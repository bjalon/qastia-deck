import type { CompiledContent, RendererRegistry } from "../publicTypes";
type ContentRendererProps = {
    readonly content: CompiledContent;
    readonly renderers?: RendererRegistry;
};
export declare const defaultRendererRegistry: RendererRegistry;
export declare function ContentRenderer({ content, renderers }: ContentRendererProps): React.ReactElement;
export {};
//# sourceMappingURL=ContentRenderer.d.ts.map