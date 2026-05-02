import type { DeckSource, LayoutName, SlotName } from "../publicTypes";
type MutableDeck = Record<string, unknown> & {
    slides?: MutableSlide[];
};
type MutableSlide = Record<string, unknown> & {
    id?: string;
    layout?: string;
    slots?: Record<string, unknown>;
};
export declare function parseMutableDeck(source: DeckSource): MutableDeck | null;
export declare function stringifyMutableDeck(source: DeckSource, deck: MutableDeck): DeckSource;
export declare function getMutableSlides(deck: MutableDeck): MutableSlide[];
export declare function updateMarkdownSlot(source: DeckSource, slideId: string, slotName: SlotName, markdown: string): DeckSource;
export declare function updateImageSlot(source: DeckSource, slideId: string, slotName: SlotName, image: {
    readonly assetId?: string;
    readonly src?: string;
    readonly alt?: string;
}): DeckSource;
export declare function updateSlideLayout(source: DeckSource, slideId: string, layout: LayoutName): DeckSource;
export declare function addSlide(source: DeckSource, layout?: LayoutName): DeckSource;
export declare function duplicateSlide(source: DeckSource, slideId: string): DeckSource;
export declare function deleteSlide(source: DeckSource, slideId: string): DeckSource;
export declare function getSlotMarkdown(source: DeckSource, slideId: string, slotName: SlotName): string;
export declare function getSlotImage(source: DeckSource, slideId: string, slotName: SlotName): {
    readonly assetId: string;
    readonly src: string;
    readonly alt: string;
};
export {};
//# sourceMappingURL=editableSource.d.ts.map