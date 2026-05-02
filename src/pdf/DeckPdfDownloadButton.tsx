import type { ButtonHTMLAttributes } from "react";
import type React from "react";
import type { CompiledDeck, PdfExportResult } from "../publicTypes";
import { DeckPdfExportHost } from "./DeckPdfExportHost";
import { type UseDeckPdfExportOptions, useDeckPdfExport } from "./useDeckPdfExport";

export type DeckPdfDownloadButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onError"
> &
  Omit<UseDeckPdfExportOptions, "deck"> & {
    readonly deck: CompiledDeck;
    readonly children?: React.ReactNode;
    readonly exportingChildren?: React.ReactNode;
    readonly exportHostClassName?: string;
    readonly onExportResult?: (result: PdfExportResult) => void;
  };

export function DeckPdfDownloadButton({
  children = "Télécharger PDF",
  deck,
  disabled,
  exportHostClassName,
  exportingChildren = "Export...",
  filename,
  imageQuality,
  onClick,
  onExportResult,
  pageHeight,
  pageSelector,
  pageWidth,
  scale,
  ...buttonProps
}: DeckPdfDownloadButtonProps): React.ReactElement {
  const { exportHostRef, exportPdf, exporting } = useDeckPdfExport({
    deck,
    filename,
    imageQuality,
    pageHeight,
    pageSelector,
    pageWidth,
    scale,
  });

  return (
    <>
      <button
        {...buttonProps}
        type={buttonProps.type ?? "button"}
        disabled={disabled || exporting}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) {
            return;
          }
          void exportPdf().then(onExportResult);
        }}
      >
        {exporting ? exportingChildren : children}
      </button>
      <DeckPdfExportHost ref={exportHostRef} deck={deck} className={exportHostClassName} />
    </>
  );
}
