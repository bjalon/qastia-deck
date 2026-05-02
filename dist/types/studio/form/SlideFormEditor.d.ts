import type { DeckSource, DeckSourceChangeReason, LayoutEditorField } from "../../publicTypes";
type SlideFormEditorProps = {
    readonly source: DeckSource;
    readonly slideId: string;
    readonly fields: readonly LayoutEditorField[];
    readonly readOnly: boolean;
    readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
};
export declare function SlideFormEditor({ fields, onUpdate, readOnly, slideId, source, }: SlideFormEditorProps): React.ReactElement;
export {};
//# sourceMappingURL=SlideFormEditor.d.ts.map