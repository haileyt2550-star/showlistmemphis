import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#2A2A2A] bg-[#111111] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p
            className="text-2xl tracking-widest text-[#F0F0F0]"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            SHOWLIST
            <span className="text-[#E8608A] ml-2">MEMPHIS</span>
          </p>
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-[#666666]">
          <Link href="/" className="hover:text-[#E8608A] transition-colors">Shows</Link>
          <Link href="/calendar" className="hover:text-[#E8608A] transition-colors">Calendar</Link>
          <Link href="/map" className="hover:text-[#E8608A] transition-colors">Map</Link>
          <Link href="/venues" className="hover:text-[#E8608A] transition-colors">Venues</Link>
        </div>

        <p className="text-xs text-[#444444]">
          © {new Date().getFullYear()} ShowList Memphis
        </p>
      </div>
    </footer>
  );
}
