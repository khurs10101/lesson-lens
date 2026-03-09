import { PrismaClient } from "@prisma/client";

/** True when a real DATABASE_URL is configured */
export const IS_DB_ENABLED = !!process.env.DATABASE_URL;

// Prisma v7 uses a driver adapter; we create the client lazily so the
// import of @prisma/adapter-pg doesn't blow up when DATABASE_URL is absent.
type GlobalWithPrisma = typeof globalThis & { _prismaClient?: PrismaClient };
const g = globalThis as GlobalWithPrisma;

function buildClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    // No DB configured — return null.
    // Every call site is guarded by `if (!IS_DB_ENABLED) return` so this
    // null value will never be dereferenced at runtime.
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg") as typeof import("pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

// Cast to PrismaClient: safe because every usage is guarded by IS_DB_ENABLED
export const prisma = (g._prismaClient ?? buildClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  g._prismaClient = prisma;
}
