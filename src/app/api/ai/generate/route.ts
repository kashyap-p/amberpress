import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// POST /api/ai/generate
// Body: { topic: string, tone?: string }.
// Returns: { title: string, content: string, excerpt: string, tags: string }
//   - content is Markdown
//   - tags is a comma-separated string of 2-5 tags
//   - excerpt is a 1-2 sentence summary
export async function POST(req: Request) {
  try {
    let body: { topic?: string; tone?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const topic = body?.topic;
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { error: "Field 'topic' is required" },
        { status: 400 }
      );
    }

    const tone =
      typeof body.tone === "string" && body.tone.trim()
        ? body.tone.trim()
        : "professional";

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert blog writer. You write full, well-structured blog posts in Markdown about the user's topic.\n\n" +
            "You MUST respond with a SINGLE valid JSON object and NOTHING else — no markdown code fences, no prose, no leading or trailing text. " +
            "The JSON object MUST have exactly these keys:\n" +
            '  - "title": a concise, engaging blog title (string, no quotes around it).\n' +
            '  - "content": the FULL blog post body as Markdown (string). Use headings, paragraphs, and lists as appropriate. Minimum 4 paragraphs.\n' +
            '  - "excerpt": a 1-2 sentence summary of the post (string).\n' +
            '  - "tags": a comma-separated string of 2 to 5 short tags (string, e.g. "AI,LLM,Writing").\n' +
            "All string values must be properly JSON-escaped (newlines inside content as \\n, quotes as \\\"). " +
            "Do NOT wrap the entire response in markdown fences.",
        },
        {
          role: "user",
          content: `Write a full blog post about the following topic in a ${tone} tone.\n\nTopic: ${topic}\n\nRespond with ONLY the JSON object described above.`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Strip markdown code fences if present (```json ... ``` or ``` ... ```).
    let jsonStr = raw.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    // Defensive: if there is any leading/trailing non-JSON prose, try to locate the outermost braces.
    if (!jsonStr.startsWith("{")) {
      const firstBrace = jsonStr.indexOf("{");
      const lastBrace = jsonStr.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }
    }

    let parsed: {
      title?: unknown;
      content?: unknown;
      excerpt?: unknown;
      tags?: unknown;
    };
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("[POST /api/ai/generate] JSON parse failed:", parseErr);
      console.error("[POST /api/ai/generate] raw LLM output was:\n", raw);
      return NextResponse.json(
        { error: "AI returned malformed JSON; please try again." },
        { status: 500 }
      );
    }

    const title =
      typeof parsed.title === "string" && parsed.title.trim()
        ? parsed.title.trim()
        : topic.trim();
    const content =
      typeof parsed.content === "string" && parsed.content.trim()
        ? parsed.content.trim()
        : "";
    const excerpt =
      typeof parsed.excerpt === "string" && parsed.excerpt.trim()
        ? parsed.excerpt.trim()
        : "";
    const tags =
      typeof parsed.tags === "string" && parsed.tags.trim()
        ? parsed.tags.trim()
        : "";

    if (!content) {
      // Graceful degradation: if the LLM produced no usable content, return a 500.
      return NextResponse.json(
        { error: "AI returned empty content; please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ title, content, excerpt, tags });
  } catch (err) {
    console.error("[POST /api/ai/generate] error:", err);
    return NextResponse.json(
      { error: "Failed to generate blog post" },
      { status: 500 }
    );
  }
}
