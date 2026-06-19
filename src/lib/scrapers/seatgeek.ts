import axios from "axios";
import type { ScrapedEvent } from "./ticketmaster";

const SG_CLIENT_ID = process.env.SEATGEEK_CLIENT_ID;
const SG_CLIENT_SECRET = process.env.SEATGEEK_CLIENT_SECRET;

interface SgEvent {
  id: number;
  title: string;
  datetime_local: string;
  url: string;
  performers: { name: string; image?: string; genres?: { name: string }[] }[];
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    location: { lat: number; lon: number };
  };
  stats: { average_price?: number; lowest_price?: number };
  type: string;
}

export async function fetchSeatgeekEvents(
  startDate: Date,
  endDate: Date
): Promise<ScrapedEvent[]> {
  if (!SG_CLIENT_ID) {
    console.warn("[SeatGeek] No client ID — skipping");
    return [];
  }

  const results: ScrapedEvent[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const res = await axios.get<{ events: SgEvent[]; meta: { total: number } }>(
        "https://api.seatgeek.com/2/events",
        {
          params: {
            client_id: SG_CLIENT_ID,
            client_secret: SG_CLIENT_SECRET,
            lat: 35.1495,
            lon: -90.0489,
            range: "80mi",
            "datetime_local.gte": startDate.toISOString().slice(0, 19),
            "datetime_local.lte": endDate.toISOString().slice(0, 19),
            sort: "datetime_local.asc",
            per_page: perPage,
            page,
          },
        }
      );

      const events = res.data.events ?? [];
      const total = res.data.meta?.total ?? 0;

      for (const ev of events) {
        const genre = ev.performers?.[0]?.genres?.[0]?.name;
        const lowestPrice = ev.stats?.lowest_price;
        const price = lowestPrice ? `From $${lowestPrice}` : undefined;

        results.push({
          title: ev.title,
          artist: ev.performers?.[0]?.name,
          venueName: ev.venue.name,
          venueAddress: ev.venue.address,
          venueCity: ev.venue.city,
          venueState: ev.venue.state,
          venueLat: ev.venue.location.lat,
          venueLng: ev.venue.location.lon,
          date: new Date(ev.datetime_local),
          ticketUrl: ev.url,
          price,
          genre,
          imageUrl: ev.performers?.[0]?.image,
          source: "seatgeek",
          sourceId: String(ev.id),
          isPopUp: false,
        });
      }

      if (page * perPage >= total) break;
      page++;
    } catch (err) {
      console.error("[SeatGeek] fetch error:", err);
      break;
    }
  }

  return results;
}
