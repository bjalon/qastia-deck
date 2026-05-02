type VersionSourceDialogProps = {
  readonly title: string;
  readonly label: string;
  readonly source: string;
  readonly onClose: () => void;
};

export function VersionSourceDialog({
  title,
  label,
  source,
  onClose,
}: VersionSourceDialogProps): React.ReactElement {
  return (
    <div className="deck-modal-backdrop" role="presentation">
      <section
        aria-labelledby="deck-version-source-title"
        aria-modal="true"
        className="deck-modal-dialog deck-version-source-dialog"
        role="dialog"
      >
        <header>
          <div>
            <p>Lecture seule</p>
            <h3 id="deck-version-source-title">{title}</h3>
          </div>
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </header>
        <label className="deck-version-source-field">
          <span>{label}</span>
          <textarea readOnly value={source} />
        </label>
      </section>
    </div>
  );
}
