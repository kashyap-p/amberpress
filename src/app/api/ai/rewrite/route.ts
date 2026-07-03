import { NextResponse } from "next/server";
import { getZAI } from "@/lib/zai";

// POST /api/ai/rewrite
// Body: { text: string, tone?: string } (tone default "professional").
// Returns: { content: string } — the rewritten text.
export async function POST(req: Request) {
  try {
    let body: { text?: string; tone?: string };
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

    const tone =
      typeof body.tone === "string" && body.tone.trim()
        ? body.tone.trim()
        : "professional";

    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert writing editor. You rewrite text to improve clarity and flow while preserving the original meaning. You adapt the tone of voice as requested by the user. You never add new facts, opinions, or hallucinate content. You return ONLY the rewritten text — no preface, no explanation, no markdown fences.",
        },
        {
          role: "user",
          content: `Rewrite the following text in a ${tone} tone. Keep the meaning intact and improve clarity and flow.\n\nText:\n"""\n${text}\n"""`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const content = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[POST /api/ai/rewrite] error:", err);
    return NextResponse.json(
      { error: "Failed to rewrite text" },
      { status: 500 }
    );
  }
}
