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

export type Quote = {
  band: DeliveryBand;
  fee: number | null;
  quoted: boolean;
  yard: string;
  province: string;
  time: string;
};

function provinceFromPostcode(pc: string): { province: string; yard: string; near: "gp" | "kzn" | "far" } {
  const n = parseInt(pc.replace(/\D/g, "").slice(0, 4) || "0", 10);
  if (n >= 3600 && n <= 4699) return { province: "KwaZulu-Natal", yard: "Cato Ridge Distribution Yard", near: "kzn" };
  if (n >= 1 && n <= 2899) return { province: "Gauteng", yard: "Midrand Distribution Yard", near: "gp" };
  if (n >= 2900 && n <= 2899) return { province: "Free State", yard: "Midrand Distribution Yard", near: "far" };
  if (n >= 2000 && n <= 2199) return { province: "Gauteng", yard: "Midrand Distribution Yard", near: "gp" };
  if (n >= 7000 && n <= 8099) return { province: "Western Cape", yard: "Midrand Distribution Yard", near: "far" };
  if (n >= 5200 && n <= 6499) return { province: "Eastern Cape", yard: "Cato Ridge Distribution Yard", near: "far" };
  if (n >= 8300 && n <= 8999) return { province: "Northern Cape", yard: "Midrand Distribution Yard", near: "far" };
  if (n >= 2700 && n <= 2899) return { province: "North West", yard: "Midrand Distribution Yard", near: "far" };
  if (n >= 690 && n <= 999) return { province: "Limpopo", yard: "Midrand Distribution Yard", near: "far" };
  if (n >= 1000 && n <= 1599) return { province: "Mpumalanga", yard: "Midrand Distribution Yard", near: "far" };
  if (n >= 9300 && n <= 9999) return { province: "Free State", yard: "Midrand Distribution Yard", near: "far" };
  if (n >= 1 && n <= 399) return { province: "Limpopo", yard: "Midrand Distribution Yard", near: "far" };
  return { province: "Gauteng", yard: "Midrand Distribution Yard", near: "gp" };
}

export function quoteDelivery(postalCode: string, method: "delivery" | "collection"): Quote {
  if (method === "collection") {
    const loc = provinceFromPostcode(postalCode || "1685");
    return {
      band: "collection",
      fee: 0,
      quoted: true,
      yard: loc.yard,
      province: loc.province,
      time: BANDS.collection.time,
    };
  }
  const loc = provinceFromPostcode(postalCode);
  if (loc.near === "far") {
    return {
      band: "long",
      fee: null,
      quoted: false,
      yard: loc.yard,
      province: loc.province,
      time: BANDS.long.time,
    };
  }
  const n = parseInt(postalCode.replace(/\D/g, "").slice(0, 4) || "0", 10);
  const localCodes =
    loc.near === "kzn"
      ? n >= 3600 && n <= 4399
      : (n >= 1600 && n <= 2199) || (n >= 1 && n <= 299);
  const regional =
    loc.near === "kzn" ? n >= 3200 && n <= 4699 : n >= 1 && n <= 2899;
  const band: DeliveryBand = localCodes ? "local" : regional ? "regional" : "extended";
  return {
    band,
    fee: BANDS[band].fee,
    quoted: true,
    yard: loc.yard,
    province: loc.province,
    time: BANDS[band].time,
  };
}

export function craneSurcharge(hasHiab: boolean) {
  return hasHiab ? 850 : 0;
}
