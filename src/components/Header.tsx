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
    <header className="border-b border-[#2A2A40] bg-[#0D0D18]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group">
          <span
            className="text-3xl tracking-widest text-[#EDE9E0] group-hover:text-[#C9A84C] transition-colors duration-200"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            SHOWLIST
          </span>
          <span
            className="text-xs tracking-[0.35em] text-[#C9A84C] -mt-1"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            MEMPHIS
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-3 py-1.5 text-sm font-medium rounded transition-all duration-150",
                pathname === href
                  ? "text-[#C9A84C] bg-[#C9A84C]/10"
                  : "text-[#8B8680] hover:text-[#EDE9E0] hover:bg-[#1C1C2E]"
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
