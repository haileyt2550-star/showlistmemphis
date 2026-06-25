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
} from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#111111] text-[#555555]">
      <Loader2 className="w-4 h-4 animate-spin mr-2.5" />
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
      <aside className="w-72 shrink-0 flex flex-col bg-[#111111] border-r border-[#2A2A2A] overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-[#2A2A2A] shrink-0">
          {selectedGroup && (
            <button
              onClick={() => setSelectedVenueId(null)}
              className="flex items-center gap-1 text-[11px] text-[#555555] hover:text-[#F0F0F0] transition-colors mb-2.5"
            >
              <ChevronLeft className="w-3 h-3" />
              All venues
            </button>
          )}
          <p className="text-[10px] text-[#555555] mb-0.5 tracking-wide">
            {selectedGroup
              ? `${selectedGroup.events.length} show${selectedGroup.events.length !== 1 ? "s" : ""}`
              : `${venueGroups.length} venues · ${events.length} shows`}
          </p>
          <h2
            className="text-[1.6rem] text-[#F0F0F0] leading-none tracking-wide truncate"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {selectedGroup ? selectedGroup.venueName : "Map"}
          </h2>
          {selectedGroup && (
            <div className="flex items-start gap-1.5 mt-1.5">
              <MapPin className="w-3 h-3 text-[#555555] shrink-0 mt-px" />
              <span className="text-[11px] text-[#555555] leading-snug">
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
              className="inline-flex items-center gap-1 text-[11px] text-[#E8608A] hover:text-[#F07095] mt-1.5 transition-colors"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              Visit venue
            </a>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#555555]">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-xs">Loading…</span>
            </div>
          ) : selectedGroup ? (
            <div className="divide-y divide-[#222222]">
              {selectedGroup.events.map((ev) => (
                <a
                  key={ev.id}
                  href={ev.ticketUrl ?? "#"}
                  target={ev.ticketUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors group"
                >
                  <div className="text-center min-w-[34px] shrink-0 pt-0.5">
                    <div className="text-[9px] text-[#E8608A] font-bold tracking-wider">
                      {format(new Date(ev.date), "MMM").toUpperCase()}
                    </div>
                    <div
                      className="text-xl text-[#F0F0F0] leading-none"
                      style={{ fontFamily: "var(--font-bebas)" }}
                    >
                      {format(new Date(ev.date), "d")}
                    </div>
                    <div className="text-[9px] text-[#444444] uppercase">
                      {format(new Date(ev.date), "EEE")}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F0F0F0] truncate group-hover:text-[#E8608A] transition-colors">
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {ev.genre && (
                        <span className="text-[9px] text-[#666666] border border-[#2A2A2A] px-1.5 py-0.5 rounded-full tracking-wide uppercase font-medium">
                          {ev.genre}
                        </span>
                      )}
                      {ev.isPopUp && (
                        <span className="text-[9px] text-[#E8608A] bg-[#E8608A]/10 border border-[#E8608A]/20 px-1.5 py-0.5 rounded-full tracking-wide uppercase font-bold">
                          Pop-up
                        </span>
                      )}
                      {ev.price && (
                        <span className="text-[10px] text-[#555555]">
                          {ev.price}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : venueGroups.length === 0 ? (
            <div className="py-16 text-center px-4">
              <p className="text-xs text-[#444444]">No shows yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {venueGroups.map((group) => (
                <button
                  key={group.venueId}
                  onClick={() => setSelectedVenueId(group.venueId)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors text-left group"
                >
                  <span className="text-[11px] font-semibold text-[#E8608A] min-w-[20px]">
                    {group.events.length}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F0F0F0] truncate group-hover:text-[#E8608A] transition-colors">
                      {group.venueName}
                    </p>
                    <p className="text-[11px] text-[#555555] truncate">
                      {group.city}, {group.state}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#333333] shrink-0 group-hover:text-[#E8608A] transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Map ── */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-[#111111] text-[#555555]">
            <Loader2 className="w-4 h-4 animate-spin mr-3" />
            <span className="text-sm">Loading…</span>
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
