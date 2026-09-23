import { useEffect, useState } from "react";
import type { AdSlot } from "@/data/ads";
import { readAdSchedule, slotIsLive, type AdOverride } from "@/lib/ad-schedule";

export function AdBanner({
  slot,
  contained = false,
  preview = false,
}: {
  slot: AdSlot;
  /** Parent already supplies the page gutter. Caps the creative at its design width. */
  contained?: boolean;
  /** Business Desk preview — ignore pause and date window. */
  preview?: boolean;
}) {
  const [live, setLive] = useState(true);
  const [override, setOverride] = useState<AdOverride | undefined>();

  useEffect(() => {
    if (preview) {
      setLive(true);
      setOverride(undefined);
      return;
    }
    const schedule = readAdSchedule();
    setOverride(schedule[slot.id]);
    setLive(slotIsLive(slot.id, schedule));
  }, [slot.id, preview]);

  if (!live) return null;

  const base = slot.campaign;
  const campaign = {
    ...base,
    headline: override?.headline || base.headline,
    subtext: override?.subtext ?? base.subtext,
    ctaText: override?.ctaText || base.ctaText,
    ctaLink: override?.ctaLink || base.ctaLink,
  };
  const { width, height, creativeType, imageFile, id } = slot;
  const compact = height <= 180;

  return (
    <div className={contained ? "mx-auto w-full" : "mx-auto w-full max-w-7xl px-4 py-4 sm:px-6"}>
      <a
        href={campaign.ctaLink}
        data-slot-id={id}
        data-kind={creativeType}
        data-compact={compact ? "true" : "false"}
        aria-label={`${campaign.headline}. ${campaign.ctaText}`}
        className="ad-frame group relative mx-auto block w-full overflow-hidden rounded-sm bg-kiln"
        style={{ maxWidth: width, ["--ad-w" as string]: String(width), ["--ad-h" as string]: String(height) }}
      >
        {creativeType === "image" && imageFile ? (
          <img src={imageFile} alt="" className="absolute inset-0 h-full w-full object-cover object-left" />
        ) : (
          <>
            {campaign.image && (
              <img src={campaign.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-kiln/90 via-kiln/55 to-kiln/20" />
            <div
              className={`relative flex min-h-full flex-col items-start justify-center ${compact ? "px-4 py-3 sm:px-6" : "px-5 py-5 sm:px-12"}`}
            >
              {campaign.eyebrow && (
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold sm:text-[11px] sm:tracking-[0.18em]">
                  {campaign.eyebrow}
                </p>
              )}
              <p
                className={`mt-1 max-w-[92%] font-display font-bold leading-[1.1] text-bisque sm:max-w-[68%] ${compact ? "text-lg sm:text-2xl" : "text-2xl sm:text-3xl lg:text-4xl"}`}
              >
                {campaign.headline}
              </p>
              {campaign.subtext && !compact && (
                <p className="mt-2 max-w-[92%] text-xs leading-snug text-[#D9CFC0] sm:max-w-[58%] sm:text-base">
                  {campaign.subtext}
                </p>
              )}
              <span
                className={`mt-3 inline-flex w-fit max-w-full bg-clay text-left font-bold uppercase text-white group-hover:bg-[#8f3626] sm:tracking-wide ${compact ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-[11px] sm:px-6 sm:py-3 sm:text-sm"}`}
              >
                {campaign.ctaText} →
              </span>
            </div>
            {!compact && (
              <span className="pointer-events-none absolute right-4 bottom-3 hidden font-display text-xs font-bold tracking-[0.16em] text-bisque/90 sm:block sm:right-6 sm:bottom-4 sm:text-sm">
                BRICKSPLAZA
              </span>
            )}
          </>
        )}
      </a>
    </div>
  );
}
