import { NextRequest, NextResponse } from "next/server";
import { ScanStatus } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";
import { scanSite } from "@/lib/detection/scan";
import { getPageRank } from "@/lib/enrichment/openpagerank";
import { generateNarrative } from "@/lib/narrative/claude";
import { RUBRIC_VERSION, parseWeights, scoreRubric } from "@/lib/scoring/rubric";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const domain = typeof body?.domain === "string" ? body.domain : null;

  if (!domain) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  const result = await scanSite(domain);

  if (result.status !== ScanStatus.SUCCESS) {
    const scan = await db.scan.create({
      data: {
        domain: result.domain,
        status: result.status,
        httpStatus: result.httpStatus,
        server: result.server,
      },
      include: { detections: true, score: true },
    });

    return NextResponse.json(scan, { status: 201 });
  }

  const [icpProfile, pageRank] = await Promise.all([
    db.icpProfile.findFirst({ where: { isActive: true } }),
    getPageRank(result.domain),
  ]);

  const weights = parseWeights(icpProfile?.weights);
  const score = scoreRubric({ detections: result.detections, openPageRank: pageRank.rank, weights });

  const narrative = await generateNarrative({
    domain: result.domain,
    detections: result.detections,
    score,
  });

  const scan = await db.scan.create({
    data: {
      domain: result.domain,
      status: result.status,
      httpStatus: result.httpStatus,
      server: result.server,
      detections: {
        create: result.detections.map((detection) => ({
          technology: detection.technology,
          category: detection.category,
          confidence: detection.confidence,
          matchedOn: detection.matchedOn,
        })),
      },
      score: {
        create: {
          measurable: score.measurable,
          commerce: score.commerce,
          retention: score.retention,
          scale: score.scale,
          total: score.total,
          verdict: score.verdict,
          rubricVersion: RUBRIC_VERSION,
          narrative,
        },
      },
    },
    include: { detections: true, score: true },
  });

  return NextResponse.json(scan, { status: 201 });
}
