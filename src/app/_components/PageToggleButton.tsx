"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";

import { cn } from "@/lib/ui";

export function PageToggleButton() {
  const pathname = usePathname();
  const toOptions = pathname !== "/options";

  return (
    <div className="sticky top-3 z-50 mx-auto flex w-full max-w-6xl justify-end px-4">
      <Link
        href={toOptions ? "/options" : "/"}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary px-4 py-2 text-sm",
          "text-secondary-foreground shadow-md transition hover:bg-secondary/80"
        )}
      >
        <ArrowLeftRight className="h-4 w-4" />
        {toOptions ? "切换到期权页" : "切换到复利页"}
      </Link>
    </div>
  );
}
