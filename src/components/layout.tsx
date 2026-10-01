import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { SignedIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart } from "@/lib/cart-store";
import { CATEGORIES, FAMILIES, SECTORS } from "@/data/taxonomy";
import { CONTACTS, GROUP, GROUP_SOCIAL, PAYMENT_METHODS } from "@/data/content";
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
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  const [sectorOpen, setSectorOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const { user } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
    setShopOpen(false);
    setSectorOpen(false);
  }, [pathname]);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setShopOpen(false);
        setSectorOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-line/80 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md hover:bg-card lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <Link to="/" className="flex shrink-0 items-center">
            <img src="/brand/lockup_light.svg" alt="Bricksplaza" className="h-9 w-auto sm:h-10" />
          </Link>
          <SearchBox />
          <div className="ml-auto flex items-center gap-1">
            {user ? (
              <SignedIn>
                <Link to="/account" className="hidden h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card sm:inline-flex">
                  Account
                </Link>
                <UserButton />
              </SignedIn>
            ) : (
              <Link to="/login" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
                Sign in
              </Link>
            )}
            <Link to="/cart" className="relative inline-flex size-11 items-center justify-center rounded-md hover:bg-card" aria-label="Cart">
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-clay px-1 text-center text-[10px] font-semibold leading-4 text-paper tabular-nums">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <nav ref={navRef} className="mx-auto hidden max-w-7xl items-center gap-1 px-4 pb-2 lg:flex sm:px-6">
          <div className="relative">
            <button
              type="button"
              aria-expanded={shopOpen}
              className="inline-flex h-11 items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-card"
              onClick={() => {
                setShopOpen((v) => !v);
                setSectorOpen(false);
              }}
            >
              Shop <ChevronDown className="size-3.5" />
            </button>
            {shopOpen && (
              <div className="absolute left-0 top-full z-50 w-[min(40rem,calc(100vw-2rem))] rounded-xl bg-paper p-5 shadow-[var(--shadow-card-hover)]">
                <Link to="/shop" className="mb-3 inline-block text-sm font-medium text-clay">
                  All products
                </Link>
                <div className="grid grid-cols-2 gap-5">
                  {FAMILIES.map((f) => (
                    <div key={f.slug}>
                      <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">{f.name}</p>
                      <ul className="space-y-1">
                        {CATEGORIES.filter((c) => c.family === f.slug).map((c) => (
                          <li key={c.slug}>
                            <Link to="/shop/$slug" params={{ slug: c.slug }} className="block rounded-md px-2 py-1.5 text-sm hover:bg-card hover:text-clay">
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
          <div className="relative">
            <button
              type="button"
              aria-expanded={sectorOpen}
              className="inline-flex h-11 items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-card"
              onClick={() => {
                setSectorOpen((v) => !v);
                setShopOpen(false);
              }}
            >
              Sectors <ChevronDown className="size-3.5" />
            </button>
            {sectorOpen && (
              <div className="absolute left-0 top-full z-50 w-56 rounded-xl bg-paper p-3 shadow-[var(--shadow-card-hover)]">
                {SECTORS.map((sector) => (
                  <Link
                    key={sector}
                    to="/sectors/$slug"
                    params={{ slug: sector.toLowerCase() }}
                    className="block rounded-md px-2 py-2 text-sm hover:bg-card hover:text-clay"
                  >
                    {sector}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/projects" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
            Projects
          </Link>
          <Link to="/blog" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
            Blog
          </Link>
          <Link to="/trade" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
            Trade
          </Link>
          <Link to="/help" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-card">
            Help
          </Link>
        </nav>
      </div>
      {open &&
        typeof document !== "undefined" &&
        createPortal(<MobileMenu onClose={() => setOpen(false)} />, document.body)}
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
  const links = [
    ["/shop", "Shop"],
    ["/brands", "Brands"],
    ["/blog", "Blog"],
    ["/projects", "Projects"],
    ["/trade", "Trade"],
    ["/partners", "Partners"],
    ["/help", "Help"],
    ["/contact", "Contact"],
    ["/ways-to-pay", "Ways to pay"],
    ["/careers", "Careers"],
  ] as const;
  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <button type="button" className="absolute inset-0 bg-kiln/40" aria-label="Close menu" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-[min(100%,20rem)] overflow-y-auto bg-paper p-5 shadow-[var(--shadow-card-hover)]">
        <div className="mb-4 flex items-center justify-between">
          <img src="/brand/lockup_light.svg" alt="Bricksplaza" className="h-8" />
          <button type="button" className="inline-flex size-11 items-center justify-center" aria-label="Close" onClick={onClose}>
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
          <input name="q" placeholder="Search catalogue" className="h-11 w-full rounded-md border border-line bg-card px-3 text-sm" />
        </form>
        {links.map(([to, label]) => (
          <Link key={to} to={to} onClick={onClose} className="block py-2 font-medium">
            {label}
          </Link>
        ))}
        <p className="mb-1 mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">Sectors</p>
        {SECTORS.map((sector) => (
          <Link key={sector} to="/sectors/$slug" params={{ slug: sector.toLowerCase() }} onClick={onClose} className="block py-2 text-sm">
            {sector}
          </Link>
        ))}
        {FAMILIES.map((f) => (
          <div key={f.slug} className="mb-4 mt-4">
            <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-muted">{f.name}</p>
            {CATEGORIES.filter((c) => c.family === f.slug).map((c) => (
              <Link key={c.slug} to="/shop/$slug" params={{ slug: c.slug }} onClick={onClose} className="block py-2 text-sm">
                {c.name}
              </Link>
            ))}
          </div>
        ))}
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
                  className="block size-8 opacity-90 hover:opacity-100"
                >
                  <img src={item.icon} alt="" className="size-8 object-contain" />
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
              <Link to="/blog" className="text-dim hover:text-bisque">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/ways-to-pay" className="text-dim hover:text-bisque">
                Ways to pay
              </Link>
            </li>
            <li>
              <Link to="/careers" className="text-dim hover:text-bisque">
                Careers
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
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Ways to pay</p>
            <Link to="/ways-to-pay" className="text-xs text-dim hover:text-bisque">
              All 18 methods
            </Link>
          </div>
          <ul className="mt-3 flex flex-wrap items-center gap-2">
            {PAYMENT_METHODS.filter((method) => method.logo).map((method) => (
              <li key={method.id}>
                <Link to="/ways-to-pay" aria-label={method.name} className="flex h-10 items-center rounded-md bg-bisque px-2">
                  <img src={method.logo!} alt="" className="h-6 w-auto max-w-[5.5rem] object-contain" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-dim">PayFast, Ozow, Yoco, Happy Pay and the other methods without a mark are on the same page.</p>
        </div>
      </div>
      <div className="border-t border-bisque/10">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-4 gap-y-2 px-4 py-4 text-[11px] uppercase tracking-[0.14em] text-dim sm:px-6">
          {GROUP.map((g) =>
            g.name === "Affiliated Builders" ? (
              <Link key={g.name} to="/divisions/$slug" params={{ slug: "affiliated-builders" }} className="hover:text-bisque">
                {g.name}
              </Link>
            ) : g.name === "Finishes Construction" ? (
              <Link key={g.name} to="/divisions/$slug" params={{ slug: "finishes-construction" }} className="hover:text-bisque">
                {g.name}
              </Link>
            ) : (
              <span key={g.name}>{g.name}</span>
            ),
          )}
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
    ["/desk/journal", "Journal"],
    ["/desk/reviews", "Reviews"],
    ["/desk/leads", "Leads"],
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
