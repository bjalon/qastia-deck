import type { DeckDiagnostic, PdfExportResult } from "../publicTypes";

export type DeckPdfRasterExportOptions = {
  readonly root: HTMLElement;
  readonly filename: string;
  readonly pageSelector?: string;
  readonly pageWidth?: number;
  readonly pageHeight?: number;
  readonly scale?: number;
  readonly imageQuality?: number;
};

export async function downloadDeckPdfFromElement({
  filename,
  imageQuality = 0.96,
  pageHeight = 900,
  pageSelector = ".deck-print-page",
  pageWidth = 1600,
  root,
  scale = 2,
}: DeckPdfRasterExportOptions): Promise<PdfExportResult> {
  const pages = Array.from(root.querySelectorAll<HTMLElement>(pageSelector));

  if (pages.length === 0) {
    return failed("PDF_NO_PRINT_PAGES", `No printable pages found with selector '${pageSelector}'.`);
  }

  try {
    const [{ jsPDF }, html2canvasModule] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);
    const html2canvas = html2canvasModule.default;

    await document.fonts?.ready;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [pageWidth, pageHeight],
      compress: true,
    });

    for (const [index, page] of pages.entries()) {
      const canvas = await html2canvas(page, {
        backgroundColor: "#ffffff",
        scale,
        useCORS: true,
        windowWidth: pageWidth,
        windowHeight: pageHeight,
      });
      const image = canvas.toDataURL("image/jpeg", imageQuality);

      if (index > 0) {
        pdf.addPage([pageWidth, pageHeight], "landscape");
      }

      pdf.addImage(image, "JPEG", 0, 0, pageWidth, pageHeight);
    }

    pdf.save(filename);
    return { status: "downloaded" };
  } catch (error) {
    return failed(
      "PDF_EXPORT_FAILED",
      error instanceof Error ? error.message : "Unable to generate PDF.",
    );
  }
}

function failed(code: DeckDiagnostic["code"], message: string): PdfExportResult {
  return {
    status: "failed",
    diagnostics: [
      {
        code,
        severity: "error",
        message,
      },
    ],
  };
}
