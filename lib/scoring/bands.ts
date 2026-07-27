import { Verdict } from "@/lib/generated/prisma/client";

export const READY_THRESHOLD = 70;
export const GAPS_THRESHOLD = 40;

export function verdictForTotal(total: number): Verdict {
  if (total >= READY_THRESHOLD) return Verdict.READY;
  if (total >= GAPS_THRESHOLD) return Verdict.GAPS;
  return Verdict.NOT_YET;
}
