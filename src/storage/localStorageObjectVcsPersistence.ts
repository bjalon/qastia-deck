import {
  BranchAlreadyExistsError,
  BranchNotFoundError,
  ConcurrencyConflictError,
  DirtyHeadError,
  PersistenceError,
  RepositoryAlreadyExistsError,
  RepositoryNotFoundError,
  RevisionNotFoundError,
  TagAlreadyExistsError,
  TagNotFoundError,
  TagRevisionMismatchError,
  type BranchRecord,
  type CreateBranchInput,
  type CreateRepoInput,
  type CreateRepoResult,
  type CreateRevisionInput,
  type CreateRevisionResult,
  type CreateTagInput,
  type DeleteTagInput,
  type DeleteTagResult,
  type GetBranchInput,
  type GetHeadInput,
  type GetRepoInput,
  type Head,
  type ListBranchesInput,
  type ListRevisionsInput,
  type ListTagsInput,
  type PersistenceAdapter,
  type ReadRevisionInput,
  type ReadRevisionStateInput,
  type RepoRecord,
  type ResetBranchInput,
  type RestoreRevisionInput,
  type RevisionRecord,
  type RevisionSummary,
  type StoredRevision,
  type TagRecord,
  type UpdateBranchInput,
  type WriteHeadInput,
  type WriteHeadResult,
} from "@bjalon/object-vcs-core";

type PersistedObjectVcsStore<TState> = {
  readonly schemaVersion: 1;
  readonly repos: Record<string, PersistedRepositoryStore<TState>>;
};

type PersistedRepositoryStore<TState> = {
  repo: RepoRecord;
  branches: Record<string, BranchRecord>;
  heads: Record<string, Head<TState>>;
  revisions: Record<string, StoredRevision<TState>>;
  tags: Record<string, TagRecord>;
};

export type LocalStorageObjectVcsPersistenceOptions = {
  readonly namespace?: string;
  readonly now?: () => string;
};

export function localStorageObjectVcsPersistence<TState>(
  options: LocalStorageObjectVcsPersistenceOptions = {},
): PersistenceAdapter<TState> {
  const namespace = options.namespace ?? "deck-runtime-object-vcs";
  const storageKey = `${namespace}:v1`;
  const now = options.now ?? (() => new Date().toISOString());

  function readStore(): PersistedObjectVcsStore<TState> {
    const raw = storage()?.getItem(storageKey);
    if (!raw) {
      return { schemaVersion: 1, repos: {} };
    }
    try {
      const parsed = JSON.parse(raw) as PersistedObjectVcsStore<TState>;
      return parsed.schemaVersion === 1 && isRecord(parsed.repos)
        ? parsed
        : { schemaVersion: 1, repos: {} };
    } catch {
      return { schemaVersion: 1, repos: {} };
    }
  }

  function writeStore(store: PersistedObjectVcsStore<TState>): void {
    const storageArea = storage();
    if (!storageArea) {
      throw new PersistenceError("localStorage is unavailable.");
    }
    storageArea.setItem(storageKey, JSON.stringify(store));
  }

  function mutateStore<TResult>(
    recipe: (store: PersistedObjectVcsStore<TState>) => TResult,
  ): TResult {
    const store = readStore();
    const result = recipe(store);
    writeStore(store);
    return result;
  }

  function getStore(repoId: string): PersistedRepositoryStore<TState> {
    const store = readStore().repos[repoId];
    if (!store) {
      throw new RepositoryNotFoundError(`Repository "${repoId}" was not found.`);
    }
    return store;
  }

  function getMutableStore(
    root: PersistedObjectVcsStore<TState>,
    repoId: string,
  ): PersistedRepositoryStore<TState> {
    const store = root.repos[repoId];
    if (!store) {
      throw new RepositoryNotFoundError(`Repository "${repoId}" was not found.`);
    }
    return store;
  }

  function getHeadOrThrow(
    store: PersistedRepositoryStore<TState>,
    branchName: string,
  ): Head<TState> {
    const head = store.heads[branchName];
    if (!head) {
      throw new BranchNotFoundError(`Branch "${branchName}" was not found.`);
    }
    return head;
  }

  function getBranchOrThrow(
    store: PersistedRepositoryStore<TState>,
    branchName: string,
  ): BranchRecord {
    const branch = store.branches[branchName];
    if (!branch) {
      throw new BranchNotFoundError(`Branch "${branchName}" was not found.`);
    }
    return branch;
  }

  function getRevisionOrThrow(
    store: PersistedRepositoryStore<TState>,
    revision: number,
  ): StoredRevision<TState> {
    const storedRevision = store.revisions[String(revision)];
    if (!storedRevision) {
      throw new RevisionNotFoundError(`Revision "${revision}" was not found.`);
    }
    return storedRevision;
  }

  function checkExpectedHeadHash(
    head: Head<TState>,
    expectedHeadHash: string | undefined,
  ): void {
    if (expectedHeadHash !== undefined && expectedHeadHash !== head.stateHash) {
      throw new ConcurrencyConflictError(
        `Expected HEAD hash "${expectedHeadHash}", got "${head.stateHash}".`,
      );
    }
  }

  function setCleanHead(
    store: PersistedRepositoryStore<TState>,
    branchName: string,
    state: TState,
    stateHash: string,
    revision: number,
    author: string | undefined,
  ): Head<TState> {
    const timestamp = now();
    const head: Head<TState> = {
      repoId: store.repo.repoId,
      branchName,
      status: "clean",
      headRevision: revision,
      baseRevision: revision,
      stateHash,
      state: cloneJson(state),
      updatedAt: timestamp,
      ...(author === undefined ? {} : { updatedBy: author }),
    };
    const branch = getBranchOrThrow(store, branchName);
    store.branches[branchName] = {
      ...branch,
      headRevision: revision,
      baseRevision: revision,
      headStateHash: stateHash,
      status: "clean",
      updatedAt: timestamp,
      ...(author === undefined ? {} : { updatedBy: author }),
    };
    store.heads[branchName] = head;
    return cloneJson(head);
  }

  const adapter: PersistenceAdapter<TState> = {
    async getRepo(input: GetRepoInput): Promise<RepoRecord | null> {
      return cloneOrNull(readStore().repos[input.repoId]?.repo ?? null);
    },

    async createRepo(input: CreateRepoInput<TState>): Promise<CreateRepoResult<TState>> {
      return mutateStore((root) => {
        if (root.repos[input.repoId]) {
          throw new RepositoryAlreadyExistsError(`Repository "${input.repoId}" already exists.`);
        }

        const timestamp = now();
        const repo: RepoRecord = {
          repoId: input.repoId,
          schemaVersion: input.schemaVersion,
          graphVersion: input.graphVersion,
          schemaFingerprint: input.schemaFingerprint,
          schemaFingerprintAlgorithm: input.schemaFingerprintAlgorithm,
          defaultBranch: input.defaultBranch,
          storageMode: input.storageMode,
          nextRevision: input.commit ? 2 : 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        const revisions: Record<string, StoredRevision<TState>> = {};
        let revision: RevisionRecord | undefined;

        if (input.commit) {
          revision = {
            repoId: input.repoId,
            revision: 1,
            parentRevision: null,
            branchName: input.defaultBranch,
            stateHash: input.stateHash,
            schemaVersion: input.schemaVersion,
            graphVersion: input.graphVersion,
            schemaFingerprint: input.schemaFingerprint,
            schemaFingerprintAlgorithm: input.schemaFingerprintAlgorithm,
            ...(input.message === undefined ? {} : { message: input.message }),
            createdAt: timestamp,
            ...(input.author === undefined ? {} : { createdBy: input.author }),
            isEmptyRevision: false,
            isCheckpoint: true,
            snapshotRef: input.stateHash,
          };
          revisions[String(revision.revision)] = {
            revision,
            state: cloneJson(input.initialState),
          };
        }

        const headRevision = revision?.revision ?? null;
        const branch: BranchRecord = {
          repoId: input.repoId,
          name: input.defaultBranch,
          headRevision,
          baseRevision: headRevision,
          headStateHash: input.stateHash,
          status: input.commit ? "clean" : "dirty",
          createdFromRevision: headRevision,
          createdAt: timestamp,
          updatedAt: timestamp,
          ...(input.author === undefined ? {} : { createdBy: input.author }),
          ...(input.author === undefined ? {} : { updatedBy: input.author }),
        };
        const head: Head<TState> = {
          repoId: input.repoId,
          branchName: input.defaultBranch,
          status: input.commit ? "clean" : "dirty",
          headRevision,
          baseRevision: headRevision,
          stateHash: input.stateHash,
          state: cloneJson(input.initialState),
          updatedAt: timestamp,
          ...(input.author === undefined ? {} : { updatedBy: input.author }),
        };
        const store: PersistedRepositoryStore<TState> = {
          repo,
          branches: { [input.defaultBranch]: branch },
          heads: { [input.defaultBranch]: head },
          revisions,
          tags: {},
        };
        root.repos[input.repoId] = store;

        return {
          repo: cloneJson(repo),
          head: cloneJson(head),
          ...(revision === undefined ? {} : { revision: cloneJson(revision) }),
        };
      });
    },

    async getBranch(input: GetBranchInput): Promise<BranchRecord | null> {
      return cloneOrNull(readStore().repos[input.repoId]?.branches[input.branchName] ?? null);
    },

    async getHead(input: GetHeadInput): Promise<Head<TState> | null> {
      return cloneOrNull(readStore().repos[input.repoId]?.heads[input.branchName] ?? null);
    },

    async listBranches(input: ListBranchesInput): Promise<BranchRecord[]> {
      return Object.values(getStore(input.repoId).branches).map(cloneJson);
    },

    async writeHead(input: WriteHeadInput<TState>): Promise<WriteHeadResult<TState>> {
      return mutateStore((root) => {
        const store = getMutableStore(root, input.repoId);
        const currentHead = getHeadOrThrow(store, input.branchName);
        if (input.concurrency !== "last-write-wins") {
          checkExpectedHeadHash(currentHead, input.expectedHeadHash);
        }
        const timestamp = now();
        const baseRevision = input.baseRevision ?? currentHead.baseRevision;
        const head: Head<TState> = {
          repoId: input.repoId,
          branchName: input.branchName,
          status: "dirty",
          headRevision: null,
          baseRevision,
          stateHash: input.stateHash,
          state: cloneJson(input.state),
          updatedAt: timestamp,
          ...(input.author === undefined ? {} : { updatedBy: input.author }),
        };
        const branch = getBranchOrThrow(store, input.branchName);
        store.branches[input.branchName] = {
          ...branch,
          headRevision: null,
          baseRevision,
          headStateHash: input.stateHash,
          status: "dirty",
          updatedAt: timestamp,
          ...(input.author === undefined ? {} : { updatedBy: input.author }),
        };
        store.heads[input.branchName] = head;
        return { head: cloneJson(head) };
      });
    },

    async createRevision(input: CreateRevisionInput<TState>): Promise<CreateRevisionResult<TState>> {
      return mutateStore((root) => {
        const store = getMutableStore(root, input.repoId);
        const currentHead = getHeadOrThrow(store, input.branchName);
        checkExpectedHeadHash(currentHead, input.expectedHeadHash);

        if (
          currentHead.status === "clean" &&
          currentHead.headRevision !== null &&
          currentHead.stateHash === input.stateHash &&
          input.allowEmpty !== true
        ) {
          const storedRevision = getRevisionOrThrow(store, currentHead.headRevision);
          return {
            revision: cloneJson(storedRevision.revision),
            head: cloneJson(currentHead),
            created: false,
          };
        }

        const revisionNumber = store.repo.nextRevision;
        const timestamp = now();
        const parentRevision =
          currentHead.status === "clean" ? currentHead.headRevision : currentHead.baseRevision;
        const parentHash =
          parentRevision === null
            ? null
            : getRevisionOrThrow(store, parentRevision).revision.stateHash;
        const revision: RevisionRecord = {
          repoId: input.repoId,
          revision: revisionNumber,
          parentRevision,
          branchName: input.branchName,
          stateHash: input.stateHash,
          schemaVersion: input.schemaVersion ?? store.repo.schemaVersion,
          graphVersion: input.graphIdentity?.graphVersion ?? input.graphVersion ?? store.repo.graphVersion,
          schemaFingerprint:
            input.graphIdentity?.schemaFingerprint ?? store.repo.schemaFingerprint,
          schemaFingerprintAlgorithm:
            input.graphIdentity?.schemaFingerprintAlgorithm ?? store.repo.schemaFingerprintAlgorithm,
          ...(input.message === undefined ? {} : { message: input.message }),
          createdAt: timestamp,
          ...(input.author === undefined ? {} : { createdBy: input.author }),
          isEmptyRevision: parentHash === input.stateHash,
          isCheckpoint: true,
          snapshotRef: input.stateHash,
        };
        store.revisions[String(revisionNumber)] = {
          revision,
          state: cloneJson(input.state),
        };
        store.repo = {
          ...store.repo,
          schemaVersion: input.schemaVersion ?? store.repo.schemaVersion,
          graphVersion: input.graphIdentity?.graphVersion ?? input.graphVersion ?? store.repo.graphVersion,
          schemaFingerprint:
            input.graphIdentity?.schemaFingerprint ?? store.repo.schemaFingerprint,
          schemaFingerprintAlgorithm:
            input.graphIdentity?.schemaFingerprintAlgorithm ?? store.repo.schemaFingerprintAlgorithm,
          nextRevision: revisionNumber + 1,
          updatedAt: timestamp,
        };
        const head = setCleanHead(
          store,
          input.branchName,
          input.state,
          input.stateHash,
          revisionNumber,
          input.author,
        );
        return {
          revision: cloneJson(revision),
          head,
          created: true,
        };
      });
    },

    async readRevision(input: ReadRevisionInput): Promise<StoredRevision<TState> | null> {
      return cloneOrNull(readStore().repos[input.repoId]?.revisions[String(input.revision)] ?? null);
    },

    async readRevisionState(input: ReadRevisionStateInput): Promise<TState | null> {
      return cloneOrNull(readStore().repos[input.repoId]?.revisions[String(input.revision)]?.state ?? null);
    },

    async listRevisions(input: ListRevisionsInput): Promise<RevisionSummary[]> {
      const revisions = Object.values(getStore(input.repoId).revisions)
        .map((storedRevision) => storedRevision.revision)
        .filter((revision) => input.branchName === undefined || revision.branchName === input.branchName)
        .filter((revision) => input.after === undefined || revision.revision > input.after)
        .sort((left, right) =>
          input.order === "asc" ? left.revision - right.revision : right.revision - left.revision,
        );
      return revisions.slice(0, input.limit).map(cloneJson);
    },

    async createTag(input: CreateTagInput): Promise<TagRecord> {
      return mutateStore((root) => {
        const store = getMutableStore(root, input.repoId);
        if (store.tags[input.name] && input.overwrite !== true) {
          throw new TagAlreadyExistsError(`Tag "${input.name}" already exists.`);
        }

        const branchName = input.branchName ?? store.repo.defaultBranch;
        let revision =
          input.revision === undefined || input.revision === "HEAD"
            ? getHeadOrThrow(store, branchName).headRevision
            : input.revision;

        if (input.revision === undefined || input.revision === "HEAD") {
          const head = getHeadOrThrow(store, branchName);
          if (head.status === "dirty") {
            if (input.createRevisionIfDirty === false) {
              throw new DirtyHeadError("Cannot tag a dirty HEAD when createRevisionIfDirty is false.");
            }

            const revisionNumber = store.repo.nextRevision;
            const timestamp = now();
            const parentRevision = head.baseRevision;
            const parentHash =
              parentRevision === null
                ? null
                : getRevisionOrThrow(store, parentRevision).revision.stateHash;
            const revisionRecord: RevisionRecord = {
              repoId: input.repoId,
              revision: revisionNumber,
              parentRevision,
              branchName,
              stateHash: head.stateHash,
              schemaVersion: store.repo.schemaVersion,
              graphVersion: store.repo.graphVersion,
              schemaFingerprint: store.repo.schemaFingerprint,
              schemaFingerprintAlgorithm: store.repo.schemaFingerprintAlgorithm,
              message: `Create revision for tag ${input.name}`,
              createdAt: timestamp,
              ...(input.author === undefined ? {} : { createdBy: input.author }),
              isEmptyRevision: parentHash === head.stateHash,
              isCheckpoint: true,
              snapshotRef: head.stateHash,
            };
            store.revisions[String(revisionNumber)] = {
              revision: revisionRecord,
              state: cloneJson(head.state),
            };
            store.repo = {
              ...store.repo,
              nextRevision: revisionNumber + 1,
              updatedAt: timestamp,
            };
            setCleanHead(store, branchName, head.state, head.stateHash, revisionNumber, input.author);
            revision = revisionNumber;
          }
        }

        if (revision === null) {
          throw new RevisionNotFoundError("Cannot tag a dirty HEAD directly.");
        }

        getRevisionOrThrow(store, revision);
        const tag: TagRecord = {
          repoId: input.repoId,
          name: input.name,
          revision,
          ...(input.annotation === undefined ? {} : { annotation: input.annotation }),
          createdAt: now(),
          ...(input.author === undefined ? {} : { createdBy: input.author }),
        };
        store.tags[input.name] = tag;
        return cloneJson(tag);
      });
    },

    async listTags(input: ListTagsInput): Promise<TagRecord[]> {
      return Object.values(getStore(input.repoId).tags).map(cloneJson);
    },

    async deleteTag(input: DeleteTagInput): Promise<DeleteTagResult> {
      return mutateStore((root) => {
        const store = getMutableStore(root, input.repoId);
        const tag = store.tags[input.name];
        if (!tag) {
          if ((input.missing ?? "throw") === "ignore") {
            return {
              deleted: false,
              name: input.name,
              previousRevision: null,
            };
          }
          throw new TagNotFoundError(`Tag "${input.name}" was not found.`);
        }
        if (input.expectedRevision !== undefined && tag.revision !== input.expectedRevision) {
          throw new TagRevisionMismatchError(
            `Tag "${input.name}" points to revision "${tag.revision}", not "${input.expectedRevision}".`,
          );
        }
        delete store.tags[input.name];
        return {
          deleted: true,
          name: input.name,
          previousRevision: tag.revision,
        };
      });
    },

    async createBranch(input: CreateBranchInput): Promise<BranchRecord> {
      return mutateStore((root) => {
        const store = getMutableStore(root, input.repoId);
        if (store.branches[input.name]) {
          throw new BranchAlreadyExistsError(`Branch "${input.name}" already exists.`);
        }
        const sourceRevision =
          input.from === "HEAD"
            ? getHeadOrThrow(store, input.sourceBranch ?? store.repo.defaultBranch).headRevision
            : input.from;
        if (sourceRevision === null) {
          throw new RevisionNotFoundError("Cannot create a branch from a dirty HEAD.");
        }
        const source = getRevisionOrThrow(store, sourceRevision);
        const timestamp = now();
        const branch: BranchRecord = {
          repoId: input.repoId,
          name: input.name,
          headRevision: sourceRevision,
          baseRevision: sourceRevision,
          headStateHash: source.revision.stateHash,
          status: "clean",
          createdFromRevision: sourceRevision,
          createdAt: timestamp,
          updatedAt: timestamp,
          ...(input.author === undefined ? {} : { createdBy: input.author }),
          ...(input.author === undefined ? {} : { updatedBy: input.author }),
        };
        const head: Head<TState> = {
          repoId: input.repoId,
          branchName: input.name,
          status: "clean",
          headRevision: sourceRevision,
          baseRevision: sourceRevision,
          stateHash: source.revision.stateHash,
          state: cloneJson(source.state),
          updatedAt: timestamp,
          ...(input.author === undefined ? {} : { updatedBy: input.author }),
        };
        store.branches[input.name] = branch;
        store.heads[input.name] = head;
        return cloneJson(branch);
      });
    },

    async updateBranch(input: UpdateBranchInput): Promise<BranchRecord> {
      return mutateStore((root) => {
        const store = getMutableStore(root, input.repoId);
        const branch = getBranchOrThrow(store, input.branchName);
        const updatedBranch: BranchRecord = {
          ...branch,
          headRevision: input.headRevision,
          baseRevision: input.baseRevision,
          headStateHash: input.headStateHash,
          status: input.status,
          updatedAt: now(),
          ...(input.author === undefined ? {} : { updatedBy: input.author }),
        };
        store.branches[input.branchName] = updatedBranch;
        return cloneJson(updatedBranch);
      });
    },

    async restoreRevision(input: RestoreRevisionInput<TState>): Promise<WriteHeadResult<TState>> {
      if (input.commit === true) {
        const result = await adapter.createRevision({
          repoId: input.repoId,
          branchName: input.branchName,
          state: input.state,
          stateHash: input.stateHash,
          ...(input.message === undefined ? {} : { message: input.message }),
          ...(input.author === undefined ? {} : { author: input.author }),
          ...(input.expectedHeadHash === undefined ? {} : { expectedHeadHash: input.expectedHeadHash }),
        });
        return { head: result.head };
      }

      return adapter.writeHead({
        repoId: input.repoId,
        branchName: input.branchName,
        state: input.state,
        stateHash: input.stateHash,
        ...(input.author === undefined ? {} : { author: input.author }),
        ...(input.expectedHeadHash === undefined ? {} : { expectedHeadHash: input.expectedHeadHash }),
      });
    },

    async resetBranch(input: ResetBranchInput): Promise<BranchRecord> {
      if (input.mode !== "hard") {
        throw new PersistenceError('resetBranch only supports mode "hard".');
      }
      return mutateStore((root) => {
        const store = getMutableStore(root, input.repoId);
        const currentHead = getHeadOrThrow(store, input.branchName);
        checkExpectedHeadHash(currentHead, input.expectedHeadHash);
        const revision = getRevisionOrThrow(store, input.to);
        setCleanHead(
          store,
          input.branchName,
          revision.state,
          revision.revision.stateHash,
          input.to,
          input.author,
        );
        return cloneJson(getBranchOrThrow(store, input.branchName));
      });
    },

    subscribeHead(input, callback) {
      void adapter.getHead(input).then((head) => {
        if (head) {
          callback(head);
        }
      });
      return () => undefined;
    },

    subscribeRevisions(input, callback) {
      void adapter.listRevisions(input).then(callback);
      return () => undefined;
    },

    subscribeTags(input, callback) {
      void adapter.listTags(input).then(callback);
      return () => undefined;
    },

    subscribeBranches(input, callback) {
      void adapter.listBranches(input).then(callback);
      return () => undefined;
    },
  };

  return adapter;
}

function storage(): Storage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

function cloneJson<TValue>(value: TValue): TValue {
  return JSON.parse(JSON.stringify(value)) as TValue;
}

function cloneOrNull<TValue>(value: TValue | null): TValue | null {
  return value === null ? null : cloneJson(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
