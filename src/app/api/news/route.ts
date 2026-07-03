import { NextResponse } from "next/server";
import { getZAI } from "@/lib/zai";
import type { NewsItem } from "@/lib/types";

interface RawNewsResult {
  url?: string;
  name?: string;
  snippet?: string;
  host_name?: string;
  rank?: number;
  date?: string;
  favicon?: string;
}

// GET /api/news
// Query params (optional):
//   - topic (default: "artificial intelligence technology news latest")
//   - num   (default: 12)
// Returns: { news: NewsItem[] }
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topic =
      searchParams.get("topic")?.trim() ||
      "artificial intelligence technology news latest";

    let num = 12;
    const numRaw = searchParams.get("num");
    if (numRaw) {
      const parsed = parseInt(numRaw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        num = Math.min(parsed, 50); // cap at 50 to avoid abuse
      }
    }

    const zai = await getZAI();
    const results = (await zai.functions.invoke("web_search", {
      query: topic,
      num,
    })) as RawNewsResult[];

    const news: NewsItem[] = Array.isArray(results)
      ? results.map((r) => ({
          title: r?.name ?? "",
          snippet: r?.snippet ?? "",
          url: r?.url ?? "",
          host_name: r?.host_name ?? "",
          date: r?.date ?? "",
          favicon: r?.favicon ?? "",
        }))
      : [];

    return NextResponse.json({ news });
  } catch (err) {
    console.error("[GET /api/news] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
