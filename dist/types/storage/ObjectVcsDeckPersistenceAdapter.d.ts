import { type BranchRecord, type Head, type ObjectVcsRepository, type PersistenceAdapter, type RevisionSummary, type TagRecord } from "@bjalon/object-vcs-core";
import type { ClearDraftRequest, CreateDeckVersionRequest, DeckDraftSnapshot, DeckPersistedState, DeckPersistenceAdapter, DeckPersistenceResult, DeckVersionSnapshot, DeckVersionSummary, DeleteDeckVersionRequest, ListDeckVersionsRequest, LoadCurrentDeckRequest, LoadDeckVersionRequest, LoadDraftRequest, SaveCurrentDeckRequest, SaveDraftRequest } from "../publicTypes";
export type ObjectVcsDeckState = {
    readonly current: DeckPersistedState | null;
    readonly draft: DeckDraftSnapshot | null;
    readonly version: DeckVersionSnapshot | null;
};
export type ObjectVcsDeckRepository = ObjectVcsRepository<{
    deck: ObjectVcsDeckState;
}>;
export type ObjectVcsDeckRepositoryRequest = {
    readonly deckId: string;
    readonly namespace: string;
};
export type ObjectVcsDeckHistory = {
    readonly head: Head<{
        deck: ObjectVcsDeckState;
    }> | null;
    readonly revisions: readonly RevisionSummary[];
    readonly tags: readonly TagRecord[];
    readonly branches: readonly BranchRecord[];
};
export type ObjectVcsDeckPersistenceAdapterOptions = {
    readonly persistence?: PersistenceAdapter<{
        deck: ObjectVcsDeckState;
    }>;
    readonly author?: string;
    readonly storageNamespace?: string;
};
export declare class ObjectVcsDeckPersistenceAdapter implements DeckPersistenceAdapter {
    #private;
    constructor(options?: ObjectVcsDeckPersistenceAdapterOptions);
    loadCurrent(request: LoadCurrentDeckRequest): Promise<DeckPersistedState | null>;
    saveCurrent(request: SaveCurrentDeckRequest): Promise<DeckPersistenceResult>;
    saveDraft(request: SaveDraftRequest): Promise<DeckPersistenceResult>;
    loadDraft(request: LoadDraftRequest): Promise<DeckDraftSnapshot | null>;
    clearDraft(request: ClearDraftRequest): Promise<DeckPersistenceResult>;
    createVersion(request: CreateDeckVersionRequest): Promise<DeckPersistenceResult>;
    listVersions(request: ListDeckVersionsRequest): Promise<readonly DeckVersionSummary[]>;
    loadVersion(request: LoadDeckVersionRequest): Promise<DeckVersionSnapshot | null>;
    deleteVersion(request: DeleteDeckVersionRequest): Promise<DeckPersistenceResult>;
    getRepository(request: ObjectVcsDeckRepositoryRequest): Promise<ObjectVcsDeckRepository>;
    getHistory(request: ObjectVcsDeckRepositoryRequest): Promise<ObjectVcsDeckHistory>;
    restoreRevision(request: ObjectVcsDeckRepositoryRequest & {
        readonly revision: number;
    }): Promise<DeckVersionSnapshot | null>;
}
//# sourceMappingURL=ObjectVcsDeckPersistenceAdapter.d.ts.map