import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout";
import { COLOURS } from "@/data/taxonomy";

export const Route = createFileRoute("/visualise")({
  head: () => ({
    meta: [
      { title: "Product to site · Bricksplaza" },
      {
        name: "description",
        content:
          "A colour study for Bricksplaza colourways on an elevation, a driveway and a boundary. Not a photograph of a named SKU on a site.",
      },
    ],
  }),
  component: Visualise,
});

const SCENES = [
  { id: "elevation", label: "Elevation", note: "Face brick on the wall." },
  { id: "drive", label: "Driveway", note: "Pavers in the same colourway." },
  { id: "boundary", label: "Boundary", note: "The wall and the coping." },
] as const;

function Visualise() {
  const [slug, setSlug] = useState<(typeof COLOURS)[number]["slug"]>("autumn-red");
  const [scene, setScene] = useState<(typeof SCENES)[number]["id"]>("elevation");
  const colour = COLOURS.find((row) => row.slug === slug) ?? COLOURS[0];

  return (
    <>
      <PageHeader
        kicker="Colour study"
        title="See a colourway on a stand before you specify it."
        body="Pick one of the 14 catalogue colourways. The drawing takes that colour. It is a study of how the colour sits on an elevation, a drive and a boundary. It is not a photograph of that product, and it is not your site."
      />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[18rem_1fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Colourway</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {COLOURS.map((row) => (
              <li key={row.slug}>
                <button
                  type="button"
                  onClick={() => setSlug(row.slug)}
                  className={`flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left text-sm ${
                    row.slug === colour.slug ? "border-clay bg-card" : "border-line bg-paper"
                  }`}
                >
                  <span className="size-6 shrink-0 rounded-sm border border-line" style={{ background: row.hex }} />
                  {row.name}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-mortar">
            <Link to="/search" search={{ colour: colour.name }} className="text-clay">
              Shop {colour.name}
            </Link>
            <span className="text-muted"> · </span>
            <Link to="/collections" className="text-clay">
              Face, semi-face and paver
            </Link>
          </p>
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {SCENES.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setScene(row.id)}
                className={`h-11 rounded-md px-4 text-sm ${scene === row.id ? "bg-kiln text-bisque" : "bg-paper text-kiln"}`}
              >
                {row.label}
              </button>
            ))}
          </div>
          <figure className="mt-4 overflow-hidden rounded-2xl bg-kiln">
            <Study colour={colour.hex} scene={scene} />
            <figcaption className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm text-dim">
              <span>
                {colour.name} · {SCENES.find((row) => row.id === scene)?.note}
              </span>
              <span>Colour study. Not a site photograph.</span>
            </figcaption>
          </figure>
          <p className="mt-4 max-w-2xl text-sm text-mortar">
            Kiln variation is real. A sample panel still comes before a full elevation. Manufacturer shops — Corobrik, Bosun, Technicrete, Infraset — are quoted separately and are not recoloured here.
          </p>
        </div>
      </div>
    </>
  );
}

function Study({ colour, scene }: { colour: string; scene: (typeof SCENES)[number]["id"] }) {
  return (
    <svg viewBox="0 0 800 460" className="h-auto w-full" role="img" aria-label="Colour study drawing">
      <rect width="800" height="460" fill="#3a312b" />
      <rect y="340" width="800" height="120" fill="#2a2420" />
      {scene === "elevation" && <Elevation colour={colour} />}
      {scene === "drive" && <Drive colour={colour} />}
      {scene === "boundary" && <Boundary colour={colour} />}
    </svg>
  );
}

function Elevation({ colour }: { colour: string }) {
  return (
    <g>
      <rect x="180" y="90" width="440" height="260" fill={colour} />
      {Array.from({ length: 12 }).map((_, row) =>
        Array.from({ length: 10 }).map((__, col) => (
          <rect
            key={`${row}-${col}`}
            x={192 + col * 42 + (row % 2 ? 20 : 0)}
            y={102 + row * 20}
            width="36"
            height="12"
            fill="rgba(38,33,30,0.18)"
          />
        )),
      )}
      <rect x="250" y="160" width="70" height="90" fill="#ede1d3" />
      <rect x="480" y="160" width="70" height="90" fill="#ede1d3" />
      <rect x="360" y="250" width="80" height="100" fill="#26211e" />
      <polygon points="160,100 400,40 640,100" fill="#26211e" />
    </g>
  );
}

function Drive({ colour }: { colour: string }) {
  return (
    <g>
      <rect x="80" y="150" width="220" height="190" fill="#c4b496" />
      <rect x="110" y="190" width="50" height="60" fill="#ede1d3" />
      <rect x="190" y="190" width="50" height="60" fill="#ede1d3" />
      <rect x="150" y="270" width="60" height="70" fill="#26211e" />
      {Array.from({ length: 14 }).map((_, row) =>
        Array.from({ length: 16 }).map((__, col) => {
          const offset = row % 2 ? 16 : 0;
          return (
            <rect
              key={`${row}-${col}`}
              x={330 + col * 28 + offset}
              y={150 + row * 16}
              width="22"
              height="12"
              fill={colour}
              transform={`rotate(45 ${342 + col * 28 + offset} ${156 + row * 16})`}
            />
          );
        }),
      )}
    </g>
  );
}

function Boundary({ colour }: { colour: string }) {
  return (
    <g>
      <rect x="70" y="150" width="660" height="160" fill={colour} />
      {Array.from({ length: 7 }).map((_, row) =>
        Array.from({ length: 18 }).map((__, col) => (
          <rect
            key={`${row}-${col}`}
            x={82 + col * 36 + (row % 2 ? 16 : 0)}
            y={162 + row * 20}
            width="30"
            height="12"
            fill="rgba(38,33,30,0.18)"
          />
        )),
      )}
      <rect x="70" y="128" width="660" height="24" fill="#d9a441" />
      <rect x="90" y="310" width="40" height="50" fill="#3f6b4c" />
      <rect x="180" y="300" width="50" height="60" fill="#3f6b4c" />
      <rect x="560" y="305" width="46" height="55" fill="#3f6b4c" />
    </g>
  );
}
