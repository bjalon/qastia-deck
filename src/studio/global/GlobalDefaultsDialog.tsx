import type { DeckSource, DeckSourceChangeReason } from "../../publicTypes";
import { getDefaultSlotMarkdown, updateDefaultMarkdownSlot } from "../editableSource";

type GlobalDefaultsDialogProps = {
  readonly source: DeckSource;
  readonly readOnly: boolean;
  readonly onClose: () => void;
  readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
};

export function GlobalDefaultsDialog({
  onClose,
  onUpdate,
  readOnly,
  source,
}: GlobalDefaultsDialogProps): React.ReactElement {
  const eyebrow = getDefaultSlotMarkdown(source, "eyebrow");
  const footer = getDefaultSlotMarkdown(source, "footer");

  return (
    <div className="deck-global-defaults-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="deck-global-defaults-title"
        className="deck-global-defaults-dialog"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <p>Defaults</p>
            <h3 id="deck-global-defaults-title">Valeurs globales</h3>
          </div>
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </header>

        <div className="deck-global-defaults-body">
          <label className="deck-form-field">
            <span>Eyebrow global</span>
            <input
              className="deck-form-input"
              placeholder=" "
              value={eyebrow}
              onChange={(event) =>
                onUpdate(
                  updateDefaultMarkdownSlot(source, "eyebrow", event.currentTarget.value),
                  "defaults-edit",
                )
              }
              readOnly={readOnly}
            />
          </label>

          <label className="deck-form-field">
            <span>Footer global</span>
            <input
              className="deck-form-input"
              placeholder=" "
              value={footer}
              onChange={(event) =>
                onUpdate(
                  updateDefaultMarkdownSlot(source, "footer", event.currentTarget.value),
                  "defaults-edit",
                )
              }
              readOnly={readOnly}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
