type VersionCompareDialogProps = {
  readonly title: string;
  readonly leftLabel: string;
  readonly leftSource: string;
  readonly rightLabel: string;
  readonly rightSource: string;
  readonly onClose: () => void;
};

export function VersionCompareDialog({
  title,
  leftLabel,
  leftSource,
  rightLabel,
  rightSource,
  onClose,
}: VersionCompareDialogProps): React.ReactElement {
  return (
    <div className="deck-modal-backdrop" role="presentation">
      <section
        aria-labelledby="deck-version-compare-title"
        aria-modal="true"
        className="deck-modal-dialog deck-version-compare-dialog"
        role="dialog"
      >
        <header>
          <div>
            <p>Comparaison</p>
            <h3 id="deck-version-compare-title">{title}</h3>
          </div>
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </header>
        <div className="deck-version-compare-grid">
          <label>
            <span>{leftLabel}</span>
            <textarea readOnly value={leftSource} />
          </label>
          <label>
            <span>{rightLabel}</span>
            <textarea readOnly value={rightSource} />
          </label>
        </div>
      </section>
    </div>
  );
}
