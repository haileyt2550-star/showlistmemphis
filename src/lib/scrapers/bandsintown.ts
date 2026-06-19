import axios from "axios";
import type { ScrapedEvent } from "./ticketmaster";

const BIT_APP_ID = process.env.BANDSINTOWN_APP_ID ?? "showlistmemphis";

// Search for artists with upcoming shows near Memphis
const MEMPHIS_ARTISTS_QUERY = "Memphis";

interface BitEvent {
  id: string;
  title: string;
  datetime: string;
  url: string;
  artist: { name: string; image_url?: string };
  venue: {
    name: string;
    city: string;
    region: string;
    country: string;
    latitude: string;
    longitude: string;
  };
  offers: { url: string; type: string }[];
  lineup: string[];
}

// Bandsintown doesn't have a "search by location" endpoint on the free tier.
// We query known Memphis-area venues and local artists directly.
const MEMPHIS_VENUE_SEARCHES = [
  "FedExForum",
  "Orpheum Theatre Memphis",
  "Minglewood Hall",
  "New Daisy Theatre",
  "Levitt Shell",
  "Lafayette's Music Room Memphis",
  "BankPlus Amphitheater",
  "Landers Center Southaven",
];

export async function fetchBandsintownEvents(
  startDate: Date,
  endDate: Date
): Promise<ScrapedEvent[]> {
  const results: ScrapedEvent[] = [];

  for (const venueName of MEMPHIS_VENUE_SEARCHES) {
    try {
      const res = await axios.get<BitEvent[]>(
        `https://rest.bandsintown.com/venues/search`,
        {
          params: {
            query: venueName,
            app_id: BIT_APP_ID,
          },
        }
      );

      if (!Array.isArray(res.data) || res.data.length === 0) continue;

      // For each matched venue, get its events
      for (const venue of res.data.slice(0, 2)) {
        // top 2 matches
        try {
          const evRes = await axios.get<BitEvent[]>(
            `https://rest.bandsintown.com/venues/${(venue as any).id}/events`,
            { params: { app_id: BIT_APP_ID, date: "upcoming" } }
          );

          for (const ev of evRes.data ?? []) {
            const date = new Date(ev.datetime);
            if (date < startDate || date > endDate) continue;

            results.push({
              title: ev.title || ev.lineup?.join(", ") || ev.artist?.name,
              artist: ev.artist?.name,
              venueName: ev.venue.name,
              venueCity: ev.venue.city,
              venueState: ev.venue.region,
              venueLat: parseFloat(ev.venue.latitude),
              venueLng: parseFloat(ev.venue.longitude),
              date,
              ticketUrl: ev.offers?.[0]?.url || ev.url,
              imageUrl: ev.artist?.image_url,
              source: "bandsintown",
              sourceId: ev.id,
              isPopUp: false,
            });
          }
        } catch {
          // venue may not have events
        }
      }
    } catch (err) {
      console.error(`[Bandsintown] error for "${venueName}":`, err);
    }
  }

  return results;
}
