"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { EventWithVenue } from "@/types";
import { Loader2 } from "lucide-react";

// MapView must be client-only (Leaflet uses window)
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] border border-[#2A2A40] rounded-xl text-[#6B6880]">
      <Loader2 className="w-6 h-6 animate-spin mr-3" />
      <span className="text-sm">Loading map…</span>
    </div>
  ),
});

export default function MapPage() {
  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 3);

    fetch(
      `/api/events?start=${start.toISOString()}&end=${end.toISOString()}`
    )
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.4em] text-[#C9A84C] mb-2 uppercase">
          Where to go
        </p>
        <h1
          className="text-5xl text-[#EDE9E0] leading-none tracking-wide mb-2"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Map View
        </h1>
        <p className="text-[#6B6880] text-xs">
          Gold pins = ticketed shows · Blue pins = pop-ups &amp; community events
        </p>
      </div>

      <div className="divider-gold mb-8" />

      {loading ? (
        <div className="flex items-center justify-center h-[600px] border border-[#2A2A40] rounded-xl text-[#6B6880]">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          <span className="text-sm">Loading events…</span>
        </div>
      ) : (
        <MapView events={events} />
      )}

      {!loading && (
        <p className="text-xs text-[#4A4858] mt-4 text-center">
          Showing {events.length} shows across{" "}
          {new Set(events.map((e) => e.venue.id)).size} venues in the Memphis
          area
        </p>
      )}
    </div>
  );
}
