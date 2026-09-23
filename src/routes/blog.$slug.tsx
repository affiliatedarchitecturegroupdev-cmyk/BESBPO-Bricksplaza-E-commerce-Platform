import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG } from "@/data/content";

export const Route = createFileRoute("/blog/$slug")({ component: Post });

function Post() {
  const { slug } = Route.useParams();
  const post = BLOG.find((p) => p.slug === slug);
  if (!post) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Article not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-clay">
          Back
        </Link>
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.16em] text-clay">
        {post.tag} · {post.date}
      </p>
      <h1 className="mt-2 font-display text-4xl">{post.title}</h1>
      {post.body.split("\n\n").map((para) => (
        <p key={para.slice(0, 24)} className="mt-4 leading-relaxed text-mortar">
          {para}
        </p>
      ))}
    </article>
  );
}
