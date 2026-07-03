"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Providers } from "@/components/providers";
import { Header } from "@/components/blog/header";
import { Hero } from "@/components/blog/hero";
import { Footer } from "@/components/blog/footer";
import { EmptyState } from "@/components/blog/empty-state";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogReader } from "@/components/blog/blog-reader";
import { BlogFormDialog } from "@/components/blog/blog-form-dialog";
import { NewsCard } from "@/components/blog/news-card";
import { allCategories } from "@/components/blog/category-style";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Blog, BlogInput, NewsItem } from "@/lib/types";

export default function Home() {
  return (
    <Providers>
      <App />
    </Providers>
  );
}

type AIAction = "generate" | "rewrite" | "improve" | "summarize";

type FormState = {
  open: boolean;
  blog?: Blog | null;
  prefill?: Partial<BlogInput> | null;
  autoAction?: AIAction | null;
};

function App() {
  const qc = useQueryClient();

  // ---- Blog filters ----
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [source, setSource] = useState<string>("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // ---- Tab state ----
  const [tab, setTab] = useState<"blogs" | "news">("blogs");

  // ---- News ----
  const [newsTopic, setNewsTopic] = useState("");
  const [newsTopicDebounced, setNewsTopicDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setNewsTopicDebounced(newsTopic.trim()), 400);
    return () => clearTimeout(t);
  }, [newsTopic]);

  // ---- Dialogs ----
  const [formState, setFormState] = useState<FormState>({ open: false });
  const [readerBlog, setReaderBlog] = useState<Blog | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [deleteBlog, setDeleteBlog] = useState<Blog | null>(null);

  // ---- Queries ----
  const blogsQuery = useQuery({
    queryKey: ["blogs", debouncedQ, category, source],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQ) params.set("q", debouncedQ);
      if (category && category !== "all") params.set("category", category);
      if (source && source !== "all") params.set("source", source);
      const res = await fetch(`/api/blogs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load blogs");
      return data.blogs as Blog[];
    },
    placeholderData: (prev) => prev,
  });

  const newsQuery = useQuery({
    queryKey: ["news", newsTopicDebounced],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (newsTopicDebounced) params.set("topic", newsTopicDebounced);
      params.set("num", "12");
      const res = await fetch(`/api/news?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load news");
      return data.news as NewsItem[];
    },
    // Lazy: only fetch when the News tab is active. Avoids a 1-3s web search
    // on initial page load when the user just wants to read their blogs.
    enabled: tab === "news",
  });

  // ---- Mutations ----
  // NOTE: Create & edit are persisted by <BlogFormDialog> via its own fetch;
  // on completion it calls `handleSaved`, which refetches the blogs query.
  // Only delete goes through a page-level mutation (see confirmDelete).
  const deleteBlogMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      return data;
    },
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ["blogs"] });
    },
  });

  // ---- Handlers ----
  function openNewBlog() {
    setFormState({ open: true, blog: null, prefill: null, autoAction: null });
  }

  function openEdit(blog: Blog) {
    setFormState({ open: true, blog, prefill: null, autoAction: null });
  }

  function openRewrite(blog: Blog) {
    setFormState({ open: true, blog, prefill: null, autoAction: "rewrite" });
  }

  function openReader(blog: Blog) {
    setReaderBlog(blog);
    setReaderOpen(true);
  }

  function importNews(item: NewsItem) {
    const prefill: BlogInput = {
      title: item.title,
      content: item.snippet
        ? `> ${item.snippet}\n\n_[Imported from ${item.host_name}]_`
        : "",
      excerpt: item.snippet || "",
      tags: "AI, tech, news",
      category: "Technology",
      coverImage: "",
      author: "Editor",
      source: "news",
      sourceUrl: item.url,
      published: true,
    };
    setFormState({ open: true, blog: null, prefill, autoAction: null });
    setTab("blogs");
  }

  async function handleSaved(_blog: Blog) {
    // The BlogFormDialog persists via its own fetch; refresh the blogs
    // query so the grid reflects the newly created/updated blog instantly.
    await qc.refetchQueries({ queryKey: ["blogs"] });
  }

  async function confirmDelete() {
    if (!deleteBlog) return;
    try {
      await deleteBlogMut.mutateAsync(deleteBlog.id);
      toast.success("Blog deleted", { description: deleteBlog.title });
      setDeleteBlog(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const blogs = blogsQuery.data ?? [];
  const news = newsQuery.data ?? [];
  const blogsCount = blogs.length;
  const categoriesCount = useMemo(() => allCategories().length, []);

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header
        onNewBlog={openNewBlog}
        onGoToBlogs={() => setTab("blogs")}
        onGoToNews={() => setTab("news")}
      />

      <Hero blogsCount={blogsCount} categoriesCount={categoriesCount} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "blogs" | "news")}
          className="w-full"
        >
          <TabsList className="h-10 bg-amber-100/60 dark:bg-amber-500/10">
            <TabsTrigger value="blogs" className="gap-1.5">
              <Sparkles className="size-4" />
              My Blogs
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-1.5">
              <Newspaper className="size-4" />
              AI &amp; Tech News
            </TabsTrigger>
          </TabsList>

          {/* ---- Blogs tab ---- */}
          <TabsContent value="blogs" className="mt-6 space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title, content, or tags..."
                  className="pl-9"
                  aria-label="Search blogs"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9 w-[170px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {allCategories().map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="h-9 w-[140px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sources</SelectItem>
                    <SelectItem value="user">Mine</SelectItem>
                    <SelectItem value="news">Imported</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={openNewBlog}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">New Blog</span>
                </Button>
              </div>
            </div>

            {/* Grid */}
            {blogsQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : blogsQuery.isError ? (
              <EmptyState
                title="Couldn't load blogs"
                description="Something went wrong fetching your blogs. Please try again."
                actionLabel="Retry"
                onAction={() => blogsQuery.refetch()}
              />
            ) : blogs.length === 0 ? (
              <EmptyState
                title={
                  debouncedQ || category !== "all" || source !== "all"
                    ? "No matching blogs"
                    : "No blogs yet"
                }
                description={
                  debouncedQ || category !== "all" || source !== "all"
                    ? "Try adjusting your search or filters."
                    : "Start your first AI-assisted blog or import one from the news tab."
                }
                actionLabel="Write a new blog"
                onAction={openNewBlog}
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog, i) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    index={i}
                    onOpen={openReader}
                    onEdit={openEdit}
                    onRewrite={openRewrite}
                    onDelete={setDeleteBlog}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ---- News tab ---- */}
          <TabsContent value="news" className="mt-6 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={newsTopic}
                  onChange={(e) => setNewsTopic(e.target.value)}
                  placeholder="Topic (e.g. multimodal AI, semiconductor industry)"
                  className="pl-9"
                  aria-label="News topic"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => newsQuery.refetch()}
                disabled={newsQuery.isFetching}
                className="bg-background"
              >
                <RefreshCw
                  className={
                    newsQuery.isFetching
                      ? "size-4 animate-spin"
                      : "size-4"
                  }
                />
                Refresh
              </Button>
            </div>

            {newsQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            ) : newsQuery.isError ? (
              <EmptyState
                title="Couldn't load news"
                description="Something went wrong fetching the latest AI & tech news."
                actionLabel="Retry"
                onAction={() => newsQuery.refetch()}
              />
            ) : news.length === 0 ? (
              <EmptyState
                title="No news found"
                description="Try a different topic or refresh to get the latest stories."
              />
            ) : (
              <div className="amber-scroll max-h-[70vh] overflow-y-auto rounded-xl border border-amber-200/60 p-2 dark:border-amber-500/10">
                <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2">
                  {news.map((item, i) => (
                    <NewsCard
                      key={`${item.url}-${i}`}
                      item={item}
                      index={i}
                      onImport={importNews}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Dialogs */}
      <BlogFormDialog
        open={formState.open}
        onOpenChange={(o) => setFormState((s) => ({ ...s, open: o }))}
        blog={formState.blog}
        prefill={formState.prefill}
        autoAction={formState.autoAction}
        onSaved={handleSaved}
      />

      <BlogReader
        blog={readerBlog}
        open={readerOpen}
        onOpenChange={setReaderOpen}
        onEdit={(b) => {
          setReaderOpen(false);
          openEdit(b);
        }}
      />

      <AlertDialog
        open={Boolean(deleteBlog)}
        onOpenChange={(o) => !o && setDeleteBlog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-destructive/15 text-destructive">
                <Trash2 className="size-4" />
              </span>
              Delete this blog?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteBlog?.title
                ? `"${deleteBlog.title}" will be permanently deleted. This cannot be undone.`
                : "This blog will be permanently deleted. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBlogMut.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteBlogMut.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteBlogMut.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-amber-200/60 bg-card dark:border-amber-500/10">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function NewsCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-amber-200/60 bg-card p-4 dark:border-amber-500/10">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-36" />
      </div>
    </div>
  );
}
