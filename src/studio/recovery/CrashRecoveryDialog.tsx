import type { DeckDraftSnapshot, DeckPersistedState, DeckVersionSummary } from "../../publicTypes";

type CrashRecoveryDialogProps = {
  readonly draft: DeckDraftSnapshot;
  readonly current: DeckPersistedState | null;
  readonly versions: readonly DeckVersionSummary[];
  readonly onRestoreDraft: () => void;
  readonly onRestoreVersion: (versionId: string) => void;
  readonly onPreviewDraft: () => void;
  readonly onPreviewVersion: (versionId: string) => void;
  readonly onCompareDraftWithCurrent: () => void;
  readonly onCompareVersionWithCurrent: (versionId: string) => void;
  readonly onCreateCopyFromDraft: () => void;
  readonly onCreateCopyFromVersion: (versionId: string) => void;
  readonly onDeleteDraft: () => void;
  readonly onKeepCurrent: () => void;
  readonly onOpenVersionHistory: () => void;
};

export function CrashRecoveryDialog({
  draft,
  current,
  versions,
  onRestoreDraft,
  onRestoreVersion,
  onPreviewDraft,
  onPreviewVersion,
  onCompareDraftWithCurrent,
  onCompareVersionWithCurrent,
  onCreateCopyFromDraft,
  onCreateCopyFromVersion,
  onDeleteDraft,
  onKeepCurrent,
  onOpenVersionHistory,
}: CrashRecoveryDialogProps): React.ReactElement {
  const recentVersions = versions.slice(0, 4);

  return (
    <div className="deck-modal-backdrop" role="presentation">
      <section
        aria-labelledby="deck-crash-recovery-title"
        aria-modal="true"
        className="deck-modal-dialog deck-recovery-dialog"
        role="dialog"
      >
        <header>
          <div>
            <p>Recovery</p>
            <h3 id="deck-crash-recovery-title">Une version locale plus récente existe</h3>
          </div>
          <button type="button" onClick={onKeepCurrent}>
            Ignorer
          </button>
        </header>

        <div className="deck-recovery-summary">
          <article>
            <strong>Draft local</strong>
            <small>
              {new Date(draft.updatedAtIso).toLocaleString()} - {draft.compilerStatus}
            </small>
            <span>{draft.sourceHash.slice(0, 8)}</span>
          </article>
          <article>
            <strong>Version courante</strong>
            <small>
              {current ? new Date(current.updatedAtIso).toLocaleString() : "Non sauvegardée"}
            </small>
            <span>{current ? current.sourceHash.slice(0, 8) : "Aucun hash"}</span>
          </article>
        </div>

        <div className="deck-modal-actions">
          <button type="button" onClick={onRestoreDraft}>
            Restaurer cette version
          </button>
          <button type="button" onClick={onPreviewDraft}>
            Ouvrir en lecture seule
          </button>
          <button type="button" onClick={onCompareDraftWithCurrent}>
            Comparer avec la version actuelle
          </button>
          <button type="button" onClick={onCreateCopyFromDraft}>
            Créer une copie
          </button>
          <button type="button" onClick={onKeepCurrent}>
            Garder la version courante
          </button>
          <button type="button" onClick={onDeleteDraft}>
            Supprimer le draft
          </button>
          <button type="button" onClick={onOpenVersionHistory}>
            Voir l'historique
          </button>
        </div>

        {recentVersions.length > 0 ? (
          <div className="deck-recovery-versions">
            <strong>Versions récentes</strong>
            <ul className="deck-version-list">
              {recentVersions.map((version) => (
                <li key={version.id}>
                  <strong>{version.label ?? version.reason}</strong>
                  <small>
                    {new Date(version.createdAtIso).toLocaleString()} - {version.compilerStatus}
                  </small>
                  <span>{version.sourceHash.slice(0, 8)} - {version.sizeBytes} octets</span>
                  <div className="deck-version-actions">
                    <button type="button" onClick={() => onRestoreVersion(version.id)}>
                      Restaurer cette version
                    </button>
                    <button type="button" onClick={() => onPreviewVersion(version.id)}>
                      Ouvrir
                    </button>
                    <button type="button" onClick={() => onCompareVersionWithCurrent(version.id)}>
                      Comparer
                    </button>
                    <button type="button" onClick={() => onCreateCopyFromVersion(version.id)}>
                      Créer copie
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
