import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#2A2A40] bg-[#0D0D18] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p
            className="text-2xl tracking-widest text-[#EDE9E0]"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            SHOWLIST
            <span className="text-[#C9A84C] ml-2">MEMPHIS</span>
          </p>
          <p className="text-xs text-[#6B6880] mt-1">
            Every show in Memphis and the Mid-South, one place.
          </p>
        </div>

        <div className="flex flex-col gap-1 text-xs text-[#6B6880]">
          <Link href="/" className="hover:text-[#C9A84C] transition-colors">
            Shows
          </Link>
          <Link href="/calendar" className="hover:text-[#C9A84C] transition-colors">
            Calendar
          </Link>
          <Link href="/map" className="hover:text-[#C9A84C] transition-colors">
            Map
          </Link>
          <Link href="/venues" className="hover:text-[#C9A84C] transition-colors">
            Venues
          </Link>
        </div>

        <p className="text-xs text-[#4A4858]">
          © {new Date().getFullYear()} ShowList Memphis
        </p>
      </div>
    </footer>
  );
}
