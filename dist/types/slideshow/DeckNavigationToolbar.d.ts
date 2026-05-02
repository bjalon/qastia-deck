import type { DeckPresentationControlsMode } from "../publicTypes";
type DeckNavigationToolbarProps = {
    readonly activeIndex: number;
    readonly slideCount: number;
    readonly placement: "top" | "bottom";
    readonly showPreviousNext: boolean;
    readonly showCounter: boolean;
    readonly showPresentationButton: boolean;
    readonly presentationDisabled: boolean;
    readonly showPresentationControlsModeSelect: boolean;
    readonly presentationControlsMode: DeckPresentationControlsMode;
    readonly presentationButtonLabel: string;
    readonly presentationUnavailableLabel: string;
    readonly onOpenPresentation: () => void;
    readonly onPresentationControlsModeChange: (mode: DeckPresentationControlsMode) => void;
    readonly onPrevious: () => void;
    readonly onNext: () => void;
};
export declare function DeckNavigationToolbar({ activeIndex, onNext, onOpenPresentation, onPresentationControlsModeChange, onPrevious, placement, presentationButtonLabel, presentationControlsMode, presentationDisabled, presentationUnavailableLabel, showCounter, showPresentationButton, showPresentationControlsModeSelect, showPreviousNext, slideCount, }: DeckNavigationToolbarProps): React.ReactElement;
export {};
//# sourceMappingURL=DeckNavigationToolbar.d.ts.map