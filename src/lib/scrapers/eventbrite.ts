import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedEvent } from "./ticketmaster";

// Eventbrite deep scrape for Memphis-area pop-ups and community events.
// Uses their public search page since the API requires OAuth.
export async function scrapeEventbrite(): Promise<ScrapedEvent[]> {
  const results: ScrapedEvent[] = [];
  const queries = ["music", "concert", "live music", "show", "festival"];

  for (const q of queries) {
    try {
      const res = await axios.get(
        `https://www.eventbrite.com/d/tn--memphis/music--events/${encodeURIComponent(q)}/`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          },
          timeout: 20000,
        }
      );

      const $ = cheerio.load(res.data);

      // Eventbrite embeds JSON-LD for event listings
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html() ?? "{}");
          const items = Array.isArray(json) ? json : [json];

          for (const item of items) {
            if (item["@type"] !== "Event") continue;

            const title = item.name as string;
            const dateStr = item.startDate as string;
            const date = dateStr ? new Date(dateStr) : undefined;
            if (!date || isNaN(date.getTime()) || !title) continue;

            const location = item.location;
            const venueName =
              typeof location === "object" ? location.name : "Memphis Area";
            const address =
              typeof location?.address === "object"
                ? `${location.address.streetAddress ?? ""}, ${location.address.addressLocality ?? ""}`
                : undefined;

            results.push({
              title,
              venueName: venueName || "Memphis Area",
              venueAddress: address,
              venueCity:
                typeof location?.address === "object"
                  ? location.address.addressLocality
                  : "Memphis",
              venueState:
                typeof location?.address === "object"
                  ? location.address.addressRegion
                  : "TN",
              date,
              ticketUrl: item.url,
              price: item.offers?.price
                ? `$${item.offers.price}`
                : item.offers?.priceCurrency === "USD"
                ? "Ticketed"
                : "Free",
              imageUrl: item.image,
              source: "eventbrite",
              sourceId: `eb-${Buffer.from(title + dateStr).toString("base64").slice(0, 20)}`,
              isPopUp: true,
            });
          }
        } catch {
          // skip malformed JSON-LD
        }
      });
    } catch (err) {
      console.error(`[Eventbrite] error for "${q}":`, err);
    }
  }

  // deduplicate by sourceId
  const seen = new Set<string>();
  return results.filter((e) => {
    if (seen.has(e.sourceId)) return false;
    seen.add(e.sourceId);
    return true;
  });
}
