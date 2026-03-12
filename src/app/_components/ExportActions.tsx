import { Download, FileSpreadsheet, FileText, ImageIcon, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const FORMAT_META: Record<"csv" | "png" | "pdf", { icon: LucideIcon; label: string }> = {
  csv: { icon: FileSpreadsheet, label: "CSV" },
  png: { icon: ImageIcon, label: "PNG" },
  pdf: { icon: FileText, label: "PDF" },
};

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
  const exportCta = lang === "zh" ? `导出 ${FORMAT_META[fmt].label}` : `Export ${FORMAT_META[fmt].label}`;

  const handleExport = () => {
    if (fmt === "csv") onCsv();
    else if (fmt === "png") onPng();
    else onPdf();
  };

  const ActiveIcon = FORMAT_META[fmt].icon;

  return (
    <div className="action-shell grid gap-3 p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
          <Download className="h-4 w-4" />
        </span>
        <div>
          <div className="text-base font-semibold text-foreground">{label}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {lang === "zh" ? "导出当前结果视图，便于发送、存档或复盘。" : "Export the current result view for sharing, archiving, or review."}
          </div>
        </div>
      </div>
      <div className="rounded-[18px] border border-border/60 bg-background/70 p-2">
        <div className="mb-2 px-1 text-xs text-muted-foreground">{formatLabel}</div>
        <div className="grid gap-2">
          <div className="format-switcher" role="tablist" aria-label={formatLabel}>
            {(["csv", "png", "pdf"] as const).map((value) => {
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFmt(value)}
                  className={`format-switch ${fmt === value ? "is-active" : ""}`}
                  aria-pressed={fmt === value}
                >
                  <span className="format-switch-label">
                    {FORMAT_META[value].label}
                  </span>
                </button>
              );
            })}
          </div>
          <Button variant="outline" onClick={handleExport} className="min-h-11 w-full justify-center">
            <ActiveIcon className="h-4 w-4" />
            {exportCta}
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{lang === "zh" ? "支持导出表格、图片和 PDF。" : "Supports table, image, and PDF exports."}</div>
    </div>
  );
}
