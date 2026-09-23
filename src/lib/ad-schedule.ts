export type AdOverride = {
  paused?: boolean;
  activeFrom?: string;
  activeTo?: string;
  headline?: string;
  subtext?: string;
  ctaText?: string;
  ctaLink?: string;
};

const KEY = "bp-ad-schedule";

export function readAdSchedule(): Record<string, AdOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, AdOverride>) : {};
  } catch {
    return {};
  }
}

export function writeAdSchedule(next: Record<string, AdOverride>) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

/** Date inputs are calendar days. "To" includes that whole local day. */
function parseBound(value: string, end: boolean) {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (day) {
    const y = Number(day[1]);
    const m = Number(day[2]) - 1;
    const d = Number(day[3]);
    return end ? new Date(y, m, d, 23, 59, 59, 999) : new Date(y, m, d, 0, 0, 0, 0);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function slotIsLive(id: string, schedule: Record<string, AdOverride>, now = new Date()) {
  const o = schedule[id];
  if (!o) return true;
  if (o.paused) return false;
  if (o.activeFrom) {
    const from = parseBound(o.activeFrom, false);
    if (from && from > now) return false;
  }
  if (o.activeTo) {
    const to = parseBound(o.activeTo, true);
    if (to && to < now) return false;
  }
  return true;
}
