import { test } from "node:test";
import assert from "node:assert/strict";
import { Category, Confidence, Verdict } from "@/lib/generated/prisma/client";
import { DEFAULT_WEIGHTS, scoreRubric } from "@/lib/scoring/rubric";

test("no detections and no page rank scores zero across every pillar", () => {
  const result = scoreRubric({ detections: [], openPageRank: null });
  assert.equal(result.total, 0);
  assert.equal(result.verdict, Verdict.NOT_YET);
});

test("a full stack across every detectable pillar plus max page rank reaches READY", () => {
  const result = scoreRubric({
    detections: [
      { category: Category.PIXEL, confidence: Confidence.CONFIRMED },
      { category: Category.PIXEL, confidence: Confidence.CONFIRMED },
      { category: Category.COMMERCE, confidence: Confidence.CONFIRMED },
      { category: Category.RETENTION, confidence: Confidence.CONFIRMED },
    ],
    openPageRank: 10,
  });
  assert.equal(result.scale, DEFAULT_WEIGHTS.scale);
  assert.equal(result.verdict, Verdict.READY);
});

test("OPAQUE detections do not earn pillar credit, only CONFIRMED does", () => {
  const result = scoreRubric({
    detections: [{ category: Category.PIXEL, confidence: Confidence.OPAQUE }],
    openPageRank: null,
  });
  assert.equal(result.measurable, 0);
});
