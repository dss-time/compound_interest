import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as XLSX from "xlsx";

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildWorkbookBlob(sheets: Array<{ name: string; rows: Array<Record<string, unknown>> }>) {
  const book = XLSX.utils.book_new();
  sheets.forEach((sheet) => {
    const ws = XLSX.utils.json_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(book, ws, sheet.name);
  });
  const bytes = XLSX.write(book, { type: "array", bookType: "csv" });
  return new Blob([bytes], { type: "text/csv;charset=utf-8;" });
}

export async function buildResultPdf(params: {
  title: string;
  summaryLines: string[];
  chartPngDataUrl?: string;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText(params.title, {
    x: 24,
    y: height - 38,
    size: 16,
    font,
    color: rgb(0.09, 0.1, 0.12),
  });

  let y = height - 66;
  params.summaryLines.forEach((line) => {
    page.drawText(line, {
      x: 24,
      y,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: 300,
      lineHeight: 12,
    });
    y -= 14;
  });

  if (params.chartPngDataUrl) {
    const pngBytes = await fetch(params.chartPngDataUrl).then((r) => r.arrayBuffer());
    const png = await pdf.embedPng(pngBytes);
    const maxW = 470;
    const maxH = 460;
    const scale = Math.min(maxW / png.width, maxH / png.height);
    const drawW = png.width * scale;
    const drawH = png.height * scale;
    page.drawImage(png, {
      x: width - drawW - 24,
      y: height - drawH - 52,
      width: drawW,
      height: drawH,
    });
  }

  return pdf.save();
}
