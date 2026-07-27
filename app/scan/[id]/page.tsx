import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { titleCase } from "@/lib/format";
import { parseWeights } from "@/lib/scoring/rubric";
import { Badge, confidenceTone, verdictTone } from "@/app/components/Badge";
import { PillarBar } from "@/app/components/PillarBar";

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [scan, icpProfile] = await Promise.all([
    db.scan.findUnique({ where: { id }, include: { detections: true, score: true } }),
    db.icpProfile.findFirst({ where: { isActive: true } }),
  ]);

  if (!scan) notFound();

  const weights = parseWeights(icpProfile?.weights);

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden px-6 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden">
        <div className="spotlight-beam spotlight-beam-left" />
        <div className="spotlight-beam spotlight-beam-right" />
      </div>

      <div className="relative w-full max-w-xl">
        <Link
          href="/"
          className="animate-fade-up font-mono text-xs uppercase tracking-[0.2em] text-muted hover:text-accent"
        >
          ← Upfront
        </Link>

        <div className="animate-fade-up mt-8 flex items-baseline justify-between [animation-delay:60ms]">
          <p className="font-mono text-sm text-muted">{scan.domain}</p>
          {scan.score ? (
            <Badge tone={verdictTone(scan.score.verdict)} label={titleCase(scan.score.verdict)} />
          ) : (
            <Badge tone="unknown" label={scan.status} />
          )}
        </div>

        {scan.score ? (
          <>
            <p className="animate-fade-up mt-4 font-serif text-6xl text-foreground [animation-delay:120ms]">
              {scan.score.total}/100
            </p>

            <div className="animate-fade-up mt-10 flex flex-col gap-6 [animation-delay:180ms]">
              <PillarBar label="Measurable" points={scan.score.measurable} max={weights.measurable} />
              <PillarBar label="Commerce" points={scan.score.commerce} max={weights.commerce} />
              <PillarBar label="Retention" points={scan.score.retention} max={weights.retention} />
              <PillarBar label="Scale" points={scan.score.scale} max={weights.scale} />
            </div>

            {scan.score.narrative && (
              <div className="animate-fade-up mt-10 [animation-delay:210ms]">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Rationale</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">{scan.score.narrative}</p>
              </div>
            )}

            <div className="animate-fade-up mt-14 [animation-delay:240ms]">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Evidence</p>
              {scan.detections.length > 0 ? (
                <ul className="mt-4 flex flex-col divide-y divide-border border-t border-border">
                  {scan.detections.map((detection) => (
                    <li key={detection.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{detection.technology}</p>
                        <p className="mt-0.5 truncate font-mono text-xs text-muted">{detection.matchedOn}</p>
                      </div>
                      <Badge tone={confidenceTone(detection.confidence)} label={detection.confidence} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">No known marketing stack detected in static HTML.</p>
              )}
            </div>

            <p className="animate-fade-up mt-10 font-mono text-xs text-muted [animation-delay:300ms]">
              {scan.httpStatus} · {scan.server ?? "unknown server"} · rubric {scan.score.rubricVersion}
            </p>
          </>
        ) : (
          <p className="animate-fade-up mt-6 text-sm text-muted [animation-delay:120ms]">
            This scan didn&apos;t reach a scoreable state. No marketing stack signal could be read.
          </p>
        )}
      </div>
    </div>
  );
}
