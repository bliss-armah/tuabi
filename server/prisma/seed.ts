import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.subscriptionPlan.createMany({
    data: [
      { name: "Basic", amount: 20, currency: "GHS", duration: 30 },
      { name: "Pro", amount: 50, currency: "GHS", duration: 30 },
    ],
    skipDuplicates: true,
  });
  console.log("Seeded default subscription plans.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
