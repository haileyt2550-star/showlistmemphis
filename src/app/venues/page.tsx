"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";

interface VenueWithCount {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  website: string | null;
  capacity: number | null;
  _count?: { events: number };
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<VenueWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/venues")
      .then((r) => r.json())
      .then((d: any) => setVenues(d.venues ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const memphis = venues.filter((v) => v.state === "TN");
  const mississippi = venues.filter((v) => v.state === "MS");
  const other = venues.filter((v) => v.state !== "TN" && v.state !== "MS");

  function VenueSection({ title, items }: { title: string; items: VenueWithCount[] }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-10">
        <h2
          className="text-2xl tracking-widest text-[#E8608A] mb-4"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((v) => (
            <div
              key={v.id}
              className="bg-[#13112A] border border-[#272348] rounded-2xl p-4 hover:border-[#E8608A]/30 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_#E8608A10] transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-[#F2ECE0] text-sm leading-snug">
                  {v.name}
                </h3>
                {v.website && (
                  <a
                    href={v.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A48BF0] hover:text-[#C4B0F8] shrink-0 mt-0.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7268A0] mb-3">
                <MapPin className="w-3 h-3 text-[#E8608A] shrink-0" />
                <span>{v.address}, {v.city}, {v.state}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#E8608A] font-semibold">
                  {v._count?.events ?? 0} upcoming show{(v._count?.events ?? 0) !== 1 ? "s" : ""}
                </span>
                {v.capacity && (
                  <span className="text-xs text-[#4A4570]">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[0.45em] text-[#E8608A] mb-2 uppercase">
          Mid-South
        </p>
        <h1
          className="text-5xl text-[#F2ECE0] leading-none tracking-wide"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Venues
        </h1>
      </div>

      <div className="divider-rose mb-8" />

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#7268A0]">
          <Loader2 className="w-5 h-5 animate-spin mr-3" />
          <span className="text-sm">Loading venues…</span>
        </div>
      ) : (
        <>
          <VenueSection title="Memphis, TN" items={memphis} />
          <VenueSection title="Mississippi" items={mississippi} />
          {other.length > 0 && <VenueSection title="Other" items={other} />}
          {venues.length === 0 && (
            <p className="text-[#7268A0] text-sm text-center py-16">
              No venues yet. Run a scrape to populate the database.
            </p>
          )}
        </>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-[#E8608A] hover:text-[#F07095] transition-colors">
          ← Back to all shows
        </Link>
      </div>
    </div>
  );
}
