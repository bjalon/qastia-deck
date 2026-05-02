import type { DeckVersionSummary } from "../../publicTypes";
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
export declare function VersionHistoryPanel({ versions, readOnly, canRestore, canCompare, onCreateManualVersion, onRestoreVersion, onDeleteVersion, onRenameVersion, onCompareWithCurrent, onCompareVersions, }: VersionHistoryPanelProps): React.ReactElement;
export {};
//# sourceMappingURL=VersionHistoryPanel.d.ts.map