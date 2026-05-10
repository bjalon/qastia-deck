import {
  BranchNotFoundError,
  RepositoryAlreadyExistsError,
  RepositoryNotFoundError,
  createRepository,
  defineGraph,
  singleton,
  type BranchRecord,
  type Head,
  type ObjectVcsRepository,
  type PersistenceAdapter,
  type RevisionSummary,
  type TagRecord,
} from "@bjalon/object-vcs-core";
import { z } from "zod";
import type {
  ClearDraftRequest,
  CreateDeckVersionRequest,
  DeckDiagnostic,
  DeckDraftSnapshot,
  DeckPersistedState,
  DeckPersistenceAdapter,
  DeckPersistenceResult,
  DeckSource,
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
import { localStorageObjectVcsPersistence } from "./localStorageObjectVcsPersistence";

const graphVersion = "deck-runtime-object-vcs@1";
const defaultBranch = "main";
const versionTagPrefix = "deck-version/";

const deckSourceSchema = z
  .object({
    uri: z.string().optional(),
    content: z.string(),
  })
  .strict();

const diagnosticSummarySchema = z
  .object({
    code: z.string(),
    severity: z.enum(["error", "warning", "info"]),
    count: z.number().int().nonnegative(),
  })
  .strict();

const persistedStateSchema = z
  .object({
    deckId: z.string(),
    namespace: z.string(),
    schemaVersion: z.literal(1),
    updatedAtIso: z.string(),
    source: deckSourceSchema,
    sourceHash: z.string(),
    selectedSlideId: z.string().optional(),
  })
  .strict();

const draftSnapshotSchema = z
  .object({
    deckId: z.string(),
    namespace: z.string(),
    schemaVersion: z.literal(1),
    updatedAtIso: z.string(),
    sessionId: z.string(),
    source: deckSourceSchema,
    sourceHash: z.string(),
    selectedSlideId: z.string().optional(),
    compilerStatus: z.enum(["valid", "degraded", "invalid"]),
  })
  .strict();

const versionSnapshotSchema = z
  .object({
    id: z.string(),
    deckId: z.string(),
    namespace: z.string(),
    schemaVersion: z.literal(1),
    createdAtIso: z.string(),
    label: z.string().optional(),
    reason: z.enum([
      "manual",
      "autosave",
      "before-layout-change",
      "before-slide-delete",
      "before-version-restore",
      "crash-recovery",
      "import",
      "external-save",
    ]),
    source: deckSourceSchema,
    sourceHash: z.string(),
    selectedSlideId: z.string().optional(),
    compilerStatus: z.enum(["valid", "degraded", "invalid"]),
    diagnosticsSummary: z.array(diagnosticSummarySchema),
  })
  .strict();

export type ObjectVcsDeckState = {
  readonly current: DeckPersistedState | null;
  readonly draft: DeckDraftSnapshot | null;
  readonly version: DeckVersionSnapshot | null;
};

const deckObjectVcsStateSchema = z
  .object({
    current: persistedStateSchema.nullable(),
    draft: draftSnapshotSchema.nullable(),
    version: versionSnapshotSchema.nullable(),
  })
  .strict() as z.ZodType<ObjectVcsDeckState>;

const deckObjectVcsGraph = defineGraph({
  deck: singleton(deckObjectVcsStateSchema),
});

export type ObjectVcsDeckRepository = ObjectVcsRepository<{ deck: ObjectVcsDeckState }>;

export type ObjectVcsDeckRepositoryRequest = {
  readonly deckId: string;
  readonly namespace: string;
};

export type ObjectVcsDeckHistory = {
  readonly head: Head<{ deck: ObjectVcsDeckState }> | null;
  readonly revisions: readonly RevisionSummary[];
  readonly tags: readonly TagRecord[];
  readonly branches: readonly BranchRecord[];
};

export type ObjectVcsDeckPersistenceAdapterOptions = {
  readonly persistence?: PersistenceAdapter<{ deck: ObjectVcsDeckState }>;
  readonly author?: string;
  readonly storageNamespace?: string;
};

export class ObjectVcsDeckPersistenceAdapter implements DeckPersistenceAdapter {
  readonly #persistence: PersistenceAdapter<{ deck: ObjectVcsDeckState }>;
  readonly #author: string;

  constructor(options: ObjectVcsDeckPersistenceAdapterOptions = {}) {
    this.#persistence =
      options.persistence ??
      localStorageObjectVcsPersistence<{ deck: ObjectVcsDeckState }>({
        namespace: options.storageNamespace ?? "deck-runtime-object-vcs",
      });
    this.#author = options.author ?? "Deck Runtime";
  }

  async loadCurrent(request: LoadCurrentDeckRequest): Promise<DeckPersistedState | null> {
    const head = await this.#loadHeadOrNull(request);
    return head?.state.deck.current ?? null;
  }

  async saveCurrent(request: SaveCurrentDeckRequest): Promise<DeckPersistenceResult> {
    return this.#writeHead(request, (state) => ({
      ...state,
      current: request,
    }));
  }

  async saveDraft(request: SaveDraftRequest): Promise<DeckPersistenceResult> {
    return this.#writeHead(request, (state) => ({
      ...state,
      draft: request,
    }));
  }

  async loadDraft(request: LoadDraftRequest): Promise<DeckDraftSnapshot | null> {
    const head = await this.#loadHeadOrNull(request);
    return head?.state.deck.draft ?? null;
  }

  async clearDraft(request: ClearDraftRequest): Promise<DeckPersistenceResult> {
    return this.#writeHead(request, (state) => ({
      ...state,
      draft: null,
    }));
  }

  async createVersion(request: CreateDeckVersionRequest): Promise<DeckPersistenceResult> {
    try {
      const repository = await this.#ensureRepository(request, currentFromVersion(request));
      const head = await repository.getHead({ branch: defaultBranch });
      const nextState: ObjectVcsDeckState = {
        ...head.state.deck,
        current: currentFromVersion(request),
        version: stripVersionLimits(request),
      };
      await repository.update(
        () => ({ deck: nextState }),
        {
          branch: defaultBranch,
          commit: false,
          message: request.label ?? versionReasonLabel(request.reason),
          author: this.#author,
          concurrency: "last-write-wins",
        },
      );
      const result = await repository.commit({
        branch: defaultBranch,
        allowEmpty: true,
        message: request.label ?? versionReasonLabel(request.reason),
        author: this.#author,
      });

      if (result.revision) {
        await repository.tag(versionTagName(request.id), {
          revision: result.revision.revision,
          overwrite: true,
          annotation: request.reason,
          author: this.#author,
        });
      }

      return { status: "success" };
    } catch (error) {
      return failed(error);
    }
  }

  async listVersions(request: ListDeckVersionsRequest): Promise<readonly DeckVersionSummary[]> {
    try {
      const repository = await this.#getRepositoryIfExists(request);
      if (!repository) {
        return [];
      }

      const tags = await repository.listTags();
      const versionTags = tags
        .filter((tag) => tag.name.startsWith(versionTagPrefix))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      const versions = await Promise.all(
        versionTags.map(async (tag) => {
          const stored = await repository.readRevision(tag.revision, { migrateTo: "current" });
          return versionSummaryFromSnapshot(stored.deck.version);
        }),
      );

      return versions
        .filter((version): version is DeckVersionSummary => version !== null)
        .sort((left, right) => right.createdAtIso.localeCompare(left.createdAtIso));
    } catch {
      return [];
    }
  }

  async loadVersion(request: LoadDeckVersionRequest): Promise<DeckVersionSnapshot | null> {
    try {
      const repository = await this.#getRepositoryIfExists(request);
      if (!repository) {
        return null;
      }
      const tag = (await repository.listTags()).find((item) => item.name === versionTagName(request.versionId));
      if (!tag) {
        return null;
      }
      const stored = await repository.readRevision(tag.revision, { migrateTo: "current" });
      return stored.deck.version?.id === request.versionId ? stored.deck.version : null;
    } catch {
      return null;
    }
  }

  async deleteVersion(request: DeleteDeckVersionRequest): Promise<DeckPersistenceResult> {
    try {
      const repository = await this.#getRepositoryIfExists(request);
      if (!repository) {
        return { status: "success" };
      }
      await repository.deleteTag(versionTagName(request.versionId), { missing: "ignore", author: this.#author });
      return { status: "success" };
    } catch (error) {
      return failed(error);
    }
  }

  async getRepository(request: ObjectVcsDeckRepositoryRequest): Promise<ObjectVcsDeckRepository> {
    return this.#ensureRepository(request);
  }

  async getHistory(request: ObjectVcsDeckRepositoryRequest): Promise<ObjectVcsDeckHistory> {
    const repository = await this.#getRepositoryIfExists(request);
    if (!repository) {
      return {
        head: null,
        revisions: [],
        tags: [],
        branches: [],
      };
    }

    const [head, revisions, tags, branches] = await Promise.all([
      repository.getHead({ branch: defaultBranch }).catch((error: unknown) => {
        if (error instanceof BranchNotFoundError) {
          return null;
        }
        throw error;
      }),
      repository.listRevisions({ limit: 100 }),
      repository.listTags(),
      repository.listBranches(),
    ]);

    return { head, revisions, tags, branches };
  }

  async restoreRevision(
    request: ObjectVcsDeckRepositoryRequest & { readonly revision: number },
  ): Promise<DeckVersionSnapshot | null> {
    const repository = await this.#getRepositoryIfExists(request);
    if (!repository) {
      return null;
    }
    const restored = await repository.readRevision(request.revision, { migrateTo: "current" });
    const version = restored.deck.version;
    if (!version) {
      return null;
    }
    await repository.restore(request.revision, {
      branch: defaultBranch,
      commit: false,
      author: this.#author,
    });
    return version;
  }

  async #writeHead(
    request: ObjectVcsDeckRepositoryRequest,
    update: (state: ObjectVcsDeckState) => ObjectVcsDeckState,
  ): Promise<DeckPersistenceResult> {
    try {
      const repository = await this.#ensureRepository(request);
      const head = await repository.getHead({ branch: defaultBranch });
      await repository.update(
        () => ({ deck: update(head.state.deck) }),
        {
          branch: defaultBranch,
          commit: false,
          author: this.#author,
          concurrency: "last-write-wins",
        },
      );
      return { status: "success" };
    } catch (error) {
      return failed(error);
    }
  }

  async #loadHeadOrNull(request: ObjectVcsDeckRepositoryRequest): Promise<Head<{ deck: ObjectVcsDeckState }> | null> {
    const repository = await this.#getRepositoryIfExists(request);
    if (!repository) {
      return null;
    }
    try {
      return await repository.getHead({ branch: defaultBranch });
    } catch (error) {
      if (error instanceof BranchNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async #getRepositoryIfExists(request: ObjectVcsDeckRepositoryRequest): Promise<ObjectVcsDeckRepository | null> {
    const repository = this.#createRepository(request);
    try {
      await this.#persistence.getRepo({ repoId: repoId(request) });
    } catch (error) {
      if (error instanceof RepositoryNotFoundError) {
        return null;
      }
      throw error;
    }

    const repo = await this.#persistence.getRepo({ repoId: repoId(request) });
    return repo ? repository : null;
  }

  async #ensureRepository(
    request: ObjectVcsDeckRepositoryRequest,
    initialCurrent: DeckPersistedState | null = null,
  ): Promise<ObjectVcsDeckRepository> {
    const repository = this.#createRepository(request);
    const existingRepo = await this.#persistence.getRepo({ repoId: repoId(request) });
    if (existingRepo) {
      return repository;
    }

    try {
      await repository.init({
        branch: defaultBranch,
        initialState: {
          deck: {
            current: initialCurrent,
            draft: null,
            version: null,
          },
        },
        commit: true,
        message: "Initial deck repository",
        author: this.#author,
      });
    } catch (error) {
      if (!(error instanceof RepositoryAlreadyExistsError)) {
        throw error;
      }
    }
    return repository;
  }

  #createRepository(request: ObjectVcsDeckRepositoryRequest): ObjectVcsDeckRepository {
    return createRepository({
      repoId: repoId(request),
      graph: deckObjectVcsGraph,
      schemaVersion: 1,
      graphVersion,
      schemaFingerprint: `manual:${graphVersion}`,
      schemaFingerprintAlgorithm: "manual",
      defaultBranch,
      persistence: this.#persistence,
    });
  }
}

function repoId(request: ObjectVcsDeckRepositoryRequest): string {
  return `${request.namespace}:${request.deckId}`;
}

function stripVersionLimits(request: CreateDeckVersionRequest): DeckVersionSnapshot {
  const { limits: _limits, ...snapshot } = request;
  return snapshot;
}

function currentFromVersion(version: DeckVersionSnapshot): DeckPersistedState {
  return {
    deckId: version.deckId,
    namespace: version.namespace,
    schemaVersion: 1,
    updatedAtIso: version.createdAtIso,
    source: version.source,
    sourceHash: version.sourceHash,
    selectedSlideId: version.selectedSlideId,
  };
}

function versionSummaryFromSnapshot(snapshot: DeckVersionSnapshot | null): DeckVersionSummary | null {
  if (!snapshot) {
    return null;
  }
  return {
    id: snapshot.id,
    deckId: snapshot.deckId,
    namespace: snapshot.namespace,
    schemaVersion: snapshot.schemaVersion,
    createdAtIso: snapshot.createdAtIso,
    label: snapshot.label,
    reason: snapshot.reason,
    sourceHash: snapshot.sourceHash,
    selectedSlideId: snapshot.selectedSlideId,
    compilerStatus: snapshot.compilerStatus,
    sizeBytes: JSON.stringify(snapshot).length,
  };
}

function versionTagName(versionId: string): string {
  return `${versionTagPrefix}${versionId}`;
}

function versionReasonLabel(reason: DeckVersionSnapshot["reason"]): string {
  if (reason === "autosave") {
    return "Autosave";
  }
  if (reason === "manual") {
    return "Manual version";
  }
  if (reason === "external-save") {
    return "External save";
  }
  if (reason === "crash-recovery") {
    return "Crash recovery";
  }
  if (reason.startsWith("before-")) {
    return "Safety checkpoint";
  }
  return "Import";
}

function failed(error: unknown): DeckPersistenceResult {
  return {
    status: "failed",
    diagnostics: [
      {
        code: "STORAGE_VERSION_CORRUPTED",
        severity: "warning",
        message: error instanceof Error ? error.message : "Unable to write deck state to Object VCS.",
      } satisfies DeckDiagnostic,
    ],
  };
}
