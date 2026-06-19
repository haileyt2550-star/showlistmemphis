// Edge-only DB client — uses Cloudflare D1 exclusively.
// Imported by all API routes (runtime = "edge"). Never imports better-sqlite3.

import { PrismaClient } from "@/generated/prisma";
import { PrismaD1 } from "@prisma/adapter-d1";

export function getDB(env?: { DB?: any }): PrismaClient {
  if (!env?.DB) {
    throw new Error("D1 binding not available. Is DB bound in wrangler.toml?");
  }
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter } as any);
}
