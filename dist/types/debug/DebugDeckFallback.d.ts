import type { DebugDeckViewModel } from "../publicTypes";
type DebugDeckFallbackProps = {
    readonly fallback: DebugDeckViewModel;
};
export declare function DebugDeckFallback({ fallback }: DebugDeckFallbackProps): React.ReactElement;
export declare function DiagnosticsList({ diagnostics, }: {
    readonly diagnostics: DebugDeckViewModel["diagnostics"];
}): React.ReactElement;
export {};
//# sourceMappingURL=DebugDeckFallback.d.ts.map