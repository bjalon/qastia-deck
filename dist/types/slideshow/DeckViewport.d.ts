import type { CompiledDeck, LayoutRendererTarget } from "../publicTypes";
type DeckViewportProps = {
    readonly deck: CompiledDeck;
    readonly activeIndex: number;
    readonly target?: LayoutRendererTarget;
};
export declare function DeckViewport({ activeIndex, deck, target, }: DeckViewportProps): React.ReactElement | null;
export {};
//# sourceMappingURL=DeckViewport.d.ts.map