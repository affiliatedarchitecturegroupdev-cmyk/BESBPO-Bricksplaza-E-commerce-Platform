import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { COLOURS } from "@/data/taxonomy";
import { getCatalogue } from "@/data/catalogue";

export const Route = createFileRoute("/collections")({ component: Collections });

function Collections() {
  const cat = getCatalogue();
  return (
    <>
      <PageHeader
        kicker="14 colourways"
        title="Colour-matched collections"
        body="Face, semi-face and paver from the same clay body."
      />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 sm:grid-cols-2 lg:grid-cols-3">
        {COLOURS.map((c) => {
          const face = cat.find((p) => p.categorySlug === "clay-face-bricks" && p.colourFinish === c.name);
          if (face) {
            return (
              <Link
                key={c.slug}
                to="/product/$sku"
                params={{ sku: face.sku }}
                className="overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]"
              >
                <div className="h-24" style={{ background: c.hex }} />
                <div className="p-4">
                  <h2 className="font-display text-xl">{c.name}</h2>
                  <p className="text-sm text-mortar">Face · semi-face · paver · slips · coping</p>
                </div>
              </Link>
            );
          }
          return (
            <div key={c.slug} className="overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]">
              <div className="h-24" style={{ background: c.hex }} />
              <div className="p-4">
                <h2 className="font-display text-xl">{c.name}</h2>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
