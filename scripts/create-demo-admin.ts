// Creates (or resets) the public portfolio demo admin account — a
// SEPARATE account from the real admin login, meant to be shared openly
// with recruiters/visitors. Unlike scripts/set-admin-password.ts, this
// password is intentionally not a secret — it's displayed publicly on
// the site and in the case study.
//
// Destructive actions (editing/deleting foods or categories, editing
// settings, uploading images) are blocked for this specific account at
// the API level — see the isDemoAccount() checks in lib/session.ts and
// each guarded route. Everything else, especially the order status and
// payment-reconciliation workflow, is fully open to try.
//
// Usage:
//   npx tsx scripts/create-demo-admin.ts

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@dineflow.example";
const DEMO_PASSWORD = "TryMeOut2026";
const DEMO_NAME = "Demo Admin";

async function main() {
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password: hashed, role: Role.ADMIN, name: DEMO_NAME },
    create: { email: DEMO_EMAIL, password: hashed, role: Role.ADMIN, name: DEMO_NAME },
  });

  console.log(`Demo admin ready → ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log("This password is meant to be public — it's displayed on the live site and case study.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
