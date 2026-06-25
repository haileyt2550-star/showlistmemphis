"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import type { EventWithVenue } from "@/types";
import {
  Loader2,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Music2,
} from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#0B0917] text-[#7268A0]">
      <Loader2 className="w-5 h-5 animate-spin mr-2.5" />
      <span className="text-sm">Loading map…</span>
    </div>
  ),
});

interface VenueGroup {
  venueId: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  website: string | null;
  events: EventWithVenue[];
}

function buildVenueGroups(events: EventWithVenue[]): VenueGroup[] {
  const map = new Map<string, VenueGroup>();
  for (const ev of events) {
    const id = ev.venue.id;
    if (!map.has(id)) {
      map.set(id, {
        venueId: id,
        venueName: ev.venue.name,
        address: ev.venue.address,
        city: ev.venue.city,
        state: ev.venue.state,
        website: ev.venue.website,
        events: [],
      });
    }
    map.get(id)!.events.push(ev);
  }
  return Array.from(map.values()).sort(
    (a, b) => b.events.length - a.events.length
  );
}

export default function MapPage() {
  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

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

  const venueGroups = buildVenueGroups(events);
  const selectedGroup = selectedVenueId
    ? (venueGroups.find((g) => g.venueId === selectedVenueId) ?? null)
    : null;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-72 shrink-0 flex flex-col bg-[#0B0917] border-r border-[#272348] overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-[#272348] shrink-0">
          {selectedGroup && (
            <button
              onClick={() => setSelectedVenueId(null)}
              className="flex items-center gap-1 text-[11px] text-[#7268A0] hover:text-[#F2ECE0] transition-colors mb-2.5"
            >
              <ChevronLeft className="w-3 h-3" />
              All venues
            </button>
          )}
          <p className="text-[10px] font-bold tracking-[0.35em] text-[#E8608A] uppercase mb-0.5">
            {selectedGroup
              ? `${selectedGroup.events.length} upcoming show${selectedGroup.events.length !== 1 ? "s" : ""}`
              : `${venueGroups.length} venue${venueGroups.length !== 1 ? "s" : ""} · ${events.length} shows`}
          </p>
          <h2
            className="text-[1.6rem] text-[#F2ECE0] leading-none tracking-wide truncate"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {selectedGroup ? selectedGroup.venueName : "Map View"}
          </h2>
          {selectedGroup && (
            <div className="flex items-start gap-1.5 mt-1.5">
              <MapPin className="w-3 h-3 text-[#E8608A] shrink-0 mt-px" />
              <span className="text-[11px] text-[#7268A0] leading-snug">
                {selectedGroup.address}, {selectedGroup.city},{" "}
                {selectedGroup.state}
              </span>
            </div>
          )}
          {selectedGroup?.website && (
            <a
              href={selectedGroup.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[#A48BF0] hover:text-[#C4B0F8] mt-1.5 transition-colors"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              Visit venue
            </a>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#7268A0]">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-xs">Loading…</span>
            </div>
          ) : selectedGroup ? (
            <div className="divide-y divide-[#1B1838]">
              {selectedGroup.events.map((ev) => (
                <a
                  key={ev.id}
                  href={ev.ticketUrl ?? "#"}
                  target={ev.ticketUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#13112A] transition-colors group"
                >
                  <div className="text-center min-w-[34px] shrink-0 pt-0.5">
                    <div className="text-[9px] text-[#E8608A] font-bold tracking-wider">
                      {format(new Date(ev.date), "MMM").toUpperCase()}
                    </div>
                    <div
                      className="text-xl text-[#F2ECE0] leading-none"
                      style={{ fontFamily: "var(--font-bebas)" }}
                    >
                      {format(new Date(ev.date), "d")}
                    </div>
                    <div className="text-[9px] text-[#4A4570] uppercase">
                      {format(new Date(ev.date), "EEE")}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F2ECE0] truncate group-hover:text-[#E8608A] transition-colors">
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {ev.genre && (
                        <span className="text-[9px] text-[#A48BF0] bg-[#A48BF0]/10 border border-[#A48BF0]/20 px-1.5 py-0.5 rounded-full tracking-wide uppercase font-bold">
                          {ev.genre}
                        </span>
                      )}
                      {ev.isPopUp && (
                        <span className="text-[9px] text-[#E8608A] bg-[#E8608A]/10 border border-[#E8608A]/20 px-1.5 py-0.5 rounded-full tracking-wide uppercase font-bold">
                          Pop-up
                        </span>
                      )}
                      {ev.price && (
                        <span className="text-[10px] text-[#7268A0]">
                          {ev.price}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : venueGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Music2 className="w-8 h-8 text-[#272348] mb-3" />
              <p className="text-xs text-[#7268A0]">
                No shows yet. Run a scrape to populate the map.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1B1838]">
              {venueGroups.map((group) => (
                <button
                  key={group.venueId}
                  onClick={() => setSelectedVenueId(group.venueId)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#13112A] transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E8608A]/10 border border-[#E8608A]/20 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-[#E8608A]">
                      {group.events.length}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F2ECE0] truncate group-hover:text-[#E8608A] transition-colors">
                      {group.venueName}
                    </p>
                    <p className="text-[11px] text-[#7268A0] truncate">
                      {group.city}, {group.state}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#3A3660] shrink-0 group-hover:text-[#E8608A] transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-[#272348] shrink-0">
          <div className="flex items-center gap-4 text-[10px] text-[#7268A0]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#E8608A]" />
              Ticketed
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#A48BF0]" />
              Pop-ups
            </div>
          </div>
        </div>
      </aside>

      {/* ── Map ── */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-[#0B0917] text-[#7268A0]">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-sm">Loading events…</span>
          </div>
        ) : (
          <MapView
            events={events}
            onVenueSelect={setSelectedVenueId}
            selectedVenueId={selectedVenueId}
          />
        )}
      </div>
    </div>
  );
}
