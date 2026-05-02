import type React from "react";
import type { CompiledDeck, PdfExportResult } from "../publicTypes";
import { type DeckPdfRasterExportOptions } from "./downloadDeckPdfFromElement";
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
export declare function useDeckPdfExport({ deck, filename, imageQuality, pageHeight, pageSelector, pageWidth, scale, }: UseDeckPdfExportOptions): UseDeckPdfExportResult;
//# sourceMappingURL=useDeckPdfExport.d.ts.map