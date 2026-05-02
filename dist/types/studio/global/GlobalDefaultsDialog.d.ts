import type { DeckSource, DeckSourceChangeReason } from "../../publicTypes";
type GlobalDefaultsDialogProps = {
    readonly source: DeckSource;
    readonly readOnly: boolean;
    readonly onClose: () => void;
    readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
};
export declare function GlobalDefaultsDialog({ onClose, onUpdate, readOnly, source, }: GlobalDefaultsDialogProps): React.ReactElement;
export {};
//# sourceMappingURL=GlobalDefaultsDialog.d.ts.map