"use client";

import { format } from "date-fns";
import { MapPin, Clock, Ticket } from "lucide-react";
import type { EventWithVenue } from "@/types";

interface Props {
  event: EventWithVenue;
  compact?: boolean;
}

const GENRE_THEMES: Record<string, { bg: string; color: string }> = {
  "Blues":      { bg: "linear-gradient(135deg, #0C1829 0%, #102240 100%)", color: "#4A90D9" },
  "R&B":        { bg: "linear-gradient(135deg, #1A0813 0%, #280E1E 100%)", color: "#E8608A" },
  "Soul":       { bg: "linear-gradient(135deg, #1A0C00 0%, #2A1500 100%)", color: "#E07840" },
  "Hip-Hop":    { bg: "linear-gradient(135deg, #0A0A0A 0%, #161616 100%)", color: "#C8C8C8" },
  "Rock":       { bg: "linear-gradient(135deg, #140000 0%, #220808 100%)", color: "#CC3333" },
  "Country":    { bg: "linear-gradient(135deg, #141000 0%, #221A00 100%)", color: "#C89820" },
  "Jazz":       { bg: "linear-gradient(135deg, #080D1C 0%, #0E1830 100%)", color: "#8878CC" },
  "Gospel":     { bg: "linear-gradient(135deg, #141000 0%, #201800 100%)", color: "#D4A820" },
  "Pop":        { bg: "linear-gradient(135deg, #130018 0%, #1E0026 100%)", color: "#C860C8" },
  "Folk":       { bg: "linear-gradient(135deg, #0A1005 0%, #121A08 100%)", color: "#72A04A" },
  "Electronic": { bg: "linear-gradient(135deg, #001418 0%, #002028 100%)", color: "#00B898" },
  "Metal":      { bg: "linear-gradient(135deg, #060606 0%, #101010 100%)", color: "#707070" },
  "Comedy":     { bg: "linear-gradient(135deg, #141000 0%, #1E1800 100%)", color: "#D4C000" },
  "Other":      { bg: "linear-gradient(135deg, #111111 0%, #1A1A1A 100%)", color: "#E8608A" },
};

const FALLBACK_THEMES = Object.values(GENRE_THEMES);

function getEventTheme(genre: string | null | undefined, title: string) {
  if (genre && GENRE_THEMES[genre]) return GENRE_THEMES[genre];
  const hash = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return FALLBACK_THEMES[hash % FALLBACK_THEMES.length];
}

export default function EventCard({ event, compact = false }: Props) {
  const date = new Date(event.date);
  const dayOfWeek = format(date, "EEE").toUpperCase();
  const dayNum = format(date, "d");
  const month = format(date, "MMM").toUpperCase();
  const time = format(date, "h:mm a");

  if (compact) {
    return (
      <a
        href={event.ticketUrl ?? "#"}
        target={event.ticketUrl ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#1A1A1A] transition-colors group"
      >
        <div className="text-center min-w-[36px]">
          <div className="text-[10px] text-[#E8608A] font-semibold tracking-wider">
            {month}
          </div>
          <div className="text-lg font-bold text-[#F0F0F0] leading-none">
            {dayNum}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#F0F0F0] truncate group-hover:text-[#E8608A] transition-colors">
            {event.title}
          </p>
          <p className="text-xs text-[#666666] truncate">{event.venue.name}</p>
        </div>
        {event.price && (
          <span className="text-xs text-[#E8608A] shrink-0">{event.price}</span>
        )}
      </a>
    );
  }

  const theme = getEventTheme(event.genre, event.title);

  return (
    <article className="group relative bg-[#181818] rounded-2xl overflow-hidden border border-[#2A2A2A] hover:border-[#E8608A]/30 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-300">
      {/* Image / date block */}
      <div className="relative h-40 overflow-hidden">
        {event.imageUrl ? (
          <>
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent" />
          </>
        ) : (
          <div
            className="w-full h-full flex items-end p-3 relative overflow-hidden"
            style={{ background: theme.bg }}
          >
            <span
              className="text-3xl leading-none tracking-wide line-clamp-2 relative z-10 opacity-90"
              style={{ fontFamily: "var(--font-bebas)", color: theme.color }}
            >
              {event.title}
            </span>
          </div>
        )}

        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-sm border border-[#2A2A2A] rounded-xl px-2 py-1 text-center">
          <div className="text-[9px] text-[#E8608A] font-bold tracking-widest">
            {dayOfWeek}
          </div>
          <div
            className="text-lg text-[#F0F0F0] leading-none"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {month} {dayNum}
          </div>
        </div>

        {/* Genre pill */}
        {event.genre && (
          <div className="absolute top-3 right-3 bg-[#111111]/70 border border-[#2A2A2A] text-[#999999] text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
            {event.genre}
          </div>
        )}

        {/* Pop-up pill */}
        {event.isPopUp && (
          <div className="absolute bottom-3 right-3 bg-[#E8608A]/15 border border-[#E8608A]/35 text-[#E8608A] text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
            Pop-up
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[#F0F0F0] text-[15px] leading-snug mb-2.5 group-hover:text-[#E8608A] transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#666666]">
            <MapPin className="w-3 h-3 shrink-0 text-[#E8608A]" />
            <span className="truncate">
              {event.venue.name} — {event.venue.city}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#666666]">
            <Clock className="w-3 h-3 shrink-0 text-[#E8608A]" />
            <span>{time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {event.price ? (
            <span className="text-sm font-semibold text-[#F0F0F0]">
              {event.price}
            </span>
          ) : (
            <span />
          )}

          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] bg-[#E8608A] hover:bg-[#F07095] px-3.5 py-1.5 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Ticket className="w-3 h-3" />
              Tickets
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
