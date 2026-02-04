import { Download } from "lucide-react";

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
  const label = lang === "zh" ? "导出结果" : "Export";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onCsv}>
        <Download className="h-4 w-4" />
        {label} CSV
      </Button>
      <Button variant="outline" size="sm" onClick={onPng}>
        <Download className="h-4 w-4" />
        {label} PNG
      </Button>
      <Button variant="outline" size="sm" onClick={onPdf}>
        <Download className="h-4 w-4" />
        {label} PDF
      </Button>
    </div>
  );
}
