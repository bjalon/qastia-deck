import type { DeckPresentationControlsMode } from "../publicTypes";
type DeckNavigationToolbarProps = {
    readonly activeIndex: number;
    readonly slideCount: number;
    readonly showPresentationButton: boolean;
    readonly canOpenPresentation: boolean;
    readonly showPresentationControlsModeSelect: boolean;
    readonly presentationControlsMode: DeckPresentationControlsMode;
    readonly presentationButtonLabel: string;
    readonly presentationUnavailableLabel: string;
    readonly onOpenPresentation: () => void;
    readonly onPresentationControlsModeChange: (mode: DeckPresentationControlsMode) => void;
    readonly onPrevious: () => void;
    readonly onNext: () => void;
};
export declare function DeckNavigationToolbar({ activeIndex, canOpenPresentation, onNext, onOpenPresentation, onPresentationControlsModeChange, onPrevious, presentationButtonLabel, presentationControlsMode, presentationUnavailableLabel, showPresentationButton, showPresentationControlsModeSelect, slideCount, }: DeckNavigationToolbarProps): React.ReactElement;
export {};
//# sourceMappingURL=DeckNavigationToolbar.d.ts.map