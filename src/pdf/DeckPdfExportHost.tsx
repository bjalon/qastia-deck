import { forwardRef } from "react";
import type React from "react";
import type { CompiledDeck } from "../publicTypes";
import { PrintDeck } from "./PrintDeck";

export type DeckPdfExportHostProps = {
  readonly deck: CompiledDeck;
  readonly className?: string;
};

export const DeckPdfExportHost = forwardRef<HTMLDivElement, DeckPdfExportHostProps>(
  function DeckPdfExportHost({ className, deck }, ref): React.ReactElement {
    return (
      <div
        ref={ref}
        className={["deck-pdf-export-host", className].filter(Boolean).join(" ")}
        aria-hidden="true"
      >
        <PrintDeck deck={deck} />
      </div>
    );
  },
);
