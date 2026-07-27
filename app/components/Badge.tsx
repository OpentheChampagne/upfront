import { Confidence, Verdict } from "@/lib/generated/prisma/client";

export type Tone = "confirmed" | "opaque" | "unknown" | "ready" | "gaps" | "not-yet";

const TONE_STYLES: Record<Tone, string> = {
  confirmed: "bg-confirmed/15 text-confirmed border-confirmed/30",
  opaque: "bg-opaque/15 text-opaque border-opaque/30",
  unknown: "bg-unknown/15 text-unknown border-unknown/30",
  ready: "bg-ready/15 text-ready border-ready/30",
  gaps: "bg-gaps/15 text-gaps border-gaps/30",
  "not-yet": "bg-not-yet/15 text-not-yet border-not-yet/30",
};

export function verdictTone(verdict: Verdict): Tone {
  if (verdict === Verdict.READY) return "ready";
  if (verdict === Verdict.GAPS) return "gaps";
  return "not-yet";
}

export function confidenceTone(confidence: Confidence): Tone {
  if (confidence === Confidence.CONFIRMED) return "confirmed";
  if (confidence === Confidence.OPAQUE) return "opaque";
  return "unknown";
}

export function Badge({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs uppercase tracking-wide ${TONE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
}
