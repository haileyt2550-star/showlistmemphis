"use client";

import { format } from "date-fns";
import { MapPin, Clock, Ticket } from "lucide-react";
import type { EventWithVenue } from "@/types";

interface Props {
  event: EventWithVenue;
  compact?: boolean;
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
        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#1C1C2E] transition-colors group"
      >
        <div className="text-center min-w-[36px]">
          <div className="text-[10px] text-[#C9A84C] font-semibold tracking-wider">
            {month}
          </div>
          <div className="text-lg font-bold text-[#EDE9E0] leading-none">
            {dayNum}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#EDE9E0] truncate group-hover:text-[#C9A84C] transition-colors">
            {event.title}
          </p>
          <p className="text-xs text-[#6B6880] truncate">{event.venue.name}</p>
        </div>
        {event.price && (
          <span className="text-xs text-[#C9A84C] shrink-0">{event.price}</span>
        )}
      </a>
    );
  }

  return (
    <article className="group relative bg-[#141420] border border-[#2A2A40] rounded-lg overflow-hidden hover:border-[#C9A84C]/50 transition-all duration-200 hover:shadow-[0_0_20px_#C9A84C15]">
      {/* Image or date block */}
      <div className="relative h-40 bg-[#1C1C2E] overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span
              className="text-5xl text-[#C9A84C] leading-none"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              {dayNum}
            </span>
            <span
              className="text-xl text-[#6B6880] tracking-widest"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              {month}
            </span>
          </div>
        )}

        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-[#0D0D18]/80 backdrop-blur-sm border border-[#2A2A40] rounded px-2 py-1 text-center">
          <div className="text-[10px] text-[#C9A84C] font-bold tracking-widest">
            {dayOfWeek}
          </div>
          <div
            className="text-xl text-[#EDE9E0] leading-none"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {month} {dayNum}
          </div>
        </div>

        {/* Genre tag */}
        {event.genre && (
          <div className="absolute top-3 right-3 bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
            {event.genre}
          </div>
        )}

        {/* Pop-up tag */}
        {event.isPopUp && (
          <div className="absolute bottom-3 right-3 bg-[#4A9EE8]/20 border border-[#4A9EE8]/40 text-[#4A9EE8] text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
            Pop-up
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[#EDE9E0] text-base leading-snug mb-2 group-hover:text-[#C9A84C] transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8B8680]">
            <MapPin className="w-3 h-3 shrink-0 text-[#C9A84C]" />
            <span className="truncate">
              {event.venue.name} — {event.venue.city}, {event.venue.state}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#8B8680]">
            <Clock className="w-3 h-3 shrink-0 text-[#C9A84C]" />
            <span>{time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {event.price ? (
            <span className="text-sm font-semibold text-[#EDE9E0]">
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
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0D0D18] bg-[#C9A84C] hover:bg-[#DDB85C] px-3 py-1.5 rounded transition-colors"
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
