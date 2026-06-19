"use client";

import { useState, useEffect } from "react";
import CalendarView from "@/components/CalendarView";
import type { EventWithVenue } from "@/types";
import { Loader2 } from "lucide-react";

export default function CalendarPage() {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.4em] text-[#C9A84C] mb-2 uppercase">
          Schedule
        </p>
        <h1
          className="text-5xl text-[#EDE9E0] leading-none tracking-wide"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Calendar
        </h1>
      </div>

      <div className="divider-gold mb-8" />

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#6B6880]">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          <span className="text-sm">Loading calendar…</span>
        </div>
      ) : (
        <CalendarView events={events} />
      )}
    </div>
  );
}
