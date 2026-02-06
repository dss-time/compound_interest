import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background/70 p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <Select value={fmt} onValueChange={(value) => setFmt(value as "csv" | "png" | "pdf")}>
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder={formatLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="csv">CSV</SelectItem>
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4" />
        {label}
      </Button>
    </div>
  );
}
