import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { PROVINCES } from "@/data/taxonomy";
import { BANDS } from "@/lib/delivery";

export const Route = createFileRoute("/locations/$slug")({ component: Location });

function Location() {
  const { slug } = Route.useParams();
  const p = PROVINCES.find((x) => x.slug === slug);
  if (!p) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Province not listed</h1>
        <Link to="/" className="mt-4 inline-block text-clay">
          Home
        </Link>
      </div>
    );
  }
  return (
    <>
      <PageHeader kicker={p.mode === "yard" ? "Yard fulfilment" : "Online-first"} title={p.name} body={p.blurb} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {p.yard && <p className="font-medium">{p.yard}</p>}
        <ul className="mt-6 space-y-2 text-sm text-mortar">
          {Object.values(BANDS).map((b) => (
            <li key={b.label}>
              {b.label} · {b.distance} · {b.time} · {b.fee == null ? "Quoted" : b.fee === 0 ? "Free" : `R${b.fee.toLocaleString("en-ZA")}`}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
