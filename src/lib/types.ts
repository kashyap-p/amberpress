export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string; // comma-separated
  category: string;
  coverImage: string;
  author: string;
  published: boolean;
  source: "user" | "news";
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  title: string;
  snippet: string;
  url: string;
  host_name: string;
  date: string;
  favicon: string;
}

export type BlogInput = {
  title: string;
  content?: string;
  excerpt?: string;
  tags?: string;
  category?: string;
  coverImage?: string;
  author?: string;
  published?: boolean;
  source?: "user" | "news";
  sourceUrl?: string;
};

export const BLOG_CATEGORIES = [
  "Artificial Intelligence",
  "Machine Learning",
  "Technology",
  "Startups",
  "Research",
  "Opinion",
  "General",
] as const;

export type AITone =
  | "professional"
  | "casual"
  | "enthusiastic"
  | "informative"
  | "storytelling";
