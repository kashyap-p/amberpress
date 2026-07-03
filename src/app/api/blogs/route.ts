import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { BlogInput } from "@/lib/types";

// GET /api/blogs — list blogs with optional filters: q, category, source.
// Returns { blogs: Blog[] } sorted by createdAt DESC.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const source = searchParams.get("source")?.trim() || "";

    // Build dynamic where clause. SQLite (Prisma) does not support `mode: insensitive`,
    // so we rely on default contains. We filter broadly across multiple text fields.
    const where: Prisma.BlogWhereInput = {};

    if (category) {
      where.category = category;
    }
    if (source) {
      where.source = source;
    }
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
        { excerpt: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    const blogs = await db.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ blogs });
  } catch (err) {
    console.error("[GET /api/blogs] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST /api/blogs — create a new blog. Body: BlogInput (title required).
// Returns { blog: Blog } with 201.
export async function POST(req: Request) {
  try {
    let body: BlogInput;
    try {
      body = (await req.json()) as BlogInput;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "Field 'title' is required" },
        { status: 400 }
      );
    }

    const created = await db.blog.create({
      data: {
        title: body.title.trim(),
        content: body.content ?? "",
        excerpt: body.excerpt ?? "",
        tags: body.tags ?? "",
        category: body.category ?? "General",
        coverImage: body.coverImage ?? "",
        author: body.author ?? "Editor",
        published: body.published ?? true,
        source: body.source ?? "user",
        sourceUrl: body.sourceUrl ?? "",
      },
    });

    return NextResponse.json({ blog: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/blogs] error:", err);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
