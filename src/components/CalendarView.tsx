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
}

export default function CalendarView({ events }: Props) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today);
  const [selected, setSelected] = useState<Date>(today);

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

  const selectedKey = format(selected, "yyyy-MM-dd");
  const selectedEvents = eventsByDay.get(selectedKey) ?? [];

  return (
    <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
      {/* ── Calendar grid ── */}
      <div>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewMonth(subMonths(viewMonth, 1))}
            className="p-1.5 text-[#555555] hover:text-[#F0F0F0] hover:bg-[#1A1A1A] rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2
            className="text-xl tracking-widest text-[#F0F0F0]"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {format(viewMonth, "MMMM yyyy").toUpperCase()}
          </h2>
          <button
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="p-1.5 text-[#555555] hover:text-[#F0F0F0] hover:bg-[#1A1A1A] rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 text-center text-[10px] font-medium tracking-widest text-[#444444] mb-1">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-px bg-[#2A2A2A] rounded-xl overflow-hidden border border-[#2A2A2A]">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, viewMonth);
            const isSelected = isSameDay(day, selected);
            const todayDay = isToday(day);

            return (
              <button
                key={key}
                onClick={() => setSelected(day)}
                className={clsx(
                  "relative min-h-[72px] p-2 text-left transition-colors",
                  !inMonth
                    ? "bg-[#111111] text-[#333333]"
                    : isSelected
                    ? "bg-[#181818] text-[#F0F0F0]"
                    : "bg-[#151515] text-[#F0F0F0] hover:bg-[#1A1A1A]"
                )}
              >
                <span
                  className={clsx(
                    "inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full mb-1",
                    todayDay
                      ? "bg-[#E8608A] text-[#111111]"
                      : isSelected && !todayDay
                      ? "border border-[#E8608A] text-[#E8608A]"
                      : ""
                  )}
                >
                  {format(day, "d")}
                </span>

                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[9px] truncate px-1 py-0.5 rounded bg-[#E8608A]/10 text-[#E8608A] leading-tight"
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] text-[#555555] px-1">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Day detail panel ── */}
      <div className="mt-6 lg:mt-0 lg:sticky lg:top-20 lg:self-start">
        <div className="border border-[#2A2A2A] rounded-xl bg-[#181818] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2A2A2A]">
            <p className="text-[10px] text-[#555555] tracking-wide">
              {format(selected, "EEEE").toUpperCase()}
            </p>
            <h3
              className="text-2xl text-[#F0F0F0] leading-none tracking-wide"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              {format(selected, "MMMM d")}
            </h3>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[#444444]">No shows this day.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {selectedEvents.map((ev) => (
                <a
                  key={ev.id}
                  href={ev.ticketUrl ?? "#"}
                  target={ev.ticketUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F0F0F0] truncate group-hover:text-[#E8608A] transition-colors">
                      {ev.title}
                    </p>
                    <p className="text-xs text-[#555555] mt-0.5">
                      {ev.venue.name}
                    </p>
                    <p className="text-xs text-[#444444]">
                      {format(new Date(ev.date), "h:mm a")}
                    </p>
                  </div>
                  {ev.price && (
                    <span className="text-xs text-[#F0F0F0] shrink-0 pt-0.5">
                      {ev.price}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
