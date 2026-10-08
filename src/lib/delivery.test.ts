import assert from "node:assert/strict";
import test from "node:test";
import { quoteDelivery } from "./delivery.ts";

test("Midrand is a local collection yard", () => {
  const quote = quoteDelivery("1685", "delivery", { pallets: 1, weightKg: 800 });
  assert.equal(quote.band, "local");
  assert.equal(quote.yard, "Midrand Distribution Yard");
  assert.equal(quote.fee, 950);
  assert.equal(quote.weightKg, 800);
});

test("a second pallet adds the local pallet rate", () => {
  const quote = quoteDelivery("2001", "delivery", { pallets: 3, weightKg: 2400 });
  assert.equal(quote.baseFee, 950);
  assert.equal(quote.palletFee, 360);
  assert.equal(quote.fee, 1310);
});

test("Pretoria is regional, not the whole of the old 0001–2899 bucket", () => {
  const quote = quoteDelivery("0002", "delivery");
  assert.equal(quote.province, "Gauteng");
  assert.equal(quote.band, "regional");
  assert.equal(quote.fee, 1850);
});

test("Cape Town is a quote, not a Gauteng fee", () => {
  const quote = quoteDelivery("8001", "delivery", { pallets: 4, weightKg: 5000 });
  assert.equal(quote.province, "Western Cape");
  assert.equal(quote.band, "long");
  assert.equal(quote.quoted, false);
  assert.equal(quote.fee, null);
});

test("Cato Ridge is the KwaZulu-Natal yard", () => {
  const quote = quoteDelivery("3680", "delivery");
  assert.equal(quote.yard, "Cato Ridge Distribution Yard");
  assert.equal(quote.band, "local");
});

test("an empty postcode is not priced as local", () => {
  const quote = quoteDelivery("", "delivery");
  assert.equal(quote.quoted, false);
});
