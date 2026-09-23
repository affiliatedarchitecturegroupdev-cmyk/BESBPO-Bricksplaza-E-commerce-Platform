import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout";
import { CATEGORIES, PROVINCES, SECTORS } from "@/data/taxonomy";
import { BLOG, LEGAL } from "@/data/content";

export const Route = createFileRoute("/sitemap")({ component: HtmlSitemap });

function HtmlSitemap() {
  return (
    <>
      <PageHeader kicker="Index" title="HTML sitemap" />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <Col title="Shop">
          <Link to="/shop">All SKUs</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/shop/$slug" params={{ slug: c.slug }}>
              {c.name}
            </Link>
          ))}
        </Col>
        <Col title="Sectors & places">
          {SECTORS.map((s) => (
            <Link key={s} to="/sectors/$slug" params={{ slug: s.toLowerCase() }}>
              {s}
            </Link>
          ))}
          {PROVINCES.map((p) => (
            <Link key={p.slug} to="/locations/$slug" params={{ slug: p.slug }}>
              {p.name}
            </Link>
          ))}
        </Col>
        <Col title="Help & legal">
          <Link to="/help">Help</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/blog">Blog</Link>
          {Object.entries(LEGAL).map(([slug, p]) => (
            <Link key={slug} to="/legal/$slug" params={{ slug }}>
              {p.title}
            </Link>
          ))}
          {BLOG.map((b) => (
            <Link key={b.slug} to="/blog/$slug" params={{ slug: b.slug }}>
              {b.title}
            </Link>
          ))}
        </Col>
      </div>
    </>
  );
}

function Col({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{title}</p>
      <div className="mt-3 flex flex-col gap-1 text-sm">{children}</div>
    </div>
  );
}
