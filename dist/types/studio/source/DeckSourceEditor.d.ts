import type { DeckDiagnostic } from "../../publicTypes";
export type DeckSourceEditorHandle = {
    readonly focusDiagnostic: (diagnostic: DeckDiagnostic) => void;
};
export type DeckSourceEditorProps = {
    readonly value: string;
    readonly diagnostics: readonly DeckDiagnostic[];
    readonly readOnly?: boolean;
    readonly onChange: (value: string) => void;
};
export declare const DeckSourceEditor: import("react").ForwardRefExoticComponent<DeckSourceEditorProps & import("react").RefAttributes<DeckSourceEditorHandle>>;
//# sourceMappingURL=DeckSourceEditor.d.ts.map