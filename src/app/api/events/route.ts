import { NextRequest } from "next/server";
import { getDB } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const startDate = searchParams.get("start")
    ? new Date(searchParams.get("start")!)
    : new Date();

  const endDate = searchParams.get("end")
    ? new Date(searchParams.get("end")!)
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d;
      })();

  const genre = searchParams.get("genre");
  const venueSlug = searchParams.get("venue");
  const isPopUp = searchParams.get("popup");
  const q = searchParams.get("q");

  try {
    let env: { DB?: any } | undefined;
    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      env = getRequestContext().env as any;
    } catch {
      // local dev — no CF context
    }

    const db = getDB(env);

    const events = await db.event.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(genre ? { genre: { contains: genre } } : {}),
        ...(isPopUp === "true" ? { isPopUp: true } : {}),
        ...(venueSlug ? { venue: { slug: venueSlug } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { artist: { contains: q } },
                { venue: { name: { contains: q } } },
              ],
            }
          : {}),
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
            state: true,
            lat: true,
            lng: true,
            website: true,
          },
        },
      },
      orderBy: { date: "asc" },
      take: 500,
    });

    return Response.json({ events, count: events.length });
  } catch (err) {
    console.error("[API/events]", err);
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
