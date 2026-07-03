"use client";

import { motion } from "framer-motion";
import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title = "No blogs yet",
  description = "Start your first AI-assisted blog or import one from the news tab.",
  actionLabel = "Write a new blog",
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-amber-300/70 bg-card/60 p-10 text-center",
        "dark:border-amber-500/15",
      )}
    >
      <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
        <FileText className="size-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="size-4" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
