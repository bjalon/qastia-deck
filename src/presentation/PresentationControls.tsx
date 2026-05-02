type PresentationControlsProps = {
  readonly activeIndex: number;
  readonly slideCount: number;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onClose: () => void;
};

export function PresentationControls({
  activeIndex,
  onClose,
  onNext,
  onPrevious,
  slideCount,
}: PresentationControlsProps): React.ReactElement {
  return (
    <div className="deck-presentation-controls" aria-label="Navigation presentation">
      <button type="button" onClick={onPrevious} disabled={activeIndex === 0} aria-label="Slide precedente">
        Previous
      </button>
      <span>
        {activeIndex + 1} / {slideCount}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={activeIndex >= slideCount - 1}
        aria-label="Slide suivante"
      >
        Next
      </button>
      <button type="button" onClick={onClose}>
        Quitter
      </button>
    </div>
  );
}
