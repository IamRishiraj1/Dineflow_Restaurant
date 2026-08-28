import { PrismaClient } from "@prisma/client";

// Standard Next.js + Prisma singleton pattern. In development, Next.js
// hot-reloads modules on every save, which would otherwise instantiate a
// new PrismaClient (and a new DB connection) on every change. Stashing the
// client on `globalThis` avoids that.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
