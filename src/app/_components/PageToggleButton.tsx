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
  const target = toOptions ? "/options" : "/";

  return (
    <div className="fixed left-4 top-4 z-[90]">
      <Link
        href={target}
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/82 px-4 py-2 text-sm",
          "text-secondary-foreground shadow-[0_10px_22px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-[transform,background-color,border-color,box-shadow,color] duration-150 ease-out hover:-translate-y-px hover:bg-background/90 hover:shadow-[0_12px_26px_rgba(15,23,42,0.1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <ArrowLeftRight className="h-4 w-4" />
        {label}
      </Link>
    </div>
  );
}
