import { HelpCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function HelpTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}
