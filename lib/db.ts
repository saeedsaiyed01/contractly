import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function assertDirectPostgresUrl(url: string) {
  const lower = url.trim().toLowerCase();
  if (lower.startsWith("prisma+")) {
    throw new Error(
      "DATABASE_URL uses a prisma+ URL. The pg driver needs a direct Postgres URL. " +
        "In the Neon dashboard copy the connection string that starts with postgresql:// or postgres:// " +
        "and set DATABASE_URL to that. Then run: pnpm db:migrate",
    );
  }
  if (
    !lower.startsWith("postgres://") &&
    !lower.startsWith("postgresql://")
  ) {
    throw new Error(
      "DATABASE_URL must start with postgres:// or postgresql:// (e.g. Neon connection string).",
    );
  }
}

function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.",
    );
  }
  assertDirectPostgresUrl(url);
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
