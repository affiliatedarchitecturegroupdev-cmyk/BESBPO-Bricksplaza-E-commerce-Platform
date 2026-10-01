import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { SignedIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart } from "@/lib/cart-store";
import { CATEGORIES, FAMILIES, SECTORS } from "@/data/taxonomy";
import { CONTACTS, GROUP, GROUP_SOCIAL } from "@/data/content";
import type { Product } from "@/data/catalogue";
import { suggestProducts } from "@/lib/products";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  X,
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import { ProductMedia } from "@/components/product-media";
import { formatZar } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { claimYard } from "@/lib/commerce";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
      <CookieNotice />
      <Toaster position="top-center" richColors />
    </div>
  );
}

function TopBar() {
  return (
    <div className="bg-kiln text-bisque">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.16em] sm:px-6">
        <p className="truncate">Gauteng & KZN yards · Nationwide pallet freight</p>
        <div className="hidden items-center gap-4 sm:flex">
          <Link to="/trade" className="hover:text-gold">
            Trade accounts
          </Link>
          <Link to="/track" className="hover:text-gold">
            Track an order
          </Link>
          <Link to="/desk" className="hover:text-gold">
            Business Desk
          </Link>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const { user } = useCurrentUserState();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-3 px-4 py-3 sm:px-6">
        <button
          className="inline-flex size-11 items-center justify-center rounded-md hover:bg-card lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </button>
        <Link to="/" className="flex shrink-0 items-center">
          <img src="/brand/lockup_light.svg" alt="Bricksplaza" className="h-9 w-auto sm:h-10" />
        </Link>
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <Link
              to="/shop"
              className="inline-flex h-11 items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-card"
            >
              Shop <ChevronDown className="size-3.5" />
            </Link>
            {shopOpen && (
              <div className="absolute left-0 top-full z-50 w-[640px] rounded-xl bg-paper p-5 shadow-[var(--shadow-card-hover)]">
                <div className="grid grid-cols-2 gap-5">
                  {FAMILIES.map((f) => (
                    <div key={f.slug}>
                      <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">{f.name}</p>
                      <ul className="space-y-1">
                        {CATEGORIES.filter((c) => c.family === f.slug).map((c) => (
                          <li key={c.slug}>
                            <Link
                              to="/shop/$slug"
                              params={{ slug: c.slug }}
                              className="block rounded-md px-2 py-1.5 text-sm hover:bg-card hover:text-clay"
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/brands" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
            Brands
          </Link>
          <Link to="/sectors/$slug" params={{ slug: "residential" }} className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
            Sectors
          </Link>
          <Link to="/projects" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
            Projects
          </Link>
          <Link to="/trade" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
            Trade
          </Link>
          <Link to="/help" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
            Help
          </Link>
        </nav>
        <SearchBox />
        <div className="ml-auto flex items-center gap-1">
          {user ? (
            <SignedIn>
              <Link
                to="/account"
                className="hidden h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card sm:inline-flex"
              >
                Account
              </Link>
              <UserButton />
            </SignedIn>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/cart"
            className="relative inline-flex size-11 items-center justify-center rounded-md hover:bg-card"
            aria-label="Cart"
          >
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-clay px-1 text-center text-[10px] font-semibold leading-4 text-paper tabular-nums">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </header>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [hits, setHits] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const qv = q.trim();
    if (qv.length < 2) {
      setHits([]);
      return;
    }
    let cancel = false;
    const t = window.setTimeout(() => {
      suggestProducts({ data: { q: qv } })
        .then((rows) => {
          if (!cancel) setHits(rows);
        })
        .catch(() => {
          if (!cancel) setHits([]);
        });
    }, 120);
    return () => {
      cancel = true;
      window.clearTimeout(t);
    };
  }, [q]);

  return (
    <div className="relative ml-auto hidden min-w-0 flex-1 max-w-md md:block">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) navigate({ to: "/search", search: { q } });
          setFocus(false);
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 160)}
          placeholder="Search SKU, colour, SANS…"
          suppressHydrationWarning
          className="h-11 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-clay/30"
        />
      </form>
      {focus && hits.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card-hover)]">
          {hits.map((p) => (
            <Link
              key={p.sku}
              to="/product/$sku"
              params={{ sku: p.sku }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-card"
            >
              <ProductMedia product={p} labelled={false} className="size-10 shrink-0 rounded-md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.productType}</p>
                <p className="truncate text-xs text-muted">
                  {p.sku} · {p.colourFinish}
                </p>
              </div>
              <span className="ml-auto text-sm tabular-nums">{formatZar(p.retailPrice, true)}</span>
            </Link>
          ))}
          <Link
            to="/search"
            search={{ q }}
            className="block border-t border-line px-3 py-2 text-sm font-medium text-clay"
          >
            View all results
          </Link>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button className="absolute inset-0 bg-kiln/40" aria-label="Close menu" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-[min(100%,20rem)] overflow-y-auto bg-paper p-5 shadow-[var(--shadow-card-hover)]">
        <div className="mb-6 flex items-center justify-between">
          <img src="/brand/lockup_light.svg" alt="Bricksplaza" className="h-8" />
          <button className="size-11" aria-label="Close" onClick={onClose}>
            <X />
          </button>
        </div>
        <form
          className="mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q") as string;
            window.location.href = `/search?q=${encodeURIComponent(q)}`;
          }}
        >
          <input
            name="q"
            placeholder="Search catalogue"
            className="h-11 w-full rounded-md border border-line bg-card px-3 text-sm"
          />
        </form>
        {FAMILIES.map((f) => (
          <div key={f.slug} className="mb-4">
            <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-muted">{f.name}</p>
            {CATEGORIES.filter((c) => c.family === f.slug).map((c) => (
              <Link
                key={c.slug}
                to="/shop/$slug"
                params={{ slug: c.slug }}
                onClick={onClose}
                className="block py-2 text-sm"
              >
                {c.name}
              </Link>
            ))}
          </div>
        ))}
        <Link to="/brands" onClick={onClose} className="block py-2 font-medium">
          Manufacturer shops
        </Link>
        <Link to="/projects" onClick={onClose} className="block py-2 font-medium">
          Projects
        </Link>
        <Link to="/trade" onClick={onClose} className="block py-2 font-medium">
          Trade
        </Link>
        <Link to="/partners" onClick={onClose} className="block py-2 font-medium">
          Partners
        </Link>
        <Link to="/account" onClick={onClose} className="block py-2 font-medium">
          Account
        </Link>
        <Link to="/desk" onClick={onClose} className="block py-2 font-medium">
          Business Desk
        </Link>
      </div>
    </div>
  );
}

function SocialMark({ id }: { id: (typeof GROUP_SOCIAL)[number]["id"] }) {
  const common = { viewBox: "0 0 24 24", className: "size-4", fill: "currentColor", "aria-hidden": true } as const;
  if (id === "x") {
    return (
      <svg {...common}>
        <path d="M14.7 10.3 22.4 1.5h-1.8l-6.7 7.6L8.6 1.5H1.7l8.1 11.5L1.7 22.5h1.8l7.1-8.1 5.7 8.1h6.9L14.7 10.3Zm-2.5 2.8-.8-1.2-6.6-9.2h2.8l5.3 7.4.8 1.2 6.9 9.6h-2.8l-5.6-7.8Z" />
      </svg>
    );
  }
  if (id === "instagram") {
    return (
      <svg {...common}>
        <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm8 1.8H8A3.2 3.2 0 0 0 4.8 8v8A3.2 3.2 0 0 0 8 19.2h8a3.2 3.2 0 0 0 3.2-3.2V8A3.2 3.2 0 0 0 16 4.8ZM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8Zm4.35-2.55a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9Z" />
      </svg>
    );
  }
  if (id === "threads") {
    return (
      <svg {...common}>
        <path d="M16.4 11.2c-.2-2.4-1.6-4-4.1-4.2-2.2-.2-3.8.8-4.4 2.4l1.6.5c.4-1 .1-1.7 2.5-1.6 1.5.1 2.3.8 2.4 2.1-1-.1-2.1 0-3 .4-1.8.7-2.9 2-2.7 3.6.2 1.6 1.5 2.6 3.3 2.6 1.5 0 2.6-.6 3.2-1.7.4.9 1 1.5 2.1 1.7l.4-1.6c-.7-.2-1.1-.6-1.3-1.2.7-.4 1.1-1.1 1.1-2 .1-.7-.1-1.3-.3-1.6Zm-2.2 3.2c-.4.7-1.1 1.1-2 .1-.7-.1-1.1-.6-1.2-1.2-.1-.8.4-1.5 1.4-1.8.7-.2 1.4-.2 2.1 0 .1.9-.1 1.6-.3 2Z" />
      </svg>
    );
  }
  if (id === "tiktok") {
    return (
      <svg {...common}>
        <path d="M14.2 3.2c.4 2.2 1.7 3.6 3.8 3.9v2.2c-1.3 0-2.5-.4-3.6-1.2v6.4c0 3.3-2.4 5.6-5.6 5.6S3.2 17.8 3.2 14.6c0-3.1 2.3-5.5 5.4-5.6v2.3c-1.7.1-3 1.4-3 3.2 0 1.9 1.4 3.3 3.3 3.3s3.2-1.4 3.2-3.4V3.2h2.1Z" />
      </svg>
    );
  }
  if (id === "facebook") {
    return (
      <svg {...common}>
        <path d="M14.2 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4H17V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2h-2.5v2.8H11V21h3.2Z" />
      </svg>
    );
  }
  if (id === "linkedin") {
    return (
      <svg {...common}>
        <path d="M5.7 9.2H3.2V20h2.5V9.2ZM4.4 3.6A1.5 1.5 0 1 0 4.5 6.6 1.5 1.5 0 0 0 4.4 3.6ZM20.8 13.4c0-3.1-1.6-4.6-3.8-4.6-1.8 0-2.6 1-3.1 1.7V9.2H11.4c0 1.3 0 10.8 0 10.8h2.5v-6c0-.3 0-.7.1-1 .3-.7.9-1.4 2-1.4 1.4 0 2 1.1 2 2.7V20h2.5v-6.6h.3Z" />
      </svg>
    );
  }
  if (id === "youtube") {
    return (
      <svg {...common}>
        <path d="M21.2 8.2a2.5 2.5 0 0 0-1.8-1.8C17.7 6 12 6 12 6s-5.7 0-7.4.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2.4 12a26 26 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.8 1.8C6.3 18 12 18 12 18s5.7 0 7.4-.4a2.5 2.5 0 0 0 1.8-1.8 26 26 0 0 0 .4-3.8 26 26 0 0 0-.4-3.8ZM10.2 14.8V9.2L15.2 12l-5 2.8Z" />
      </svg>
    );
  }
  if (id === "behance") {
    return (
      <svg {...common}>
        <path d="M8.6 11.2c.8-.3 1.3-.9 1.3-1.7 0-1.4-1.1-2.2-2.9-2.2H3.2V17h4.1c1.9 0 3.2-.9 3.2-2.5 0-1.1-.6-1.9-1.9-2.3ZM5.4 8.6h1.5c.7 0 1.2.3 1.2.9s-.5 1-1.3 1H5.4V8.6Zm1.7 6.3H5.4v-2.1h1.8c.8 0 1.4.4 1.4 1.1s-.6 1-1.5 1ZM14.2 9.4c-2.4 0-3.9 1.6-3.9 3.9 0 2.4 1.6 3.9 4 3.9 1.6 0 2.8-.6 3.5-1.8h-2c-.4.5-.9.7-1.6.7-1 .0-1.7-.5-1.9-1.4h5.6v-.5c0-2.3-1.4-4.8-3.7-4.8Zm-1.8 3.2c.2-.9.9-1.5 1.8-1.5s1.6.6 1.8 1.5h-3.6ZM16.6 6.2h4.2v1.3h-4.2V6.2Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12.1 3.2A8.7 8.7 0 0 0 4.6 16.3L3.4 20.8l4.6-1.2A8.7 8.7 0 1 0 12.1 3.2Zm4.8 12.3c-.2.6-1.2 1.1-1.7 1.2-.4.1-.9.2-3-.6-2.5-1-4.1-3.5-4.2-3.7-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.9-.4h.6c.2 0 .4 0 .6.5.2.6.8 2 .8 2.1.1.2.1.3 0 .5-.1.2-.2.4-.3.5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.2.5.2.6.3.1.2.1.8-.1 1.4Z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="mt-16 bg-kiln text-bisque">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <img src="/brand/lockup_reversed.svg" alt="Bricksplaza" className="h-10" />
          <p className="mt-4 text-sm text-dim">
            A specialised operating division of Besbpo Group. Clay masonry, hard landscaping and specialist systems for South Africa.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm text-dim">
            <MapPin className="size-4" /> Midrand · Cato Ridge
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-dim">
            <Phone className="size-4" /> {CONTACTS.sales}
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-gold">Besbpo Group</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {GROUP_SOCIAL.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${item.name}, Besbpo Group`}
                  className="flex size-9 items-center justify-center rounded-full border border-bisque/20 text-dim hover:border-bisque/50 hover:text-bisque"
                >
                  <SocialMark id={item.id} />
                </a>
              </li>
            ))}
          </ul>
          <a href="https://wa.me/27683676276" className="mt-2 inline-block text-xs text-dim hover:text-bisque" target="_blank" rel="noreferrer">
            WhatsApp {CONTACTS.whatsapp}
          </a>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            {CATEGORIES.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link to="/shop/$slug" params={{ slug: c.slug }} className="text-dim hover:text-bisque">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Sectors</p>
          <ul className="mt-3 space-y-2 text-sm">
            {SECTORS.map((s) => (
              <li key={s}>
                <Link
                  to="/sectors/$slug"
                  params={{ slug: s.toLowerCase() }}
                  className="text-dim hover:text-bisque"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-gold">Support</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/help" className="text-dim hover:text-bisque">
                Help centre
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-dim hover:text-bisque">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/rfq" className="text-dim hover:text-bisque">
                Bulk quote / RFQ
              </Link>
            </li>
            <li>
              <Link to="/brands" className="text-dim hover:text-bisque">
                Manufacturer shops
              </Link>
            </li>
            <li>
              <Link to="/partners" className="text-dim hover:text-bisque">
                Strategic partners
              </Link>
            </li>
            <li>
              <Link to="/returns" className="text-dim hover:text-bisque">
                Returns
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["terms-and-conditions", "Terms"],
              ["privacy-policy", "Privacy"],
              ["cookie-policy", "Cookies"],
              ["returns-and-refunds", "Returns"],
              ["warranty-policy", "Warranty"],
              ["popia-data-subject-rights", "POPIA rights"],
              ["trade-account-terms", "Trade terms"],
              ["sale-of-goods-terms", "Sale of goods"],
              ["acceptable-use-policy", "Acceptable use"],
            ].map(([slug, label]) => (
              <li key={slug}>
                <Link to="/legal/$slug" params={{ slug }} className="text-dim hover:text-bisque">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/accessibility" className="text-dim hover:text-bisque">
                Accessibility
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-bisque/10">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-4 gap-y-2 px-4 py-4 text-[11px] uppercase tracking-[0.14em] text-dim sm:px-6">
          {GROUP.map((g) => (
            <span key={g.name}>{g.name}</span>
          ))}
        </div>
      </div>
      <div className="border-t border-bisque/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-dim sm:flex-row sm:justify-between sm:px-6">
          <p>SANS · SABS · NRCS · Agrément SA · PCI-DSS via payment partners</p>
          <p>© {new Date().getFullYear()} Bricksplaza · A division of Besbpo Group</p>
        </div>
      </div>
    </footer>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 w-[min(100vw-2.5rem,22rem)] rounded-xl bg-paper p-4 shadow-[var(--shadow-card-hover)]">
          <p className="font-display text-lg">Yard desk</p>
          <p className="mt-1 text-sm text-mortar">Weekdays 07:00–16:30 SAST. Leave a note and a merchandiser will pick it up.</p>
          {sent ? (
            <p className="mt-3 rounded-md bg-card px-3 py-2 text-sm">Message received — we’ll reply to the email on your account.</p>
          ) : (
            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <textarea required name="m" rows={3} className="w-full rounded-md border border-line p-2 text-sm" placeholder="Ask about a SKU, a load or a trade account…" />
              <button className="h-10 w-full rounded-md bg-clay text-sm font-medium text-paper">Send</button>
            </form>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-clay px-4 font-medium text-paper shadow-[var(--shadow-card-hover)]"
      >
        <MessageCircle className="size-4" /> Live chat
      </button>
    </div>
  );
}

function CookieNotice() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (localStorage.getItem("bp-cookies")) setShow(false);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-mortar">
          We use essential cookies to run checkout and optional analytics to improve the catalogue.{" "}
          <Link to="/legal/$slug" params={{ slug: "cookie-policy" }} className="text-clay underline">
            Cookie policy
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            className="h-10 rounded-md bg-kiln px-4 text-sm text-bisque"
            onClick={() => {
              localStorage.setItem("bp-cookies", "all");
              setShow(false);
            }}
          >
            Accept
          </button>
          <button
            className="h-10 rounded-md border border-line px-4 text-sm"
            onClick={() => {
              localStorage.setItem("bp-cookies", "essential");
              setShow(false);
            }}
          >
            Essential only
          </button>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  body,
}: {
  kicker?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="border-b border-line bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {kicker && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-clay">{kicker}</p>
        )}
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h1>
        {body && <p className="mt-3 max-w-2xl text-mortar">{body}</p>}
      </div>
    </div>
  );
}

export function DeskShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const links = [
    ["/desk", "Dashboard"],
    ["/desk/orders", "Orders"],
    ["/desk/logistics", "Logistics"],
    ["/desk/rfqs", "Quotes"],
    ["/desk/returns", "Returns"],
    ["/desk/questions", "Questions"],
    ["/desk/inbox", "Inbox"],
    ["/desk/inventory", "Inventory"],
    ["/desk/brands", "Brands"],
    ["/desk/customers", "Trade & customers"],
    ["/desk/pricing", "Pricing engine"],
    ["/desk/promotions", "Promotions"],
    ["/desk/reviews", "Reviews"],
    ["/desk/reports", "Reports"],
  ] as const;
  return (
    <div className="flex min-h-screen bg-kiln text-bisque">
      <aside className="hidden w-60 shrink-0 border-r border-bisque/10 md:block">
        <Link to="/" className="block px-5 py-5">
          <img src="/brand/lockup_reversed.svg" alt="Bricksplaza" className="h-8" />
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-gold">Business Desk</p>
        </Link>
        <nav className="px-3">
          {links.map(([href, label]) => (
            <Link
              key={href}
              to={href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm text-dim hover:bg-bisque/5 hover:text-bisque",
                pathname === href && "bg-bisque/10 text-bisque",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="mt-8 block px-6 text-xs text-dim hover:text-gold">
          ← Back to storefront
        </Link>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-bisque/10 px-4 py-3 md:px-8">
          <p className="text-sm text-dim">Yard desk · stock, trade and banners are saved for every visitor</p>
          <UserButton />
        </div>
        <nav className="flex gap-1 overflow-x-auto border-b border-bisque/10 px-3 py-2 md:hidden">
          {links.map(([href, label]) => (
            <Link
              key={href}
              to={href}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-xs text-dim",
                pathname === href && "bg-bisque/10 text-bisque",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

export function YardClaim({ unclaimed, onClaimed }: { unclaimed: boolean; onClaimed: () => void }) {
  if (!unclaimed) return null;
  return (
    <div className="mt-4 rounded-xl bg-kiln-2 p-4">
      <p className="text-sm">Claim the yard desk before you can work this queue.</p>
      <Button
        className="mt-3"
        onClick={async () => {
          try {
            await claimYard();
            toast.success("This account is the yard operator");
            onClaimed();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not claim the desk");
          }
        }}
      >
        Claim the yard desk
      </Button>
    </div>
  );
}
