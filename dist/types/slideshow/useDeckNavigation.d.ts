import type { ActionOrigin, CompiledDeck, DeckRuntimeState, DeckUserAction, SlideChangeEvent } from "../publicTypes";
type UseDeckNavigationOptions = {
    readonly deck: CompiledDeck;
    readonly selectedSlideId?: string;
    readonly defaultSelectedSlideId?: string;
    readonly initialSlideId?: string;
    readonly onAction?: (event: DeckUserAction, state: DeckRuntimeState) => void;
    readonly onSlideChange?: (event: SlideChangeEvent) => void;
};
export declare function useDeckNavigation({ deck, defaultSelectedSlideId, initialSlideId, onAction, onSlideChange, selectedSlideId, }: UseDeckNavigationOptions): {
    activeIndex: number;
    activeSlide: import("..").CompiledSlide;
    emitAction: (event: DeckUserAction) => void;
    goTo: (nextIndex: number, origin: ActionOrigin) => void;
    resetToSlideId: (slideId?: string) => void;
    state: DeckRuntimeState;
};
export {};
//# sourceMappingURL=useDeckNavigation.d.ts.map