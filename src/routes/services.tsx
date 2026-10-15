import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { submitEnquiry } from "@/lib/commerce";
import { CONTACTS } from "@/data/content";
import { toast } from "sonner";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services · Bricksplaza" },
      {
        name: "description",
        content:
          "Bricksplaza prices the masonry. Affiliated Builders can build it. Finishes Construction can finish it. BAE takes a design or engineering enquiry. None of that is a line on the brick checkout.",
      },
    ],
  }),
  component: Services,
});

const PATHS = [
  {
    who: "Bricksplaza",
    title: "Order the material",
    body: "Priced catalogue, a site pin, crane offload, and a coverage schedule taken from the figure on the product page.",
  },
  {
    who: "Affiliated Builders",
    title: "Build the wall",
    body: "The group contractor for masonry, concrete, external works and site civil. Their quote is not this checkout.",
  },
  {
    who: "Finishes Construction",
    title: "Finish the surfaces",
    body: "Plaster, floors, ceilings, waterproofing and the specialist coats, after the brick is up.",
  },
  {
    who: "BAE",
    title: "Ask the design question",
    body: "Bellwether Architecture & Engineering. An enquiry. Not a registration number and not a sign-off you can buy here.",
  },
] as const;

type Offer = {
  title: string;
  body: string;
  who: string;
};

const STORE: Offer[] = [
  {
    title: "Coverage schedule",
    who: "On this page",
    body: "Type the square metres and the units per square metre from the product page. The schedule adds a cut allowance. It does not read a plan, and it does not add mortar, DPC or lintels.",
  },
  {
    title: "Site pin and delivery",
    who: "Checkout",
    body: "The fee follows the nearer of Midrand and Cato Ridge once a pin is set. Past 250 km the fee is quoted. Collection stays free at the nearer yard.",
  },
  {
    title: "Crane / Hiab offload",
    who: "Checkout · R850",
    body: "A standard crane offload is a surcharge on delivery, not on collection. A tight stand, a staged drop, or a crane bigger than that is still a quote.",
  },
  {
    title: "AA 60/120",
    who: "Stock lines · 30 km",
    body: "R1 000 on top of a quoted delivery, Monday to Saturday, 07:00–15:30. The fee is kept only if the load is marked before 3 hours.",
  },
  {
    title: "Trade account",
    who: "12% and 20%",
    body: "Approved accounts buy at trade or volume, on net terms the desk sets. This is not invoice financing, and it is not switched on at signup.",
  },
  {
    title: "Bulk, staged, and aggregate loads",
    who: "RFQ",
    body: "A site that cannot hold the full load, or a wet-trade package of sand and crusher dust with the brick, is written on a bulk quote. Aggregated Aggregates is the group company for aggregates. Those lines are not in the priced brick cart.",
  },
  {
    title: "Colour study and spec sheet",
    who: "For a specifier",
    body: "A colourway can be tried on an elevation, a drive and a boundary. The spec sheet is the catalogue line. There is no BIM library and no sample box you add to the cart.",
  },
];

const BUILD: Offer[] = [
  {
    title: "Masonry and structural brickwork",
    who: "Affiliated Builders",
    body: "The contract to put the material in the wall sits with Affiliated Builders. Bricksplaza supplies the order they are building from.",
  },
  {
    title: "Retaining, paving base, external works",
    who: "Affiliated Builders",
    body: "Foundation build-up, stormwater and heavy paving are a site contract. This page does not sell an engineer’s sign-off, a soil test, or a paver thickness.",
  },
  {
    title: "Supervision of their own work",
    who: "Affiliated Builders",
    body: "If they are the contractor, supervision is part of that brief. Bricksplaza does not send a separate inspector, and it does not warrant someone else’s workmanship.",
  },
];

const FINISH: Offer[] = [
  {
    title: "From plaster to handover",
    who: "Finishes Construction",
    body: "Fifteen finishing disciplines. The quote is line-itemised by Finishes Construction. It is not added to the brick total.",
  },
  {
    title: "Workmanship on their contract",
    who: "Finishes Construction",
    body: "Where the NHBRC period applies to their work, that is stated on their page. It is not a warranty you buy because the brick came from this store.",
  },
];

const DESIGN: Offer[] = [
  {
    title: "Design and engineering brief",
    who: "BAE",
    body: "Retaining, a paving foundation, or an elevation that has to be drawn: write it to BAE. They decide whether they take it. This store does not publish a professional registration number.",
  },
  {
    title: "When a test might be needed",
    who: "BAE · not a lab booking",
    body: "Heavy paving and load-bearing walls sometimes need a geotechnical test. Ask in the brief. Bricksplaza does not book the lab and does not recommend a thickness from a postcode.",
  },
];

const DECLINED = [
  "No public installer directory, and no referral fee for a contractor we have not named.",
  "No plan upload that turns a drawing into a bill of quantities.",
  "No soil-test booking, and no engineer’s stamp sold as a product.",
  "No EDGE, Green Star, or carbon certificate.",
  "No CAD or BIM texture library, and no sample box on the checkout.",
  "No invoice financing. Trade terms are the only credit, and only after the desk approves the account.",
];

const ASKS = [
  "Coverage schedule",
  "Staged or tight-site delivery",
  "Aggregates with the brick",
  "Affiliated Builders — build",
  "Finishes Construction — finish",
  "BAE — design or engineering",
  "Not sure",
] as const;

function Services() {
  return (
    <>
      <PageHeader
        kicker="Besbpo Group"
        title="The brick, the build, and the finish are three different contracts."
        body="Bricksplaza prices the masonry. Affiliated Builders can build with it. Finishes Construction can take the surfaces to handover. Bellwether Architecture & Engineering takes a design or engineering question. None of those contracts is a line on the brick checkout."
      />

      <section className="border-b border-line bg-kiln text-bisque">
        <ul className="mx-auto grid max-w-7xl gap-px bg-bisque/10 sm:grid-cols-2 lg:grid-cols-4">
          {PATHS.map((path) => (
            <li key={path.who} className="bg-kiln px-4 py-6 sm:px-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{path.who}</p>
              <h2 className="mt-2 font-display text-2xl">{path.title}</h2>
              <p className="mt-2 text-sm text-dim">{path.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6">
        <ServiceBlock
          kicker="What the store already does"
          title="Material, freight, and a schedule you can check."
          offers={STORE}
        />
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/delivery-reach" className="font-medium text-clay">
            Pin a site
          </Link>
          <Link to="/express" className="font-medium text-clay">
            AA 60/120
          </Link>
          <Link to="/trade" className="font-medium text-clay">
            Trade account
          </Link>
          <Link to="/rfq" className="font-medium text-clay">
            Bulk quote
          </Link>
          <Link to="/visualise" className="font-medium text-clay">
            Colour study
          </Link>
          <a href="#schedule" className="font-medium text-clay">
            Coverage schedule
          </a>
        </div>

        <ServiceBlock
          kicker="Affiliated Builders"
          title="The group contractor, when the order has to become a wall."
          offers={BUILD}
        />
        <Link to="/divisions/$slug" params={{ slug: "affiliated-builders" }} className="inline-block text-sm font-medium text-clay">
          Affiliated Builders →
        </Link>

        <ServiceBlock
          kicker="Finishes Construction"
          title="The surfaces after the masonry, still not a brick SKU."
          offers={FINISH}
        />
        <Link to="/divisions/$slug" params={{ slug: "finishes-construction" }} className="inline-block text-sm font-medium text-clay">
          Finishes Construction →
        </Link>

        <ServiceBlock
          kicker="Bellwether Architecture & Engineering"
          title="A design question goes to BAE. It is not endorsed on the product page."
          offers={DESIGN}
        />
        <Link to="/bae" className="inline-block text-sm font-medium text-clay">
          Write to BAE →
        </Link>

        <Schedule />

        <section>
          <p className="text-[11px] uppercase tracking-[0.16em] text-clay">Not on this store</p>
          <h2 className="mt-1 font-display text-3xl">What we will not pretend to sell.</h2>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {DECLINED.map((line) => (
              <li key={line} className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-mortar">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <Ask />
      </div>
    </>
  );
}

function ServiceBlock({ kicker, title, offers }: { kicker: string; title: string; offers: Offer[] }) {
  return (
    <section>
      <p className="text-[11px] uppercase tracking-[0.16em] text-clay">{kicker}</p>
      <h2 className="mt-1 max-w-3xl font-display text-3xl">{title}</h2>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {offers.map((offer) => (
          <li key={offer.title} className="rounded-2xl bg-paper p-5 shadow-[var(--shadow-card)]">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{offer.who}</p>
            <h3 className="mt-2 font-display text-2xl">{offer.title}</h3>
            <p className="mt-2 text-sm text-mortar">{offer.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Line = { id: number; label: string; area: string; rate: string; waste: string };

function unitsFor(line: Line) {
  const area = Number(line.area);
  const rate = Number(line.rate);
  const waste = Number(line.waste);
  if (!Number.isFinite(area) || area <= 0 || area > 1_000_000) return null;
  if (!Number.isFinite(rate) || rate <= 0 || rate > 1000) return null;
  if (!Number.isFinite(waste) || waste < 0 || waste > 25) return null;
  return Math.ceil(area * rate * (1 + waste / 100));
}

function Schedule() {
  const [lines, setLines] = useState<Line[]>([
    { id: 1, label: "Face brick", area: "", rate: "", waste: "8" },
    { id: 2, label: "Pavers", area: "", rate: "", waste: "8" },
  ]);
  const [nextId, setNextId] = useState(3);

  function update(id: number, patch: Partial<Line>) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  const ready = lines
    .map((line) => ({ line, units: unitsFor(line) }))
    .filter((row): row is { line: Line; units: number } => row.units != null);

  return (
    <section id="schedule" className="scroll-mt-28 rounded-2xl bg-card p-5 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.16em] text-clay">Arithmetic, not a bill of quantities</p>
      <h2 className="mt-1 font-display text-3xl">Coverage schedule</h2>
      <p className="mt-2 max-w-2xl text-sm text-mortar">
        Use the units per square metre printed on the product page. The product page itself adds 8% for cuts. Leave mortar, DPC, lintels and specials off this sheet — the yard counts those on the quote.
      </p>
      <div className="mt-6 space-y-4">
        {lines.map((line) => {
          const units = unitsFor(line);
          return (
            <div key={line.id} className="grid gap-3 rounded-xl bg-paper p-4 sm:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))_auto] sm:items-end">
              <label>
                <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Line</span>
                <Input className="mt-1" value={line.label} onChange={(event) => update(line.id, { label: event.target.value })} />
              </label>
              <label>
                <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Square metres</span>
                <Input className="mt-1" inputMode="decimal" value={line.area} onChange={(event) => update(line.id, { area: event.target.value })} />
              </label>
              <label>
                <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Units / m²</span>
                <Input className="mt-1" inputMode="decimal" value={line.rate} placeholder="From the product" onChange={(event) => update(line.id, { rate: event.target.value })} />
              </label>
              <label>
                <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Cut allowance %</span>
                <Input className="mt-1" inputMode="decimal" value={line.waste} onChange={(event) => update(line.id, { waste: event.target.value })} />
              </label>
              <div className="flex items-end justify-between gap-3 sm:flex-col sm:items-end">
                <p className="font-display text-2xl tabular-nums">{units == null ? "—" : units.toLocaleString("en-ZA")}</p>
                {lines.length > 1 && (
                  <button type="button" className="text-sm text-clay" onClick={() => setLines((current) => current.filter((row) => row.id !== line.id))}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <button
          type="button"
          className="font-medium text-clay"
          onClick={() => {
            setLines((current) => [...current, { id: nextId, label: "", area: "", rate: "", waste: "8" }]);
            setNextId((id) => id + 1);
          }}
        >
          Add a line
        </button>
        <Link to="/rfq" className="font-medium text-clay">
          Send a bulk quote
        </Link>
        {ready.length > 0 && (
          <p className="text-mortar">
            {ready.map((row) => `${row.line.label || "Line"} ${row.units.toLocaleString("en-ZA")} units`).join(" · ")}
          </p>
        )}
      </div>
    </section>
  );
}

function Ask() {
  const [sent, setSent] = useState(false);
  return (
    <section className="grid gap-8 rounded-2xl bg-kiln p-6 text-bisque lg:grid-cols-[0.8fr_1.2fr] sm:p-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">One brief</p>
        <h2 className="mt-2 font-display text-3xl">Say which contract you actually want.</h2>
        <p className="mt-3 text-sm text-dim">
          The yard reads it and sends it to the right company. It does not reserve stock, and it is not a tender. Write the materials questions to {CONTACTS.sales}.
        </p>
      </div>
      {sent ? (
        <p className="text-sm">Received. A person replies. Nothing has been priced.</p>
      ) : (
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              await submitEnquiry({
                data: {
                  kind: "service",
                  role: String(form.get("role") ?? ""),
                  name: String(form.get("name") ?? ""),
                  email: String(form.get("email") ?? ""),
                  phone: String(form.get("phone") ?? ""),
                  message: String(form.get("message") ?? ""),
                },
              });
              setSent(true);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not send");
            }
          }}
        >
          <label className="sm:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.14em] text-gold">Which brief</span>
            <Select name="role" className="mt-1 text-kiln" defaultValue={ASKS[0]}>
              {ASKS.map((ask) => (
                <option key={ask}>{ask}</option>
              ))}
            </Select>
          </label>
          <div>
            <Label className="text-gold">Name</Label>
            <Input name="name" required className="text-kiln" />
          </div>
          <div>
            <Label className="text-gold">Email</Label>
            <Input name="email" type="email" required className="text-kiln" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-gold">Phone</Label>
            <Input name="phone" className="text-kiln" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-gold">Site and what you need</Label>
            <Textarea name="message" required className="text-kiln" placeholder="Town, sector, and whether this is material, a build, a finish, or a design question." />
          </div>
          <Button type="submit" className="sm:col-span-2">
            Send the brief
          </Button>
        </form>
      )}
    </section>
  );
}
