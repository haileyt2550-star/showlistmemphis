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
    fetch(`/api/events?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then((r) => r.json())
      .then((d: any) => setEvents(d.events ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[0.45em] text-[#E8608A] mb-2 uppercase">
          Schedule
        </p>
        <h1
          className="text-5xl text-[#F2ECE0] leading-none tracking-wide"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Calendar
        </h1>
      </div>

      <div className="divider-rose mb-8" />

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#7268A0]">
          <Loader2 className="w-5 h-5 animate-spin mr-3" />
          <span className="text-sm">Loading calendar…</span>
        </div>
      ) : (
        <CalendarView events={events} />
      )}
    </div>
  );
}
