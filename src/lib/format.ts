const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
});

const zarWhole = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatZar(value: number, whole = false) {
  return (whole ? zarWhole : zar).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-ZA").format(value);
}

export function vatInclusive(exVat: number) {
  return round2(exVat * 1.15);
}

export function vatPortion(incVat: number) {
  return round2(incVat - incVat / 1.15);
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function skuToPath(sku: string) {
  return `/product/${encodeURIComponent(sku)}`;
}
