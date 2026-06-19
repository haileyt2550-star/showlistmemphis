import { NextRequest } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";

export const runtime = "edge";

const SECRET = process.env.SCRAPE_SECRET;

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (SECRET && auth !== `Bearer ${SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let env: { DB?: any } | undefined;
    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      env = getRequestContext().env as any;
    } catch {
      // local dev
    }

    const result = await runAllScrapers(env);
    return Response.json({ success: true, ...result });
  } catch (err) {
    console.error("[API/scrape]", err);
    return Response.json({ error: "Scrape failed" }, { status: 500 });
  }
}
