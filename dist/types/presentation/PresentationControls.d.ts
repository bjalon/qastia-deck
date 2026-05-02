type PresentationControlsProps = {
    readonly activeIndex: number;
    readonly slideCount: number;
    readonly onPrevious: () => void;
    readonly onNext: () => void;
    readonly onClose: () => void;
};
export declare function PresentationControls({ activeIndex, onClose, onNext, onPrevious, slideCount, }: PresentationControlsProps): React.ReactElement;
export {};
//# sourceMappingURL=PresentationControls.d.ts.map