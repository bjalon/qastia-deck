import type { CompiledSlide, LayoutRendererTarget, RendererRegistry } from "../publicTypes";
type SlideRendererProps = {
    readonly slide: CompiledSlide;
    readonly target: LayoutRendererTarget;
    readonly renderers?: RendererRegistry;
};
export declare function SlideRenderer({ slide, target, renderers }: SlideRendererProps): React.ReactElement;
export {};
//# sourceMappingURL=SlideRenderer.d.ts.map