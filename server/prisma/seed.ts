import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.subscriptionPlan.createMany({
    data: [
      { name: "Monthly", amount: 10, currency: "GHS", duration: 30 },
      { name: "Yearly", amount: 100, currency: "GHS", duration: 365 },
    ],
    skipDuplicates: true,
  });
  console.log("Seeded default subscription plans (₵10/month, ₵100/year).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
