import axios from "axios";

const TM_API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE = "https://app.ticketmaster.com/discovery/v2";

// Memphis center coordinates, ~80-mile radius
const GEO = { lat: 35.1495, lng: -90.0489, radius: 80 };

interface TmEvent {
  id: string;
  name: string;
  dates: {
    start: { localDate: string; localTime?: string };
  };
  url: string;
  images: { url: string; width: number }[];
  classifications?: { genre?: { name: string } }[];
  priceRanges?: { min: number; max: number; currency: string }[];
  _embedded?: {
    venues?: {
      name: string;
      address?: { line1?: string };
      city?: { name: string };
      state?: { stateCode: string };
      location?: { latitude: string; longitude: string };
    }[];
  };
}

export interface ScrapedEvent {
  title: string;
  artist?: string;
  venueName: string;
  venueAddress?: string;
  venueCity?: string;
  venueState?: string;
  venueLat?: number;
  venueLng?: number;
  date: Date;
  ticketUrl?: string;
  price?: string;
  genre?: string;
  imageUrl?: string;
  source: string;
  sourceId: string;
  isPopUp: boolean;
}

export async function fetchTicketmasterEvents(
  startDate: Date,
  endDate: Date
): Promise<ScrapedEvent[]> {
  if (!TM_API_KEY) {
    console.warn("[Ticketmaster] No API key set — skipping");
    return [];
  }

  const results: ScrapedEvent[] = [];
  let page = 0;
  const pageSize = 200;

  while (true) {
    try {
      const res = await axios.get<{
        _embedded?: { events?: TmEvent[] };
        page: { totalPages: number };
      }>(`${BASE}/events.json`, {
        params: {
          apikey: TM_API_KEY,
          latlong: `${GEO.lat},${GEO.lng}`,
          radius: GEO.radius,
          unit: "miles",
          startDateTime: startDate.toISOString().split(".")[0] + "Z",
          endDateTime: endDate.toISOString().split(".")[0] + "Z",
          size: pageSize,
          page,
          sort: "date,asc",
        },
      });

      const events = res.data._embedded?.events ?? [];
      const totalPages = res.data.page?.totalPages ?? 1;

      for (const ev of events) {
        const tmVenue = ev._embedded?.venues?.[0];
        const dateStr = ev.dates.start.localDate;
        const timeStr = ev.dates.start.localTime ?? "00:00:00";
        const date = new Date(`${dateStr}T${timeStr}`);

        const genreRaw = ev.classifications?.[0]?.genre?.name;
        const genre = genreRaw && genreRaw !== "Undefined" ? genreRaw : undefined;

        const priceRange = ev.priceRanges?.[0];
        const price = priceRange
          ? `$${priceRange.min.toFixed(0)}${
              priceRange.max !== priceRange.min
                ? `–$${priceRange.max.toFixed(0)}`
                : ""
            }`
          : undefined;

        const image = ev.images
          ?.filter((i) => i.width >= 640)
          ?.sort((a, b) => b.width - a.width)[0];

        results.push({
          title: ev.name,
          venueName: tmVenue?.name ?? "Unknown Venue",
          venueAddress: tmVenue?.address?.line1,
          venueCity: tmVenue?.city?.name,
          venueState: tmVenue?.state?.stateCode,
          venueLat: tmVenue?.location?.latitude
            ? parseFloat(tmVenue.location.latitude)
            : undefined,
          venueLng: tmVenue?.location?.longitude
            ? parseFloat(tmVenue.location.longitude)
            : undefined,
          date,
          ticketUrl: ev.url,
          price,
          genre,
          imageUrl: image?.url,
          source: "ticketmaster",
          sourceId: ev.id,
          isPopUp: false,
        });
      }

      if (page >= totalPages - 1) break;
      page++;
    } catch (err) {
      console.error("[Ticketmaster] fetch error:", err);
      break;
    }
  }

  return results;
}
