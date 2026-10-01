import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BLOG } from "@/data/content";
import { getSql } from "@/lib/db";
import { assertYard } from "@/lib/commerce";

const COVERS: Record<string, string> = {
  "colour-matching-elevations": "images/hero/colour-match.jpg",
  "sans-227-on-site": "images/hero/slides/brick-courses.jpg",
  "trade-account-guide": "images/hero/yard.jpg",
  "paver-coverage": "images/hero/slides/paver-herringbone.jpg",
};

export type PostCard = {
  slug: string;
  title: string;
  tag: string;
  excerpt: string;
  date: string;
  image: string;
};

export type PublicPost = PostCard & {
  body: string;
  skus: string[];
  origin: string;
};

export type DeskPost = PostCard & {
  id: number;
  body: string;
  skus: string;
  status: "draft" | "published";
};

function origin() {
  const raw = process.env.PUBLIC_SITE_URL || process.env.RENDER_EXTERNAL_URL || "";
  return raw.replace(/\/$/, "");
}

function card(row: Record<string, unknown>): PostCard {
  const slug = String(row.slug ?? "");
  return {
    slug,
    title: String(row.title ?? ""),
    tag: String(row.tag ?? ""),
    excerpt: String(row.excerpt ?? ""),
    date: String(row.published_at ?? row.created_at ?? "").slice(0, 10),
    image: `/media/posts/${slug}`,
  };
}

async function tableReady() {
  const sql = await getSql();
  const rows = await sql<{ name: string | null }>`select to_regclass('public.posts') as name`;
  return Boolean(rows[0]?.name);
}

async function ensureSeeded() {
  if (!(await tableReady())) return;
  const sql = await getSql();
  const count = await sql<{ n: number }>`select count(*)::int as n from posts`;
  if (Number(count[0]?.n ?? 0) > 0) return;
  for (const post of BLOG) {
    const rel = COVERS[post.slug];
    if (!rel) continue;
    const bytes = await readFile(join(process.cwd(), "public", rel));
    await sql`insert into posts (slug, title, tag, excerpt, body, cover_type, cover, status, published_at)
      values (${post.slug}, ${post.title}, ${post.tag}, ${post.excerpt}, ${post.body}, ${"image/jpeg"}, ${bytes}, ${"published"}, ${post.date})
      on conflict (slug) do nothing`;
  }
}

export async function publishedPosts(): Promise<PostCard[]> {
  await ensureSeeded();
  if (!(await tableReady())) return [];
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select slug, title, tag, excerpt, published_at from posts
    where status = 'published' order by published_at desc nulls last, id desc
  `;
  return rows.map(card);
}

export async function publishedPost(slug: string): Promise<PublicPost | null> {
  await ensureSeeded();
  if (!(await tableReady())) return null;
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select slug, title, tag, excerpt, body, skus, published_at from posts
    where slug = ${slug} and status = 'published'
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    ...card(row),
    body: String(row.body ?? ""),
    skus: String(row.skus ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    origin: origin(),
  };
}

export async function postImage(slug: string) {
  if (!(await tableReady())) return null;
  const sql = await getSql();
  const rows = await sql<{ cover_type: string; cover: Uint8Array }>`
    select cover_type, cover from posts where slug = ${slug}
  `;
  const row = rows[0];
  if (!row?.cover) return null;
  return { type: String(row.cover_type || "image/jpeg"), bytes: row.cover };
}

export async function deskPosts(userId: string): Promise<DeskPost[]> {
  await assertYard(userId);
  await ensureSeeded();
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select id, slug, title, tag, excerpt, body, skus, status, published_at, created_at
    from posts order by updated_at desc
  `;
  return rows.map((row) => ({
    ...card(row),
    id: Number(row.id),
    body: String(row.body ?? ""),
    skus: String(row.skus ?? ""),
    status: row.status === "published" ? "published" : "draft",
  }));
}

function decodeImage(input: string) {
  const match = input.match(/^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=\s]+)$/i);
  if (!match) throw new Error("Use a JPEG, PNG or WebP");
  const bytes = Buffer.from(match[2]!.replace(/\s/g, ""), "base64");
  if (bytes.length < 32 || bytes.length > 1_200_000) throw new Error("Picture must be under 1.2 MB");
  const type = match[1]!.toLowerCase();
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const png = bytes[0] === 0x89 && bytes[1] === 0x50;
  const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (type === "image/jpeg" && !jpeg) throw new Error("That file is not a JPEG");
  if (type === "image/png" && !png) throw new Error("That file is not a PNG");
  if (type === "image/webp" && !webp) throw new Error("That file is not a WebP");
  return { type, bytes };
}

function cleanSlug(value: string) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Slug needs letters or numbers");
  return slug;
}

export async function savePostRecord(
  userId: string,
  data: {
    id?: number;
    slug: string;
    title: string;
    tag: string;
    excerpt: string;
    body: string;
    skus: string;
    status: string;
    image?: string;
  },
) {
  await assertYard(userId);
  await ensureSeeded();
  const title = data.title.trim().slice(0, 140);
  const tag = data.tag.trim().slice(0, 40);
  const excerpt = data.excerpt.trim().slice(0, 280);
  const body = data.body.trim().slice(0, 12000);
  const slug = cleanSlug(data.slug || title);
  const status = data.status === "published" ? "published" : "draft";
  const skus = data.skus
    .split(/[\s,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 8)
    .join(",");
  if (title.length < 4) throw new Error("Add a title");
  if (!tag) throw new Error("Add a tag");
  if (excerpt.length < 12) throw new Error("Add a short excerpt");
  if (body.length < 40) throw new Error("The note is too short");
  const sql = await getSql();
  const id = Number(data.id || 0);
  const image = data.image?.trim() ? decodeImage(data.image.trim()) : null;
  if (!id && !image) throw new Error("Every note needs a picture");

  if (!id) {
    await sql`insert into posts (slug, title, tag, excerpt, body, cover_type, cover, skus, status, published_at, updated_at)
      values (${slug}, ${title}, ${tag}, ${excerpt}, ${body}, ${image!.type}, ${image!.bytes}, ${skus}, ${status},
        ${status === "published" ? new Date().toISOString().slice(0, 10) : null}, now())`;
    return { ok: true as const, slug };
  }

  const existing = await sql<{ id: number }>`select id from posts where id = ${id}`;
  if (!existing[0]) throw new Error("Note not found");
  const clash = await sql<{ id: number }>`select id from posts where slug = ${slug} and id <> ${id}`;
  if (clash[0]) throw new Error("That slug is already used");
  if (image) {
    await sql`update posts set slug = ${slug}, title = ${title}, tag = ${tag}, excerpt = ${excerpt}, body = ${body},
      cover_type = ${image.type}, cover = ${image.bytes}, skus = ${skus}, status = ${status},
      published_at = case when ${status} = 'published' then coalesce(published_at, current_date) else published_at end,
      updated_at = now() where id = ${id}`;
  } else {
    await sql`update posts set slug = ${slug}, title = ${title}, tag = ${tag}, excerpt = ${excerpt}, body = ${body},
      skus = ${skus}, status = ${status},
      published_at = case when ${status} = 'published' then coalesce(published_at, current_date) else published_at end,
      updated_at = now() where id = ${id}`;
  }
  return { ok: true as const, slug };
}
