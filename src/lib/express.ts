/** AA 60/120 Express. The clock starts when the order is confirmed. */

export const EXPRESS_FEE = 1000;
export const EXPRESS_RADIUS_KM = 30;
export const EXPRESS_PREP_MINUTES = 20;
export const EXPRESS_TARGET_MINUTES = 120;
export const EXPRESS_REFUND_MINUTES = 180;

export type SupplierPin = {
  id: number;
  name: string;
  kind: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
};

export type Pin = { lat: number; lng: number };

export function haversineKm(a: Pin, b: Pin) {
  const r = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Monday–Saturday, 07:00 through 15:30 South African time. 15:30 is the last minute an order can be placed. */
export function expressHours(now: Date): { open: boolean; reason: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  if (weekday.startsWith("Sun")) {
    return { open: false, reason: "AA 60/120 runs Monday to Saturday. Sunday is closed." };
  }
  const mins = hour * 60 + minute;
  if (mins < 7 * 60) return { open: false, reason: "AA 60/120 opens at 07:00." };
  if (mins > 15 * 60 + 30) return { open: false, reason: "The cutoff is 15:30. AA 60/120 is closed for today." };
  return { open: true, reason: "" };
}

export function nearestSuppliers(pin: Pin, suppliers: SupplierPin[]) {
  return suppliers
    .map((supplier) => ({ ...supplier, km: haversineKm(pin, supplier) }))
    .sort((a, b) => a.km - b.km);
}

export function expressDecision(input: {
  now: Date;
  method: "delivery" | "collection";
  quoted: boolean;
  lines: { fulfilment: string }[];
  pin: Pin | null;
  suppliers: SupplierPin[];
}):
  | { ok: true; supplier: SupplierPin & { km: number } }
  | { ok: false; reason: string } {
  if (input.method !== "delivery") {
    return { ok: false, reason: "AA 60/120 is a delivery. Collection stays on the ordinary yard slot." };
  }
  if (!input.lines.length || input.lines.some((line) => line.fulfilment !== "Stock Item")) {
    return { ok: false, reason: "Only stocked lines qualify. Made-to-order units are not on this service." };
  }
  if (!input.quoted) {
    return { ok: false, reason: "The ordinary delivery fee has to be quoted before the express fee can sit on top of it." };
  }
  const hours = expressHours(input.now);
  if (!hours.open) return { ok: false, reason: hours.reason };
  if (!input.pin || !Number.isFinite(input.pin.lat) || !Number.isFinite(input.pin.lng)) {
    return { ok: false, reason: "Set a delivery pin. The 30 km check uses that point, not the postcode alone." };
  }
  const nearest = nearestSuppliers(input.pin, input.suppliers);
  const supplier = nearest.find((row) => row.km <= EXPRESS_RADIUS_KM);
  if (!supplier) {
    return { ok: false, reason: "No supplier pin is within 30 km of this point." };
  }
  return { ok: true, supplier };
}

/** The R1 000 is kept only when delivery is strictly inside 3 hours. At 3:00 it is refunded. */
export function expressFeeKept(confirmedAt: Date, deliveredAt: Date) {
  return deliveredAt.getTime() - confirmedAt.getTime() < EXPRESS_REFUND_MINUTES * 60 * 1000;
}
