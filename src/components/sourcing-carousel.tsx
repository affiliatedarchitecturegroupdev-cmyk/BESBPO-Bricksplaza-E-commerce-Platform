import { Link } from "@tanstack/react-router";
import { useEffect, useState, type KeyboardEvent } from "react";
import { SOURCING_BODIES } from "@/data/sourcing";

export function SourcingCarousel({ size }: { size: "page" | "strip" }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const current = SOURCING_BODIES[active]!;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % SOURCING_BODIES.length), 6200);
    return () => window.clearInterval(timer);
  }, [paused, reduced]);

  function move(direction: number) {
    setActive((value) => (value + direction + SOURCING_BODIES.length) % SOURCING_BODIES.length);
    setPaused(true);
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === "ArrowRight") move(1);
    if (event.key === "ArrowLeft") move(-1);
  }

  const shell = current.onDark ? "bg-kiln" : "bg-paper";

  if (size === "strip") {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-roledescription="carousel" aria-label="Responsible sourcing">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Responsible sourcing</p>
            <h2 className="mt-1 font-display text-3xl">The mark is not the proof.</h2>
          </div>
          <Link to="/responsible-sourcing" className="shrink-0 text-sm font-medium text-clay">
            How we check partners
          </Link>
        </div>
        <div
          className="overflow-hidden rounded-xl bg-kiln text-bisque"
          tabIndex={0}
          onKeyDown={onKey}
        >
          <div className="grid items-center gap-4 p-4 sm:grid-cols-[auto_1fr_auto] sm:p-5">
            <Link
              to="/responsible-sourcing"
              className={`grid h-16 w-28 place-items-center rounded-lg px-2 ${shell}`}
              aria-label={`${current.name} — open responsible sourcing`}
            >
              <img src={current.logo} alt="" className="max-h-12 w-full object-contain" />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{current.eyebrow}</p>
              <p className="mt-1 font-display text-xl">{current.name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-dim">{current.claim}</p>
            </div>
            <Controls active={active} paused={paused || reduced} onMove={move} onPause={() => setPaused((value) => !value)} compact />
          </div>
          <Dots active={active} onPick={(index) => { setActive(index); setPaused(true); }} />
        </div>
      </section>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-kiln text-bisque" aria-roledescription="carousel" aria-label="Responsible sourcing framework" tabIndex={0} onKeyDown={onKey}>
      <div className="grid lg:grid-cols-[18rem_1fr]">
        <div className="flex min-h-64 flex-col justify-between border-b border-bisque/10 p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-gold">
            <span>Partner ecosystem</span>
            <span className="tabular-nums">
              {String(active + 1).padStart(2, "0")} / {String(SOURCING_BODIES.length).padStart(2, "0")}
            </span>
          </div>
          <div className={`mx-auto mt-8 grid h-40 w-full max-w-xs place-items-center rounded-xl px-4 ${shell}`}>
            <img src={current.logo} alt={`${current.name} badge`} className="max-h-28 w-full object-contain" />
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-dim">Shown for education. A badge on a product still needs its own evidence.</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{current.eyebrow}</p>
              <h3 className="mt-2 font-display text-4xl">{current.name}</h3>
            </div>
            <a href={current.source} target="_blank" rel="noreferrer" className="shrink-0 text-sm text-gold hover:text-bisque">
              {current.sourceLabel}
            </a>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-dim">{current.description}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-kiln-2 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-gold">Evidence we request</p>
              <p className="mt-2 text-sm text-bisque/80">{current.proof}</p>
            </div>
            <div className="rounded-lg bg-kiln-2 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-gold">Publishing rule</p>
              <p className="mt-2 text-sm text-bisque/80">{current.claim}</p>
            </div>
          </div>
          <div className="mt-6">
            <Controls active={active} paused={paused || reduced} onMove={move} onPause={() => setPaused((value) => !value)} />
          </div>
        </div>
      </div>
      <Dots active={active} onPick={(index) => { setActive(index); setPaused(true); }} />
    </div>
  );
}

function Controls({
  active,
  paused,
  onMove,
  onPause,
  compact,
}: {
  active: number;
  paused: boolean;
  onMove: (direction: number) => void;
  onPause: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onMove(-1)} className="grid size-10 place-items-center rounded-full border border-bisque/20 hover:border-gold" aria-label="Previous body">
        ‹
      </button>
      <button type="button" onClick={() => onMove(1)} className="grid size-10 place-items-center rounded-full border border-bisque/20 hover:border-gold" aria-label="Next body">
        ›
      </button>
      <button type="button" onClick={onPause} className="h-10 rounded-full border border-bisque/20 px-3 text-[11px] uppercase tracking-[0.14em] hover:border-gold" aria-label={paused ? "Resume" : "Pause"}>
        {paused ? "Play" : "Pause"}
      </button>
      {compact ? <span className="sr-only">Slide {active + 1}</span> : null}
    </div>
  );
}

function Dots({ active, onPick }: { active: number; onPick: (index: number) => void }) {
  return (
    <div className="flex gap-1 border-t border-bisque/10 px-4 py-3" role="tablist" aria-label="Sourcing bodies">
      {SOURCING_BODIES.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={index === active}
          aria-label={item.name}
          onClick={() => onPick(index)}
          className={`h-1.5 flex-1 rounded-full ${index === active ? "bg-gold" : "bg-bisque/20"}`}
        />
      ))}
    </div>
  );
}
