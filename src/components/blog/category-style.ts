import { BLOG_CATEGORIES } from "@/lib/types";

type CategoryStyle = {
  gradient: string;
  badge: string;
  ring: string;
  icon: string;
};

const FALLBACK: CategoryStyle = {
  gradient: "from-amber-400 to-orange-500",
  badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  ring: "ring-amber-300/60",
  icon: "✦",
};

const CATEGORY_MAP: Record<string, CategoryStyle> = {
  "Artificial Intelligence": {
    gradient: "from-amber-400 to-orange-500",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    ring: "ring-amber-300/60",
    icon: "✦",
  },
  "Machine Learning": {
    gradient: "from-rose-400 to-amber-500",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
    ring: "ring-rose-300/60",
    icon: "◆",
  },
  Technology: {
    gradient: "from-orange-400 to-yellow-500",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200",
    ring: "ring-orange-300/60",
    icon: "▲",
  },
  Startups: {
    gradient: "from-yellow-400 to-amber-600",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200",
    ring: "ring-yellow-300/60",
    icon: "★",
  },
  Research: {
    gradient: "from-amber-500 to-red-500",
    badge: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200",
    ring: "ring-red-300/60",
    icon: "✚",
  },
  Opinion: {
    gradient: "from-orange-500 to-rose-500",
    badge: "bg-orange-100 text-rose-800 dark:bg-orange-500/20 dark:text-rose-200",
    ring: "ring-orange-300/60",
    icon: "✎",
  },
  General: {
    gradient: "from-amber-300 to-orange-400",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    ring: "ring-amber-300/60",
    icon: "•",
  },
};

export function getCategoryStyle(category: string): CategoryStyle {
  if (!category) return FALLBACK;
  return CATEGORY_MAP[category] ?? FALLBACK;
}

export function parseTags(tags: string): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function allCategories(): readonly string[] {
  return BLOG_CATEGORIES;
}
