"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, Tag } from "lucide-react";

import { cn } from "@/lib/utils";

type HeroProps = {
  blogsCount: number;
  categoriesCount: number;
};

export function Hero({ blogsCount, categoriesCount }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-amber-200/60 dark:border-amber-500/10"
    >
      {/* Warm amber radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40rem 24rem at 12% -10%, oklch(0.92 0.10 70 / 0.85), transparent 70%), radial-gradient(36rem 22rem at 95% 10%, oklch(0.9 0.09 55 / 0.7), transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="flex flex-col items-start gap-5"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-amber-300/60",
              "bg-amber-100/70 px-3 py-1 text-xs font-medium text-amber-800",
              "dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
            )}
          >
            <Sparkles className="size-3.5" />
            AI-assisted writing for the curious mind
          </motion.div>

          <motion.h1
            id="hero-title"
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0 },
            }}
            className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            AI &amp; Tech,{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Written Smarter
            </span>
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0 },
            }}
            className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            Draft, rewrite, and curate blogs with a built-in AI co-writer. Pull
            in the latest AI &amp; technology news from across the web and turn
            them into your own stories — all in one warm, focused editor.
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-wrap items-center gap-2 pt-2"
          >
            <HeroChip icon={<BookOpen className="size-3.5" />}>
              {blogsCount} {blogsCount === 1 ? "blog" : "blogs"}
            </HeroChip>
            <HeroChip icon={<Tag className="size-3.5" />}>
              {categoriesCount} categories
            </HeroChip>
            <HeroChip icon={<Sparkles className="size-3.5" />}>
              AI rewrite · improve · generate
            </HeroChip>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroChip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-card/80 px-3 py-1 text-xs font-medium text-foreground/80 shadow-sm backdrop-blur",
        "dark:border-amber-500/15 dark:bg-card/60",
      )}
    >
      <span className="text-amber-600 dark:text-amber-300">{icon}</span>
      {children}
    </span>
  );
}
