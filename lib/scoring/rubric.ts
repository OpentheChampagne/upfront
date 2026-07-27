import { Category, Confidence, Verdict } from "@/lib/generated/prisma/client";
import { verdictForTotal } from "@/lib/scoring/bands";

export const RUBRIC_VERSION = "measurable-dominant-v1";

export interface PillarWeights {
  measurable: number;
  commerce: number;
  retention: number;
  scale: number;
}

export const DEFAULT_WEIGHTS: PillarWeights = {
  measurable: 45,
  commerce: 15,
  retention: 25,
  scale: 15,
};

const WEIGHT_KEYS = ["measurable", "commerce", "retention", "scale"] as const;

export function parseWeights(value: unknown): PillarWeights {
  if (typeof value !== "object" || value === null) return DEFAULT_WEIGHTS;

  const record = value as Record<string, unknown>;
  const isValid = WEIGHT_KEYS.every((key) => typeof record[key] === "number");

  return isValid ? (record as unknown as PillarWeights) : DEFAULT_WEIGHTS;
}

export interface RubricDetection {
  category: Category;
  confidence: Confidence;
}

export interface RubricInput {
  detections: RubricDetection[];
  openPageRank: number | null;
  weights?: PillarWeights;
}

export interface RubricResult {
  measurable: number;
  commerce: number;
  retention: number;
  scale: number;
  total: number;
  verdict: Verdict;
}

function countConfirmed(detections: RubricDetection[], category: Category): number {
  return detections.filter((d) => d.category === category && d.confidence === Confidence.CONFIRMED).length;
}

// Marginal signal value diminishes fast: the first tool in a pillar proves the
// capability exists, the second confirms it, a third adds little more.
function stackingFraction(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 0.6;
  if (count === 2) return 0.85;
  return 1;
}

export function scoreRubric(input: RubricInput): RubricResult {
  const weights = input.weights ?? DEFAULT_WEIGHTS;

  const measurable = Math.round(
    weights.measurable * stackingFraction(countConfirmed(input.detections, Category.PIXEL))
  );
  const commerce = Math.round(
    weights.commerce * stackingFraction(countConfirmed(input.detections, Category.COMMERCE))
  );
  const retention = Math.round(
    weights.retention * stackingFraction(countConfirmed(input.detections, Category.RETENTION))
  );

  const scaleFraction = input.openPageRank == null ? 0 : Math.min(Math.max(input.openPageRank / 10, 0), 1);
  const scale = Math.round(weights.scale * scaleFraction);

  const total = measurable + commerce + retention + scale;

  return { measurable, commerce, retention, scale, total, verdict: verdictForTotal(total) };
}
