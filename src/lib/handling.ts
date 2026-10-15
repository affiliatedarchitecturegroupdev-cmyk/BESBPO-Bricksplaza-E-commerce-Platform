import { round2 } from "@/lib/format";

/** 15% is the usual materials-handling charge. The extra 3% is Bricksplaza administration and coordination. */
export const HANDLING_RATE = 0.18;

export type HandlingFault = "yard" | "supplier" | "customer";

export function handlingFee(paidTotal: number, fault: HandlingFault) {
  if (fault !== "customer") return 0;
  if (!Number.isFinite(paidTotal) || paidTotal <= 0) return 0;
  return round2(paidTotal * HANDLING_RATE);
}
