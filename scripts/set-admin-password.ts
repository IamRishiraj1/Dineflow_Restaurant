// One-off utility to change the seeded admin account's password without
// re-running the full seed script — seed.ts creates categories, foods,
// and orders with plain .create() (not upsert), so running it again
// against a database that already has data would duplicate all of that.
// This script only ever touches the admin user's password field.
//
// The new password is passed as a command-line argument, not hardcoded
// here — so it only ever lives in your terminal history, never in a
// file that could end up committed to git.
//
// Usage:
//   npx tsx scripts/set-admin-password.ts "YourNewStrongPassword123!"

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPassword = process.argv[2];

  if (!newPassword || newPassword.length < 8) {
    console.error('Usage: npx tsx scripts/set-admin-password.ts "YourNewStrongPassword123!"');
    console.error("(password must be at least 8 characters)");
    process.exit(1);
  }

  const email = "admin@dineflow.example";
  const hashed = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  // Deliberately doesn't log the new password back out — if this ever
  // ran in a CI/build log somewhere, that log would become the new
  // leaked credential.
  console.log(`Password updated for ${updated.email}. The old seeded password no longer works.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
