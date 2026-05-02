import type React from "react";
export type DeckSource = {
    readonly uri?: string;
    readonly content: string;
};
export type DiagnosticSeverity = "error" | "warning" | "info";
export type SourcePosition = {
    readonly offset: number;
    readonly line: number;
    readonly column: number;
};
export type SourceRange = {
    readonly start: SourcePosition;
    readonly end: SourcePosition;
};
export type DiagnosticCode = "YAML_SYNTAX_ERROR" | "YAML_PARSE_WARNING" | "SCHEMA_UNKNOWN_FIELD" | "SCHEMA_MISSING_FIELD" | "SCHEMA_INVALID_VALUE" | "DECK_EMPTY_SLIDES" | "SLIDE_DUPLICATE_ID" | "SLIDE_UNKNOWN_LAYOUT" | "LAYOUT_MISSING_SLOT" | "LAYOUT_FORBIDDEN_SLOT" | "LAYOUT_UNASSIGNED_SLOT" | "ASSET_NOT_FOUND" | "MARKDOWN_UNSUPPORTED_HTML" | "MARKDOWN_INVALID_TABLE" | "MERMAID_PARSE_ERROR" | "RENDERER_UNKNOWN_KIND" | "RENDER_OVERFLOW_WARNING" | "PDF_UNSUPPORTED_RENDERER" | "STORAGE_QUOTA_EXCEEDED" | "STORAGE_VERSION_CORRUPTED";
export type RelatedDiagnostic = {
    readonly message: string;
    readonly range?: SourceRange;
};
export type DeckDiagnostic = {
    readonly code: DiagnosticCode;
    readonly severity: DiagnosticSeverity;
    readonly message: string;
    readonly path?: readonly string[];
    readonly range?: SourceRange;
    readonly slideId?: string;
    readonly hint?: string;
    readonly related?: readonly RelatedDiagnostic[];
};
export type DeckMetadata = {
    readonly title: string;
    readonly description?: string;
    readonly author?: string;
    readonly locale?: string;
};
export type AspectRatio = "16:9" | "4:3";
export type SlotName = string;
export type LayoutName = "cover" | "title-body" | "two-columns" | "image-only" | string;
export type LayoutCategory = "cover" | "text" | "visual" | "comparison" | "custom";
export type MarkdownBlockKind = "plain" | "heading" | "bullets" | "rich";
export type LayoutEditorDefinition = {
    readonly fieldGroups: readonly LayoutEditorFieldGroup[];
};
export type LayoutEditorFieldGroup = {
    readonly id: string;
    readonly label: string;
    readonly fields: readonly LayoutEditorField[];
};
export type LayoutEditorField = MarkdownEditorField | TextEditorField | ImageEditorField | SelectEditorField | BooleanEditorField | RendererEditorField;
export type MarkdownEditorField = {
    readonly kind: "markdown";
    readonly slotName: SlotName;
    readonly label: string;
    readonly required?: boolean;
    readonly minRows?: number;
    readonly blockKind?: MarkdownBlockKind;
};
export type TextEditorField = {
    readonly kind: "text";
    readonly path: readonly string[];
    readonly label: string;
    readonly required?: boolean;
};
export type ImageEditorField = {
    readonly kind: "image";
    readonly slotName: SlotName;
    readonly label: string;
    readonly required?: boolean;
};
export type SelectEditorField = {
    readonly kind: "select";
    readonly path: readonly string[];
    readonly label: string;
    readonly options: readonly SelectEditorOption[];
};
export type BooleanEditorField = {
    readonly kind: "boolean";
    readonly path: readonly string[];
    readonly label: string;
};
export type RendererEditorField = {
    readonly kind: "renderer";
    readonly slotName: SlotName;
    readonly label: string;
    readonly rendererKind: string;
};
export type SelectEditorOption = {
    readonly value: string;
    readonly label: string;
};
export type LayoutRendererTarget = "screen" | "thumbnail" | "print";
export type LayoutRendererProps = {
    readonly slide: CompiledSlide;
    readonly target: LayoutRendererTarget;
};
export type LayoutDefinition = {
    readonly name: LayoutName;
    readonly displayName: string;
    readonly description: string;
    readonly category: LayoutCategory;
    readonly requiredSlots: readonly SlotName[];
    readonly optionalSlots: readonly SlotName[];
    readonly forbiddenSlots: readonly SlotName[];
    readonly editor: LayoutEditorDefinition;
    readonly migrateFrom?: LayoutMigrationMap;
    readonly component: React.ComponentType<LayoutRendererProps>;
};
export type LayoutMigrationMap = Readonly<Record<string, LayoutMigrationPlan>>;
export type LayoutMigrationPlan = {
    readonly from: LayoutName;
    readonly to: LayoutName;
    readonly operations: readonly LayoutMigrationOperation[];
    readonly diagnostics: readonly DeckDiagnostic[];
};
export type LayoutMigrationOperation = {
    readonly kind: "move-slot";
    readonly from: SlotName;
    readonly to: SlotName;
} | {
    readonly kind: "drop-slot";
    readonly slotName: SlotName;
    readonly reason: string;
} | {
    readonly kind: "keep-unassigned";
    readonly slotName: SlotName;
    readonly reason: string;
};
export type LayoutRegistry = ReadonlyMap<LayoutName, LayoutDefinition>;
export type SlotKind = "markdown" | "image" | "renderer";
export type CompiledContent = {
    readonly kind: "markdown";
    readonly markdown: string;
    readonly nodes: readonly CompiledContentNode[];
} | {
    readonly kind: "image";
    readonly assetId?: string;
    readonly src?: string;
    readonly alt?: string;
} | {
    readonly kind: "renderer";
    readonly rendererKind: string;
    readonly props: Readonly<Record<string, unknown>>;
};
export type CompiledContentNode = {
    readonly kind: "markdown";
    readonly markdown: string;
} | {
    readonly kind: "code";
    readonly language?: string;
    readonly code: string;
} | {
    readonly kind: "mermaid";
    readonly chart: string;
};
export type CompiledSlot = {
    readonly name: SlotName;
    readonly kind: SlotKind;
    readonly content: CompiledContent;
    readonly diagnostics: readonly DeckDiagnostic[];
};
export type CompiledLayout = {
    readonly name: LayoutName;
    readonly definition: LayoutDefinition;
};
export type CompiledTransition = {
    readonly in: string;
    readonly out: string;
    readonly durationMs: number;
};
export type CompiledSlide = {
    readonly id: string;
    readonly index: number;
    readonly layout: CompiledLayout;
    readonly transition: CompiledTransition;
    readonly slots: ReadonlyMap<SlotName, CompiledSlot>;
    readonly diagnostics: readonly DeckDiagnostic[];
};
export type ThemeTokens = {
    readonly color: {
        readonly background: string;
        readonly foreground: string;
        readonly primary: string;
        readonly muted: string;
        readonly danger: string;
        readonly warning: string;
    };
    readonly font: {
        readonly heading: string;
        readonly body: string;
        readonly mono: string;
    };
    readonly spacing: {
        readonly slidePadding: string;
        readonly gap: string;
    };
    readonly radius: {
        readonly small: string;
        readonly medium: string;
        readonly large: string;
    };
};
export type ThemeDefinition = {
    readonly id: string;
    readonly displayName: string;
    readonly cssClassName: string;
    readonly tokens: ThemeTokens;
};
export type CompiledTheme = ThemeDefinition;
export type ThemeRegistry = ReadonlyMap<string, ThemeDefinition>;
export type TransitionDefinition = {
    readonly name: string;
    readonly displayName: string;
};
export type TransitionRegistry = ReadonlyMap<string, TransitionDefinition>;
export type AssetDefinition = {
    readonly type: "image";
    readonly src: string;
    readonly alt: string;
};
export type AssetRegistry = ReadonlyMap<string, AssetDefinition>;
export type ResolveImageAssetRequest = {
    readonly assetId?: string;
    readonly src?: string;
    readonly assets: AssetRegistry;
};
export type ResolvedImageAsset = {
    readonly src: string;
    readonly alt: string;
    readonly width?: number;
    readonly height?: number;
};
export interface AssetResolver {
    resolveImage(request: ResolveImageAssetRequest): Promise<ResolvedImageAsset>;
}
export type ContentRendererPlugin<TNode extends CompiledContentNode = CompiledContentNode> = {
    readonly kind: TNode["kind"];
    readonly render: React.ComponentType<{
        readonly node: TNode;
    }>;
};
export type RendererRegistry = ReadonlyMap<string, ContentRendererPlugin>;
export type CompiledDeck = {
    readonly version: 1;
    readonly metadata: DeckMetadata;
    readonly theme: CompiledTheme;
    readonly aspectRatio: AspectRatio;
    readonly assets: AssetRegistry;
    readonly slides: readonly CompiledSlide[];
};
export type DebugDeckViewModel = {
    readonly source: DeckSource;
    readonly title: string;
    readonly diagnostics: readonly DeckDiagnostic[];
};
export type CompileDeckResult = {
    readonly status: "valid";
    readonly deck: CompiledDeck;
    readonly diagnostics: readonly [];
} | {
    readonly status: "degraded";
    readonly deck: CompiledDeck;
    readonly diagnostics: readonly DeckDiagnostic[];
} | {
    readonly status: "invalid";
    readonly fallback: DebugDeckViewModel;
    readonly diagnostics: readonly DeckDiagnostic[];
};
export type CompileContext = {
    readonly runtime: DeckRuntime;
    readonly mode: "viewer" | "editor" | "print" | "thumbnail";
    readonly locale: string;
};
export type DeckRuntime = {
    readonly layouts: LayoutRegistry;
    readonly renderers: RendererRegistry;
    readonly themes: ThemeRegistry;
    readonly transitions: TransitionRegistry;
    readonly assets: AssetResolver;
    readonly storage?: DeckPersistenceAdapter;
    readonly pdf?: PdfExportAdapter;
};
export type CreateDeckRuntimeOptions = {
    readonly layouts?: readonly LayoutDefinition[];
    readonly renderers?: readonly ContentRendererPlugin[];
    readonly themes?: readonly ThemeDefinition[];
    readonly transitions?: readonly TransitionDefinition[];
    readonly storage?: DeckPersistenceAdapter;
    readonly pdf?: PdfExportAdapter;
};
export type DeckStudioResponsiveMode = "auto" | "desktop" | "compact" | "mobile";
export type DeckStudioProps = ControlledDeckStudioProps | UncontrolledDeckStudioProps;
export type ControlledDeckStudioProps = DeckStudioSharedProps & {
    readonly mode: "controlled";
    readonly value: DeckSource;
    readonly onChange: (nextSource: DeckSource, event: DeckSourceChangeEvent) => void;
    readonly initialValue?: never;
};
export type UncontrolledDeckStudioProps = DeckStudioSharedProps & {
    readonly mode?: "uncontrolled";
    readonly initialValue: DeckSource;
    readonly onChange?: (nextSource: DeckSource, event: DeckSourceChangeEvent) => void;
    readonly value?: never;
};
export type DeckStudioSharedProps = {
    readonly deckId: string;
    readonly namespace?: string;
    readonly runtime?: DeckRuntime;
    readonly readOnly?: boolean;
    readonly locale?: string;
    readonly responsiveMode?: DeckStudioResponsiveMode;
    readonly layout?: DeckStudioLayoutOptions;
    readonly storage?: false | DeckStorageConfig;
    readonly autosave?: false | DeckAutosaveConfig;
    readonly features?: DeckStudioFeatureFlags;
    readonly initialSelectedSlideId?: string;
    readonly onCompile?: (result: CompileDeckResult) => void;
    readonly onSave?: (event: DeckSaveEvent) => void;
    readonly onRestoreVersion?: (event: DeckRestoreVersionEvent) => void;
    readonly onSelectedSlideChange?: (event: DeckSelectedSlideChangeEvent) => void;
    readonly onUserAction?: (event: DeckUserAction) => void;
    readonly onPdfExportRequest?: (event: DeckPdfExportRequestEvent) => void;
    readonly onError?: (error: DeckRuntimeError) => void;
};
export type DeckStudioLayoutOptions = {
    readonly desktopBreakpointPx?: number;
    readonly slideRailWidthPx?: number;
    readonly inspectorWidthPx?: number;
    readonly showInspector?: boolean;
    readonly showActiveSlidePreview?: boolean;
    readonly showSourceModeToggle?: boolean;
    readonly showVersionHistory?: boolean;
    readonly showDiagnosticsPanel?: boolean;
    readonly density?: "compact" | "comfortable";
};
export type DeckStudioFeatureFlags = {
    readonly allowAddSlide?: boolean;
    readonly allowDuplicateSlide?: boolean;
    readonly allowDeleteSlide?: boolean;
    readonly allowReorderSlides?: boolean;
    readonly allowLayoutChange?: boolean;
    readonly allowThemeChange?: boolean;
    readonly allowRawSourceEdit?: boolean;
    readonly allowPdfExport?: boolean;
    readonly allowVersionRestore?: boolean;
    readonly allowVersionCompare?: boolean;
};
export type DeckSourceChangeReason = "slide-field-edit" | "slide-add" | "slide-duplicate" | "slide-delete" | "slide-reorder" | "layout-change" | "theme-change" | "metadata-edit" | "raw-source-edit" | "version-restore" | "crash-recovery";
export type DeckSourceChangeEvent = {
    readonly reason: DeckSourceChangeReason;
    readonly deckId: string;
    readonly selectedSlideId?: string;
    readonly sourceHash: string;
    readonly createdAtIso: string;
};
export type DeckSaveEvent = {
    readonly deckId: string;
    readonly sourceHash: string;
    readonly createdAtIso: string;
};
export type DeckRestoreVersionEvent = {
    readonly deckId: string;
    readonly versionId: string;
    readonly createdAtIso: string;
};
export type DeckSelectedSlideChangeEvent = {
    readonly deckId: string;
    readonly slideId: string;
};
export type DeckPdfExportRequestEvent = {
    readonly deckId: string;
    readonly request: PdfExportRequest;
};
export type DeckRuntimeError = {
    readonly message: string;
    readonly cause?: unknown;
};
export type DeckShowProps = {
    readonly deck: CompiledDeck;
    readonly initialSlideId?: string;
    readonly mode?: "viewer" | "presenter" | "embedded";
    readonly onAction?: (event: DeckUserAction, state: DeckRuntimeState) => void;
    readonly onSlideChange?: (event: SlideChangeEvent) => void;
    readonly onDiagnosticClick?: (diagnostic: DeckDiagnostic) => void;
};
export type DeckRuntimeState = {
    readonly activeSlideId: string;
    readonly activeSlideIndex: number;
};
export type DeckUserAction = {
    readonly type: "next-slide" | "previous-slide" | "go-to-slide" | "toggle-fullscreen" | "pdf-export";
    readonly origin: ActionOrigin;
    readonly slideId?: string;
    readonly createdAtIso: string;
};
export type ActionOrigin = "keyboard" | "mouse" | "touch" | "programmatic";
export type SlideChangeEvent = {
    readonly previousSlideId?: string;
    readonly activeSlideId: string;
    readonly activeSlideIndex: number;
};
export type DeckStorageConfig = {
    readonly adapter?: DeckPersistenceAdapter;
    readonly namespace?: string;
    readonly maxVersionsPerDeck?: number;
    readonly maxAutosaveVersionsPerDeck?: number;
    readonly maxBytesPerDeck?: number;
    readonly saveDraftOnChange?: boolean;
    readonly createVersionOnManualSave?: boolean;
    readonly createVersionBeforeDestructiveAction?: boolean;
    readonly recoverOnMount?: boolean;
};
export type DeckAutosaveConfig = {
    readonly draftDebounceMs?: number;
    readonly versionIntervalMs?: number;
    readonly minChangeDistanceForVersion?: number;
    readonly createVersionOnValidDeckOnly?: boolean;
};
export interface DeckPersistenceAdapter {
    loadCurrent(request: LoadCurrentDeckRequest): Promise<DeckPersistedState | null>;
    saveCurrent(request: SaveCurrentDeckRequest): Promise<DeckPersistenceResult>;
    saveDraft(request: SaveDraftRequest): Promise<DeckPersistenceResult>;
    loadDraft(request: LoadDraftRequest): Promise<DeckDraftSnapshot | null>;
    clearDraft(request: ClearDraftRequest): Promise<DeckPersistenceResult>;
    createVersion(request: CreateDeckVersionRequest): Promise<DeckPersistenceResult>;
    listVersions(request: ListDeckVersionsRequest): Promise<readonly DeckVersionSummary[]>;
    loadVersion(request: LoadDeckVersionRequest): Promise<DeckVersionSnapshot | null>;
    deleteVersion(request: DeleteDeckVersionRequest): Promise<DeckPersistenceResult>;
}
export type DeckPersistenceResult = {
    readonly status: "success";
} | {
    readonly status: "failed";
    readonly diagnostics: readonly DeckDiagnostic[];
};
export type DeckPersistedState = {
    readonly deckId: string;
    readonly namespace: string;
    readonly schemaVersion: 1;
    readonly updatedAtIso: string;
    readonly source: DeckSource;
    readonly sourceHash: string;
    readonly selectedSlideId?: string;
};
export type DeckVersionReason = "manual" | "autosave" | "before-layout-change" | "before-slide-delete" | "before-version-restore" | "crash-recovery" | "import" | "external-save";
export type DeckDiagnosticSummary = {
    readonly code: DiagnosticCode;
    readonly severity: DiagnosticSeverity;
    readonly count: number;
};
export type DeckVersionSnapshot = {
    readonly id: string;
    readonly deckId: string;
    readonly namespace: string;
    readonly schemaVersion: 1;
    readonly createdAtIso: string;
    readonly label?: string;
    readonly reason: DeckVersionReason;
    readonly source: DeckSource;
    readonly sourceHash: string;
    readonly selectedSlideId?: string;
    readonly compilerStatus: "valid" | "degraded" | "invalid";
    readonly diagnosticsSummary: readonly DeckDiagnosticSummary[];
};
export type DeckVersionSummary = Omit<DeckVersionSnapshot, "source" | "diagnosticsSummary"> & {
    readonly sizeBytes: number;
};
export type DeckDraftSnapshot = {
    readonly deckId: string;
    readonly namespace: string;
    readonly schemaVersion: 1;
    readonly updatedAtIso: string;
    readonly sessionId: string;
    readonly source: DeckSource;
    readonly sourceHash: string;
    readonly selectedSlideId?: string;
    readonly compilerStatus: "valid" | "degraded" | "invalid";
};
export type LoadCurrentDeckRequest = {
    readonly deckId: string;
    readonly namespace: string;
};
export type SaveCurrentDeckRequest = DeckPersistedState;
export type SaveDraftRequest = DeckDraftSnapshot;
export type LoadDraftRequest = {
    readonly deckId: string;
    readonly namespace: string;
};
export type ClearDraftRequest = LoadDraftRequest;
export type CreateDeckVersionRequest = DeckVersionSnapshot & {
    readonly limits?: VersionCleanupLimits;
};
export type VersionCleanupLimits = {
    readonly maxVersionsPerDeck: number;
    readonly maxAutosaveVersionsPerDeck: number;
    readonly maxBytesPerDeck: number;
};
export type ListDeckVersionsRequest = {
    readonly deckId: string;
    readonly namespace: string;
};
export type LoadDeckVersionRequest = ListDeckVersionsRequest & {
    readonly versionId: string;
};
export type DeleteDeckVersionRequest = LoadDeckVersionRequest;
export type PdfExportAdapter = {
    exportDeck(request: PdfExportRequest, context: PdfExportContext): Promise<PdfExportResult>;
};
export type PdfExportContext = {
    readonly createdAtIso: string;
};
export type PdfExportRequest = {
    readonly deck: CompiledDeck;
    readonly filename?: string;
    readonly mode: "browser-print" | "client-raster";
};
export type PdfExportResult = {
    readonly status: "opened-print-dialog";
} | {
    readonly status: "blob";
    readonly blob: Blob;
} | {
    readonly status: "failed";
    readonly diagnostics: readonly DeckDiagnostic[];
};
//# sourceMappingURL=publicTypes.d.ts.map