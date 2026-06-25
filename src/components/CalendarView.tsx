"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import type { EventWithVenue } from "@/types";

interface Props {
  events: EventWithVenue[];
  onDayClick?: (date: Date, events: EventWithVenue[]) => void;
}

export default function CalendarView({ events, onDayClick }: Props) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const eventsByDay = new Map<string, EventWithVenue[]>();
  for (const ev of events) {
    const key = format(new Date(ev.date), "yyyy-MM-dd");
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(ev);
  }

  function handleDayClick(day: Date) {
    setSelected(day);
    const key = format(day, "yyyy-MM-dd");
    const dayEvents = eventsByDay.get(key) ?? [];
    onDayClick?.(day, dayEvents);
  }

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedEvents = selectedKey ? (eventsByDay.get(selectedKey) ?? []) : [];

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          className="p-2 text-[#7268A0] hover:text-[#F2ECE0] hover:bg-[#1B1838] rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2
          className="text-2xl tracking-widest text-[#F2ECE0]"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          {format(viewMonth, "MMMM yyyy").toUpperCase()}
        </h2>
        <button
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="p-2 text-[#7268A0] hover:text-[#F2ECE0] hover:bg-[#1B1838] rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold tracking-widest text-[#4A4570] mb-1">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px bg-[#272348] rounded-2xl overflow-hidden border border-[#272348]">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, viewMonth);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const today = isToday(day);

          return (
            <button
              key={key}
              onClick={() => handleDayClick(day)}
              className={clsx(
                "relative min-h-[80px] p-2 text-left transition-colors",
                !inMonth
                  ? "bg-[#0B0917] text-[#2E2848]"
                  : isSelected
                  ? "bg-[#E8608A]/12 text-[#F2ECE0]"
                  : "bg-[#13112A] text-[#F2ECE0] hover:bg-[#1B1838]"
              )}
            >
              <span
                className={clsx(
                  "inline-flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full mb-1",
                  today && !isSelected
                    ? "bg-[#E8608A] text-[#0B0917]"
                    : isSelected
                    ? "bg-[#E8608A] text-[#0B0917]"
                    : ""
                )}
              >
                {format(day, "d")}
              </span>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className={clsx(
                      "text-[10px] truncate px-1.5 py-0.5 rounded-full leading-tight font-medium",
                      ev.isPopUp
                        ? "bg-[#A48BF0]/15 text-[#A48BF0]"
                        : "bg-[#E8608A]/12 text-[#E8608A]"
                    )}
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-[#7268A0] px-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selected && selectedEvents.length > 0 && (
        <div className="mt-4 border border-[#272348] rounded-2xl bg-[#13112A] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#272348]">
            <h3
              className="text-lg tracking-wider text-[#E8608A]"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              {format(selected, "EEEE, MMMM d").toUpperCase()}
            </h3>
          </div>
          <div className="divide-y divide-[#1B1838]">
            {selectedEvents.map((ev) => (
              <a
                key={ev.id}
                href={ev.ticketUrl ?? "#"}
                target={ev.ticketUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-4 py-3 hover:bg-[#1B1838] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F2ECE0] truncate group-hover:text-[#E8608A] transition-colors">
                    {ev.title}
                  </p>
                  <p className="text-xs text-[#7268A0]">
                    {ev.venue.name} · {format(new Date(ev.date), "h:mm a")}
                  </p>
                </div>
                {ev.price && (
                  <span className="text-xs text-[#A48BF0] shrink-0">{ev.price}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {selected && selectedEvents.length === 0 && (
        <div className="text-center py-8 text-[#4A4570] text-sm">
          No shows listed for {format(selected, "MMMM d")}.
        </div>
      )}
    </div>
  );
}
