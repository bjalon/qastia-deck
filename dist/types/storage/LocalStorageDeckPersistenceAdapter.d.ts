import type { ClearDraftRequest, CreateDeckVersionRequest, DeckDraftSnapshot, DeckPersistedState, DeckPersistenceAdapter, DeckPersistenceResult, DeckVersionSnapshot, DeckVersionSummary, DeleteDeckVersionRequest, ListDeckVersionsRequest, LoadCurrentDeckRequest, LoadDeckVersionRequest, LoadDraftRequest, SaveCurrentDeckRequest, SaveDraftRequest } from "../publicTypes";
export declare class LocalStorageDeckPersistenceAdapter implements DeckPersistenceAdapter {
    loadCurrent(request: LoadCurrentDeckRequest): Promise<DeckPersistedState | null>;
    saveCurrent(request: SaveCurrentDeckRequest): Promise<DeckPersistenceResult>;
    saveDraft(request: SaveDraftRequest): Promise<DeckPersistenceResult>;
    loadDraft(request: LoadDraftRequest): Promise<DeckDraftSnapshot | null>;
    clearDraft(request: ClearDraftRequest): Promise<DeckPersistenceResult>;
    createVersion(request: CreateDeckVersionRequest): Promise<DeckPersistenceResult>;
    listVersions(request: ListDeckVersionsRequest): Promise<readonly DeckVersionSummary[]>;
    loadVersion(request: LoadDeckVersionRequest): Promise<DeckVersionSnapshot | null>;
    deleteVersion(request: DeleteDeckVersionRequest): Promise<DeckPersistenceResult>;
}
//# sourceMappingURL=LocalStorageDeckPersistenceAdapter.d.ts.map