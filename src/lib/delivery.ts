export type DeliveryBand = "local" | "regional" | "extended" | "long" | "collection";

export const BANDS: Record<
  DeliveryBand,
  { label: string; distance: string; time: string; fee: number | null }
> = {
  local: { label: "Local", distance: "0–30 km", time: "Same day / next business day", fee: 950 },
  regional: { label: "Regional", distance: "30–100 km", time: "1–2 business days", fee: 1850 },
  extended: { label: "Extended", distance: "100–250 km", time: "2–4 business days", fee: 3200 },
  long: { label: "Long-distance", distance: "250 km+", time: "4–7 business days", fee: null },
  collection: { label: "Collection", distance: "Yard", time: "Same day (subject to stock)", fee: 0 },
};

/** Extra rand per pallet after the first. The band fee covers one pallet. */
const PALLET_EXTRA: Record<DeliveryBand, number> = {
  local: 180,
  regional: 280,
  extended: 420,
  long: 0,
  collection: 0,
};

export type Quote = {
  band: DeliveryBand;
  fee: number | null;
  baseFee: number | null;
  palletFee: number;
  quoted: boolean;
  yard: string;
  province: string;
  time: string;
  pallets: number;
  weightKg: number;
};

type Near = "gp" | "kzn" | "extended" | "far";

function provinceFromPostcode(pc: string): { province: string; yard: string; near: Near; code: number } {
  const n = parseInt(pc.replace(/\D/g, "").slice(0, 4) || "0", 10);
  const midrand = "Midrand Distribution Yard";
  const cato = "Cato Ridge Distribution Yard";
  if (!n) return { province: "Unknown", yard: midrand, near: "far", code: 0 };
  if ((n >= 1 && n <= 299) || (n >= 1400 && n <= 2199)) {
    return { province: "Gauteng", yard: midrand, near: "gp", code: n };
  }
  if ((n >= 300 && n <= 499) || (n >= 1000 && n <= 1099) || (n >= 2200 && n <= 2699)) {
    const province = n >= 2500 ? "North West" : n >= 1000 ? "Mpumalanga" : "North West";
    return { province, yard: midrand, near: "extended", code: n };
  }
  if (n >= 2900 && n <= 4699) return { province: "KwaZulu-Natal", yard: cato, near: "kzn", code: n };
  if (n >= 4700 && n <= 6499) return { province: "Eastern Cape", yard: cato, near: "far", code: n };
  if (n >= 6500 && n <= 8299) return { province: "Western Cape", yard: midrand, near: "far", code: n };
  if (n >= 8300 && n <= 8999) return { province: "Northern Cape", yard: midrand, near: "far", code: n };
  if (n >= 9000 && n <= 9999) return { province: "Free State", yard: midrand, near: "far", code: n };
  if (n >= 500 && n <= 999) return { province: "Limpopo", yard: midrand, near: "far", code: n };
  if (n >= 1100 && n <= 1399) return { province: "Mpumalanga", yard: midrand, near: "far", code: n };
  if (n >= 2700 && n <= 2899) return { province: "North West", yard: midrand, near: "far", code: n };
  return { province: "Unknown", yard: midrand, near: "far", code: n };
}

function bandFor(near: Near, n: number): DeliveryBand {
  if (near === "far") return "long";
  if (near === "extended") return "extended";
  if (near === "gp") return n >= 1600 && n <= 2199 ? "local" : "regional";
  if (n >= 3600 && n <= 3799) return "local";
  if ((n >= 3200 && n <= 3599) || (n >= 4000 && n <= 4099)) return "regional";
  if (n >= 3200 && n <= 4699) return "extended";
  return "long";
}

export function quoteDelivery(
  postalCode: string,
  method: "delivery" | "collection",
  load?: { pallets?: number; weightKg?: number },
): Quote {
  const pallets = Math.max(0, Math.ceil(Number(load?.pallets) || 0));
  const weightKg = Math.max(0, Math.round(Number(load?.weightKg) || 0));
  if (method === "collection") {
    const loc = provinceFromPostcode(postalCode || "1685");
    return {
      band: "collection",
      fee: 0,
      baseFee: 0,
      palletFee: 0,
      quoted: true,
      yard: loc.yard,
      province: loc.province,
      time: BANDS.collection.time,
      pallets,
      weightKg,
    };
  }
  const loc = provinceFromPostcode(postalCode);
  const band = bandFor(loc.near, loc.code);
  const baseFee = BANDS[band].fee;
  const palletFee = baseFee == null ? 0 : Math.max(0, pallets - 1) * PALLET_EXTRA[band];
  return {
    band,
    baseFee,
    palletFee,
    fee: baseFee == null ? null : baseFee + palletFee,
    quoted: baseFee != null,
    yard: loc.yard,
    province: loc.province,
    time: BANDS[band].time,
    pallets,
    weightKg,
  };
}

export function craneSurcharge(hasHiab: boolean) {
  return hasHiab ? 850 : 0;
}

export const COLLECTION_SLOTS = [
  { id: "morning", label: "Morning · 08:00–11:00" },
  { id: "midday", label: "Midday · 11:00–14:00" },
  { id: "afternoon", label: "Afternoon · 14:00–16:30" },
] as const;

export const CARRIERS = [
  "DSV South Africa",
  "Faber Vervoer",
  "Panamax Bulk Carriers",
  "Besfleet",
  "Collection",
] as const;

export function palletCount(qty: number, unitsPerPallet: number) {
  const per = unitsPerPallet > 0 ? unitsPerPallet : 1;
  return Math.ceil(Math.max(0, qty) / per);
}

export function collectionSlotLabel(id: string | null | undefined) {
  return COLLECTION_SLOTS.find((s) => s.id === id)?.label ?? null;
}
