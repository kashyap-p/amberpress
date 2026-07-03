"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
  User,
  Wand2,
} from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Blog } from "@/lib/types";

import { getCategoryStyle, parseTags } from "./category-style";

type BlogCardProps = {
  blog: Blog;
  onOpen: (blog: Blog) => void;
  onEdit: (blog: Blog) => void;
  onRewrite: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
  index?: number;
};

export function BlogCard({
  blog,
  onOpen,
  onEdit,
  onRewrite,
  onDelete,
  index = 0,
}: BlogCardProps) {
  const [imgError, setImgError] = useState(false);
  const style = getCategoryStyle(blog.category);
  const tags = parseTags(blog.tags).slice(0, 4);
  const hasImage = Boolean(blog.coverImage) && !imgError;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-amber-200/70 bg-card shadow-sm transition-shadow",
        "hover:border-amber-300 hover:shadow-md",
        "dark:border-amber-500/10 dark:hover:border-amber-500/25",
      )}
      onClick={() => onOpen(blog)}
    >
      {/* Cover */}
      <div className="relative h-32 w-full overflow-hidden">
        {hasImage ? (
          <img
            src={blog.coverImage}
            alt=""
            onError={() => setImgError(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={cn(
              "size-full bg-gradient-to-br",
              style.gradient,
              "transition-transform duration-500 group-hover:scale-105",
            )}
            aria-hidden
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge
            className={cn(
              "border-transparent bg-white/90 font-medium text-amber-800 shadow-sm",
              "dark:bg-black/50 dark:text-amber-100",
            )}
          >
            <span aria-hidden>{style.icon}</span>
            {blog.category || "General"}
          </Badge>
          {blog.source === "news" && (
            <Badge
              variant="secondary"
              className="border-transparent bg-white/80 text-foreground/80 shadow-sm dark:bg-black/40 dark:text-amber-100"
            >
              Imported
            </Badge>
          )}
        </div>

        <div
          className="absolute right-2 top-2"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Actions for ${blog.title}`}
                className="size-8 bg-white/85 text-foreground shadow-sm hover:bg-white dark:bg-black/40 dark:hover:bg-black/60"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onSelect={() => onOpen(blog)}
                className="cursor-pointer"
              >
                <ExternalLink className="size-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onEdit(blog)}
                className="cursor-pointer"
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onRewrite(blog)}
                className="cursor-pointer text-amber-700 focus:text-amber-800 dark:text-amber-300"
              >
                <Wand2 className="size-4" />
                Rewrite with AI
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(blog)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {blog.excerpt}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
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

        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <User className="size-3.5 shrink-0 text-amber-600 dark:text-amber-300" />
            <span className="truncate">{blog.author || "Editor"}</span>
          </span>
          <span className="shrink-0">
            {formatDistanceToNow(new Date(blog.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
