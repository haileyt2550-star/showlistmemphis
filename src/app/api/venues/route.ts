import { NextRequest } from "next/server";
import { getDB } from "@/lib/db-cf";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    let env: { DB?: any } | undefined;
    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      env = getRequestContext().env as any;
    } catch {
      // local dev
    }

    const db = getDB(env);

    const now = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);

    const venues = await db.venue.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            events: {
              where: { date: { gte: now, lte: threeMonths } },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return Response.json({ venues });
  } catch (err) {
    console.error("[API/venues]", err);
    return Response.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}
