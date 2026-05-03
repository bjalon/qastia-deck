import type { DebugDeckViewModel } from "../publicTypes";
type DebugDeckFallbackProps = {
    readonly fallback: DebugDeckViewModel;
};
export declare function DebugDeckFallback({ fallback }: DebugDeckFallbackProps): React.ReactElement;
export declare function DiagnosticsList({ diagnostics, onDiagnosticClick, }: {
    readonly diagnostics: DebugDeckViewModel["diagnostics"];
    readonly onDiagnosticClick?: (diagnostic: DebugDeckViewModel["diagnostics"][number]) => void;
}): React.ReactElement;
export {};
//# sourceMappingURL=DebugDeckFallback.d.ts.map