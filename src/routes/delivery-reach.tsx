import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout";
import { BANDS } from "@/lib/delivery";
import { REACH, REACH_TOWN_COUNT, placeHaystack, placeLabel, type ReachPlace } from "@/data/reach";

export const Route = createFileRoute("/delivery-reach")({
  head: () => ({
    meta: [
      { title: "Delivery reach · Bricksplaza" },
      {
        name: "description",
        content: `Bricksplaza delivers in all nine South African provinces. Search ${REACH_TOWN_COUNT} cities and towns, from the Midrand and Cato Ridge yards.`,
      },
    ],
  }),
  component: DeliveryReach,
});

function norm(value: string) {
  return value
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function DeliveryReach() {
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState<Set<string>>(() => new Set());
  const [picked, setPicked] = useState<{ province: string; place: ReachPlace } | null>(null);
  const needle = norm(query);

  const visible = useMemo(() => {
    if (needle.length < 2) return REACH;
    return REACH.map((province) => ({
      ...province,
      towns: province.towns.filter((place) => norm(placeHaystack(place)).includes(needle)),
    })).filter((province) => province.towns.length > 0);
  }, [needle]);

  const shownTowns = visible.reduce((n, province) => n + province.towns.length, 0);
  const open = needle.length >= 2 ? new Set(visible.map((province) => province.slug)) : manual;

  function jump(slug: string) {
    setQuery("");
    setManual(new Set([slug]));
    requestAnimationFrame(() => {
      document.getElementById(`province-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggle(slug: string) {
    if (needle.length >= 2) return;
    setManual((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <>
      <PageHeader
        kicker="Delivery reach"
        title="All nine provinces. The town list is the delivery list."
        body="Buying online does not mean the brick has to come from somewhere you cannot name. Search the city or town. If it is here, we will take the load. Gauteng and KwaZulu-Natal leave from the yards. Everywhere else is a quoted long haul."
      />

      <section className="border-b border-line bg-paper">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {[
            [String(REACH.length), "Provinces"],
            [String(REACH_TOWN_COUNT), "Cities and towns"],
            ["2", "Yards — Midrand and Cato Ridge"],
            ["100+", "Manufacturers we buy from"],
          ].map(([value, label]) => (
            <div key={label} className="bg-paper px-4 py-6 sm:px-6">
              <dt className="font-display text-3xl tabular-nums">{value}</dt>
              <dd className="mt-1 text-sm text-mortar">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Jump to a province</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
              {REACH.map((province) => (
                <li key={province.slug}>
                  <button
                    type="button"
                    onClick={() => jump(province.slug)}
                    className="flex w-full items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-left text-sm hover:border-clay"
                  >
                    <span>{province.name}</span>
                    <span className="tabular-nums text-muted">{province.towns.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Find a city or town</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPicked(null);
                }}
                placeholder="Polokwane, Gqeberha, Witbank, Upington…"
                className="mt-2 h-12 w-full rounded-md border border-line bg-paper px-4 text-base focus:outline-none focus:ring-2 focus:ring-clay/30"
              />
            </label>
            <p className="mt-2 text-sm text-mortar">
              {needle.length >= 2
                ? `${shownTowns} match${shownTowns === 1 ? "" : "es"} in ${visible.length} province${visible.length === 1 ? "" : "s"}.`
                : `${REACH_TOWN_COUNT} places. Older names still work — Nelspruit, Port Elizabeth, Witbank, Stanger.`}
            </p>

            {needle.length >= 2 && visible.length === 0 && (
              <div className="mt-6 rounded-xl border border-line bg-card p-5">
                <h2 className="font-display text-2xl">Not on this list</h2>
                <p className="mt-2 text-sm text-mortar">
                  A missing name is not a refusal. The list is the towns we planned the freight around. A smaller settlement on the same road can still be quoted.
                </p>
                <p className="mt-3 text-sm">
                  <Link to="/contact" className="text-clay">
                    Ask the yard
                  </Link>
                  <span className="text-muted"> · </span>
                  <Link to="/rfq" className="text-clay">
                    Send a bulk quote
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {visible.map((province) => {
                const expanded = open.has(province.slug);
                return (
                  <section key={province.slug} id={`province-${province.slug}`} className="scroll-mt-28 rounded-xl border border-line bg-paper">
                    <h2>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => toggle(province.slug)}
                        className="flex w-full items-start gap-4 px-4 py-4 text-left sm:px-5"
                      >
                        <span className="mt-1 inline-block w-3 shrink-0 text-clay" aria-hidden>
                          {expanded ? "–" : "+"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-display text-2xl">{province.name}</span>
                            <span className="text-sm tabular-nums text-muted">
                              {province.towns.length} {needle.length >= 2 ? "shown" : "towns"}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-clay">
                            {province.mode === "yard" ? province.yard : "Quoted long haul"} · {province.arteries}
                          </span>
                        </span>
                      </button>
                    </h2>
                    {expanded && (
                      <div className="border-t border-line px-4 py-4 sm:px-5">
                        <p className="max-w-3xl text-sm text-mortar">{province.why}</p>
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {province.towns.map((place) => {
                            const active = picked?.province === province.slug && picked.place.name === place.name;
                            return (
                              <li key={place.name}>
                                <button
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() => setPicked(active ? null : { province: province.slug, place })}
                                  className={
                                    active
                                      ? "rounded-full bg-kiln px-3 py-1.5 text-sm text-bisque"
                                      : "rounded-full border border-line px-3 py-1.5 text-sm hover:border-clay"
                                  }
                                >
                                  {placeLabel(place)}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        {picked?.province === province.slug && (
                          <div className="mt-4 rounded-lg bg-card p-4 text-sm">
                            <p className="font-medium">
                              {placeLabel(picked.place)}, {province.name}
                            </p>
                            <p className="mt-1 text-mortar">
                              {province.mode === "yard"
                                ? `On the yard run from ${province.yard}. The fee is worked out from the delivery postcode at checkout: local, regional or extended.`
                                : "On the national list. The fee is not guessed at checkout — a load past 250 km is quoted within one business day."}{" "}
                              Collection is only from Midrand or Cato Ridge, not from the town itself.
                            </p>
                            <p className="mt-3">
                              <Link to="/checkout" className="text-clay">
                                Check out with a postcode
                              </Link>
                              <span className="text-muted"> · </span>
                              <Link to="/contact" className="text-clay">
                                Ask about this town
                              </Link>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>

        <section className="mt-14 grid gap-8 border-t border-line pt-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl">How the fee is worked out</h2>
            <p className="mt-3 text-sm text-mortar">
              The same bands as checkout. A town on this page does not change the band. The postcode does. Crane offload is extra. The brand can still be specified — Corobrik, Bosun, Technicrete, Infraset, or another make from the manufacturers we buy from.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {Object.values(BANDS)
                .filter((band) => band.label !== "Collection")
                .map((band) => (
                  <li key={band.label} className="flex justify-between gap-4 border-b border-line py-2">
                    <span>
                      {band.label}
                      <span className="text-muted"> · {band.distance}</span>
                    </span>
                    <span className="tabular-nums">
                      {band.fee == null ? "Quoted" : `R${band.fee.toLocaleString("en-ZA")}`}
                      <span className="text-muted"> · {band.time}</span>
                    </span>
                  </li>
                ))}
            </ul>
          </div>
          <div className="rounded-xl bg-kiln p-6 text-bisque">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gold">If the town is not listed</p>
            <h2 className="mt-2 font-display text-3xl">Ask before you assume we do not go there.</h2>
            <p className="mt-3 text-sm text-dim">
              The {REACH_TOWN_COUNT} names are cities, regional centres, ports, mines, mills and the towns on the national roads between them. A farm, a township next to a listed town, or a stop on the same highway can still be on the truck. We will say so in the quote, not on a map we have not driven.
            </p>
            <p className="mt-5 text-sm">
              <Link to="/rfq" className="text-gold">
                Request a delivery quote
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
