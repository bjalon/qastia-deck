import type { DeckDiagnostic, DeckSource, LayoutName, LayoutRegistry, SlotName } from "../publicTypes";
type MutableDeck = Record<string, unknown> & {
    metadata?: MutableMetadata;
    defaults?: MutableDefaults;
    slides?: MutableSlide[];
};
type MutableMetadata = Record<string, unknown> & {
    title?: string;
};
type MutableDefaults = Record<string, unknown> & {
    slots?: Record<string, unknown>;
};
type MutableSlide = Record<string, unknown> & {
    id?: string;
    layout?: string;
    slots?: Record<string, unknown>;
    unassignedSlots?: Record<string, unknown>;
};
export type SlideMovePlacement = "before" | "after";
export type LayoutMigrationResult = {
    readonly source: DeckSource;
    readonly diagnostics: readonly DeckDiagnostic[];
    readonly movedSlots: readonly {
        readonly from: SlotName;
        readonly to: SlotName;
    }[];
    readonly unassignedSlots: readonly SlotName[];
};
export declare function parseMutableDeck(source: DeckSource): MutableDeck | null;
export declare function stringifyMutableDeck(source: DeckSource, deck: MutableDeck): DeckSource;
export declare function getMutableSlides(deck: MutableDeck): MutableSlide[];
export declare function updateMarkdownSlot(source: DeckSource, slideId: string, slotName: SlotName, markdown: string): DeckSource;
export declare function removeSlideSlot(source: DeckSource, slideId: string, slotName: SlotName): DeckSource;
export declare function hasSlideSlot(source: DeckSource, slideId: string, slotName: SlotName): boolean;
export declare function getDefaultSlotMarkdown(source: DeckSource, slotName: SlotName): string;
export declare function hasDefaultSlot(source: DeckSource, slotName: SlotName): boolean;
export declare function updateDefaultMarkdownSlot(source: DeckSource, slotName: SlotName, markdown: string): DeckSource;
export declare function updateDeckTitle(source: DeckSource, title: string): DeckSource;
export declare function updateImageSlot(source: DeckSource, slideId: string, slotName: SlotName, image: {
    readonly assetId?: string;
    readonly src?: string;
    readonly alt?: string;
}): DeckSource;
export declare function updateSlideLayout(source: DeckSource, slideId: string, layout: LayoutName, layouts?: LayoutRegistry): DeckSource;
export declare function updateSlideLayoutWithMigration(source: DeckSource, slideId: string, layout: LayoutName, layouts?: LayoutRegistry): LayoutMigrationResult;
export declare function addSlide(source: DeckSource, layout?: LayoutName, afterSlideId?: string): {
    readonly source: DeckSource;
    readonly slideId?: string;
};
export declare function duplicateSlide(source: DeckSource, slideId: string): DeckSource;
export declare function deleteSlide(source: DeckSource, slideId: string): DeckSource;
export declare function moveSlide(source: DeckSource, slideId: string, targetSlideId: string, placement: SlideMovePlacement): DeckSource;
export declare function getSlotMarkdown(source: DeckSource, slideId: string, slotName: SlotName): string;
export declare function getSlotImage(source: DeckSource, slideId: string, slotName: SlotName): {
    readonly assetId: string;
    readonly src: string;
    readonly alt: string;
};
export declare function getSlideUnassignedSlots(source: DeckSource, slideId: string): Readonly<Record<string, unknown>>;
export declare function restoreUnassignedSlot(source: DeckSource, slideId: string, slotName: SlotName): DeckSource;
export {};
//# sourceMappingURL=editableSource.d.ts.map