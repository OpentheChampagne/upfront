import { Category, Confidence, ScanStatus } from "@/lib/generated/prisma/client";
import { FINGERPRINTS } from "@/lib/detection/fingerprints";

const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = "Mozilla/5.0 (compatible; UpfrontScanBot/1.0)";
const BLOCKED_STATUS_CODES = new Set([403, 429, 503, 999]);
const DOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export interface DetectionResult {
  technology: string;
  category: Category;
  confidence: Confidence;
  matchedOn: string;
}

export interface ScanResult {
  domain: string;
  status: ScanStatus;
  httpStatus: number | null;
  server: string | null;
  detections: DetectionResult[];
}

function normalizeDomain(input: string): string | null {
  const stripped = input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./i, "");
  return DOMAIN_PATTERN.test(stripped) ? stripped.toLowerCase() : null;
}

function matchFingerprints(html: string): DetectionResult[] {
  const detections: DetectionResult[] = [];

  for (const fingerprint of FINGERPRINTS) {
    for (const pattern of fingerprint.patterns) {
      const match = html.match(pattern);
      if (match) {
        detections.push({
          technology: fingerprint.technology,
          category: fingerprint.category,
          confidence: Confidence.CONFIRMED,
          matchedOn: match[0],
        });
        break;
      }
    }
  }

  return detections;
}

function applyOpaqueInference(detections: DetectionResult[]): void {
  const tagManager = detections.find((d) => d.category === Category.TAG_MANAGER);
  const hasPixelSignal = detections.some((d) => d.category === Category.PIXEL);

  if (tagManager && !hasPixelSignal) {
    detections.push({
      technology: `Unidentified tags via ${tagManager.technology}`,
      category: Category.UNIDENTIFIED,
      confidence: Confidence.OPAQUE,
      matchedOn: tagManager.matchedOn,
    });
  }
}

export async function scanSite(rawDomain: string): Promise<ScanResult> {
  const domain = normalizeDomain(rawDomain);

  if (!domain) {
    return { domain: rawDomain.trim(), status: ScanStatus.INVALID, httpStatus: null, server: null, detections: [] };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`https://${domain}`, {
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
      headers: { "User-Agent": USER_AGENT },
    });

    const httpStatus = response.status;
    const server = response.headers.get("server");

    if (BLOCKED_STATUS_CODES.has(httpStatus)) {
      return { domain, status: ScanStatus.BLOCKED, httpStatus, server, detections: [] };
    }

    const html = await response.text();
    const detections = matchFingerprints(html);
    applyOpaqueInference(detections);

    return { domain, status: ScanStatus.SUCCESS, httpStatus, server, detections };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { domain, status: ScanStatus.TIMEOUT, httpStatus: null, server: null, detections: [] };
    }
    return { domain, status: ScanStatus.BLOCKED, httpStatus: null, server: null, detections: [] };
  } finally {
    clearTimeout(timeout);
  }
}
