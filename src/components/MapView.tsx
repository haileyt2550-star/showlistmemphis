"use client";

import { useEffect, useRef } from "react";
import type { EventWithVenue } from "@/types";

interface Props {
  events: EventWithVenue[];
  onVenueSelect?: (venueId: string) => void;
  selectedVenueId?: string | null;
}

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

export default function MapView({ events, onVenueSelect, selectedVenueId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if (!document.querySelector("link[data-leaflet-css]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute("data-leaflet-css", "");
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [35.1495, -90.0489],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      const groups = groupByVenue(events).filter(
        (g) => g.lat !== 0 && g.lng !== 0 && !isNaN(g.lat) && !isNaN(g.lng)
      );

      for (const group of groups) {
        const count = group.events.length;
        const color = "#E8608A";

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:36px;height:36px;
            background:${color};
            border:2.5px solid #111111;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:12px;font-weight:800;font-family:Inter,system-ui,sans-serif;
            color:#111111;
            box-shadow:0 0 0 4px ${color}28,0 4px 14px rgba(0,0,0,0.75);
            cursor:pointer;
            transition:transform 0.15s,box-shadow 0.15s;
          "
          onmouseenter="this.style.transform='scale(1.2)';this.style.boxShadow='0 0 0 6px ${color}40,0 6px 20px rgba(0,0,0,0.8)'"
          onmouseleave="this.style.transform='scale(1)';this.style.boxShadow='0 0 0 4px ${color}28,0 4px 14px rgba(0,0,0,0.75)'"
          >${count}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -22],
        });

        const popupHtml = `
          <div style="font-family:Inter,system-ui,sans-serif;min-width:220px;max-width:280px;">
            <p style="font-weight:700;color:#F0F0F0;font-size:14px;margin:0 0 2px 0;line-height:1.3;">${group.venueName}</p>
            <p style="color:#555555;font-size:11px;margin:0 0 10px 0;">${group.city}, ${group.state}</p>
            <div>
              ${group.events
                .slice(0, 4)
                .map(
                  (ev) => `
                <a href="${ev.ticketUrl ?? "#"}" target="_blank" rel="noopener"
                   style="display:block;padding:5px 8px;background:#222222;border-radius:8px;margin-bottom:3px;text-decoration:none;border:1px solid #2A2A2A;">
                  <span style="color:#E8608A;font-size:10px;display:block;font-weight:600;margin-bottom:1px;">
                    ${new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span style="color:#F0F0F0;font-size:12px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ev.title}</span>
                </a>`
                )
                .join("")}
              ${
                group.events.length > 4
                  ? `<p style="color:#555555;font-size:10px;margin:5px 0 0 0;">+${group.events.length - 4} more</p>`
                  : ""
              }
            </div>
            ${
              group.website
                ? `<a href="${group.website}" target="_blank" rel="noopener" style="color:#E8608A;font-size:11px;display:block;margin-top:8px;text-decoration:none;">Visit venue →</a>`
                : ""
            }
          </div>
        `;

        L.marker([group.lat, group.lng], { icon })
          .addTo(map)
          .on("click", () => onVenueSelect?.(group.venueId))
          .bindPopup(popupHtml, {
            maxWidth: 300,
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

  return (
    <>
      <style>{`
        .showlist-popup .leaflet-popup-content-wrapper {
          background: #181818;
          border: 1px solid #2A2A2A;
          border-radius: 14px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.85);
          padding: 0;
        }
        .showlist-popup .leaflet-popup-content {
          margin: 14px 14px;
        }
        .showlist-popup .leaflet-popup-tip {
          background: #181818;
        }
        .showlist-popup .leaflet-popup-close-button {
          color: #555555 !important;
          font-size: 18px !important;
          padding: 6px 8px !important;
          top: 2px !important;
          right: 2px !important;
        }
        .leaflet-control-zoom a {
          background: #181818 !important;
          border-color: #2A2A2A !important;
          color: #F0F0F0 !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #222222 !important;
          color: #E8608A !important;
        }
        .leaflet-control-zoom-in {
          border-bottom: 1px solid #2A2A2A !important;
        }
        .leaflet-control-attribution {
          background: rgba(17,17,17,0.8) !important;
          color: #444444 !important;
          font-size: 10px !important;
          backdrop-filter: blur(4px);
        }
        .leaflet-control-attribution a {
          color: #555555 !important;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}
