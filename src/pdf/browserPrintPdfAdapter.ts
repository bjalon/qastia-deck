import type { PdfExportAdapter, PdfExportResult } from "../publicTypes";

export const browserPrintPdfAdapter: PdfExportAdapter = {
  async exportDeck(request): Promise<PdfExportResult> {
    if (request.mode !== "browser-print") {
      return {
        status: "failed",
        diagnostics: [
          {
            code: "PDF_UNSUPPORTED_RENDERER",
            severity: "error",
            message: "Only browser-print PDF export is implemented.",
          },
        ],
      };
    }

    window.print();
    return { status: "opened-print-dialog" };
  },
};
