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

export function DeckNavigationToolbar({
  activeIndex,
  onNext,
  onOpenPresentation,
  onPresentationControlsModeChange,
  onPrevious,
  placement,
  presentationButtonLabel,
  presentationControlsMode,
  presentationDisabled,
  presentationUnavailableLabel,
  showCounter,
  showPresentationButton,
  showPresentationControlsModeSelect,
  showPreviousNext,
  slideCount,
}: DeckNavigationToolbarProps): React.ReactElement {
  return (
    <div className="deck-show-toolbar" data-placement={placement} aria-label="Deck navigation">
      {showPresentationButton ? (
        <button
          type="button"
          onClick={onOpenPresentation}
          disabled={presentationDisabled}
          title={presentationDisabled ? presentationUnavailableLabel : presentationButtonLabel}
        >
          {presentationButtonLabel}
        </button>
      ) : null}
      {showPresentationButton && showPresentationControlsModeSelect ? (
        <label className="deck-presentation-mode-select">
          <span>Presentation controls</span>
          <select
            value={presentationControlsMode}
            onChange={(event) =>
              onPresentationControlsModeChange(event.currentTarget.value as DeckPresentationControlsMode)
            }
          >
            <option value="visible">Boutons visibles</option>
            <option value="hidden">Boutons hidden</option>
            <option value="auto">Auto</option>
          </select>
        </label>
      ) : null}
      {showPreviousNext ? (
        <button type="button" onClick={onPrevious} disabled={activeIndex === 0}>
          Previous
        </button>
      ) : null}
      {showCounter ? (
        <span>
          {activeIndex + 1} / {slideCount}
        </span>
      ) : null}
      {showPreviousNext ? (
        <button type="button" onClick={onNext} disabled={activeIndex >= slideCount - 1}>
          Next
        </button>
      ) : null}
    </div>
  );
}
