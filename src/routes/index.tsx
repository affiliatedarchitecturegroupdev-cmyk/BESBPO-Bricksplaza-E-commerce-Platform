import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Pause, Play } from "lucide-react";
import { HERO_SLIDES, BUNDLES, PROJECTS, GROUP } from "@/data/content";
import { CATEGORIES, COLOURS, FAMILIES, PROVINCES, SECTORS } from "@/data/taxonomy";
import { type Product } from "@/data/catalogue";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useViewed } from "@/lib/cart-store";
import { useProductsBySku } from "@/lib/use-products";
import { loadHome, loadCatalogueJournal } from "@/lib/products";
import { listBrandShops } from "@/lib/brands";
import { AdBanner } from "@/components/ad-banner";
import { adSlot } from "@/data/ads";
import { listPublishedPosts } from "@/lib/posts";
import { SourcingCarousel } from "@/components/sourcing-carousel";
import { RAIL_CARD, RAIL_STORY, ScrollRail } from "@/components/scroll-rail";
import { PitchDeck } from "@/components/pitch-deck";
import { BRAND_MEDIA } from "@/data/brand-media";
import { formatZar } from "@/lib/format";

export const Route = createFileRoute("/")({
  loader: async () => {
    const empty = {
      trending: [] as Product[],
      arrivals: [] as Product[],
      clearance: [] as Product[],
      best: [] as Product[],
      favs: [] as Product[],
      editorial: [] as Product[],
      value: [] as Product[],
      bulk: [] as Product[],
      restocked: [] as Product[],
      colours: [] as { colour: string; face: Product; semi?: Product; paver?: Product }[],
    };
    const [home, brands, notes, journal] = await Promise.all([
      loadHome().catch(() => empty),
      listBrandShops().catch(() => []),
      listPublishedPosts().catch(() => []),
      loadCatalogueJournal({ data: { page: 1 } }).catch(() => ({ items: [] as Product[], total: 0, page: 1, pages: 1 })),
    ]);
    return { home, brands, notes, journal };
  },
  component: Home,
});

function Home() {
  const { trending, arrivals, clearance, best, favs, editorial, value, bulk, restocked, colours } =
    Route.useLoaderData().home;
  const brands = Route.useLoaderData().brands;
  const notes = Route.useLoaderData().notes;
  const journal = Route.useLoaderData().journal;

  return (
    <>
      <CompanyMast />
      <Hero />
      <ExpressBand />
      <ExpressCheckout />
      <AdBanner slot={adSlot("hero-banner")} />
      <PitchDeck />
      <Rail title="Trending now" kicker="Order velocity" href="/shop" products={trending} />
      <Rail title="Recent arrivals" kicker="Newest kiln loads" href="/new" products={arrivals} />
      <Bundles />
      <Rail title="Clearance" kicker="Overstock & discontinued colourways" href="/search" products={clearance} />
      <ShopByCategory />
      <MasterCatalogue entries={journal.items} />
      <SpecifiedBrands shops={brands} />
      <AdBanner slot={adSlot("midpage-banner")} />
      <ShopBySector />
      <ColourCollections colours={colours} />
      <Rail title="Best sellers" kicker="Marked by the merchandising desk" href="/shop" products={best} />
      <NewToRange />
      <AdBanner slot={adSlot("inrail-banner-1")} />
      <Rail title="Customer favourites" kicker="Real stars · 4.5 and above" href="/shop" products={favs} />
      <BrowseByColour />
      <ShopByProject />
      <AdBanner slot={adSlot("division-affiliated")} />
      <AdBanner slot={adSlot("division-finishes")} />
      <Rail title="Editor’s picks" kicker="Merchandising desk — not the algorithm" href="/shop" products={editorial} />
      <AdBanner slot={adSlot("inrail-banner-2")} />
      <Rail title="Value picks" kicker="Everyday commodity lines — not clearance" href="/shop/stock-bricks" products={value} />
      <TradeBulk products={bulk} />
      <Rail title="Recently restocked" kicker="Back on the yard floor" href="/shop" products={restocked} />
      <Gallery />
      <DeliveryMap />
      <TrustStrip />
      <SourcingCarousel size="strip" />
      <YardNotes notes={notes} />
      <Newsletter />
      <RecentlyViewed />
    </>
  );
}

function CompanyMast() {
  const products = [
    { slug: "clay-face-bricks", title: "Clay masonry", body: "Face, semi-face, maxi, stock, engineering and specials." },
    { slug: "concrete-blocks", title: "Concrete", body: "Blocks, maxi, AAC, CSEB, lintels and mortar." },
    { slug: "clay-pavers", title: "Hard landscaping", body: "Pavers, cobbles, slabs, retaining and coping." },
    { slug: "brick-slips", title: "Specialist systems", body: "Brick slips, braai kits and the newest lines." },
  ] as const;
  const services = [
    { to: "/shop" as const, title: "Priced catalogue", body: "Stock and made-to-order, with trade and volume prices at checkout." },
    { to: "/brands" as const, title: "Manufacturer shops", body: "Corobrik, Bosun, Technicrete and Infraset. Quoted, not added to the cart." },
    { to: "/delivery-reach" as const, title: "Yard delivery", body: "Midrand and Cato Ridge. The other seven provinces are quoted long haul." },
    { to: "/trade" as const, title: "Trade accounts", body: "12% trade, 20% volume, on approved terms." },
  ];
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Bricksplaza · Besbpo Group</p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl leading-[1.08] sm:text-5xl">
          Clay masonry, hard landscaping and specialist systems.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mortar sm:text-base">
          A South African masonry store. Priced lines leave the Midrand and Cato Ridge yards. Manufacturer colourways stay on quotation. The slides below are product references, not a list of our own jobs.
        </p>
        <Link
          to="/express"
          className="mt-6 grid gap-3 rounded-2xl bg-kiln p-5 text-bisque sm:grid-cols-[auto_1fr_auto] sm:items-center"
        >
          <p className="font-display text-2xl text-gold">AA 60/120</p>
          <p className="text-sm text-dim">
            R1 000 on top of a quoted delivery. Stock lines only, within 30 km of a supplier pin, Monday to Saturday 07:00–15:30. The fee is refunded if the load is marked after 3 hours.
          </p>
          <span className="text-sm font-medium text-gold">See the service</span>
        </Link>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-cream p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Products</p>
            <ul className="mt-3 divide-y divide-line">
              {products.map((item) => (
                <li key={item.slug}>
                  <Link
                    to="/shop/$slug"
                    params={{ slug: item.slug }}
                    className="flex items-baseline justify-between gap-4 py-3 hover:text-clay"
                  >
                    <span>
                      <span className="font-medium">{item.title}</span>
                      <span className="mt-0.5 block text-sm text-mortar">{item.body}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-clay" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-line bg-cream p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Services</p>
              <ul className="mt-3 divide-y divide-line">
                {services.map((item) => (
                  <li key={item.title}>
                    <Link to={item.to} className="flex items-baseline justify-between gap-4 py-3 hover:text-clay">
                      <span>
                        <span className="font-medium">{item.title}</span>
                        <span className="mt-0.5 block text-sm text-mortar">{item.body}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-clay" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
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
          <h2 className="mt-2 max-w-xl font-display text-[clamp(1.65rem,4.2vw,3.35rem)] leading-[1.08] sm:max-w-3xl">
            {slide.title}
          </h2>
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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ScrollRail
        label={title}
        header={
          <>
            <p className="text-[11px] uppercase tracking-[0.18em] text-clay">{kicker}</p>
            <h2 className="mt-1 font-display text-3xl">{title}</h2>
          </>
        }
        action={
          <a href={href} className="text-sm font-medium text-clay hover:underline">
            View all
          </a>
        }
      >
        {products.map((p) => (
          <div key={p.sku} className={RAIL_CARD}>
            <ProductCard product={p} />
          </div>
        ))}
      </ScrollRail>
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

function SpecifiedBrands({ shops }: { shops: { brand: string; brand_slug: string; ranges: number; products: number }[] }) {
  const counts = new Map(shops.map((shop) => [shop.brand_slug, shop]));
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Specified by name</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl">Manufacturer shops</h2>
        <Link to="/brands" className="text-sm font-medium text-clay">
          All four shops <ArrowRight className="inline size-4" />
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-mortar">
        When the instruction is “this face brick must be Corobrik”, start in that shop. These ranges sit beside the priced catalogue. They are quoted, not sold off a shelf price.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(BRAND_MEDIA).map(([slug, media]) => {
          const shop = counts.get(slug);
          return (
            <Link
              key={slug}
              to="/brands/$slug"
              params={{ slug }}
              className="rounded-xl border border-line bg-paper p-5 hover:border-clay"
            >
              <span className="flex h-20 items-center justify-center rounded-lg bg-white px-4">
                <img src={media.logo} alt={media.logoAlt} className="max-h-16 w-auto max-w-full object-contain" />
              </span>
              <p className="mt-4 font-display text-2xl">{media.name}</p>
              <p className="mt-1 text-sm text-muted">
                {shop ? `${shop.ranges} ranges · ${shop.products} named products` : "Quote-only shop"}
              </p>
            </Link>
          );
        })}
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

function MasterCatalogue({ entries }: { entries: Product[] }) {
  if (!entries.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <ScrollRail
        label="Master catalogue"
        header={
          <>
            <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Newest first</p>
            <h2 className="mt-1 font-display text-3xl">Master catalogue</h2>
          </>
        }
        action={
          <Link to="/catalogue" className="text-sm font-medium text-clay">
            Open the full list <ArrowRight className="inline size-4" />
          </Link>
        }
      >
        {entries.map((product) => (
          <div key={product.sku} className={RAIL_CARD}>
            <ProductCard product={product} />
          </div>
        ))}
      </ScrollRail>
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
        <ScrollRail
          label="Shop by sector"
          header={
            <>
              <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Specify by job</p>
              <h2 className="mt-1 font-display text-3xl">Shop by sector</h2>
            </>
          }
        >
          {SECTORS.map((s) => (
            <Link
              key={s}
              to="/sectors/$slug"
              params={{ slug: s.toLowerCase() }}
              className="group relative aspect-[3/4] w-[68%] shrink-0 snap-start overflow-hidden rounded-xl sm:w-[calc((100%-1rem)/2.15)] lg:w-[calc((100%-3rem)/4.3)]"
            >
              <img src={img[s]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-kiln to-transparent" />
              <span className="absolute bottom-4 left-4 font-display text-xl text-bisque">{s}</span>
            </Link>
          ))}
        </ScrollRail>
      </div>
    </section>
  );
}

function ColourCollections({
  colours,
}: {
  colours: { colour: string; face: Product; semi?: Product; paver?: Product }[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <ScrollRail
        label="Colour-matched collections"
        header={
          <>
            <p className="text-[11px] uppercase tracking-[0.18em] text-clay">The core differentiator</p>
            <h2 className="mt-1 font-display text-3xl">Colour-matched collections</h2>
            <p className="mt-2 max-w-2xl text-mortar">
              Face brick, semi-face and clay paver fired in the same colourway — specify once, lay three surfaces.
            </p>
          </>
        }
        action={
          <Link to="/collections" className="text-sm font-medium text-clay hover:underline">
            All 14 colourways
          </Link>
        }
      >
        {colours.map((row) => {
          const { colour, face, semi, paver } = row;
          return (
            <Link
              key={colour}
              to="/product/$sku"
              params={{ sku: face.sku }}
              className={`${RAIL_STORY} flex-col overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]`}
            >
              <div className="flex h-24 w-full">
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
      </ScrollRail>
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
        <ScrollRail
          label="New to the range"
          tone="dark"
          header={
            <>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Just added</p>
              <h2 className="mt-1 font-display text-3xl">New to the range</h2>
            </>
          }
        >
          {items.map((it) => (
            <Link key={it.slug} to="/shop/$slug" params={{ slug: it.slug }} className={`${RAIL_CARD} flex-col overflow-hidden rounded-xl bg-kiln-2`}>
              <img src={it.img} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <h3 className="font-display text-xl">{it.title}</h3>
                <p className="mt-1 text-sm text-dim">{it.blurb}</p>
              </div>
            </Link>
          ))}
        </ScrollRail>
      </div>
    </section>
  );
}

function BrowseByColour() {
  return (
    <section className="bg-card py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollRail
          label="Browse by colour"
          header={
            <>
              <p className="text-[11px] uppercase tracking-[0.18em] text-clay">All 14 finishes</p>
              <h2 className="mt-1 font-display text-3xl">Browse by colour</h2>
              <p className="mt-2 max-w-2xl text-mortar">
                Pick a colourway and see every category that fires it — not a curated trio, the whole yard.
              </p>
            </>
          }
        >
          {COLOURS.map((c) => (
            <Link
              key={c.slug}
              to="/search"
              search={{ colour: c.name }}
              className="w-36 shrink-0 snap-start rounded-xl bg-paper p-3 shadow-[var(--shadow-card)] hover:ring-2 hover:ring-clay"
            >
              <span className="block h-16 rounded-md" style={{ background: c.hex }} />
              <span className="mt-2 block text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </ScrollRail>
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
      <ScrollRail
        label="Shop by project"
        header={
          <>
            <p className="text-[11px] uppercase tracking-[0.18em] text-clay">How the job is actually planned</p>
            <h2 className="mt-1 font-display text-3xl">Shop by project</h2>
          </>
        }
      >
        {projects.map((p) => (
          <Link key={p.title} to="/shop/$slug" params={{ slug: p.slug }} className={`${RAIL_STORY} group flex-col overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]`}>
            <img src={p.img} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="p-4">
              <h3 className="font-display text-xl">{p.title}</h3>
              <p className="mt-1 text-sm text-mortar">{p.blurb}</p>
            </div>
          </Link>
        ))}
      </ScrollRail>
    </section>
  );
}

function TradeBulk({ products }: { products: Product[] }) {
  return (
    <section className="bg-kiln py-16 text-bisque">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollRail
          label="Trade and bulk specials"
          tone="dark"
          header={
            <>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Volume tier on the homepage</p>
              <h2 className="mt-1 font-display text-3xl">Trade & bulk specials</h2>
              <p className="mt-2 max-w-2xl text-dim">
                Volume is 20% off retail. Trade accounts open at 12%. These are list comparisons, not discontinued stock.
              </p>
            </>
          }
          action={
            <Link to="/trade" className="text-sm text-gold hover:underline">
              Trade account
            </Link>
          }
        >
          {products.map((p) => (
            <Link key={p.sku} to="/product/$sku" params={{ sku: p.sku }} className={`${RAIL_CARD} flex-col rounded-xl bg-kiln-2 p-4`}>
              <p className="text-[11px] uppercase tracking-[0.14em] text-gold">{p.category}</p>
              <h3 className="mt-1 font-display text-lg">{p.productType}</h3>
              <p className="text-sm text-dim">{p.colourFinish}</p>
              <p className="mt-3 font-display text-2xl tabular-nums">{formatZar(p.volumePrice, true)}</p>
              <p className="text-xs text-dim">
                Volume · retail {formatZar(p.retailPrice, true)} · trade {formatZar(p.tradePrice, true)}
              </p>
            </Link>
          ))}
        </ScrollRail>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <ScrollRail
        label="Project inspiration"
        header={
          <>
            <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Reference photos</p>
            <h2 className="mt-1 font-display text-3xl">Project inspiration</h2>
          </>
        }
        action={
          <Link to="/projects" className="text-sm font-medium text-clay hover:underline">
            All reference photos
          </Link>
        }
      >
        {PROJECTS.map((p) => (
          <Link key={p.slug} to="/projects" className={`${RAIL_STORY} group flex-col overflow-hidden rounded-xl`}>
            <div className="aspect-[4/3] w-full overflow-hidden">
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
      </ScrollRail>
    </section>
  );
}

function DeliveryMap() {
  return (
    <section className="bg-card py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Nine provinces, two yards</p>
          <h2 className="mt-1 font-display text-3xl">Delivery coverage</h2>
          <p className="mt-3 text-mortar">
            Yard fulfilment in Gauteng and KwaZulu-Natal. The other seven provinces are quoted long haul. The town list is on the delivery reach page.
          </p>
          <p className="mt-4">
            <Link to="/delivery-reach" className="text-sm font-medium text-clay">
              Delivery reach — cities and towns
            </Link>
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

function ExpressCheckout() {
  const steps = [
    ["1", "Stock the cart", "Made-to-order lines stay on the ordinary lead time. AA 60/120 will not take them."],
    ["2", "Set the pin", "Town search, your location, or a click on the map. The 30 km check uses that point."],
    ["3", "Tick the fee", "R1 000 is added on top of the quoted delivery. Collection does not qualify."],
  ];
  return (
    <section className="border-b border-line bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-clay">At checkout</p>
            <h2 className="mt-1 font-display text-3xl">How AA 60/120 is added</h2>
          </div>
          <Link to="/checkout" className="text-sm font-medium text-clay">
            Go to checkout
          </Link>
        </div>
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {steps.map(([n, title, body]) => (
            <li key={n} className="rounded-xl bg-paper p-5 shadow-[var(--shadow-card)]">
              <p className="font-display text-2xl text-clay">{n}</p>
              <h3 className="mt-2 font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm text-mortar">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ExpressBand() {
  const steps = [
    ["20 min", "Prepare the load. The clock is already running."],
    ["2 hours", "The planned delivery span."],
    ["2 h 59", "Last minute the R1 000 is kept."],
    ["3 hours", "The fee is refunded. Ordinary delivery stays."],
  ];
  return (
    <section className="bg-kiln text-bisque">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">AA 60/120</p>
          <h2 className="mt-2 font-display text-4xl">Express, from a pin — not a postcode</h2>
          <p className="mt-4 max-w-xl text-dim">
            R1 000 on top of a quoted delivery, for stocked lines only. A supplier pin has to sit within 30 km. Monday to Saturday, 07:00 to 15:30. Sunday is closed.
          </p>
          <p className="mt-3 max-w-xl text-sm text-dim">
            Only the Midrand and Cato Ridge yards are on the map until the desk adds a partner who can prepare a load in 20 minutes.
          </p>
          <Link
            to="/express"
            className="mt-6 inline-flex h-11 items-center rounded-md bg-clay px-4 text-sm font-medium text-paper"
          >
            See the service
          </Link>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {steps.map(([time, body]) => (
            <li key={time} className="rounded-xl bg-bisque/5 p-4">
              <p className="font-display text-2xl text-gold">{time}</p>
              <p className="mt-1 text-sm text-dim">{body}</p>
            </li>
          ))}
        </ol>
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

function YardNotes({ notes }: { notes: { slug: string; title: string; tag: string; excerpt: string; image: string }[] }) {
  if (!notes.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Journal</p>
          <h2 className="mt-1 font-display text-3xl">From the yard</h2>
        </div>
        <Link to="/blog" className="text-sm font-medium text-clay">
          All notes
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {notes.slice(0, 3).map((note) => (
          <Link key={note.slug} to="/blog/$slug" params={{ slug: note.slug }} className="overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]">
            <img src={note.image} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-clay">{note.tag}</p>
              <h3 className="mt-1 font-display text-xl">{note.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-mortar">{note.excerpt}</p>
              <p className="mt-3 text-sm font-medium text-clay">Read the note</p>
            </div>
          </Link>
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
  const skus = useViewed((s) => s.skus).slice(0, 4);
  const { products, ready } = useProductsBySku(skus);
  if (!ready || !products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <ScrollRail
        label="Recently viewed"
        header={<h2 className="font-display text-3xl">Recently viewed</h2>}
      >
        {products.map((p) => (
          <div key={p.sku} className={RAIL_CARD}>
            <ProductCard product={p} />
          </div>
        ))}
      </ScrollRail>
    </section>
  );
}
