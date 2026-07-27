import { NextRequest, NextResponse } from "next/server";
import { runScan } from "@/lib/pipeline";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const domain = typeof body?.domain === "string" ? body.domain : null;

  if (!domain) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  const scan = await runScan(domain);
  return NextResponse.json(scan, { status: 201 });
}
