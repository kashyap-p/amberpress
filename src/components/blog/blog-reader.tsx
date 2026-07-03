"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  ExternalLink,
  Globe,
  Tag,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Blog } from "@/lib/types";
import ReactMarkdown from "react-markdown";

import { getCategoryStyle, parseTags } from "./category-style";

type BlogReaderProps = {
  blog: Blog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (blog: Blog) => void;
};

export function BlogReader({
  blog,
  open,
  onOpenChange,
  onEdit,
}: BlogReaderProps) {
  const style = blog ? getCategoryStyle(blog.category) : null;
  const tags = blog ? parseTags(blog.tags) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="amber-scroll max-h-[88vh] overflow-y-auto sm:max-w-3xl"
        showCloseButton
      >
        {blog && style && (
          <>
            <div className="relative -mx-6 -mt-6 mb-2 h-36 w-[calc(100%+3rem)] overflow-hidden sm:h-44">
              {blog.coverImage ? (
                <img
                  src={blog.coverImage}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className={cn("size-full bg-gradient-to-br", style.gradient)}
                />
              )}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent"
              />
            </div>

            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <span aria-hidden>{style.icon}</span>
                  {blog.category || "General"}
                </Badge>
                {blog.source === "news" && (
                  <Badge variant="secondary">Imported from news</Badge>
                )}
              </div>
              <DialogTitle className="text-balance text-2xl font-bold leading-tight sm:text-3xl">
                {blog.title}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5 text-amber-600 dark:text-amber-300" />
                {blog.author || "Editor"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-amber-600 dark:text-amber-300" />
                {formatDistanceToNow(new Date(blog.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {blog.sourceUrl && (
                <a
                  href={blog.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-700 hover:underline dark:text-amber-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="size-3.5" />
                  Source
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="size-3.5 text-amber-600 dark:text-amber-300" />
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-amber-200/80 bg-amber-50/60 text-amber-800 dark:border-amber-500/15 dark:bg-amber-500/10 dark:text-amber-200"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="border-t border-amber-200/60 pt-4 dark:border-amber-500/10">
              {blog.excerpt && (
                <p className="mb-4 text-sm italic text-muted-foreground">
                  {blog.excerpt}
                </p>
              )}
              <div className="amber-prose text-foreground">
                <ReactMarkdown>
                  {blog.content || "_No content yet._"}
                </ReactMarkdown>
              </div>
            </div>

            {onEdit && (
              <div className="flex justify-end gap-2 border-t border-amber-200/60 pt-4 dark:border-amber-500/10">
                <button
                  type="button"
                  onClick={() => onEdit(blog)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-amber-600 hover:to-orange-600"
                >
                  Edit this blog
                </button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
