import type { LayoutRendererProps } from "../publicTypes";
type TitleSlotProps = {
    readonly slide: LayoutRendererProps["slide"];
    readonly name?: string;
    readonly className?: string;
    readonly variant?: "cover" | "section";
};
export declare function TitleSlot({ slide, name, className, variant, }: TitleSlotProps): React.ReactElement | null;
export {};
//# sourceMappingURL=TitleSlot.d.ts.map