import type { CompiledDeck, DeckPresentationControlsMode } from "../publicTypes";
type DeckPresentationOverlayProps = {
    readonly deck: CompiledDeck;
    readonly activeIndex: number;
    readonly controlsMode: DeckPresentationControlsMode;
    readonly autoHideDelayMs: number;
    readonly requestBrowserFullscreen: boolean;
    readonly closeOnEscape: boolean;
    readonly hintText: string;
    readonly showHintWhenControlsHidden: boolean;
    readonly onClose: () => void;
    readonly onPrevious: () => void;
    readonly onNext: () => void;
};
export declare function DeckPresentationOverlay({ activeIndex, autoHideDelayMs, closeOnEscape, controlsMode, deck, hintText, onClose, onNext, onPrevious, requestBrowserFullscreen, showHintWhenControlsHidden, }: DeckPresentationOverlayProps): React.ReactElement | null;
export {};
//# sourceMappingURL=DeckPresentationOverlay.d.ts.map