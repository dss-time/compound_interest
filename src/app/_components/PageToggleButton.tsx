"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";

import { cn } from "@/lib/ui";
import { useDocumentLang } from "@/app/_hooks/useDocumentLang";

export function PageToggleButton() {
  const pathname = usePathname();
  const toOptions = pathname !== "/options";
  const lang = useDocumentLang();
  const label = lang === "en" ? (toOptions ? "Go to Options" : "Go to Planner") : toOptions ? "切换到期权策略" : "切换到复利规划";

  return (
    <div className="sticky top-3 z-50 mx-auto flex w-full max-w-6xl justify-end px-4">
      <Link
        href={toOptions ? "/options" : "/"}
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/82 px-4 py-2 text-sm",
          "text-secondary-foreground shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-background/92"
        )}
      >
        <ArrowLeftRight className="h-4 w-4" />
        {label}
      </Link>
    </div>
  );
}
