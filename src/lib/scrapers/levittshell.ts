import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedEvent } from "./ticketmaster";

const VENUE = {
  name: "Levitt Shell",
  slug: "levitt-shell",
  address: "1928 Poplar Ave",
  city: "Memphis",
  state: "TN",
  lat: 35.1502,
  lng: -90.0461,
};

export async function scrapeLevittShell(): Promise<ScrapedEvent[]> {
  const results: ScrapedEvent[] = [];

  try {
    const res = await axios.get("https://www.levittshell.org/events/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(res.data);

    // Levitt Shell uses standard WordPress event plugins
    $(".tribe-event, .type-tribe_events, article[class*='tribe']").each((_, el) => {
      try {
        const title = $(el)
          .find(".tribe-event-url, .tribe-events-list-event-title, h2, h3")
          .first()
          .text()
          .trim();
        if (!title) return;

        const dateText = $(el)
          .find(".tribe-event-date-start, time, .tribe-events-schedule")
          .first()
          .text()
          .trim();

        const ticketUrl =
          $(el).find("a[href*='ticket'], a[href*='event']").first().attr("href") ??
          $(el).find("a").first().attr("href");

        const date = dateText ? new Date(dateText) : undefined;
        if (!date || isNaN(date.getTime())) return;

        results.push({
          title,
          venueName: VENUE.name,
          venueAddress: VENUE.address,
          venueCity: VENUE.city,
          venueState: VENUE.state,
          venueLat: VENUE.lat,
          venueLng: VENUE.lng,
          date,
          ticketUrl: ticketUrl?.startsWith("http")
            ? ticketUrl
            : `https://www.levittshell.org${ticketUrl ?? ""}`,
          price: "Free",
          source: "levittshell",
          sourceId: `ls-${Buffer.from(title + dateText).toString("base64").slice(0, 20)}`,
          isPopUp: false,
        });
      } catch {
        // skip
      }
    });
  } catch (err) {
    console.error("[LevittShell] scrape error:", err);
  }

  return results;
}
