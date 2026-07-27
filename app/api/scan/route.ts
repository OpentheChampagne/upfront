import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scanSite } from "@/lib/detection/scan";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const domain = typeof body?.domain === "string" ? body.domain : null;

  if (!domain) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  const result = await scanSite(domain);

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
    },
    include: { detections: true },
  });

  return NextResponse.json(scan, { status: 201 });
}
