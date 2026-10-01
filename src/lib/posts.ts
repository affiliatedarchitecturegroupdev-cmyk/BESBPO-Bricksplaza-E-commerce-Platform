import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { publishedPosts } = await import("./posts.server");
  return publishedPosts();
});

export const getPublishedPost = createServerFn({ method: "GET" })
  .validator((d: { slug?: string }) => ({ slug: String(d?.slug ?? "").slice(0, 80) }))
  .handler(async ({ data }) => {
    const { publishedPost } = await import("./posts.server");
    return publishedPost(data.slug);
  });

export const listDeskPosts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { deskPosts } = await import("./posts.server");
    return deskPosts(context.userId);
  });

export const savePost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: {
    id?: number;
    slug?: string;
    title?: string;
    tag?: string;
    excerpt?: string;
    body?: string;
    skus?: string;
    status?: string;
    image?: string;
  }) => ({
    id: Number(d?.id || 0),
    slug: String(d?.slug ?? ""),
    title: String(d?.title ?? ""),
    tag: String(d?.tag ?? ""),
    excerpt: String(d?.excerpt ?? ""),
    body: String(d?.body ?? ""),
    skus: String(d?.skus ?? ""),
    status: String(d?.status ?? "draft"),
    image: String(d?.image ?? ""),
  }))
  .handler(async ({ context, data }) => {
    const { savePostRecord } = await import("./posts.server");
    return savePostRecord(context.userId, data);
  });
