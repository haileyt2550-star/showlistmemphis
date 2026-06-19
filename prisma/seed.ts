import { PrismaClient } from "../src/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { VENUES } from "../src/lib/venues";

const dbPath = "file:" + path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding venues…");

  for (const v of VENUES) {
    await prisma.venue.upsert({
      where: { slug: v.slug },
      create: {
        name: v.name,
        slug: v.slug,
        address: v.address,
        city: v.city,
        state: v.state,
        zip: v.zip,
        lat: v.lat,
        lng: v.lng,
        capacity: v.capacity,
        website: v.website,
        scrapeUrl: v.scrapeUrl,
      },
      update: {
        name: v.name,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        website: v.website,
      },
    });
  }

  const count = await prisma.venue.count();
  console.log(`Done — ${count} venues in database`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
