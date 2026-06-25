"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV = [
  { href: "/", label: "Shows" },
  { href: "/calendar", label: "Calendar" },
  { href: "/map", label: "Map" },
  { href: "/venues", label: "Venues" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#2A2A2A] bg-[#111111]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="group flex flex-col leading-none">
          <span
            className="text-[1.75rem] tracking-[0.12em] text-[#F0F0F0] group-hover:text-[#E8608A] transition-colors duration-200"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            SHOWLIST
          </span>
          <span
            className="text-[10px] tracking-[0.4em] text-[#E8608A] -mt-1 font-medium"
          >
            MEMPHIS
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-150",
                pathname === href
                  ? "text-[#E8608A] bg-[#E8608A]/10"
                  : "text-[#666666] hover:text-[#F0F0F0] hover:bg-[#222222]"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
