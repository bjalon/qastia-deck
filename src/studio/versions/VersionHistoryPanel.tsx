import { useMemo, useState } from "react";
import type { DeckVersionReason, DeckVersionSummary } from "../../publicTypes";

type VersionFilter = "all" | DeckVersionReason | "safety";

type VersionHistoryPanelProps = {
  readonly versions: readonly DeckVersionSummary[];
  readonly readOnly: boolean;
  readonly canRestore: boolean;
  readonly canCompare: boolean;
  readonly onCreateManualVersion: (label?: string) => void;
  readonly onRestoreVersion: (versionId: string) => void;
  readonly onDeleteVersion: (versionId: string) => void;
  readonly onRenameVersion: (versionId: string, label: string) => void;
  readonly onCompareWithCurrent: (versionId: string) => void;
  readonly onCompareVersions: (leftVersionId: string, rightVersionId: string) => void;
};

const safetyReasons: readonly DeckVersionReason[] = [
  "before-layout-change",
  "before-slide-delete",
  "before-version-restore",
];

export function VersionHistoryPanel({
  versions,
  readOnly,
  canRestore,
  canCompare,
  onCreateManualVersion,
  onRestoreVersion,
  onDeleteVersion,
  onRenameVersion,
  onCompareWithCurrent,
  onCompareVersions,
}: VersionHistoryPanelProps): React.ReactElement {
  const [filter, setFilter] = useState<VersionFilter>("all");
  const [label, setLabel] = useState("");
  const [renamingVersionId, setRenamingVersionId] = useState<string | null>(null);
  const [renameLabel, setRenameLabel] = useState("");
  const [compareLeftId, setCompareLeftId] = useState<string | null>(null);

  const filteredVersions = useMemo(
    () =>
      versions.filter((version) => {
        if (filter === "all") {
          return true;
        }
        if (filter === "safety") {
          return safetyReasons.includes(version.reason);
        }
        return version.reason === filter;
      }),
    [filter, versions],
  );

  function createManualVersion(): void {
    onCreateManualVersion(label.trim() || undefined);
    setLabel("");
  }

  function startRename(version: DeckVersionSummary): void {
    setRenamingVersionId(version.id);
    setRenameLabel(version.label ?? version.reason);
  }

  function commitRename(): void {
    if (!renamingVersionId) {
      return;
    }
    const nextLabel = renameLabel.trim();
    if (nextLabel) {
      onRenameVersion(renamingVersionId, nextLabel);
    }
    setRenamingVersionId(null);
    setRenameLabel("");
  }

  function chooseComparisonSide(versionId: string): void {
    if (!compareLeftId) {
      setCompareLeftId(versionId);
      return;
    }
    if (compareLeftId !== versionId) {
      onCompareVersions(compareLeftId, versionId);
    }
    setCompareLeftId(null);
  }

  return (
    <section className="deck-version-history-panel">
      <header>
        <h3>Versions</h3>
        <label className="deck-version-filter">
          <span>Filtre</span>
          <select
            aria-label="Filtrer les versions"
            value={filter}
            onChange={(event) => setFilter(event.currentTarget.value as VersionFilter)}
          >
            <option value="all">Toutes</option>
            <option value="manual">Manuelles</option>
            <option value="autosave">Autosaves</option>
            <option value="safety">Sécurité</option>
            <option value="crash-recovery">Recovery</option>
            <option value="import">Imports</option>
            <option value="external-save">Externes</option>
          </select>
        </label>
      </header>

      <div className="deck-version-create">
        <input
          aria-label="Nom de version"
          value={label}
          placeholder="Nom de version"
          onChange={(event) => setLabel(event.currentTarget.value)}
          disabled={readOnly}
        />
        <button type="button" onClick={createManualVersion} disabled={readOnly}>
          Créer version
        </button>
      </div>

      {compareLeftId ? (
        <p className="deck-version-compare-hint">Choisir une seconde version à comparer.</p>
      ) : null}

      <ul className="deck-version-list">
        {filteredVersions.map((version) => (
          <li key={version.id}>
            {renamingVersionId === version.id ? (
              <div className="deck-version-rename">
                <input
                  aria-label="Renommer version"
                  value={renameLabel}
                  onChange={(event) => setRenameLabel(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitRename();
                    }
                    if (event.key === "Escape") {
                      event.preventDefault();
                      setRenamingVersionId(null);
                    }
                  }}
                />
                <button type="button" onClick={commitRename}>
                  OK
                </button>
              </div>
            ) : (
              <strong>{version.label ?? version.reason}</strong>
            )}
            <small>
              {versionLabel(version.reason)} - {new Date(version.createdAtIso).toLocaleString()} -{" "}
              {version.compilerStatus}
            </small>
            <div className="deck-version-actions">
              <button
                type="button"
                onClick={() => onRestoreVersion(version.id)}
                disabled={!canRestore || readOnly}
              >
                Restaurer
              </button>
              <button
                type="button"
                onClick={() => onCompareWithCurrent(version.id)}
                disabled={!canCompare}
              >
                Comparer actuel
              </button>
              <button
                type="button"
                onClick={() => chooseComparisonSide(version.id)}
                disabled={!canCompare}
                aria-pressed={compareLeftId === version.id}
              >
                Comparer A/B
              </button>
              {version.reason === "manual" ? (
                <button type="button" onClick={() => startRename(version)} disabled={readOnly}>
                  Renommer
                </button>
              ) : null}
              <button type="button" onClick={() => onDeleteVersion(version.id)} disabled={readOnly}>
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      {filteredVersions.length === 0 ? (
        <div className="deck-diagnostics-empty" role="status">
          Aucune version.
        </div>
      ) : null}
    </section>
  );
}

function versionLabel(reason: DeckVersionReason): string {
  if (reason === "autosave") {
    return "Autosave";
  }
  if (reason === "manual") {
    return "Manuelle";
  }
  if (reason === "crash-recovery") {
    return "Recovery";
  }
  if (reason.startsWith("before-")) {
    return "Sécurité";
  }
  if (reason === "external-save") {
    return "Externe";
  }
  return "Import";
}
