import { type PersistenceAdapter } from "@bjalon/object-vcs-core";
export type LocalStorageObjectVcsPersistenceOptions = {
    readonly namespace?: string;
    readonly now?: () => string;
};
export declare function localStorageObjectVcsPersistence<TState>(options?: LocalStorageObjectVcsPersistenceOptions): PersistenceAdapter<TState>;
//# sourceMappingURL=localStorageObjectVcsPersistence.d.ts.map