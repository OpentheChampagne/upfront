import Link from "next/link";
import { db } from "@/lib/db";
import { relativeTime } from "@/lib/format";
import { Badge, verdictTone } from "@/app/components/Badge";
import { ScanForm } from "@/app/components/ScanForm";

export default async function Home() {
  const recentScans = await db.scan.findMany({
    orderBy: { fetchedAt: "desc" },
    take: 10,
    include: { score: true },
  });

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden px-6 py-24">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden">
        <div className="spotlight-beam spotlight-beam-left" />
        <div className="spotlight-beam spotlight-beam-right" />
      </div>

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <p className="animate-fade-up font-mono text-xs uppercase tracking-[0.2em] text-muted">Upfront</p>
        <h1 className="animate-fade-up mt-4 font-serif text-5xl leading-tight text-foreground [animation-delay:80ms] sm:text-6xl">
          Know before you pitch.
        </h1>
        <p className="animate-fade-up mt-4 max-w-md text-sm text-muted [animation-delay:160ms]">
          Paste a prospect&apos;s site. We&apos;ll fingerprint their marketing stack and score
          whether they can actually prove a CTV campaign worked, before you spend a call
          finding out.
        </p>
        <div className="animate-fade-up mt-8 w-full [animation-delay:240ms]">
          <ScanForm />
        </div>
      </div>

      {recentScans.length > 0 && (
        <div className="animate-fade-up relative mt-20 w-full max-w-xl [animation-delay:320ms]">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Recent scans</p>
          <ul className="mt-4 flex flex-col gap-1">
            {recentScans.map((scan) => (
              <li key={scan.id}>
                <Link
                  href={`/scan/${scan.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-surface"
                >
                  <span className="font-mono text-sm">{scan.domain}</span>
                  <span className="flex items-center gap-3">
                    {scan.score ? (
                      <Badge tone={verdictTone(scan.score.verdict)} label={scan.score.verdict.replace("_", " ")} />
                    ) : (
                      <Badge tone="unknown" label={scan.status} />
                    )}
                    <span className="text-xs text-muted">{relativeTime(scan.fetchedAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
