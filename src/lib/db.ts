import { PrismaClient } from "@/generated/prisma";

// Local dev: better-sqlite3. Cloudflare: D1 via request context.
// Call getDB(env?) in API routes — env comes from getRequestContext() on CF.

let _localPrisma: PrismaClient | undefined;

function getLocalPrisma(): PrismaClient {
  if (_localPrisma) return _localPrisma;
  // Dynamic require so this doesn't break on CF edge
  const Database = require("better-sqlite3");
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const path = require("path");
  const dbPath = "file:" + path.resolve(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  _localPrisma = new PrismaClient({ adapter } as any);
  return _localPrisma;
}

export function getDB(env?: { DB?: any }): PrismaClient {
  if (env?.DB) {
    const { PrismaD1 } = require("@prisma/adapter-d1");
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter } as any);
  }
  return getLocalPrisma();
}

// Backwards-compat singleton for server components / seed script
export const prisma = getLocalPrisma();
