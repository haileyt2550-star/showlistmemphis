import { NextRequest } from "next/server";
import { getDB } from "@/lib/db-cf";

export const runtime = "edge";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; genres?: string[] };
    const email = (body.email ?? "").trim().toLowerCase();
    const genres = body.genres ? body.genres.join(",") : null;

    if (!emailRe.test(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    let env: { DB?: any } | undefined;
    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      env = getRequestContext().env as any;
    } catch {
      // local dev
    }

    const db = getDB(env);

    await db.emailSubscriber.upsert({
      where: { email },
      create: { email, genres, active: true },
      update: { genres, active: true },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[API/subscribe]", err);
    return Response.json({ error: "Subscription failed" }, { status: 500 });
  }
}
