import { NextResponse } from "next/server";
import { getZAI } from "@/lib/zai";

// POST /api/ai/summarize
// Body: { text: string }.
// Returns: { excerpt: string } — a 1-2 sentence summary.
export async function POST(req: Request) {
  try {
    let body: { text?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const text = body?.text;
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Field 'text' is required" },
        { status: 400 }
      );
    }

    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert summarizer. You produce a concise 1-2 sentence summary that captures the core message of the user's text. You do not add new information. You return ONLY the summary sentence(s) — no preface, no labels, no quotes, no markdown.",
        },
        {
          role: "user",
          content: `Summarize the following text in 1-2 sentences.\n\nText:\n"""\n${text}\n"""`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const excerpt = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ excerpt });
  } catch (err) {
    console.error("[POST /api/ai/summarize] error:", err);
    return NextResponse.json(
      { error: "Failed to summarize text" },
      { status: 500 }
    );
  }
}
