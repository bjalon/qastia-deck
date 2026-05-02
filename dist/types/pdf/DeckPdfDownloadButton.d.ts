import type { ButtonHTMLAttributes } from "react";
import type React from "react";
import type { CompiledDeck, PdfExportResult } from "../publicTypes";
import { type UseDeckPdfExportOptions } from "./useDeckPdfExport";
export type DeckPdfDownloadButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onError"> & Omit<UseDeckPdfExportOptions, "deck"> & {
    readonly deck: CompiledDeck;
    readonly children?: React.ReactNode;
    readonly exportingChildren?: React.ReactNode;
    readonly exportHostClassName?: string;
    readonly onExportResult?: (result: PdfExportResult) => void;
};
export declare function DeckPdfDownloadButton({ children, deck, disabled, exportHostClassName, exportingChildren, filename, imageQuality, onClick, onExportResult, pageHeight, pageSelector, pageWidth, scale, ...buttonProps }: DeckPdfDownloadButtonProps): React.ReactElement;
//# sourceMappingURL=DeckPdfDownloadButton.d.ts.map