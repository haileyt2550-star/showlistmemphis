import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedEvent } from "./ticketmaster";

// Memphis Flyer events calendar — primary source for pop-ups, local shows
// and anything that won't appear on Ticketmaster
export async function scrapeMemphisFlyer(startDate: Date): Promise<ScrapedEvent[]> {
  const results: ScrapedEvent[] = [];

  try {
    const res = await axios.get("https://www.memphisflyer.com/memphis/EventSearch", {
      params: {
        narrowByDate: startDate.toISOString().split("T")[0],
        sortBy: "date",
        v: "d", // list view
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(res.data);

    $(".event-listing, .event-item, article.event").each((_, el) => {
      try {
        const title =
          $(el).find(".event-title, h2, h3, .title").first().text().trim();
        if (!title) return;

        const dateText = $(el)
          .find(".event-date, .date, time")
          .first()
          .text()
          .trim();
        const venueName = $(el)
          .find(".venue-name, .venue, .location")
          .first()
          .text()
          .trim();
        const ticketUrl =
          $(el).find("a").first().attr("href") ?? undefined;

        const date = dateText ? new Date(dateText) : new Date();
        if (isNaN(date.getTime())) return;

        results.push({
          title,
          venueName: venueName || "Various — Memphis",
          venueCity: "Memphis",
          venueState: "TN",
          date,
          ticketUrl: ticketUrl?.startsWith("http")
            ? ticketUrl
            : ticketUrl
            ? `https://www.memphisflyer.com${ticketUrl}`
            : undefined,
          source: "memphisflyer",
          sourceId: `mf-${Buffer.from(title + dateText).toString("base64").slice(0, 20)}`,
          isPopUp: true,
        });
      } catch {
        // skip malformed entries
      }
    });
  } catch (err) {
    console.error("[MemphisFlyer] scrape error:", err);
  }

  return results;
}
