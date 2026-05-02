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
export declare function CrashRecoveryDialog({ draft, current, versions, onRestoreDraft, onRestoreVersion, onPreviewDraft, onPreviewVersion, onCompareDraftWithCurrent, onCompareVersionWithCurrent, onCreateCopyFromDraft, onCreateCopyFromVersion, onDeleteDraft, onKeepCurrent, onOpenVersionHistory, }: CrashRecoveryDialogProps): React.ReactElement;
export {};
//# sourceMappingURL=CrashRecoveryDialog.d.ts.map