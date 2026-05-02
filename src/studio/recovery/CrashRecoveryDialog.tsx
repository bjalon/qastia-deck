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
  const draftUpdatedAt = formatDateTime(draft.updatedAtIso);
  const currentUpdatedAt = current ? formatDateTime(current.updatedAtIso) : "Aucune sauvegarde courante";

  return (
    <div className="deck-modal-backdrop" role="presentation">
      <section
        aria-labelledby="deck-crash-recovery-title"
        aria-modal="true"
        className="deck-modal-dialog deck-recovery-dialog"
        role="dialog"
      >
        <header className="deck-recovery-header">
          <div>
            <p>Récupération</p>
            <h3 id="deck-crash-recovery-title">Tu as un travail non récupéré</h3>
            <span>
              Une modification plus récente a été trouvée sur cet ordinateur. Le choix le plus
              sûr est de récupérer ce travail.
            </span>
          </div>
          <button className="deck-button-ghost" type="button" onClick={onKeepCurrent}>
            Fermer
          </button>
        </header>

        <div className="deck-recovery-body">
          <article className="deck-recovery-card deck-recovery-card--recommended">
            <div className="deck-recovery-card-header">
              <div>
                <span className="deck-recovery-badge">Recommandé</span>
                <strong>Récupérer mon travail récent</strong>
              </div>
              <span className="deck-recovery-status" data-status={draft.compilerStatus}>
                {statusLabel(draft.compilerStatus)}
              </span>
            </div>
            <dl className="deck-recovery-meta">
              <div>
                <dt>Dernière modification</dt>
                <dd>{draftUpdatedAt}</dd>
              </div>
              <div>
                <dt>État</dt>
                <dd>{draft.sourceHash.slice(0, 8)}</dd>
              </div>
            </dl>
            <div className="deck-recovery-primary-actions">
              <button className="deck-button-primary" type="button" onClick={onRestoreDraft}>
                Récupérer mon travail
              </button>
              <button type="button" onClick={onCompareDraftWithCurrent}>
                Voir les différences
              </button>
            </div>
          </article>

          <article className="deck-recovery-card">
            <div className="deck-recovery-card-header">
              <div>
                <span className="deck-recovery-badge deck-recovery-badge--neutral">Actuel</span>
                <strong>Garder la page actuelle</strong>
              </div>
              <span className="deck-recovery-status" data-status="current">
                conservée
              </span>
            </div>
            <dl className="deck-recovery-meta">
              <div>
                <dt>Dernière sauvegarde</dt>
                <dd>{currentUpdatedAt}</dd>
              </div>
              <div>
                <dt>État</dt>
                <dd>{current ? current.sourceHash.slice(0, 8) : "Aucun hash"}</dd>
              </div>
            </dl>
            <div className="deck-recovery-current-copy">
              <strong>Ignorer les modifications trouvées</strong>
              <small>
                À utiliser seulement si tu sais que les changements récents ne sont pas utiles.
              </small>
            </div>
            <button type="button" onClick={onKeepCurrent}>
              Garder cette page
            </button>
          </article>
        </div>

        <details className="deck-recovery-advanced">
          <summary>Options avancées</summary>
          <div className="deck-recovery-secondary-actions">
            <button type="button" onClick={onPreviewDraft}>
              Voir le contenu récupéré
            </button>
            <button type="button" onClick={onCreateCopyFromDraft}>
              Créer une copie
            </button>
            <button className="deck-button-danger" type="button" onClick={onDeleteDraft}>
              Supprimer définitivement cette récupération
            </button>
          </div>

          {recentVersions.length > 0 ? (
            <section className="deck-recovery-versions">
              <strong>Autres versions locales</strong>
              <p>Ces versions sont utiles si tu cherches une sauvegarde plus ancienne.</p>
              <ul className="deck-version-list">
                {recentVersions.map((version) => (
                  <li key={version.id}>
                    <div className="deck-recovery-version-row">
                      <div>
                        <strong>{version.label ?? version.reason}</strong>
                        <small>
                          {formatDateTime(version.createdAtIso)} - {statusLabel(version.compilerStatus)}
                        </small>
                      </div>
                      <span>{version.sourceHash.slice(0, 8)} - {version.sizeBytes} octets</span>
                    </div>
                    <div className="deck-version-actions">
                      <button type="button" onClick={() => onRestoreVersion(version.id)}>
                        Récupérer
                      </button>
                      <button type="button" onClick={() => onPreviewVersion(version.id)}>
                        Voir
                      </button>
                      <button type="button" onClick={() => onCompareVersionWithCurrent(version.id)}>
                        Différences
                      </button>
                      <button type="button" onClick={() => onCreateCopyFromVersion(version.id)}>
                        Copier
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </details>

        <footer className="deck-recovery-footer">
          <button type="button" onClick={onOpenVersionHistory}>
            Voir tout l’historique
          </button>
          <button className="deck-button-ghost" type="button" onClick={onKeepCurrent}>
            Ne rien récupérer
          </button>
        </footer>
      </section>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(status: DeckDraftSnapshot["compilerStatus"]): string {
  if (status === "valid") {
    return "utilisable";
  }
  if (status === "degraded") {
    return "avec alertes";
  }
  return "avec erreurs";
}
