import { PrismaClient } from "@prisma/client";

const email = process.argv[2] ?? "brice@example.com";
const prisma = new PrismaClient();

const user = await prisma.user.findUnique({ where: { email } });
if (!user) {
  console.error("no user", email);
  process.exit(1);
}
await prisma.subscription.updateMany({
  where: { userId: user.id },
  data: {
    status: "inactive",
    currentPeriodEnd: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    cancelAtPeriodEnd: false,
  },
});
await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: null } });
console.log("reset subscription for", email);
await prisma.$disconnect();
