// Removes the 12 fake demo orders that prisma/seed.ts plants (fictional
// customers like "Ariful Islam") so they don't sit in your admin
// dashboard mixed in with real customer orders. Matches on their exact,
// known order numbers only — real customer orders get a random order
// number from generateOrderNumber() and won't match any of these, so
// this can't accidentally delete a genuine order.
//
// OrderItem rows are deleted automatically (onDelete: Cascade in the
// schema), so this is the only query needed.
//
// Usage:
//   npx tsx scripts/remove-seeded-demo-orders.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEEDED_DEMO_ORDER_NUMBERS = [
  "DF-10231", "DF-10232", "DF-10233", "DF-10234", "DF-10235", "DF-10236",
  "DF-10237", "DF-10238", "DF-10239", "DF-10240", "DF-10241", "DF-10242",
];

async function main() {
  const result = await prisma.order.deleteMany({
    where: { orderNumber: { in: SEEDED_DEMO_ORDER_NUMBERS } },
  });
  console.log(`Removed ${result.count} seeded demo order(s).`);
  if (result.count < SEEDED_DEMO_ORDER_NUMBERS.length) {
    console.log(
      `(Expected up to ${SEEDED_DEMO_ORDER_NUMBERS.length} — fewer were found, ` +
        `which just means some were already removed or never seeded. Not an error.)`
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
