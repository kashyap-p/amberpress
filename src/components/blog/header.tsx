"use client";

import { Feather, Plus } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  onNewBlog: () => void;
  onGoToBlogs: () => void;
  onGoToNews: () => void;
};

export function Header({ onNewBlog, onGoToBlogs, onGoToNews }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-200/60 bg-background/80 backdrop-blur-md dark:border-amber-500/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <a
          href="#top"
          className="group flex items-center gap-2.5"
          aria-label="AmberPress home"
        >
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl",
              "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm",
              "ring-1 ring-amber-300/50 transition-transform group-hover:scale-105",
            )}
          >
            <Feather className="size-5" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              AmberPress
            </span>
          </span>
        </a>

        <nav
          aria-label="Primary"
          className="ml-4 hidden items-center gap-1 md:flex"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoToBlogs}
            className="text-foreground/80 hover:text-foreground"
          >
            My Blogs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoToNews}
            className="text-foreground/80 hover:text-foreground"
          >
            AI &amp; Tech News
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button
            onClick={onNewBlog}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-600 hover:to-orange-600"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Blog</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
