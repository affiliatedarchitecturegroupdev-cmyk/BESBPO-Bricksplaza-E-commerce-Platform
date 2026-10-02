import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { listPublishedPosts } from "@/lib/posts";

export const Route = createFileRoute("/blog/")({
  loader: () => listPublishedPosts(),
  head: () => ({
    meta: [
      { title: "Yard notes · Bricksplaza" },
      { name: "description", content: "Specification, compliance and trade notes from the Bricksplaza yard." },
      { property: "og:title", content: "Yard notes · Bricksplaza" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Blog,
});

function Blog() {
  const posts = Route.useLoaderData();
  return (
    <>
      <PageHeader
        kicker="Journal"
        title="Yard notes"
        body="Specification, compliance and trade — written for the people who actually buy the brick."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.slug} to="/blog/$slug" params={{ slug: post.slug }} className="overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]">
            <img src={post.image} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-clay">
                {post.tag} · {post.date}
              </p>
              <h2 className="mt-1 font-display text-2xl">{post.title}</h2>
              <p className="mt-2 text-sm text-mortar">{post.excerpt}</p>
              <p className="mt-4 text-sm font-medium text-clay">Read the note</p>
            </div>
          </Link>
        ))}
        {posts.length === 0 && <p className="text-sm text-mortar">No notes published yet.</p>}
      </div>
    </>
  );
}
