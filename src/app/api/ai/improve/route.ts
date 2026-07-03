import { NextResponse } from "next/server";
import { getZAI } from "@/lib/zai";

// POST /api/ai/improve
// Body: { text: string }.
// Returns: { content: string } — grammar/style-improved text, roughly the same length.
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
            "You are a meticulous copy editor. You fix grammar, spelling, punctuation, clarity and style. You preserve the original meaning and keep the length roughly the same. You do not add new facts, opinions, or fabricated content. You return ONLY the improved text — no preface, no explanation, no markdown fences.",
        },
        {
          role: "user",
          content: `Improve the following text. Fix grammar, clarity and style while preserving the meaning and keeping the length roughly the same.\n\nText:\n"""\n${text}\n"""`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const content = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[POST /api/ai/improve] error:", err);
    return NextResponse.json(
      { error: "Failed to improve text" },
      { status: 500 }
    );
  }
}
