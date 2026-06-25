import { format } from "date-fns";
import Link from "next/link";
import { MapPin, Clock, Ticket, CalendarDays, ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { getDB } from "@/lib/db-cf";

export const runtime = "edge";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://showlistmemphis.com";

async function getEvent(id: string) {
  let env: { DB?: any } | undefined;
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    env = getRequestContext().env as any;
  } catch {}
  const db = getDB(env);
  return db.event.findUnique({
    where: { id },
    include: { venue: true },
  });
}

async function getRelatedEvents(venueId: string, excludeId: string) {
  let env: { DB?: any } | undefined;
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    env = getRequestContext().env as any;
  } catch {}
  const db = getDB(env);
  const now = new Date();
  return db.event.findMany({
    where: {
      venueId,
      id: { not: excludeId },
      date: { gte: now },
    },
    include: { venue: { select: { id: true, name: true, slug: true, city: true, state: true } } },
    orderBy: { date: "asc" },
    take: 4,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) {
    return { title: "Show Not Found — ShowList Memphis" };
  }

  const dateStr = format(new Date(event.date), "EEEE, MMMM d, yyyy");
  const timeStr = format(new Date(event.date), "h:mm a");
  const title = `${event.title} at ${event.venue.name} — ${dateStr}`;
  const description = `${event.title} live at ${event.venue.name} in ${event.venue.city}, ${event.venue.state} on ${dateStr} at ${timeStr}.${event.price ? ` Tickets from ${event.price}.` : ""} Find more Memphis shows at ShowList Memphis.`;
  const url = `${SITE_URL}/shows/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "ShowList Memphis",
      type: "website",
      ...(event.imageUrl ? { images: [{ url: event.imageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: event.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(event.imageUrl ? { images: [event.imageUrl] } : {}),
    },
    alternates: { canonical: url },
  };
}

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, related] = await Promise.all([
    getEvent(id),
    getEvent(id).then((e) =>
      e ? getRelatedEvents(e.venueId, id) : []
    ),
  ]);

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-[#7268A0] mb-4">Show not found.</p>
        <Link href="/" className="text-[#E8608A] hover:text-[#F07095] text-sm transition-colors">
          ← Back to all shows
        </Link>
      </div>
    );
  }

  const date = new Date(event.date);
  const dateStr = format(date, "EEEE, MMMM d, yyyy");
  const timeStr = format(date, "h:mm a");
  const url = `${SITE_URL}/shows/${id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.title,
    ...(event.artist ? { performer: { "@type": "MusicGroup", name: event.artist } } : {}),
    startDate: date.toISOString(),
    location: {
      "@type": "MusicVenue",
      name: event.venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venue.address,
        addressLocality: event.venue.city,
        addressRegion: event.venue.state,
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: event.venue.lat,
        longitude: event.venue.lng,
      },
    },
    url,
    ...(event.imageUrl ? { image: event.imageUrl } : {}),
    ...(event.description ? { description: event.description } : {}),
    ...(event.genre ? { genre: event.genre } : {}),
    ...(event.ticketUrl
      ? {
          offers: {
            "@type": "Offer",
            url: event.ticketUrl,
            availability: "https://schema.org/InStock",
            validFrom: new Date().toISOString(),
            ...(event.price ? { price: event.price.replace(/[^0-9.]/g, ""), priceCurrency: "USD" } : {}),
          },
        }
      : {}),
    organizer: { "@type": "Organization", name: "ShowList Memphis", url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#7268A0] hover:text-[#F2ECE0] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All shows
        </Link>

        {/* Hero image */}
        {event.imageUrl && (
          <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden mb-8 border border-[#272348]">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0917]/80 via-transparent to-transparent" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Genre + popup badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {event.genre && (
                <span className="text-[10px] font-bold tracking-widest text-[#A48BF0] bg-[#A48BF0]/10 border border-[#A48BF0]/25 px-2.5 py-1 rounded-full uppercase">
                  {event.genre}
                </span>
              )}
              {event.isPopUp && (
                <span className="text-[10px] font-bold tracking-widest text-[#E8608A] bg-[#E8608A]/10 border border-[#E8608A]/25 px-2.5 py-1 rounded-full uppercase">
                  Pop-up
                </span>
              )}
            </div>

            <h1
              className="text-4xl sm:text-5xl text-[#F2ECE0] leading-tight mb-2"
              style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em" }}
            >
              {event.title}
            </h1>

            {event.artist && event.artist !== event.title && (
              <p className="text-[#A48BF0] text-lg font-medium mb-6">{event.artist}</p>
            )}

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-[#7268A0]">
                <CalendarDays className="w-4 h-4 text-[#E8608A] shrink-0" />
                <span className="text-sm">{dateStr}</span>
              </div>
              <div className="flex items-center gap-3 text-[#7268A0]">
                <Clock className="w-4 h-4 text-[#E8608A] shrink-0" />
                <span className="text-sm">{timeStr}</span>
                {event.doorsTime && (
                  <span className="text-xs text-[#4A4570]">
                    · Doors {format(new Date(event.doorsTime), "h:mm a")}
                  </span>
                )}
              </div>
              <div className="flex items-start gap-3 text-[#7268A0]">
                <MapPin className="w-4 h-4 text-[#E8608A] shrink-0 mt-0.5" />
                <div>
                  <Link
                    href={`/venues/${event.venue.slug}`}
                    className="text-sm text-[#F2ECE0] hover:text-[#E8608A] transition-colors font-medium"
                  >
                    {event.venue.name}
                  </Link>
                  <p className="text-xs text-[#7268A0]">
                    {event.venue.address}, {event.venue.city}, {event.venue.state}
                  </p>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="bg-[#13112A] border border-[#272348] rounded-2xl p-5 mb-8">
                <p className="text-sm text-[#A8A0C0] leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar — ticket box */}
          <div className="lg:col-span-1">
            <div className="bg-[#13112A] border border-[#272348] rounded-2xl p-5 sticky top-20">
              {event.price && (
                <p className="text-2xl font-bold text-[#F2ECE0] mb-1" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>
                  {event.price}
                </p>
              )}
              <p className="text-xs text-[#7268A0] mb-4">
                {event.price ? "per person" : "Check venue for pricing"}
              </p>

              {event.ticketUrl ? (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#E8608A] hover:bg-[#F07095] text-[#0B0917] font-bold rounded-full transition-colors text-sm"
                >
                  <Ticket className="w-4 h-4" />
                  Get Tickets
                </a>
              ) : (
                <div className="text-center text-xs text-[#4A4570] py-3">
                  No ticket link — check venue website
                </div>
              )}

              {event.venue.website && (
                <a
                  href={event.venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full mt-2 py-2.5 border border-[#272348] text-[#7268A0] hover:text-[#F2ECE0] hover:border-[#A48BF0]/40 rounded-full transition-colors text-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Venue website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* More at this venue */}
        {(related as any[]).length > 0 && (
          <div className="mt-12">
            <div className="divider-rose mb-8" />
            <p className="text-[11px] font-bold tracking-[0.45em] text-[#E8608A] uppercase mb-1">
              Same venue
            </p>
            <h2
              className="text-3xl text-[#F2ECE0] mb-6"
              style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.06em" }}
            >
              More at {event.venue.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(related as any[]).map((ev) => {
                const d = new Date(ev.date);
                return (
                  <Link
                    key={ev.id}
                    href={`/shows/${ev.id}`}
                    className="flex items-center gap-3 bg-[#13112A] border border-[#272348] rounded-2xl p-4 hover:border-[#E8608A]/30 hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className="text-center min-w-[38px]">
                      <div className="text-[9px] text-[#E8608A] font-bold tracking-wider">
                        {format(d, "MMM").toUpperCase()}
                      </div>
                      <div
                        className="text-xl text-[#F2ECE0] leading-none"
                        style={{ fontFamily: "var(--font-bebas)" }}
                      >
                        {format(d, "d")}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F2ECE0] truncate group-hover:text-[#E8608A] transition-colors">
                        {ev.title}
                      </p>
                      <p className="text-xs text-[#7268A0]">{format(d, "h:mm a")}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
