import assert from "node:assert/strict";
import test from "node:test";
import {
  EXPRESS_RADIUS_KM,
  expressDecision,
  expressFeeKept,
  expressHours,
  haversineKm,
} from "./express.ts";

const midrand = { id: 1, name: "Midrand", kind: "yard", city: "Midrand", province: "Gauteng", lat: -25.989, lng: 28.127 };

test("ten kilometres north of a pin is about 10 km", () => {
  const north = { lat: midrand.lat + 10 / 110.574, lng: midrand.lng };
  const km = haversineKm(midrand, north);
  assert.ok(Math.abs(km - 10) < 0.25, String(km));
});

test("express hours are Monday to Saturday, 07:00 to 15:30 SAST", () => {
  assert.equal(expressHours(new Date("2026-10-12T04:59:00Z")).open, false);
  assert.equal(expressHours(new Date("2026-10-12T05:00:00Z")).open, true);
  assert.equal(expressHours(new Date("2026-10-12T13:30:00Z")).open, true);
  assert.equal(expressHours(new Date("2026-10-12T13:31:00Z")).open, false);
  assert.equal(expressHours(new Date("2026-10-11T10:00:00Z")).open, false);
  assert.equal(expressHours(new Date("2026-10-17T08:00:00Z")).open, true);
});

test("the fee is kept through 2 hours 59 minutes and refunded at 3 hours", () => {
  const confirmed = new Date("2026-10-15T07:00:00Z");
  assert.equal(expressFeeKept(confirmed, new Date(confirmed.getTime() + 179 * 60 * 1000)), true);
  assert.equal(expressFeeKept(confirmed, new Date(confirmed.getTime() + 180 * 60 * 1000)), false);
});

test("a stocked delivery inside 30 km qualifies", () => {
  const pin = { lat: midrand.lat + 10 / 110.574, lng: midrand.lng };
  const result = expressDecision({
    now: new Date("2026-10-12T06:00:00Z"),
    method: "delivery",
    quoted: true,
    lines: [{ fulfilment: "Stock Item" }],
    pin,
    suppliers: [midrand],
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.ok(result.supplier.km <= EXPRESS_RADIUS_KM);
});

test("past 30 km, made-to-order, collection and an unquoted fee do not qualify", () => {
  const far = { lat: midrand.lat + 40 / 110.574, lng: midrand.lng };
  const base = {
    now: new Date("2026-10-12T06:00:00Z"),
    method: "delivery" as const,
    quoted: true,
    lines: [{ fulfilment: "Stock Item" }],
    pin: far,
    suppliers: [midrand],
  };
  assert.equal(expressDecision(base).ok, false);
  assert.equal(
    expressDecision({ ...base, pin: { lat: midrand.lat, lng: midrand.lng }, lines: [{ fulfilment: "Made-to-Order" }] }).ok,
    false,
  );
  assert.equal(expressDecision({ ...base, pin: midrand, method: "collection" }).ok, false);
  assert.equal(expressDecision({ ...base, pin: midrand, quoted: false }).ok, false);
});
