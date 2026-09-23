import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AD_SLOTS } from "@/data/ads";
import { AdBanner } from "@/components/ad-banner";
import { readAdSchedule, writeAdSchedule, type AdOverride } from "@/lib/ad-schedule";

export const Route = createFileRoute("/desk/promotions")({ component: Promotions });

function Promotions() {
  const [schedule, setSchedule] = useState<Record<string, AdOverride>>({});

  useEffect(() => {
    setSchedule(readAdSchedule());
  }, []);

  function patch(id: string, next: AdOverride) {
    const merged = { ...schedule, [id]: { ...schedule[id], ...next } };
    setSchedule(merged);
    writeAdSchedule(merged);
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Promotions & banners</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Eight placement zones. No third-party network — every slot is Bricksplaza creative. Pause a slot or set a date window; the storefront on this browser picks it up immediately. Draft stays off the rail until the window opens.
      </p>
      <div className="mt-8 space-y-8">
        {AD_SLOTS.map((slot) => {
          const o = schedule[slot.id] ?? {};
          return (
            <section key={slot.id} className="rounded-xl bg-kiln-2 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gold">
                    Slot {slot.slotNumber} · {slot.width}×{slot.height}
                  </p>
                  <h2 className="font-display text-xl">{slot.name}</h2>
                  <p className="text-xs text-dim">
                    {slot.placement} · {slot.position} · {slot.creativeType}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(o.paused)}
                    onChange={(e) => patch(slot.id, { paused: e.target.checked })}
                  />
                  Paused
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <label>
                  From
                  <input
                    type="date"
                    className="ml-2 rounded-md bg-kiln px-2 py-1"
                    value={o.activeFrom?.slice(0, 10) ?? ""}
                    onChange={(e) => patch(slot.id, { activeFrom: e.target.value || undefined })}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    className="ml-2 rounded-md bg-kiln px-2 py-1"
                    value={o.activeTo?.slice(0, 10) ?? ""}
                    onChange={(e) => patch(slot.id, { activeTo: e.target.value || undefined })}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-dim">
                  Headline
                  <input
                    className="mt-1 w-full rounded-md bg-kiln px-2 py-1 text-sm text-bisque"
                    value={o.headline ?? ""}
                    placeholder={slot.campaign.headline}
                    onChange={(e) => patch(slot.id, { headline: e.target.value || undefined })}
                  />
                </label>
                <label className="text-xs text-dim">
                  Call to action
                  <input
                    className="mt-1 w-full rounded-md bg-kiln px-2 py-1 text-sm text-bisque"
                    value={o.ctaText ?? ""}
                    placeholder={slot.campaign.ctaText}
                    onChange={(e) => patch(slot.id, { ctaText: e.target.value || undefined })}
                  />
                </label>
                <label className="text-xs text-dim sm:col-span-2">
                  Link
                  <input
                    className="mt-1 w-full rounded-md bg-kiln px-2 py-1 text-sm text-bisque"
                    value={o.ctaLink ?? ""}
                    placeholder={slot.campaign.ctaLink}
                    onChange={(e) => patch(slot.id, { ctaLink: e.target.value || undefined })}
                  />
                </label>
              </div>
              <p className="mt-3 text-sm text-bisque">{o.headline || slot.campaign.headline}</p>
              <p className="text-xs text-dim">
                {slot.campaign.ctaText} → {slot.campaign.ctaLink}
              </p>
              {slot.id === "search-banner" && (
                <p className="mt-2 text-xs text-gold">
                  On search, a recognised term replaces this graphic with a category banner. A generic search keeps the designed artwork.
                </p>
              )}
              <div className="mt-3 overflow-hidden rounded-md bg-paper">
                <AdBanner
                  slot={{
                    ...slot,
                    campaign: {
                      ...slot.campaign,
                      headline: o.headline || slot.campaign.headline,
                      subtext: o.subtext ?? slot.campaign.subtext,
                      ctaText: o.ctaText || slot.campaign.ctaText,
                      ctaLink: o.ctaLink || slot.campaign.ctaLink,
                    },
                  }}
                  contained
                  preview
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
