import { ScanStatus } from "@/lib/generated/prisma/client";

const COPY: Record<ScanStatus, { headline: string; body: string }> = {
  SUCCESS: {
    headline: "No score recorded",
    body: "The scan completed but no score was saved for it. That shouldn't happen — try scanning the domain again.",
  },
  BLOCKED: {
    headline: "Blocked",
    body: "The site declined our request, most likely bot protection like Cloudflare or a WAF. This says nothing about their marketing stack, only that we couldn't read the page from here.",
  },
  TIMEOUT: {
    headline: "Timed out",
    body: "The site didn't respond within our 8 second window. Could be a slow server or a one-off network hiccup, worth trying the scan again.",
  },
  INVALID: {
    headline: "Invalid domain",
    body: "What was entered doesn't look like a real domain. Check the spelling and try again.",
  },
};

export function ScanStateNotice({
  status,
  httpStatus,
  server,
}: {
  status: ScanStatus;
  httpStatus: number | null;
  server: string | null;
}) {
  const copy = COPY[status];

  return (
    <>
      <p className="animate-fade-up mt-4 font-serif text-5xl text-foreground [animation-delay:120ms]">
        {copy.headline}
      </p>
      <p className="animate-fade-up mt-4 max-w-md text-sm leading-relaxed text-muted [animation-delay:180ms]">
        {copy.body}
      </p>
      {(httpStatus !== null || server !== null) && (
        <p className="animate-fade-up mt-8 font-mono text-xs text-muted [animation-delay:240ms]">
          {httpStatus ?? "no response"} · {server ?? "unknown server"}
        </p>
      )}
    </>
  );
}
