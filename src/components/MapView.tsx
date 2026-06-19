"use client";

import { useEffect, useRef } from "react";
import type { EventWithVenue } from "@/types";

interface Props {
  events: EventWithVenue[];
}

// Grouped by venue for cleaner map markers
interface VenueGroup {
  venueId: string;
  venueName: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  website: string | null;
  events: EventWithVenue[];
}

function groupByVenue(events: EventWithVenue[]): VenueGroup[] {
  const map = new Map<string, VenueGroup>();
  for (const ev of events) {
    const id = ev.venue.id;
    if (!map.has(id)) {
      map.set(id, {
        venueId: id,
        venueName: ev.venue.name,
        lat: ev.venue.lat,
        lng: ev.venue.lng,
        city: ev.venue.city,
        state: ev.venue.state,
        website: ev.venue.website,
        events: [],
      });
    }
    map.get(id)!.events.push(ev);
  }
  return Array.from(map.values());
}

export default function MapView({ events }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet so it doesn't SSR
    import("leaflet").then((L) => {
      // Fix default marker icons (webpack asset issue)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [35.1495, -90.0489], // Memphis center
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      const goldIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:28px;height:28px;
          background:#C9A84C;
          border:2px solid #0D0D18;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(201,168,76,0.5);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -32],
      });

      const blueIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:22px;height:22px;
          background:#4A9EE8;
          border:2px solid #0D0D18;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(74,158,232,0.4);
        "></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 22],
        popupAnchor: [0, -26],
      });

      const groups = groupByVenue(events);

      for (const group of groups) {
        const hasPopUp = group.events.some((e) => e.isPopUp);
        const icon = hasPopUp ? blueIcon : goldIcon;

        const popupHtml = `
          <div style="font-family:Inter,sans-serif;min-width:200px;max-width:260px;">
            <p style="font-weight:700;color:#EDE9E0;font-size:14px;margin:0 0 4px 0;">${group.venueName}</p>
            <p style="color:#6B6880;font-size:11px;margin:0 0 10px 0;">${group.city}, ${group.state}</p>
            <div style="space-y:4px;">
              ${group.events
                .slice(0, 5)
                .map(
                  (ev) => `
                <a href="${ev.ticketUrl ?? "#"}" target="_blank" rel="noopener"
                   style="display:block;padding:4px 6px;background:#1C1C2E;border-radius:4px;margin-bottom:3px;text-decoration:none;">
                  <span style="color:#C9A84C;font-size:10px;display:block;">${new Date(ev.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                  <span style="color:#EDE9E0;font-size:12px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ev.title}</span>
                </a>`
                )
                .join("")}
              ${
                group.events.length > 5
                  ? `<p style="color:#6B6880;font-size:10px;margin:4px 0 0 0;">+${group.events.length - 5} more shows</p>`
                  : ""
              }
            </div>
            ${
              group.website
                ? `<a href="${group.website}" target="_blank" rel="noopener" style="color:#4A9EE8;font-size:11px;display:block;margin-top:8px;">Venue website →</a>`
                : ""
            }
          </div>
        `;

        L.marker([group.lat, group.lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml, {
            maxWidth: 280,
            className: "showlist-popup",
          });
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when events change
  useEffect(() => {
    // Full rebuild is fine for now since events load once
  }, [events]);

  return (
    <>
      <style>{`
        .showlist-popup .leaflet-popup-content-wrapper {
          background: #141420;
          border: 1px solid #2A2A40;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        }
        .showlist-popup .leaflet-popup-tip {
          background: #141420;
        }
        .showlist-popup .leaflet-popup-close-button {
          color: #6B6880 !important;
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden border border-[#2A2A40]"
        style={{ height: "600px" }}
      />
    </>
  );
}
