import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

interface BlogUpdateInput {
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string;
  category?: string;
  coverImage?: string;
  author?: string;
  published?: boolean;
  source?: "user" | "news";
  sourceUrl?: string;
}

// GET /api/blogs/[id] — return a single blog.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const blog = await db.blog.findUnique({ where: { id } });
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ blog });
  } catch (err) {
    console.error("[GET /api/blogs/[id]] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] — update any subset of blog fields (except id/timestamps).
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    let body: BlogUpdateInput;
    try {
      body = (await req.json()) as BlogUpdateInput;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Ensure the blog exists first (so we can return a proper 404).
    const existing = await db.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    // Whitelist updatable fields only — ignore id / createdAt / updatedAt / unknown keys.
    const data: Prisma.BlogUpdateInput = {};
    const allowed: (keyof BlogUpdateInput)[] = [
      "title",
      "content",
      "excerpt",
      "tags",
      "category",
      "coverImage",
      "author",
      "published",
      "source",
      "sourceUrl",
    ];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 }
      );
    }

    const updated = await db.blog.update({ where: { id }, data });
    return NextResponse.json({ blog: updated });
  } catch (err) {
    console.error("[PUT /api/blogs/[id]] error:", err);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] — delete a blog. Returns { success: true }.
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    const existing = await db.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    await db.blog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/blogs/[id]] error:", err);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
