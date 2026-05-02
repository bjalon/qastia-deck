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

export function DeckNavigationToolbar({
  activeIndex,
  canOpenPresentation,
  onNext,
  onOpenPresentation,
  onPresentationControlsModeChange,
  onPrevious,
  presentationButtonLabel,
  presentationControlsMode,
  presentationUnavailableLabel,
  showPresentationButton,
  showPresentationControlsModeSelect,
  slideCount,
}: DeckNavigationToolbarProps): React.ReactElement {
  return (
    <div className="deck-show-toolbar" aria-label="Deck navigation">
      {showPresentationButton ? (
        <button
          type="button"
          onClick={onOpenPresentation}
          disabled={!canOpenPresentation}
          title={canOpenPresentation ? presentationButtonLabel : presentationUnavailableLabel}
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
      <button type="button" onClick={onPrevious} disabled={activeIndex === 0}>
        Previous
      </button>
      <span>
        {activeIndex + 1} / {slideCount}
      </span>
      <button type="button" onClick={onNext} disabled={activeIndex >= slideCount - 1}>
        Next
      </button>
    </div>
  );
}
