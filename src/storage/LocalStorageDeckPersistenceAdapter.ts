import type {
  ClearDraftRequest,
  CreateDeckVersionRequest,
  DeckDiagnostic,
  DeckDraftSnapshot,
  DeckPersistedState,
  DeckPersistenceAdapter,
  DeckPersistenceResult,
  DeckVersionSnapshot,
  DeckVersionSummary,
  DeleteDeckVersionRequest,
  ListDeckVersionsRequest,
  LoadCurrentDeckRequest,
  LoadDeckVersionRequest,
  LoadDraftRequest,
  SaveCurrentDeckRequest,
  SaveDraftRequest,
} from "../publicTypes";
import { currentKey, draftKey, versionKey, versionsIndexKey } from "./versionKeys";

type StoredVersionIndex = {
  readonly deckId: string;
  readonly namespace: string;
  readonly schemaVersion: 1;
  readonly updatedAtIso: string;
  readonly versions: readonly DeckVersionSummary[];
};

export class LocalStorageDeckPersistenceAdapter implements DeckPersistenceAdapter {
  async loadCurrent(request: LoadCurrentDeckRequest): Promise<DeckPersistedState | null> {
    return readJson<DeckPersistedState>(currentKey(request.namespace, request.deckId));
  }

  async saveCurrent(request: SaveCurrentDeckRequest): Promise<DeckPersistenceResult> {
    return writeJson(currentKey(request.namespace, request.deckId), request);
  }

  async saveDraft(request: SaveDraftRequest): Promise<DeckPersistenceResult> {
    return writeJson(draftKey(request.namespace, request.deckId), request);
  }

  async loadDraft(request: LoadDraftRequest): Promise<DeckDraftSnapshot | null> {
    return readJson<DeckDraftSnapshot>(draftKey(request.namespace, request.deckId));
  }

  async clearDraft(request: ClearDraftRequest): Promise<DeckPersistenceResult> {
    try {
      const storageArea = storage();
      if (!storageArea) {
        return unavailable();
      }
      storageArea.removeItem(draftKey(request.namespace, request.deckId));
      return { status: "success" };
    } catch (error) {
      return failed(error);
    }
  }

  async createVersion(request: CreateDeckVersionRequest): Promise<DeckPersistenceResult> {
    const snapshot: DeckVersionSnapshot = {
      id: request.id,
      deckId: request.deckId,
      namespace: request.namespace,
      schemaVersion: 1,
      createdAtIso: request.createdAtIso,
      label: request.label,
      reason: request.reason,
      source: request.source,
      sourceHash: request.sourceHash,
      selectedSlideId: request.selectedSlideId,
      compilerStatus: request.compilerStatus,
      diagnosticsSummary: request.diagnosticsSummary,
    };

    const stored = JSON.stringify(snapshot);
    const writeResult = await writeJson(versionKey(request.namespace, request.deckId, request.id), snapshot);
    if (writeResult.status !== "success") {
      return writeResult;
    }

    const index = await readIndex(request.namespace, request.deckId);
    const nextIndex: StoredVersionIndex = {
      deckId: request.deckId,
      namespace: request.namespace,
      schemaVersion: 1,
      updatedAtIso: new Date().toISOString(),
      versions: [
        {
          id: request.id,
          deckId: request.deckId,
          namespace: request.namespace,
          schemaVersion: 1,
          createdAtIso: request.createdAtIso,
          label: request.label,
          reason: request.reason,
          sourceHash: request.sourceHash,
          selectedSlideId: request.selectedSlideId,
          compilerStatus: request.compilerStatus,
          sizeBytes: stored.length,
        },
        ...index.versions.filter((version) => version.id !== request.id),
      ],
    };

    const cleanupResult = cleanupVersions(nextIndex, request.limits);
    return writeJson(versionsIndexKey(request.namespace, request.deckId), cleanupResult);
  }

  async listVersions(request: ListDeckVersionsRequest): Promise<readonly DeckVersionSummary[]> {
    return (await readIndex(request.namespace, request.deckId)).versions;
  }

  async loadVersion(request: LoadDeckVersionRequest): Promise<DeckVersionSnapshot | null> {
    return readJson<DeckVersionSnapshot>(
      versionKey(request.namespace, request.deckId, request.versionId),
    );
  }

  async deleteVersion(request: DeleteDeckVersionRequest): Promise<DeckPersistenceResult> {
    try {
      const storageArea = storage();
      if (!storageArea) {
        return unavailable();
      }
      storageArea.removeItem(versionKey(request.namespace, request.deckId, request.versionId));
      const index = await readIndex(request.namespace, request.deckId);
      const nextIndex: StoredVersionIndex = {
        ...index,
        updatedAtIso: new Date().toISOString(),
        versions: index.versions.filter((version) => version.id !== request.versionId),
      };
      return writeJson(versionsIndexKey(request.namespace, request.deckId), nextIndex);
    } catch (error) {
      return failed(error);
    }
  }
}

function cleanupVersions(
  index: StoredVersionIndex,
  limits: CreateDeckVersionRequest["limits"],
): StoredVersionIndex {
  if (!limits) {
    return index;
  }

  const versions = [...index.versions];
  const autosaves = versions.filter((version) => version.reason === "autosave");

  while (versions.length > limits.maxVersionsPerDeck) {
    const removableAutosave = findLastIndex(versions, (version) => version.reason === "autosave");
    versions.splice(removableAutosave >= 0 ? removableAutosave : versions.length - 1, 1);
  }

  while (versions.filter((version) => version.reason === "autosave").length > limits.maxAutosaveVersionsPerDeck) {
    const oldestAutosave = findLastIndex(versions, (version) => version.reason === "autosave");
    if (oldestAutosave < 0) {
      break;
    }
    versions.splice(oldestAutosave, 1);
  }

  let totalBytes = versions.reduce((sum, version) => sum + version.sizeBytes, 0);
  while (totalBytes > limits.maxBytesPerDeck && versions.length > 0) {
    const removableIndex = findLastIndex(versions, (version) => version.reason === "autosave");
    const indexToRemove = removableIndex >= 0 ? removableIndex : versions.length - 1;
    const [removed] = versions.splice(indexToRemove, 1);
    totalBytes -= removed?.sizeBytes ?? 0;
  }

  for (const removed of autosaves.filter((version) => !versions.some((kept) => kept.id === version.id))) {
    storage()?.removeItem(versionKey(index.namespace, index.deckId, removed.id));
  }

  return {
    ...index,
    versions,
  };
}

async function readIndex(namespace: string, deckId: string): Promise<StoredVersionIndex> {
  return (
    (await readJson<StoredVersionIndex>(versionsIndexKey(namespace, deckId))) ?? {
      deckId,
      namespace,
      schemaVersion: 1,
      updatedAtIso: new Date().toISOString(),
      versions: [],
    }
  );
}

function readJson<T>(key: string): T | null {
  try {
    const storageArea = storage();
    if (!storageArea) {
      return null;
    }
    const raw = storageArea.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): DeckPersistenceResult {
  try {
    const storageArea = storage();
    if (!storageArea) {
      return unavailable();
    }
    storageArea.setItem(key, JSON.stringify(value));
    return { status: "success" };
  } catch (error) {
    if (isQuotaExceededError(error)) {
      return quotaExceeded(error);
    }
    return failed(error);
  }
}

function unavailable(): DeckPersistenceResult {
  return {
    status: "unavailable",
    diagnostics: [
      {
        code: "STORAGE_VERSION_CORRUPTED",
        severity: "warning",
        message: "Local storage is unavailable in this environment.",
      },
    ],
  };
}

function quotaExceeded(error: unknown): DeckPersistenceResult {
  return {
    status: "quota-exceeded",
    diagnostics: [storageDiagnostic(error)],
  };
}

function failed(error: unknown): DeckPersistenceResult {
  return {
    status: "failed",
    diagnostics: [storageDiagnostic(error)],
  };
}

function isQuotaExceededError(error: unknown): boolean {
  return error instanceof DOMException && (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
}

function storageDiagnostic(error: unknown): DeckDiagnostic {
  return {
    code: "STORAGE_QUOTA_EXCEEDED",
    severity: "error",
    message: error instanceof Error ? error.message : "Unable to write deck state to storage.",
  };
}

function storage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage;
}

function findLastIndex<T>(items: readonly T[], predicate: (item: T) => boolean): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return index;
    }
  }
  return -1;
}
