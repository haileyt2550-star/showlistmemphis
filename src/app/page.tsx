"use client";

import { useState, useEffect, useCallback } from "react";
import { addDays } from "date-fns";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import EmailSignup from "@/components/EmailSignup";
import type { EventWithVenue } from "@/types";
import type { Filters } from "@/components/EventFilters";
import { Loader2 } from "lucide-react";

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
      const data = await res.json() as any;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1
          className="text-5xl sm:text-7xl text-[#F0F0F0] leading-none tracking-wide"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Shows
        </h1>
        <p className="text-[#555555] text-sm mt-2">Memphis and surrounding area</p>
      </div>

      <div className="divider-rose mb-8" />

      {/* Filters */}
      <div className="mb-8">
        <EventFilters onChange={handleFiltersChange} />
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-[#444444] mb-5 tracking-wide">
          {events.length === 0
            ? "Nothing in that range."
            : `${events.length} show${events.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#555555]">
          <Loader2 className="w-4 h-4 animate-spin mr-3" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : events.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-[#444444] text-sm">Nothing showing up. Try a wider date range.</p>
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
