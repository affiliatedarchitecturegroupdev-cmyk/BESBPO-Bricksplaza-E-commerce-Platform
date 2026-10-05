import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { PITCH_SLIDES } from "@/data/pitch";
import { buttonVariants } from "@/components/ui/button";

export function PitchDeck() {
  const len = PITCH_SLIDES.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const touchX = useRef<number | null>(null);
  const indexRef = useRef(0);
  const slide = PITCH_SLIDES[i]!;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    setReady(true);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  function jump(idx: number, announce: boolean) {
    const next = ((idx % len) + len) % len;
    indexRef.current = next;
    setI(next);
    if (announce) {
      const s = PITCH_SLIDES[next]!;
      setAnnouncement(`Chapter ${next + 1} of ${len}. ${s.chapter}. ${s.title}`);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6" aria-label="Bricksplaza pitch">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div
        className="overflow-hidden rounded-xl bg-kiln text-bisque shadow-[var(--shadow-card)] lg:grid lg:min-h-[32rem] lg:grid-cols-[17.5rem_1fr]"
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
        <div className="flex flex-col border-b border-bisque/10 lg:border-r lg:border-b-0">
          <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold">The pitch</p>
            <p className="mt-1 font-display text-lg leading-tight">How the yard actually works.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0" role="tablist" aria-label="Pitch chapters">
            {PITCH_SLIDES.map((s, idx) => {
              const on = idx === i;
              return (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={`shrink-0 rounded-full px-3 py-2 text-left lg:w-full lg:rounded-none lg:px-5 lg:py-3 ${on ? "bg-kiln-2" : "bg-white/5 hover:bg-white/10 lg:bg-transparent"}`}
                  onClick={() => jump(idx, true)}
                >
                  <span className={`block text-[10px] tabular-nums tracking-[0.16em] ${on ? "text-gold" : "text-bisque/45"}`}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium">{s.chapter}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-auto hidden items-center gap-2 px-4 py-4 lg:flex">
            <DeckControls paused={paused} onPause={() => setPaused((p) => !p)} onPrev={() => jump(indexRef.current - 1, true)} onNext={() => jump(indexRef.current + 1, true)} />
            <span className="ml-auto text-xs tabular-nums text-bisque/70">
              {String(i + 1).padStart(2, "0")}/{String(len).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div
          className="relative min-h-[28rem] sm:min-h-[32rem]"
          aria-roledescription="carousel"
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
          {PITCH_SLIDES.map((s, idx) => (
            <img
              key={s.key}
              src={s.image}
              alt={idx === i ? s.alt : ""}
              className={`absolute inset-0 h-full w-full object-cover ${reduced ? "" : "transition-opacity duration-700"} ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
              style={{ objectPosition: s.focus }}
              draggable={false}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-kiln via-kiln/75 to-kiln/15" />
          <div className="relative flex min-h-[28rem] flex-col justify-end p-4 sm:min-h-[32rem] sm:p-7">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{slide.kicker}</p>
            <h2 className="mt-2 max-w-xl font-display text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.08]">{slide.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-bisque/90 sm:text-base">{slide.body}</p>
            <ul className="mt-4 grid max-w-xl gap-2 sm:grid-cols-3">
              {slide.points.map((point) => (
                <li key={point} className="rounded-md border border-bisque/20 bg-kiln/50 px-3 py-2 text-xs leading-snug text-bisque">
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href={slide.href} className={buttonVariants({ variant: "gold", size: "md" })}>
                {slide.cta} <ArrowRight className="size-4" />
              </a>
              <span className="text-[10px] text-bisque/55">{slide.credit}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 lg:hidden">
              <DeckControls paused={paused} onPause={() => setPaused((p) => !p)} onPrev={() => jump(indexRef.current - 1, true)} onNext={() => jump(indexRef.current + 1, true)} />
              <span className="ml-auto text-xs tabular-nums text-bisque/70">
                {String(i + 1).padStart(2, "0")}/{String(len).padStart(2, "0")}
              </span>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-bisque/20" aria-hidden>
            <div
              key={i}
              data-paused={paused || hover ? "true" : "false"}
              className={`h-full origin-left bg-gold ${ready && !reduced ? "pitch-run" : "scale-x-0"}`}
              onAnimationEnd={(e) => {
                if (e.target !== e.currentTarget || paused || hover || reduced) return;
                jump(indexRef.current + 1, false);
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function DeckControls({
  paused,
  onPause,
  onPrev,
  onNext,
}: {
  paused: boolean;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <button type="button" className="grid size-9 place-items-center rounded-full border border-bisque/25" aria-label="Previous chapter" onClick={onPrev}>
        <ChevronLeft className="size-4" />
      </button>
      <button type="button" className="grid size-9 place-items-center rounded-full border border-bisque/25" aria-label="Next chapter" onClick={onNext}>
        <ChevronRight className="size-4" />
      </button>
      <button
        type="button"
        className="grid size-9 place-items-center rounded-full border border-bisque/25"
        aria-label={paused ? "Play the pitch" : "Pause the pitch"}
        aria-pressed={paused}
        onClick={onPause}
      >
        {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
      </button>
    </>
  );
}
