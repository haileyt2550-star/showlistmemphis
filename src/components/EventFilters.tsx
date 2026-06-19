"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { clsx } from "clsx";
import type { Genre } from "@/types";

const GENRES: Genre[] = [
  "Blues", "R&B", "Soul", "Hip-Hop", "Rock", "Country",
  "Jazz", "Gospel", "Pop", "Folk", "Electronic", "Metal", "Comedy", "Other",
];

const DATE_PRESETS = [
  { label: "Today", days: 0 },
  { label: "This Weekend", days: 3 },
  { label: "Next 7 Days", days: 7 },
  { label: "Next 30 Days", days: 30 },
  { label: "Next 3 Months", days: 90 },
];

export interface Filters {
  start: Date;
  end: Date;
  genre: Genre | null;
  popupOnly: boolean;
  q: string;
}

interface Props {
  onChange: (filters: Filters) => void;
}

export default function EventFilters({ onChange }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [start, setStart] = useState<Date>(today);
  const [end, setEnd] = useState<Date>(addDays(today, 30));
  const [genre, setGenre] = useState<Genre | null>(null);
  const [popupOnly, setPopupOnly] = useState(false);
  const [q, setQ] = useState("");
  const [activePreset, setActivePreset] = useState(3); // "Next 30 Days"
  const [showGenres, setShowGenres] = useState(false);

  function applyPreset(days: number, idx: number) {
    const newEnd = days === 0 ? addDays(today, 1) : addDays(today, days);
    setStart(today);
    setEnd(newEnd);
    setActivePreset(idx);
    emit(today, newEnd, genre, popupOnly, q);
  }

  function emit(
    s: Date,
    e: Date,
    g: Genre | null,
    popup: boolean,
    search: string
  ) {
    onChange({ start: s, end: e, genre: g, popupOnly: popup, q: search });
  }

  function handleGenre(g: Genre) {
    const next = genre === g ? null : g;
    setGenre(next);
    emit(start, end, next, popupOnly, q);
  }

  function handleSearch(val: string) {
    setQ(val);
    emit(start, end, genre, popupOnly, val);
  }

  function handlePopup(val: boolean) {
    setPopupOnly(val);
    emit(start, end, genre, val, q);
  }

  function clearAll() {
    setGenre(null);
    setPopupOnly(false);
    setQ("");
    setActivePreset(3);
    const newEnd = addDays(today, 30);
    setStart(today);
    setEnd(newEnd);
    emit(today, newEnd, null, false, "");
  }

  const hasFilters = genre || popupOnly || q;

  return (
    <div className="space-y-3">
      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6880]" />
          <input
            type="text"
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search artists, venues…"
            className="w-full pl-9 pr-3 py-2.5 bg-[#141420] border border-[#2A2A40] rounded-lg text-sm text-[#EDE9E0] placeholder-[#4A4858] focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
          {q && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6880] hover:text-[#EDE9E0]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowGenres(!showGenres)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm transition-colors",
            showGenres || genre
              ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10"
              : "border-[#2A2A40] text-[#8B8680] hover:border-[#C9A84C]/50 hover:text-[#EDE9E0] bg-[#141420]"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {genre ?? "Genre"}
        </button>

        <button
          onClick={() => handlePopup(!popupOnly)}
          className={clsx(
            "px-3 py-2.5 border rounded-lg text-sm transition-colors",
            popupOnly
              ? "border-[#4A9EE8] text-[#4A9EE8] bg-[#4A9EE8]/10"
              : "border-[#2A2A40] text-[#8B8680] hover:border-[#4A9EE8]/50 hover:text-[#EDE9E0] bg-[#141420]"
          )}
        >
          Pop-ups
        </button>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-2.5 text-xs text-[#6B6880] hover:text-[#EDE9E0] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Date presets */}
      <div className="flex gap-2 flex-wrap">
        {DATE_PRESETS.map(({ label, days }, idx) => (
          <button
            key={label}
            onClick={() => applyPreset(days, idx)}
            className={clsx(
              "px-3 py-1.5 text-xs rounded-full border transition-colors",
              activePreset === idx
                ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10"
                : "border-[#2A2A40] text-[#6B6880] hover:border-[#C9A84C]/50 hover:text-[#EDE9E0]"
            )}
          >
            {label}
          </button>
        ))}

        {/* Custom date range */}
        <div className="flex items-center gap-1.5 ml-auto text-xs text-[#6B6880]">
          <input
            type="date"
            value={format(start, "yyyy-MM-dd")}
            onChange={(e) => {
              const d = new Date(e.target.value + "T00:00:00");
              setStart(d);
              setActivePreset(-1);
              emit(d, end, genre, popupOnly, q);
            }}
            className="bg-[#141420] border border-[#2A2A40] rounded px-2 py-1 text-xs text-[#EDE9E0] focus:outline-none focus:border-[#C9A84C]"
          />
          <span>–</span>
          <input
            type="date"
            value={format(end, "yyyy-MM-dd")}
            onChange={(e) => {
              const d = new Date(e.target.value + "T23:59:59");
              setEnd(d);
              setActivePreset(-1);
              emit(start, d, genre, popupOnly, q);
            }}
            className="bg-[#141420] border border-[#2A2A40] rounded px-2 py-1 text-xs text-[#EDE9E0] focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
      </div>

      {/* Genre pills */}
      {showGenres && (
        <div className="flex flex-wrap gap-2 pt-1">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => handleGenre(g)}
              className={clsx(
                "px-3 py-1 text-xs rounded-full border transition-colors",
                genre === g
                  ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10"
                  : "border-[#2A2A40] text-[#6B6880] hover:text-[#EDE9E0] hover:border-[#2A2A40]"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
