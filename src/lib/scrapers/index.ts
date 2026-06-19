import { getDB } from "@/lib/db";
import { VENUES } from "@/lib/venues";
import { fetchTicketmasterEvents } from "./ticketmaster";
import { fetchBandsintownEvents } from "./bandsintown";
import { fetchSeatgeekEvents } from "./seatgeek";
import { scrapeMemphisFlyer } from "./memphisflyer";
import { scrapeLevittShell } from "./levittshell";
import { scrapeEventbrite } from "./eventbrite";
import type { ScrapedEvent } from "./ticketmaster";
import type { PrismaClient } from "@/generated/prisma";

const GEO = { lat: 35.1495, lng: -90.0489 };

function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getOrCreateVenue(
  event: ScrapedEvent,
  db: PrismaClient
): Promise<string | null> {
  const venueName = event.venueName?.trim();
  if (!venueName) return null;

  const knownVenue = VENUES.find((v) =>
    venueName.toLowerCase().includes(v.name.toLowerCase().split(" ")[0])
  );

  if (knownVenue) {
    const dbVenue = await db.venue.upsert({
      where: { slug: knownVenue.slug },
      create: {
        name: knownVenue.name,
        slug: knownVenue.slug,
        address: knownVenue.address,
        city: knownVenue.city,
        state: knownVenue.state,
        zip: knownVenue.zip,
        lat: knownVenue.lat,
        lng: knownVenue.lng,
        capacity: knownVenue.capacity,
        website: knownVenue.website,
        scrapeUrl: knownVenue.scrapeUrl,
      },
      update: {},
    });
    return dbVenue.id;
  }

  const existingByName = await db.venue.findFirst({
    where: { name: { contains: venueName } },
  });
  if (existingByName) return existingByName.id;

  if (event.venueLat && event.venueLng) {
    const dist = distanceMiles(GEO.lat, GEO.lng, event.venueLat, event.venueLng);
    if (dist > 85) return null;
  }

  const slug = venueName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

  const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

  try {
    const created = await db.venue.create({
      data: {
        name: venueName,
        slug: uniqueSlug,
        address: event.venueAddress ?? "",
        city: event.venueCity ?? "Memphis",
        state: event.venueState ?? "TN",
        lat: event.venueLat ?? GEO.lat,
        lng: event.venueLng ?? GEO.lng,
      },
    });
    return created.id;
  } catch {
    return null;
  }
}

export async function runAllScrapers(env?: { DB?: any }): Promise<{
  total: number;
  new: number;
  errors: string[];
}> {
  const db = getDB(env);
  const errors: string[] = [];
  const now = new Date();
  const threeMonthsOut = new Date(now);
  threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);

  const [tmEvents, bitEvents, sgEvents, flyerEvents, levittEvents, ebEvents] =
    await Promise.allSettled([
      fetchTicketmasterEvents(now, threeMonthsOut),
      fetchBandsintownEvents(now, threeMonthsOut),
      fetchSeatgeekEvents(now, threeMonthsOut),
      scrapeMemphisFlyer(now),
      scrapeLevittShell(),
      scrapeEventbrite(),
    ]);

  const allEvents: ScrapedEvent[] = [];

  const addResult = (
    result: PromiseSettledResult<ScrapedEvent[]>,
    source: string
  ) => {
    if (result.status === "fulfilled") {
      allEvents.push(...result.value);
      console.log(`[${source}] fetched ${result.value.length} events`);
    } else {
      const msg = `[${source}] failed: ${result.reason}`;
      console.error(msg);
      errors.push(msg);
    }
  };

  addResult(tmEvents, "Ticketmaster");
  addResult(bitEvents, "Bandsintown");
  addResult(sgEvents, "SeatGeek");
  addResult(flyerEvents, "MemphisFlyer");
  addResult(levittEvents, "LevittShell");
  addResult(ebEvents, "Eventbrite");

  let newCount = 0;

  for (const ev of allEvents) {
    try {
      const venueId = await getOrCreateVenue(ev, db);
      if (!venueId) continue;

      await db.event.upsert({
        where: {
          sourceId_source: {
            sourceId: ev.sourceId,
            source: ev.source,
          },
        },
        create: {
          title: ev.title,
          artist: ev.artist,
          venueId,
          date: ev.date,
          ticketUrl: ev.ticketUrl,
          price: ev.price,
          genre: ev.genre,
          imageUrl: ev.imageUrl,
          source: ev.source,
          sourceId: ev.sourceId,
          isPopUp: ev.isPopUp,
        },
        update: {
          title: ev.title,
          artist: ev.artist,
          date: ev.date,
          ticketUrl: ev.ticketUrl,
          price: ev.price,
          genre: ev.genre,
          imageUrl: ev.imageUrl,
        },
      });

      newCount++;
    } catch (err) {
      if (!(err as Error)?.message?.includes("Unique constraint")) {
        console.error("[scraper] upsert error:", err);
      }
    }
  }

  return { total: allEvents.length, new: newCount, errors };
}
