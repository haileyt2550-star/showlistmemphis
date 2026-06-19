import { prisma } from "@/lib/db";
import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";

export const revalidate = 3600; // refresh every hour

export default async function VenuesPage() {
  const venues = await prisma.venue.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { events: true } },
    },
    orderBy: { name: "asc" },
  });

  const memphis = venues.filter((v) => v.state === "TN");
  const mississippi = venues.filter((v) => v.state === "MS");
  const other = venues.filter((v) => v.state !== "TN" && v.state !== "MS");

  function VenueSection({
    title,
    items,
  }: {
    title: string;
    items: typeof venues;
  }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-10">
        <h2
          className="text-2xl tracking-widest text-[#C9A84C] mb-4"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((v) => (
            <div
              key={v.id}
              className="bg-[#141420] border border-[#2A2A40] rounded-lg p-4 hover:border-[#C9A84C]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-[#EDE9E0] text-sm leading-snug">
                  {v.name}
                </h3>
                {v.website && (
                  <a
                    href={v.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4A9EE8] hover:text-[#6BB8F4] shrink-0 mt-0.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#6B6880] mb-3">
                <MapPin className="w-3 h-3 text-[#C9A84C] shrink-0" />
                <span>
                  {v.address}, {v.city}, {v.state}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#C9A84C] font-semibold">
                  {v._count.events} upcoming show
                  {v._count.events !== 1 ? "s" : ""}
                </span>
                {v.capacity && (
                  <span className="text-xs text-[#4A4858]">
                    Cap. {v.capacity.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.4em] text-[#C9A84C] mb-2 uppercase">
          Mid-South
        </p>
        <h1
          className="text-5xl text-[#EDE9E0] leading-none tracking-wide"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Venues
        </h1>
      </div>

      <div className="divider-gold mb-8" />

      <VenueSection title="Memphis, TN" items={memphis} />
      <VenueSection title="Mississippi" items={mississippi} />
      {other.length > 0 && <VenueSection title="Other" items={other} />}

      {venues.length === 0 && (
        <p className="text-[#6B6880] text-sm text-center py-16">
          No venues yet. Run a scrape to populate the database.
        </p>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm text-[#C9A84C] hover:text-[#DDB85C] transition-colors"
        >
          ← Back to all shows
        </Link>
      </div>
    </div>
  );
}
