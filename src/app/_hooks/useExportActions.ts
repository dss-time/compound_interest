import { useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { RefObject } from 'react';

import { buildResultPdf, downloadBlob } from '@/app/_domain/export';

export function useExportActions({
  chartRef,
  onExportCsv,
  title,
  getSummaryLines,
}: {
  chartRef: RefObject<HTMLElement | null>;
  onExportCsv: () => void;
  title: string;
  getSummaryLines: () => string[];
}) {
  const exportCsv = useCallback(() => {
    onExportCsv();
  }, [onExportCsv]);

  const exportPng = useCallback(async () => {
    const node = chartRef.current;
    if (!node) return false;
    const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
    downloadBlob(`${title}.png`, await (await fetch(dataUrl)).blob());
    return true;
  }, [chartRef, title]);

  const exportPdf = useCallback(async () => {
    const node = chartRef.current;
    let chartPngDataUrl: string | undefined;
    if (node) {
      chartPngDataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
    }
    const bytes = await buildResultPdf({
      title,
      summaryLines: getSummaryLines(),
      chartPngDataUrl,
    });
    const normalized = new Uint8Array(bytes.byteLength);
    normalized.set(bytes);
    downloadBlob(
      `${title}.pdf`,
      new Blob([normalized], { type: 'application/pdf' }),
    );
    return true;
  }, [chartRef, getSummaryLines, title]);

  return { exportCsv, exportPng, exportPdf };
}
