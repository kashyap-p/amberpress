import { Feather } from "lucide-react";

import { cn } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "mt-auto w-full border-t border-amber-200/60 bg-background/80 backdrop-blur",
        "dark:border-amber-500/10",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
            <Feather className="size-4" />
          </span>
          <span>
            <span className="font-semibold text-foreground">AmberPress</span>{" "}
            · A personal AI &amp; tech blog.
          </span>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-4">
          <a
            href="#top"
            className="hover:text-foreground transition-colors"
          >
            Back to top
          </a>
          <span className="text-muted-foreground/70">
            © {year} AmberPress
          </span>
        </nav>
      </div>
    </footer>
  );
}
