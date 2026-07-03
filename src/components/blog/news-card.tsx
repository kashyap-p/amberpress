"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Globe2, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/types";

type NewsCardProps = {
  item: NewsItem;
  onImport: (item: NewsItem) => void;
  index?: number;
};

export function NewsCard({ item, onImport, index = 0 }: NewsCardProps) {
  const [faviconError, setFaviconError] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.25) }}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-amber-200/70 bg-card p-4 shadow-sm transition-shadow",
        "hover:border-amber-300 hover:shadow-md",
        "dark:border-amber-500/10 dark:hover:border-amber-500/25",
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {item.favicon && !faviconError ? (
          <img
            src={item.favicon}
            alt=""
            className="size-4 rounded-sm"
            onError={() => setFaviconError(true)}
          />
        ) : (
          <Globe2 className="size-4 text-amber-600 dark:text-amber-300" />
        )}
        <span className="truncate font-medium text-foreground/80">
          {item.host_name}
        </span>
        {item.date && (
          <span className="ml-auto inline-flex items-center gap-1 shrink-0">
            <Calendar className="size-3 text-amber-600 dark:text-amber-300" />
            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
          </span>
        )}
      </div>

      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
        {item.title}
      </h3>

      {item.snippet && (
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {item.snippet}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-1">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="bg-background"
        >
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read source: ${item.title}`}
          >
            <ExternalLink className="size-3.5" />
            Read source
          </a>
        </Button>
        <Button
          size="sm"
          onClick={() => onImport(item)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="size-3.5" />
          Import to my blogs
        </Button>
      </div>
    </motion.article>
  );
}
