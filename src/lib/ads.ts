import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { AD_SLOTS } from "@/data/ads";
import type { AdOverride } from "@/lib/ad-schedule";

const SLOT_IDS = new Set(AD_SLOTS.map((s) => s.id));

function cleanLink(value: string | undefined) {
  const link = String(value ?? "").trim().slice(0, 200);
  if (!link) return null;
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  if (link.startsWith("https://")) return link;
  throw new Error("Link must start with / or https://");
}

export const loadAdSchedule = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{
    slot_id: string;
    paused: boolean;
    active_from: string | null;
    active_to: string | null;
    headline: string | null;
    subtext: string | null;
    cta_text: string | null;
    cta_link: string | null;
  }>`select slot_id, paused, active_from, active_to, headline, subtext, cta_text, cta_link from ad_schedule`;
  const schedule: Record<string, AdOverride> = {};
  for (const row of rows) {
    schedule[String(row.slot_id)] = {
      paused: Boolean(row.paused),
      activeFrom: row.active_from ? String(row.active_from) : undefined,
      activeTo: row.active_to ? String(row.active_to) : undefined,
      headline: row.headline ? String(row.headline) : undefined,
      subtext: row.subtext ? String(row.subtext) : undefined,
      ctaText: row.cta_text ? String(row.cta_text) : undefined,
      ctaLink: row.cta_link ? String(row.cta_link) : undefined,
    };
  }
  return schedule;
});

export const saveAdSlot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { slotId?: string } & AdOverride) => d)
  .handler(async ({ context, data }) => {
    const slotId = String(data.slotId ?? "");
    if (!SLOT_IDS.has(slotId)) throw new Error("Unknown banner slot");
    const { assertYard } = await import("./commerce");
    await assertYard(context.userId);
    const headline = data.headline?.trim().slice(0, 140) || null;
    const subtext = data.subtext?.trim().slice(0, 240) || null;
    const ctaText = data.ctaText?.trim().slice(0, 40) || null;
    const ctaLink = cleanLink(data.ctaLink);
    const activeFrom = /^\d{4}-\d{2}-\d{2}$/.test(data.activeFrom ?? "") ? data.activeFrom : null;
    const activeTo = /^\d{4}-\d{2}-\d{2}$/.test(data.activeTo ?? "") ? data.activeTo : null;
    const sql = await getSql();
    await sql`insert into ad_schedule (slot_id, paused, active_from, active_to, headline, subtext, cta_text, cta_link, updated_at)
      values (${slotId}, ${Boolean(data.paused)}, ${activeFrom ?? null}, ${activeTo ?? null}, ${headline}, ${subtext}, ${ctaText}, ${ctaLink}, now())
      on conflict (slot_id) do update set
        paused = excluded.paused,
        active_from = excluded.active_from,
        active_to = excluded.active_to,
        headline = excluded.headline,
        subtext = excluded.subtext,
        cta_text = excluded.cta_text,
        cta_link = excluded.cta_link,
        updated_at = now()`;
    return { ok: true as const };
  });
