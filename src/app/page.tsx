"use client";

import { useState, useEffect, useCallback } from "react";
import { addDays } from "date-fns";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import EmailSignup from "@/components/EmailSignup";
import type { EventWithVenue } from "@/types";
import type { Filters } from "@/components/EventFilters";
import { Loader2, Music2 } from "lucide-react";

export default function HomePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    start: today,
    end: addDays(today, 30),
    genre: null,
    popupOnly: false,
    q: "",
  });

  const fetchEvents = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: f.start.toISOString(),
        end: f.end.toISOString(),
        ...(f.genre ? { genre: f.genre } : {}),
        ...(f.popupOnly ? { popup: "true" } : {}),
        ...(f.q ? { q: f.q } : {}),
      });

      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiltersChange(f: Filters) {
    setFilters(f);
    fetchEvents(f);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="mb-10">
        <p className="text-xs font-bold tracking-[0.4em] text-[#C9A84C] mb-2 uppercase">
          Memphis &amp; the Mid-South
        </p>
        <h1
          className="text-5xl sm:text-7xl text-[#EDE9E0] leading-none tracking-wide mb-3"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Every Show.
          <br />
          <span className="text-[#C9A84C]">One Place.</span>
        </h1>
        <p className="text-[#8B8680] text-sm max-w-xl">
          FedExForum to the back room at Hi-Tone — if there&apos;s a show
          within 80 miles of Memphis, it&apos;s here.
        </p>
      </div>

      <div className="divider-gold mb-8" />

      {/* Filters */}
      <div className="mb-8">
        <EventFilters onChange={handleFiltersChange} />
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-[#6B6880] mb-5 tracking-wider">
          {events.length === 0
            ? "No shows found for that range."
            : `${events.length} show${events.length !== 1 ? "s" : ""} found`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#6B6880]">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          <span className="text-sm">Loading shows…</span>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Music2 className="w-10 h-10 text-[#2A2A40] mb-4" />
          <p className="text-[#6B6880] text-sm mb-2">
            No shows found for this range.
          </p>
          <p className="text-[#4A4858] text-xs">
            Try a wider date range, or trigger a scrape to pull live data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}

      {/* Email signup */}
      <div className="mt-16 max-w-xl">
        <EmailSignup />
      </div>
    </div>
  );
}
