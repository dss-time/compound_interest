import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ExportActions({
  lang,
  onCsv,
  onPng,
  onPdf,
}: {
  lang: "zh" | "en";
  onCsv: () => void;
  onPng: () => void;
  onPdf: () => void;
}) {
  const [fmt, setFmt] = useState<"csv" | "png" | "pdf">("csv");
  const label = lang === "zh" ? "导出结果" : "Export";
  const formatLabel = lang === "zh" ? "格式" : "Format";

  const handleExport = () => {
    if (fmt === "csv") onCsv();
    else if (fmt === "png") onPng();
    else onPdf();
  };

  return (
    <div className="action-shell grid gap-3 p-4">
      <div>
        <div className="text-base font-semibold text-foreground">{label}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {lang === "zh" ? "导出当前结果视图，便于发送、存档或复盘。" : "Export the current result view for sharing, archiving, or review."}
        </div>
      </div>
      <div className="rounded-[18px] border border-border/60 bg-background/70 p-2">
        <div className="mb-2 px-1 text-xs text-muted-foreground">{formatLabel}</div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          {(["csv", "png", "pdf"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFmt(value)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                fmt === value
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_14px_28px_hsl(var(--primary)/0.22)]"
                  : "border-border/60 bg-background/80 text-muted-foreground hover:-translate-y-0.5 hover:text-foreground"
              }`}
            >
              {value.toUpperCase()}
            </button>
          ))}
          <Button variant="outline" onClick={handleExport} className="sm:min-w-[132px]">
            <Download className="h-4 w-4" />
            {lang === "zh" ? `导出 ${fmt.toUpperCase()}` : `Export ${fmt.toUpperCase()}`}
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{lang === "zh" ? "支持导出表格、图片和 PDF。" : "Supports table, image, and PDF exports."}</div>
    </div>
  );
}
