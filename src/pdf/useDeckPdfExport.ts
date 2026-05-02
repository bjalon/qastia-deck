import { useCallback, useRef, useState } from "react";
import type React from "react";
import type { CompiledDeck, PdfExportResult } from "../publicTypes";
import {
  downloadDeckPdfFromElement,
  type DeckPdfRasterExportOptions,
} from "./downloadDeckPdfFromElement";

export type DeckPdfExportStatus = "idle" | "exporting" | "downloaded" | "failed";

export type UseDeckPdfExportOptions = Omit<DeckPdfRasterExportOptions, "filename" | "root"> & {
  readonly deck: CompiledDeck;
  readonly filename?: string;
};

export type UseDeckPdfExportResult = {
  readonly exportHostRef: React.RefObject<HTMLDivElement>;
  readonly status: DeckPdfExportStatus;
  readonly exporting: boolean;
  readonly lastResult?: PdfExportResult;
  readonly exportPdf: () => Promise<PdfExportResult>;
};

export function useDeckPdfExport({
  deck,
  filename,
  imageQuality,
  pageHeight,
  pageSelector,
  pageWidth,
  scale,
}: UseDeckPdfExportOptions): UseDeckPdfExportResult {
  const exportHostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<DeckPdfExportStatus>("idle");
  const [lastResult, setLastResult] = useState<PdfExportResult | undefined>();

  const exportPdf = useCallback(async (): Promise<PdfExportResult> => {
    if (!exportHostRef.current) {
      const result: PdfExportResult = {
        status: "failed",
        diagnostics: [
          {
            code: "PDF_EXPORT_FAILED",
            severity: "error",
            message: "PDF export host is not mounted.",
          },
        ],
      };
      setStatus("failed");
      setLastResult(result);
      return result;
    }

    setStatus("exporting");
    const result = await downloadDeckPdfFromElement({
      filename: filename ?? `${slugifyFilename(deck.metadata.title || "deck")}.pdf`,
      imageQuality,
      pageHeight,
      pageSelector,
      pageWidth,
      root: exportHostRef.current,
      scale,
    });

    setStatus(result.status === "failed" ? "failed" : "downloaded");
    setLastResult(result);
    return result;
  }, [
    deck.metadata.title,
    filename,
    imageQuality,
    pageHeight,
    pageSelector,
    pageWidth,
    scale,
  ]);

  return {
    exportHostRef,
    status,
    exporting: status === "exporting",
    lastResult,
    exportPdf,
  };
}

function slugifyFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "") || "deck";
}
