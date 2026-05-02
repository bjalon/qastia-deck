import type { PdfExportResult } from "../publicTypes";
export type DeckPdfRasterExportOptions = {
    readonly root: HTMLElement;
    readonly filename: string;
    readonly pageSelector?: string;
    readonly pageWidth?: number;
    readonly pageHeight?: number;
    readonly scale?: number;
    readonly imageQuality?: number;
};
export declare function downloadDeckPdfFromElement({ filename, imageQuality, pageHeight, pageSelector, pageWidth, root, scale, }: DeckPdfRasterExportOptions): Promise<PdfExportResult>;
//# sourceMappingURL=downloadDeckPdfFromElement.d.ts.map