"use client";

import { Wand2, Sparkles, PenLine, FileText, Eye, Pencil, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AITone, Blog, BlogInput } from "@/lib/types";

import { allCategories } from "./category-style";

type AIAction = "generate" | "rewrite" | "improve" | "summarize";

type BlogFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: Blog | null;
  prefill?: Partial<BlogInput> | null;
  autoAction?: AIAction | null;
  onSaved: (blog: Blog) => void;
};

const TONES: AITone[] = [
  "professional",
  "casual",
  "enthusiastic",
  "informative",
  "storytelling",
];

const EMPTY = {
  title: "",
  content: "",
  excerpt: "",
  tags: "",
  category: "General",
  author: "Editor",
  coverImage: "",
  source: "user" as const,
  sourceUrl: "",
  published: true,
};

export function BlogFormDialog({
  open,
  onOpenChange,
  blog,
  prefill,
  autoAction,
  onSaved,
}: BlogFormDialogProps) {
  const isEdit = Boolean(blog?.id);
  const [form, setForm] = useState<BlogInput>(EMPTY);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<AIAction | null>(null);

  // Generate-from-topic inline panel
  const [showGenerate, setShowGenerate] = useState(false);
  const [topic, setTopic] = useState("");
  const [genTone, setGenTone] = useState<AITone>("informative");

  // Rewrite tone
  const [rewriteTone, setRewriteTone] = useState<AITone>("professional");

  useEffect(() => {
    if (!open) return;
    if (blog) {
      setForm({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        tags: blog.tags,
        category: blog.category,
        author: blog.author,
        coverImage: blog.coverImage,
        source: blog.source,
        sourceUrl: blog.sourceUrl,
        published: blog.published,
      });
    } else if (prefill) {
      setForm({
        ...EMPTY,
        ...prefill,
        source: prefill.source ?? "user",
        published: true,
      });
    } else {
      setForm(EMPTY);
    }
    setPreview(false);
    setShowGenerate(false);
    setTopic("");
  }, [open, blog, prefill]);

  // Auto-trigger rewrite action when opened via "Rewrite with AI".
  // Inline the API call to avoid stale closure on `form.content` (form is
  // synced by the effect above on the same render pass).
  useEffect(() => {
    if (!open || autoAction !== "rewrite" || !blog?.content) return;
    let cancelled = false;
    const text = blog.content;
    setAiLoading("rewrite");
    fetch("/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tone: "professional" }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "AI request failed");
        if (!cancelled) {
          setForm((prev) => ({ ...prev, content: data.content as string }));
          toast.success("Content rewritten with AI", {
            description: "Review and edit before saving.",
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "AI request failed");
        }
      })
      .finally(() => {
        if (!cancelled) setAiLoading(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, autoAction, blog]);

  function update<K extends keyof BlogInput>(key: K, value: BlogInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function callAI<T>(
    action: AIAction,
    url: string,
    body: Record<string, unknown>,
  ): Promise<T | null> {
    setAiLoading(action);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "AI request failed");
      }
      return data as T;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "AI request failed";
      toast.error(message);
      return null;
    } finally {
      setAiLoading(null);
    }
  }

  async function runGenerate() {
    if (!topic.trim()) {
      toast.error("Please enter a topic first");
      return;
    }
    const data = await callAI<{
      title: string;
      content: string;
      excerpt: string;
      tags: string;
    }>("generate", "/api/ai/generate", { topic: topic.trim(), tone: genTone });
    if (!data) return;
    setForm((prev) => ({
      ...prev,
      title: data.title || prev.title,
      content: data.content || prev.content,
      excerpt: data.excerpt || prev.excerpt,
      tags: data.tags || prev.tags,
    }));
    toast.success("AI draft generated", {
      description: "Review and edit before saving.",
    });
    setShowGenerate(false);
  }

  async function runRewrite(overrideText?: string) {
    const text = overrideText ?? form.content;
    if (!text.trim()) {
      toast.error("Add some content to rewrite first");
      return;
    }
    const data = await callAI<{ content: string }>("rewrite", "/api/ai/rewrite", {
      text,
      tone: rewriteTone,
    });
    if (!data) return;
    update("content", data.content);
    toast.success("Content rewritten", {
      description: `Tone: ${rewriteTone}`,
    });
  }

  async function runImprove() {
    if (!form.content.trim()) {
      toast.error("Add some content to improve first");
      return;
    }
    const data = await callAI<{ content: string }>("improve", "/api/ai/improve", {
      text: form.content,
    });
    if (!data) return;
    update("content", data.content);
    toast.success("Content improved");
  }

  async function runSummarize() {
    if (!form.content.trim()) {
      toast.error("Add some content to summarize first");
      return;
    }
    const data = await callAI<{ excerpt: string }>(
      "summarize",
      "/api/ai/summarize",
      { text: form.content },
    );
    if (!data) return;
    update("excerpt", data.excerpt);
    toast.success("Excerpt generated from content");
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload: BlogInput = {
        title: form.title.trim(),
        content: form.content,
        excerpt: form.excerpt,
        tags: form.tags,
        category: form.category,
        author: form.author,
        coverImage: form.coverImage,
        source: form.source,
        sourceUrl: form.sourceUrl,
        published: form.published,
      };
      const url = isEdit ? `/api/blogs/${blog!.id}` : "/api/blogs";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Save failed");
      }
      toast.success(isEdit ? "Blog updated" : "Blog created", {
        description: form.title,
      });
      onSaved(data.blog as Blog);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="amber-scroll max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
              <Pencil className="size-4" />
            </span>
            {isEdit ? "Edit blog" : "New blog"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your blog. Use the AI tools to rewrite or improve."
              : "Draft a new blog post. The AI co-writer can generate, rewrite, and summarize for you."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="bf-title">Title</Label>
            <Input
              id="bf-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="A snappy headline"
            />
          </div>

          {/* Category + Author */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => update("category", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories().map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bf-author">Author</Label>
              <Input
                id="bf-author"
                value={form.author}
                onChange={(e) => update("author", e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Tags + Cover */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bf-tags">Tags (comma separated)</Label>
              <Input
                id="bf-tags"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="ai, llm, future"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bf-cover">Cover image URL (optional)</Label>
              <Input
                id="bf-cover"
                value={form.coverImage}
                onChange={(e) => update("coverImage", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* AI Toolbar */}
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 dark:border-amber-500/15 dark:bg-amber-500/5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              <Sparkles className="size-3.5" />
              AI co-writer
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowGenerate((s) => !s)}
                disabled={aiLoading !== null}
                className="bg-background"
              >
                {aiLoading === "generate" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Generate from topic
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={runRewrite}
                disabled={aiLoading !== null}
                className="bg-background"
              >
                {aiLoading === "rewrite" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wand2 className="size-4" />
                )}
                Rewrite
              </Button>
              <Select
                value={rewriteTone}
                onValueChange={(v) => setRewriteTone(v as AITone)}
              >
                <SelectTrigger size="sm" className="h-8 w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={runImprove}
                disabled={aiLoading !== null}
                className="bg-background"
              >
                {aiLoading === "improve" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PenLine className="size-4" />
                )}
                Improve
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={runSummarize}
                disabled={aiLoading !== null}
                className="bg-background"
              >
                {aiLoading === "summarize" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                Summarize → excerpt
              </Button>
            </div>

            {/* Generate panel */}
            {showGenerate && (
              <div className="mt-3 space-y-2 rounded-lg border border-amber-200/70 bg-background p-3 dark:border-amber-500/15">
                <Label htmlFor="bf-topic">Topic</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="bf-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. The future of multimodal AI assistants"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void runGenerate();
                      }
                    }}
                  />
                  <Select
                    value={genTone}
                    onValueChange={(v) => setGenTone(v as AITone)}
                  >
                    <SelectTrigger size="sm" className="h-9 sm:w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    onClick={runGenerate}
                    disabled={aiLoading !== null}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generates a title, markdown content, excerpt, and tags.
                </p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="bf-content">Content (Markdown)</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setPreview((p) => !p)}
                className="h-7"
              >
                {preview ? (
                  <>
                    <Pencil className="size-3.5" /> Edit
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5" /> Preview
                  </>
                )}
              </Button>
            </div>
            {preview ? (
              <div
                className={cn(
                  "amber-prose amber-scroll min-h-[200px] max-h-[50vh] overflow-y-auto rounded-md border border-amber-200/70 bg-card p-4 text-sm dark:border-amber-500/15",
                )}
              >
                {form.content ? (
                  <ReactMarkdown>{form.content}</ReactMarkdown>
                ) : (
                  <span className="text-muted-foreground italic">
                    Nothing to preview yet.
                  </span>
                )}
              </div>
            ) : (
              <Textarea
                id="bf-content"
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                placeholder={"## Heading\n\nWrite your story in markdown..."}
                className="amber-scroll min-h-[220px] max-h-[55vh] resize-y font-mono text-sm"
              />
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <Label htmlFor="bf-excerpt">Excerpt</Label>
            <Textarea
              id="bf-excerpt"
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="A one or two sentence summary (or use Summarize → excerpt)."
              className="min-h-[80px] resize-y text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create blog"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
