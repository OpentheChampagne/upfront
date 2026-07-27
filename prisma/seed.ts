import "dotenv/config";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { runScan } from "@/lib/pipeline";
import { DEFAULT_WEIGHTS } from "@/lib/scoring/rubric";

const SEED_DOMAINS = ["harrys.com", "brooklinen.com", "glossier.com", "hims.com", "casper.com", "cutsclothing.com"];

async function main() {
  await db.icpProfile.upsert({
    where: { name: "Default" },
    update: {},
    create: {
      name: "Default",
      weights: DEFAULT_WEIGHTS as unknown as Prisma.InputJsonValue,
      isActive: true,
    },
  });

  for (const domain of SEED_DOMAINS) {
    const existing = await db.scan.findFirst({ where: { domain } });
    if (existing) {
      console.log(`skip ${domain} (already scanned)`);
      continue;
    }

    const scan = await runScan(domain);
    console.log(`scanned ${domain} -> ${scan.status}${scan.score ? ` (${scan.score.verdict})` : ""}`);
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
