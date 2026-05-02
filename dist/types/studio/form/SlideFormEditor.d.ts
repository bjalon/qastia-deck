import type { DeckSource, DeckSourceChangeReason, LayoutEditorField, SlotName } from "../../publicTypes";
type SlideFormEditorProps = {
    readonly source: DeckSource;
    readonly slideId: string;
    readonly fields: readonly LayoutEditorField[];
    readonly inheritedMarkdownSlots?: ReadonlyMap<SlotName, string>;
    readonly readOnly: boolean;
    readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
};
export declare function SlideFormEditor({ fields, inheritedMarkdownSlots, onUpdate, readOnly, slideId, source, }: SlideFormEditorProps): React.ReactElement;
export {};
//# sourceMappingURL=SlideFormEditor.d.ts.map