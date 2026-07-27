import "dotenv/config";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { DEFAULT_WEIGHTS } from "@/lib/scoring/rubric";

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
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
