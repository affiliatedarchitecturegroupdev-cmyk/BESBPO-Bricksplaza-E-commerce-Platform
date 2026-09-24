import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Pause, Play } from "lucide-react";
import { HERO_SLIDES, BUNDLES, PROJECTS, GROUP } from "@/data/content";
import { CATEGORIES, COLOURS, FAMILIES, PROVINCES, SECTORS } from "@/data/taxonomy";
import { findProduct, type Product } from "@/data/catalogue";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useViewed } from "@/lib/cart-store";
import { useCatalogue } from "@/components/catalogue";
import { AdBanner } from "@/components/ad-banner";
import { adSlot } from "@/data/ads";
import { formatZar } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const catalogue = useCatalogue();
  const trending = catalogue.filter((p) => p.isTrending).slice(0, 8);
  const arrivals = [...catalogue].reverse().filter((p) => p.isNew).slice(0, 8);
  const clearance = catalogue.filter((p) => p.isClearance).slice(0, 8);
  const best = catalogue.filter((p) => p.isBestSeller).slice(0, 8);
  const favs = catalogue.filter((p) => p.rating >= 4.5).slice(0, 8);
  const colours = ["Autumn Red", "Imperial", "Sandstone", "Kalahari", "Slate", "Burgundy"];
  const editorial = editorialPicks(catalogue);
  const value = valuePicks(catalogue);
  const bulk = bulkSpecials(catalogue);
  const restocked = restockedPicks(catalogue);

  return (
    <>
      <Hero />
      <AdBanner slot={adSlot("hero-banner")} />
      <Rail title="Trending now" kicker="Order velocity" href="/shop" products={trending} />
      <Rail title="Recent arrivals" kicker="Newest kiln loads" href="/new" products={arrivals} />
      <Bundles />
      <Rail title="Clearance" kicker="Overstock & discontinued colourways" href="/search" products={clearance} />
      <ShopByCategory />
      <AdBanner slot={adSlot("midpage-banner")} />
      <ShopBySector />
      <ColourCollections colours={colours} />
      <Rail title="Best sellers" kicker="Rating + volume" href="/shop" products={best} />
      <NewToRange />
      <AdBanner slot={adSlot("inrail-banner-1")} />
      <Rail title="Customer favourites" kicker="4.5★ and above" href="/shop" products={favs} />
      <BrowseByColour />
      <ShopByProject />
      <Rail title="Editor’s picks" kicker="Merchandising desk — not the algorithm" href="/shop" products={editorial} />
      <AdBanner slot={adSlot("inrail-banner-2")} />
      <Rail title="Value picks" kicker="Everyday commodity lines — not clearance" href="/shop/stock-bricks" products={value} />
      <TradeBulk products={bulk} />
      <Rail title="Recently restocked" kicker="Back on the yard floor" href="/shop" products={restocked} />
      <Gallery />
      <DeliveryMap />
      <TrustStrip />
      <Newsletter />
      <RecentlyViewed />
    </>
  );
}

function Hero() {
  const len = HERO_SLIDES.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const touchX = useRef<number | null>(null);
  const indexRef = useRef(0);
  const slide = HERO_SLIDES[i]!;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (paused || hover || reduced) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const idx = (indexRef.current + 1) % len;
      indexRef.current = idx;
      setI(idx);
    }, 7000);
    return () => window.clearInterval(id);
  }, [paused, hover, reduced, len, i]);

  function jump(idx: number, announce: boolean) {
    const next = ((idx % len) + len) % len;
    indexRef.current = next;
    setI(next);
    if (announce) {
      const s = HERO_SLIDES[next]!;
      setAnnouncement(`Slide ${next + 1} of ${len}. ${s.title}`);
    }
  }

  return (
    <section
      className="relative overflow-hidden bg-kiln text-bisque"
      aria-roledescription="carousel"
      aria-label="Featured products and services"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          jump(indexRef.current + 1, true);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          jump(indexRef.current - 1, true);
        }
      }}
    >
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div
        className="relative min-h-[28rem] sm:h-[36rem] lg:h-[min(74vh,42rem)]"
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          touchX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (touchX.current == null) return;
          const dx = e.clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) < 48) return;
          jump(dx < 0 ? indexRef.current + 1 : indexRef.current - 1, true);
        }}
        onPointerCancel={() => {
          touchX.current = null;
        }}
      >
        {HERO_SLIDES.map((s, idx) => (
          <img
            key={s.key}
            src={s.image}
            alt={idx === i ? s.alt : ""}
            className={`absolute inset-0 h-full w-full object-cover ${reduced ? "" : "transition-opacity duration-700"} ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            style={{ objectPosition: s.focus }}
            draggable={false}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-kiln via-kiln/80 to-kiln/10" />
        <div className="relative flex min-h-[28rem] flex-col justify-end px-4 pb-4 sm:h-full sm:min-h-0 sm:px-8 sm:pb-7">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold sm:tracking-[0.22em]">{slide.kicker}</p>
          <h1 className="mt-2 max-w-xl font-display text-[clamp(1.65rem,4.2vw,3.35rem)] leading-[1.08] sm:max-w-3xl">
            {slide.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-bisque/90 sm:text-base">{slide.body}</p>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
            <a href={slide.href}>
              <Button size="md" className="sm:h-12 sm:px-5 sm:text-base">
                {slide.cta} <ArrowRight className="size-4" />
              </Button>
            </a>
            <Link to="/shop">
              <Button size="md" variant="inverse" className="sm:h-12 sm:px-5 sm:text-base">
                Browse the catalogue
              </Button>
            </Link>
          </div>
          <p className="mt-3 max-w-xl text-[10px] leading-snug text-bisque/55">{slide.credit}</p>
          <div className="mt-3 flex items-center gap-2 sm:mt-4 sm:gap-3">
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-bisque/25 sm:size-11"
              aria-label="Previous slide"
              onClick={() => jump(indexRef.current - 1, true)}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-bisque/25 sm:size-11"
              aria-label="Next slide"
              onClick={() => jump(indexRef.current + 1, true)}
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-bisque/25 sm:size-11"
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <div className="flex min-w-0 flex-1 gap-1" role="tablist" aria-label="Choose a slide">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={idx === i}
                  aria-label={`${idx + 1}. ${s.kicker}`}
                  onClick={() => jump(idx, true)}
                  className={`h-1.5 min-w-0 flex-1 rounded-full ${idx === i ? "bg-gold" : "bg-bisque/35"}`}
                />
              ))}
            </div>
            <span className="shrink-0 text-xs tabular-nums text-bisque/80">
              {String(i + 1).padStart(2, "0")}/{String(len).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rail({
  title,
  kicker,
  href,
  products,
}: {
  title: string;
  kicker: string;
  href: string;
  products: Product[];
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-clay">{kicker}</p>
          <h2 className="mt-1 font-display text-3xl">{title}</h2>
        </div>
        <a href={href} className="hidden text-sm font-medium text-clay hover:underline sm:inline">
          View all
        </a>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.sku} product={p} />
        ))}
      </div>
    </section>
  );
}

function Bundles() {
  return (
    <section className="bg-kiln py-16 text-bisque">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Merchandiser-curated</p>
        <h2 className="mt-1 font-display text-3xl">Bundles & combos</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {BUNDLES.filter((b) => b.slug !== "paving-finishing-kit").map((b) => (
            <a key={b.slug} href={b.href} className="group overflow-hidden rounded-xl bg-kiln-2">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={b.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <span className="text-[11px] uppercase tracking-[0.16em] text-gold">{b.tag}</span>
                <h3 className="mt-1 font-display text-xl">{b.name}</h3>
                <p className="mt-2 text-sm text-dim">{b.blurb}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopByCategory() {
  const images: Record<string, string> = {
    "clay-masonry": "/images/bricks/autumn-red.jpg",
    concrete: "/images/types/blocks.jpg",
    "hard-landscaping": "/images/hero/driveway.jpg",
    specialist: "/images/types/slips.jpg",
  };
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-clay">21 categories · 4 families</p>
      <h2 className="mt-1 font-display text-3xl">Shop by category</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {FAMILIES.map((f) => (
          <div key={f.slug} className="overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]">
            <div className="aspect-[21/9] overflow-hidden">
              <img src={images[f.slug]} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-2xl">{f.name}</h3>
              <p className="mt-1 text-sm text-mortar">{f.blurb}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {CATEGORIES.filter((c) => c.family === f.slug).map((c) => (
                  <li key={c.slug}>
                    <Link
                      to="/shop/$slug"
                      params={{ slug: c.slug }}
                      className="inline-flex rounded-full bg-card px-3 py-1.5 text-sm hover:bg-clay hover:text-paper"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShopBySector() {
  const img: Record<string, string> = {
    Residential: "/images/projects/house.jpg",
    Commercial: "/images/projects/commercial.jpg",
    Industrial: "/images/hero/yard.jpg",
    Institutional: "/images/projects/school.jpg",
    Civil: "/images/hero/driveway.jpg",
  };
  return (
    <section className="bg-card py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Specify by job</p>
        <h2 className="mt-1 font-display text-3xl">Shop by sector</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {SECTORS.map((s) => (
            <Link
              key={s}
              to="/sectors/$slug"
              params={{ slug: s.toLowerCase() }}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl"
            >
              <img src={img[s]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-kiln to-transparent" />
              <span className="absolute bottom-4 left-4 font-display text-xl text-bisque">{s}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ColourCollections({ colours }: { colours: string[] }) {
  const catalogue = useCatalogue();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-clay">The core differentiator</p>
      <h2 className="mt-1 font-display text-3xl">Colour-matched collections</h2>
      <p className="mt-2 max-w-2xl text-mortar">
        Face brick, semi-face and clay paver fired in the same colourway — specify once, lay three surfaces.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {colours.map((colour) => {
          const face = catalogue.find((p) => p.categorySlug === "clay-face-bricks" && p.colourFinish === colour);
          const semi = catalogue.find((p) => p.categorySlug === "semi-face-bricks" && p.colourFinish === colour);
          const paver = catalogue.find((p) => p.categorySlug === "clay-pavers" && p.colourFinish === colour);
          if (!face) return null;
          return (
            <Link
              key={colour}
              to="/product/$sku"
              params={{ sku: face.sku }}
              className="overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]"
            >
              <div className="flex h-24">
                {[face, semi, paver].filter(Boolean).map((p) => (
                  <div key={p!.sku} className="flex-1" style={{ background: p!.colourHex }} />
                ))}
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl">{colour}</h3>
                <p className="mt-1 text-sm text-mortar">
                  {[face && "Face", semi && "Semi-face", paver && "Paver"].filter(Boolean).join(" · ")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-6">
        <Link to="/collections" className="text-sm font-medium text-clay hover:underline">
          All 14 colourways →
        </Link>
      </div>
    </section>
  );
}

function NewToRange() {
  const items = [
    { slug: "aac-blocks", title: "AAC Blocks", img: "/images/types/aac.jpg", blurb: "Light, insulated, Agrément-certified autoclaved aerated concrete." },
    { slug: "cseb", title: "CSEB", img: "/images/types/cseb.jpg", blurb: "Compressed stabilised earth blocks for low-carbon walls." },
    { slug: "brick-slips", title: "Brick Slips", img: "/images/types/slips.jpg", blurb: "Thin clay cladding, colour-matched to the facing range." },
    { slug: "braai-kits", title: "Braai Kits", img: "/images/types/braai.jpg", blurb: "Scheduled outdoor kits — brick, firebrick, grate." },
  ];
  return (
    <section className="bg-kiln py-16 text-bisque">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Just added</p>
        <h2 className="mt-1 font-display text-3xl">New to the range</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <Link key={it.slug} to="/shop/$slug" params={{ slug: it.slug }} className="overflow-hidden rounded-xl bg-kiln-2">
              <img src={it.img} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <h3 className="font-display text-xl">{it.title}</h3>
                <p className="mt-1 text-sm text-dim">{it.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function firstOf(catalogue: Product[], categorySlug: string, colour?: string) {
  return catalogue.find((p) => p.categorySlug === categorySlug && (!colour || p.colourFinish === colour));
}

function editorialPicks(catalogue: Product[]) {
  return [
    firstOf(catalogue, "clay-face-bricks", "Autumn Red"),
    firstOf(catalogue, "clay-pavers", "Sandstone"),
    firstOf(catalogue, "brick-slips", "Slate"),
    firstOf(catalogue, "braai-kits", "Autumn Red"),
  ].filter(Boolean) as Product[];
}

function valuePicks(catalogue: Product[]) {
  const slugs = ["stock-bricks", "concrete-blocks", "concrete-maxi", "mortar-accessories"];
  return slugs
    .map((slug) =>
      catalogue
        .filter((p) => p.categorySlug === slug && !p.isClearance)
        .sort((a, b) => a.retailPrice - b.retailPrice)[0],
    )
    .filter(Boolean) as Product[];
}

function bulkSpecials(catalogue: Product[]) {
  return [
    firstOf(catalogue, "clay-face-bricks", "Autumn Red"),
    firstOf(catalogue, "concrete-blocks", "White"),
    firstOf(catalogue, "clay-pavers", "Autumn Red"),
    firstOf(catalogue, "stock-bricks"),
  ].filter(Boolean) as Product[];
}

function restockedPicks(catalogue: Product[]) {
  const seen = new Set<string>();
  const picks = [];
  const ranked = catalogue
    .filter((p) => p.fulfilmentType === "Stock Item" && !p.isNew && !p.isClearance && p.stock > 200)
    .sort((a, b) => b.stock - a.stock);
  for (const p of ranked) {
    if (seen.has(p.categorySlug)) continue;
    seen.add(p.categorySlug);
    picks.push(p);
    if (picks.length === 4) break;
  }
  return picks;
}

function BrowseByColour() {
  return (
    <section className="bg-card py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-clay">All 14 finishes</p>
        <h2 className="mt-1 font-display text-3xl">Browse by colour</h2>
        <p className="mt-2 max-w-2xl text-mortar">
          Pick a colourway and see every category that fires it — not a curated trio, the whole yard.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {COLOURS.map((c) => (
            <Link
              key={c.slug}
              to="/search"
              search={{ colour: c.name }}
              className="rounded-xl bg-paper p-3 shadow-[var(--shadow-card)] hover:ring-2 hover:ring-clay"
            >
              <span className="block h-16 rounded-md" style={{ background: c.hex }} />
              <span className="mt-2 block text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopByProject() {
  const projects = [
    {
      title: "Driveway & paving",
      blurb: "Pavers and cobbles planned as a surface, not a category.",
      href: "/shop/clay-pavers" as const,
      slug: "clay-pavers",
      img: "/images/hero/driveway.jpg",
    },
    {
      title: "Garden wall & landscaping",
      blurb: "Retaining, coping and the colour that meets the planting.",
      href: "/shop/retaining-blocks" as const,
      slug: "retaining-blocks",
      img: "/images/projects/estate.jpg",
    },
    {
      title: "New build structural",
      blurb: "Blocks, maxi and lintels for the shell of the building.",
      href: "/shop/concrete-blocks" as const,
      slug: "concrete-blocks",
      img: "/images/types/blocks.jpg",
    },
    {
      title: "Braai & outdoor living",
      blurb: "A kit, not a loose bill of materials.",
      href: "/shop/braai-kits" as const,
      slug: "braai-kits",
      img: "/images/types/braai.jpg",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-clay">How the job is actually planned</p>
      <h2 className="mt-1 font-display text-3xl">Shop by project</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((p) => (
          <Link key={p.title} to="/shop/$slug" params={{ slug: p.slug }} className="group overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]">
            <img src={p.img} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="p-4">
              <h3 className="font-display text-xl">{p.title}</h3>
              <p className="mt-1 text-sm text-mortar">{p.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TradeBulk({ products }: { products: Product[] }) {
  return (
    <section className="bg-kiln py-16 text-bisque">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Volume tier on the homepage</p>
        <h2 className="mt-1 font-display text-3xl">Trade & bulk specials</h2>
        <p className="mt-2 max-w-2xl text-dim">
          Volume is 20% off retail. Trade accounts open at 12%. These are list comparisons, not discontinued stock.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <Link key={p.sku} to="/product/$sku" params={{ sku: p.sku }} className="rounded-xl bg-kiln-2 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-gold">{p.category}</p>
              <h3 className="mt-1 font-display text-lg">{p.productType}</h3>
              <p className="text-sm text-dim">{p.colourFinish}</p>
              <p className="mt-3 font-display text-2xl tabular-nums">{formatZar(p.volumePrice, true)}</p>
              <p className="text-xs text-dim">
                Volume · retail {formatZar(p.retailPrice, true)} · trade {formatZar(p.tradePrice, true)}
              </p>
            </Link>
          ))}
        </div>
        <Link to="/trade" className="mt-6 inline-flex text-sm text-gold hover:underline">
          Open a trade account →
        </Link>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Finished work</p>
          <h2 className="mt-1 font-display text-3xl">Project inspiration</h2>
        </div>
        <Link to="/projects" className="text-sm font-medium text-clay hover:underline">
          All case studies
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {PROJECTS.map((p) => (
          <Link key={p.slug} to="/projects" className="group overflow-hidden rounded-xl">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="bg-paper p-4 shadow-[var(--shadow-card)]">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                {p.sector} · {p.location}
              </p>
              <h3 className="mt-1 font-display text-xl">{p.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DeliveryMap() {
  return (
    <section className="bg-card py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Seven provinces served, two yards</p>
          <h2 className="mt-1 font-display text-3xl">Delivery coverage</h2>
          <p className="mt-3 text-mortar">
            Physical yard fulfilment in Gauteng and KwaZulu-Natal. Online-first nationwide with live distance-banded fees at checkout.
          </p>
          <ul className="mt-6 space-y-3">
            {PROVINCES.map((p) => (
              <li key={p.slug}>
                <Link to="/locations/$slug" params={{ slug: p.slug }} className="flex items-start gap-3 rounded-lg p-2 hover:bg-paper">
                  <MapPin className="mt-0.5 size-4 text-clay" />
                  <span>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs uppercase tracking-wider text-muted">
                      {p.mode === "yard" ? "Yard" : "Online-first"}
                    </span>
                    <span className="mt-0.5 block text-sm text-mortar">{p.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-xl">
          <img src="/images/hero/yard.jpg" alt="Bricksplaza distribution yard" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const badges = ["SANS 227", "SANS 1058", "SANS 1215", "SABS", "NRCS", "Agrément SA", "PayFast", "Ozow", "DSV", "Faber Vervoer"];
  return (
    <section className="border-y border-line bg-paper py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4 sm:px-6">
        {badges.map((b) => (
          <span key={b} className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-mortar">
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid overflow-hidden rounded-2xl bg-kiln text-bisque md:grid-cols-2">
        <div className="p-8 sm:p-12">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Yard notes</p>
          <h2 className="mt-2 font-display text-3xl">New colourways, lead times, trade openings.</h2>
          <p className="mt-3 text-dim">Opt-in only. We do not sell the list. Trade applications live on the same form as always.</p>
          {done ? (
            <p className="mt-6 text-sm">You’re on the list.</p>
          ) : (
            <form
              className="mt-6 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
            >
              <input
                required
                type="email"
                placeholder="you@company.co.za"
                suppressHydrationWarning
                className="h-12 flex-1 rounded-md border-0 bg-kiln-2 px-3 text-sm text-bisque placeholder:text-dim"
              />
              <Button type="submit" size="lg">
                Subscribe
              </Button>
            </form>
          )}
          <Link to="/trade" className="mt-4 inline-flex text-sm text-gold hover:underline">
            Apply for a trade account →
          </Link>
        </div>
        <img src="/images/hero/facade.jpg" alt="" className="hidden h-full object-cover md:block" />
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Group ecosystem: {GROUP.map((g) => g.name).join(" · ")}
      </p>
    </section>
  );
}

function RecentlyViewed() {
  const skus = useViewed((s) => s.skus);
  const catalogue = useCatalogue();
  const products = skus.map((sku) => findProduct(catalogue, sku)).filter((p) => p != null).slice(0, 4);
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <h2 className="font-display text-3xl">Recently viewed</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p!.sku} product={p!} />
        ))}
      </div>
    </section>
  );
}
