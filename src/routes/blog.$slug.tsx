import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { loadBySkus } from "@/lib/products";
import { getPublishedPost, listPublishedPosts } from "@/lib/posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    const [related, more] = await Promise.all([
      post.skus.length ? loadBySkus({ data: { skus: post.skus } }) : Promise.resolve([]),
      listPublishedPosts(),
    ]);
    return { post, related, more: more.filter((item) => item.slug !== post.slug).slice(0, 3) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { post } = loaderData;
    const page = post.origin ? `${post.origin}/blog/${post.slug}` : `/blog/${post.slug}`;
    const image = post.origin ? `${post.origin}${post.image}` : post.image;
    return {
      meta: [
        { title: `${post.title} · Bricksplaza` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:image", content: image },
        { property: "article:published_time", content: post.date },
      ],
      links: post.origin ? [{ rel: "canonical", href: page }] : [],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post, related, more } = Route.useLoaderData();
  const page = post.origin ? `${post.origin}/blog/${post.slug}` : "";
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: post.origin ? `${post.origin}${post.image}` : post.image,
    author: { "@type": "Organization", name: "Bricksplaza" },
    publisher: { "@type": "Organization", name: "Besbpo Group" },
    mainEntityOfPage: page || undefined,
  };
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <img src={post.image} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
      <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-clay">
        {post.tag} · {post.date}
      </p>
      <h1 className="mt-2 font-display text-4xl">{post.title}</h1>
      {post.body.split(/\n\n+/).map((para) => (
        <p key={para.slice(0, 32)} className="mt-4 leading-relaxed text-mortar">
          {para}
        </p>
      ))}
      <Share title={post.title} path={`/blog/${post.slug}`} />
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl">On this note</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
        </section>
      )}
      {more.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl">More from the yard</h2>
          <ul className="mt-4 space-y-3">
            {more.map((item) => (
              <li key={item.slug}>
                <Link to="/blog/$slug" params={{ slug: item.slug }} className="text-clay">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Share({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? path : window.location.href;
  const text = encodeURIComponent(title);
  const encoded = encodeURIComponent(url);
  const links = [
    ["WhatsApp", `https://wa.me/?text=${text}%20${encoded}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encoded}`],
    ["X", `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`],
  ];
  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Share</p>
      {links.map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-clay">
          {label}
        </a>
      ))}
      <button
        type="button"
        className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-clay"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
