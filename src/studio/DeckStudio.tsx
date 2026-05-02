import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { compileDeck } from "../compiler/compileDeck";
import { summarizeDiagnostics } from "../compiler/diagnostics";
import { hashSource } from "../compiler/hash";
import { DebugDeckFallback, DiagnosticsList } from "../debug/DebugDeckFallback";
import type {
  CompileDeckResult,
  CompiledSlide,
  DeckSource,
  DeckSourceChangeEvent,
  DeckSourceChangeReason,
  DeckStudioProps,
  DeckStudioViewMode,
  DeckVersionReason,
  DeckVersionSummary,
} from "../publicTypes";
import { defaultDeckRuntime } from "../runtime/defaultDeckRuntime";
import { deckThemeStyle } from "../runtime/themeStyle";
import { SlideRenderer } from "../slideshow/SlideRenderer";
import {
  defaultDeckAutosaveConfig,
  defaultDeckStorageConfig,
  defaultDeckStudioFeatureFlags,
  defaultDeckStudioLayoutOptions,
} from "./defaultStudioOptions";
import {
  addSlide,
  deleteSlide,
  duplicateSlide,
  getDefaultSlotMarkdown,
  hasDefaultSlot,
  moveSlide,
  type SlideMovePlacement,
  updateSlideLayout,
} from "./editableSource";
import { SlideFormEditor } from "./form/SlideFormEditor";
import { GlobalDefaultsDialog } from "./global/GlobalDefaultsDialog";

export function DeckStudio(props: DeckStudioProps): React.ReactElement {
  const {
    autosave,
    deckId,
    features: featuresProps,
    initialSelectedSlideId,
    layout: layoutProps,
    locale = "fr-FR",
    namespace,
    onChange,
    onCompile,
    onError,
    onRestoreVersion,
    onSave,
    onSelectedSlideChange,
    readOnly,
    storage,
  } = props;
  const studioOptions = props.options;
  const runtime = props.runtime ?? defaultDeckRuntime;
  const controlled = props.mode === "controlled";
  const [internalSource, setInternalSource] = useState<DeckSource>(
    controlled ? props.value : props.initialValue,
  );
  const source = controlled ? props.value : internalSource;
  const [compileResult, setCompileResult] = useState<CompileDeckResult | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | undefined>(
    initialSelectedSlideId,
  );
  const [viewMode, setViewMode] = useState<DeckStudioViewMode>(
    studioOptions?.editing?.defaultMode ?? "form",
  );
  const [globalDefaultsOpen, setGlobalDefaultsOpen] = useState(false);
  const [slideDragState, setSlideDragState] = useState<{
    readonly draggedSlideId: string;
    readonly targetSlideId?: string;
    readonly placement?: SlideMovePlacement;
  } | null>(null);
  const [versions, setVersions] = useState<readonly DeckVersionSummary[]>([]);
  const mainRef = useRef<HTMLElement | null>(null);
  const onCompileRef = useRef(onCompile);
  const onErrorRef = useRef(onError);
  const focusEditorAfterSlideSelectRef = useRef(false);

  onCompileRef.current = onCompile;
  onErrorRef.current = onError;

  const layoutOptions = useMemo(() => {
    const nextOptions = { ...defaultDeckStudioLayoutOptions, ...layoutProps };
    const panels = studioOptions?.panels;

    if (panels?.slideRail === false) {
      nextOptions.showSlideRail = false;
    } else if (panels?.slideRail) {
      nextOptions.showSlideRail = panels.slideRail.visibleDefault ?? nextOptions.showSlideRail;
      nextOptions.slideRailWidthPx = panels.slideRail.widthPx ?? nextOptions.slideRailWidthPx;
    }

    if (panels?.inspector === false) {
      nextOptions.showInspector = false;
    } else if (panels?.inspector) {
      nextOptions.showInspector = panels.inspector.visibleDefault ?? nextOptions.showInspector;
      nextOptions.inspectorWidthPx = panels.inspector.widthPx ?? nextOptions.inspectorWidthPx;
    }

    if (panels?.diagnostics === false) {
      nextOptions.showDiagnosticsPanel = false;
    } else if (panels?.diagnostics) {
      nextOptions.showDiagnosticsPanel = panels.diagnostics.visibleDefault ?? nextOptions.showDiagnosticsPanel;
    }

    if (panels?.activeSlidePreview === false) {
      nextOptions.showActiveSlidePreview = false;
    } else if (panels?.activeSlidePreview) {
      nextOptions.showActiveSlidePreview =
        panels.activeSlidePreview.visibleDefault ?? nextOptions.showActiveSlidePreview;
    }

    if (panels?.versionHistory === false) {
      nextOptions.showVersionHistory = false;
    } else if (panels?.versionHistory) {
      nextOptions.showVersionHistory = panels.versionHistory.visibleDefault ?? nextOptions.showVersionHistory;
    }

    if (studioOptions?.editing?.allowSourceMode === false) {
      nextOptions.showSourceModeToggle = false;
    }

    return nextOptions;
  }, [layoutProps, studioOptions]);
  const features = useMemo(() => {
    const nextFeatures = { ...defaultDeckStudioFeatureFlags, ...featuresProps };

    if (studioOptions?.editing?.allowSourceMode !== undefined) {
      nextFeatures.allowRawSourceEdit = studioOptions.editing.allowSourceMode;
    }

    if (studioOptions?.editing?.allowLayoutChange !== undefined) {
      nextFeatures.allowLayoutChange = studioOptions.editing.allowLayoutChange;
    }

    if (studioOptions?.layoutSelector?.enabled !== undefined) {
      nextFeatures.allowLayoutChange = studioOptions.layoutSelector.enabled;
    }

    if (studioOptions?.panels?.slideRail) {
      if (studioOptions.panels.slideRail.allowReorder !== undefined) {
        nextFeatures.allowReorderSlides = studioOptions.panels.slideRail.allowReorder;
      }
      if (studioOptions.panels.slideRail.allowAddDelete !== undefined) {
        nextFeatures.allowAddSlide = studioOptions.panels.slideRail.allowAddDelete;
        nextFeatures.allowDeleteSlide = studioOptions.panels.slideRail.allowAddDelete;
      }
    }

    return nextFeatures;
  }, [featuresProps, studioOptions]);
  const availableViewModes = useMemo<readonly DeckStudioViewMode[]>(() => {
    const configuredModes = studioOptions?.editing?.viewModes ?? ["form", "source", "preview"];
    const uniqueModes = configuredModes.filter(
      (mode, index, modes): mode is DeckStudioViewMode =>
        (mode === "form" || mode === "source" || mode === "preview") && modes.indexOf(mode) === index,
    );
    const nextModes = uniqueModes.filter((mode) => mode !== "source" || features.allowRawSourceEdit);
    return nextModes.length > 0 ? nextModes : ["form"];
  }, [features.allowRawSourceEdit, studioOptions]);
  const storageConfig = useMemo(
    () =>
      storage === false
        ? undefined
        : {
          ...defaultDeckStorageConfig,
            namespace: namespace ?? storage?.namespace ?? defaultDeckStorageConfig.namespace,
            adapter: storage?.adapter ?? runtime.storage ?? defaultDeckStorageConfig.adapter,
            ...storage,
          },
    [namespace, runtime.storage, storage],
  );
  const autosaveConfig = useMemo(
    () => (autosave === false ? undefined : { ...defaultDeckAutosaveConfig, ...autosave }),
    [autosave],
  );

  const compiledDeck = compileResult?.status === "valid" || compileResult?.status === "degraded"
    ? compileResult.deck
    : undefined;
  const selectedSlide = compiledDeck?.slides.find((slide) => slide.id === selectedSlideId) ?? compiledDeck?.slides[0];
  const inheritedMarkdownSlots = useMemo(() => {
    const inheritedSlots = new Map<string, string>();

    for (const slotName of ["eyebrow", "footer"] as const) {
      if (hasDefaultSlot(source, slotName)) {
        inheritedSlots.set(slotName, getDefaultSlotMarkdown(source, slotName));
      }
    }

    return inheritedSlots;
  }, [source]);

  const publishSource = useCallback(
    (nextSource: DeckSource, reason: DeckSourceChangeReason, nextSelectedSlideId?: string): void => {
      const event: DeckSourceChangeEvent = {
        reason,
        deckId,
        selectedSlideId: nextSelectedSlideId ?? selectedSlideId,
        sourceHash: hashSource(nextSource.content),
        createdAtIso: new Date().toISOString(),
      };

      if (!controlled) {
        setInternalSource(nextSource);
      }
      onChange?.(nextSource, event);
    },
    [controlled, deckId, onChange, selectedSlideId],
  );

  useEffect(() => {
    let cancelled = false;

    compileDeck(source, {
      runtime,
      mode: "editor",
      locale,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }
        setCompileResult(result);
        onCompileRef.current?.(result);
      })
      .catch((error: unknown) => {
        onErrorRef.current?.({
          message: error instanceof Error ? error.message : "Deck compilation failed.",
          cause: error,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [locale, runtime, source]);

  useEffect(() => {
    if (!compiledDeck || selectedSlideId) {
      return;
    }

    const firstSlide = compiledDeck.slides[0];
    if (firstSlide) {
      setSelectedSlideId(firstSlide.id);
    }
  }, [compiledDeck, selectedSlideId]);

  useEffect(() => {
    if (!storageConfig?.recoverOnMount) {
      return;
    }

    storageConfig.adapter
      .loadDraft({ deckId, namespace: storageConfig.namespace })
      .then((draft) => {
        if (!draft || draft.sourceHash === hashSource(source.content)) {
          return;
        }
        setSelectedSlideId(draft.selectedSlideId);
        publishSource(draft.source, "crash-recovery", draft.selectedSlideId);
      })
      .catch((error: unknown) => {
        onError?.({
          message: error instanceof Error ? error.message : "Unable to recover deck draft.",
          cause: error,
        });
      });
  }, [deckId, onError, publishSource, source.content, storageConfig]);

  useEffect(() => {
    if (!storageConfig || !autosaveConfig || !storageConfig.saveDraftOnChange) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void storageConfig.adapter.saveDraft({
        deckId,
        namespace: storageConfig.namespace,
        schemaVersion: 1,
        updatedAtIso: new Date().toISOString(),
        sessionId: sessionId(),
        source,
        sourceHash: hashSource(source.content),
        selectedSlideId,
        compilerStatus: compileResult?.status ?? "invalid",
      });
    }, autosaveConfig.draftDebounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [autosaveConfig, compileResult, deckId, selectedSlideId, source, storageConfig]);

  const refreshVersions = useCallback((): void => {
    if (!storageConfig) {
      return;
    }

    storageConfig.adapter
      .listVersions({ deckId, namespace: storageConfig.namespace })
      .then(setVersions)
      .catch((error: unknown) => {
        onError?.({
          message: error instanceof Error ? error.message : "Unable to list deck versions.",
          cause: error,
        });
      });
  }, [deckId, onError, storageConfig]);

  useEffect(() => {
    refreshVersions();
  }, [refreshVersions]);

  const createVersion = useCallback(
    async (reason: DeckVersionReason, label?: string): Promise<void> => {
      if (!storageConfig) {
        return;
      }

      const diagnostics = compileResult?.diagnostics ?? [];
      const result = await storageConfig.adapter.createVersion({
        id: createVersionId(),
        deckId,
        namespace: storageConfig.namespace,
        schemaVersion: 1,
        createdAtIso: new Date().toISOString(),
        label,
        reason,
        source,
        sourceHash: hashSource(source.content),
        selectedSlideId,
        compilerStatus: compileResult?.status ?? "invalid",
        diagnosticsSummary: summarizeDiagnostics(diagnostics),
        limits: {
          maxVersionsPerDeck: storageConfig.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: storageConfig.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: storageConfig.maxBytesPerDeck,
        },
      });

      if (result.status !== "success") {
        onError?.({ message: result.diagnostics[0]?.message ?? "Unable to save deck version." });
      }
      refreshVersions();
    },
    [compileResult, deckId, onError, refreshVersions, selectedSlideId, source, storageConfig],
  );

  const handleManualSave = useCallback((): void => {
    if (!storageConfig) {
      return;
    }

    void storageConfig.adapter.saveCurrent({
      deckId,
      namespace: storageConfig.namespace,
      schemaVersion: 1,
      updatedAtIso: new Date().toISOString(),
      source,
      sourceHash: hashSource(source.content),
      selectedSlideId,
    });

    if (storageConfig.createVersionOnManualSave) {
      void createVersion("manual", "Manual save");
    }

    onSave?.({
      deckId,
      sourceHash: hashSource(source.content),
      createdAtIso: new Date().toISOString(),
    });
  }, [createVersion, deckId, onSave, selectedSlideId, source, storageConfig]);

  const restoreVersion = useCallback(
    async (versionId: string): Promise<void> => {
      if (!storageConfig) {
        return;
      }

      if (storageConfig.createVersionBeforeDestructiveAction) {
        await createVersion("before-version-restore", "Before restore");
      }

      const version = await storageConfig.adapter.loadVersion({
        deckId,
        namespace: storageConfig.namespace,
        versionId,
      });

      if (!version) {
        return;
      }

      setSelectedSlideId(version.selectedSlideId);
      publishSource(version.source, "version-restore", version.selectedSlideId);
      onRestoreVersion?.({
        deckId,
        versionId,
        createdAtIso: new Date().toISOString(),
      });
    },
    [createVersion, deckId, onRestoreVersion, publishSource, storageConfig],
  );

  function selectSlide(slideId: string): void {
    focusEditorAfterSlideSelectRef.current = true;
    setSelectedSlideId(slideId);
    onSelectedSlideChange?.({ deckId, slideId });
  }

  function updateSource(
    nextSource: DeckSource,
    reason: DeckSourceChangeReason,
    nextSelectedSlideId = selectedSlide?.id,
  ): void {
    publishSource(nextSource, reason, nextSelectedSlideId);
  }

  function handleAddSlide(): void {
    const result = addSlide(source, "title-body", selectedSlide?.id);
    if (result.slideId) {
      setSelectedSlideId(result.slideId);
      onSelectedSlideChange?.({ deckId, slideId: result.slideId });
    }
    updateSource(result.source, "slide-add", result.slideId);
  }

  function handleSlideDragStart(event: DragEvent<HTMLButtonElement>, slideId: string): void {
    if (!features.allowReorderSlides || readOnly) {
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-qastia-slide-id", slideId);
    event.dataTransfer.setData("text/plain", slideId);
    setSlideDragState({ draggedSlideId: slideId });
  }

  function handleSlideDragOver(event: DragEvent<HTMLButtonElement>, targetSlideId: string): void {
    const draggedSlideId = slideDragState?.draggedSlideId;
    if (!features.allowReorderSlides || readOnly || !draggedSlideId || draggedSlideId === targetSlideId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setSlideDragState({
      draggedSlideId,
      targetSlideId,
      placement: getSlideDropPlacement(event),
    });
  }

  function handleSlideDrop(event: DragEvent<HTMLButtonElement>, targetSlideId: string): void {
    const draggedSlideId =
      slideDragState?.draggedSlideId ||
      event.dataTransfer.getData("application/x-qastia-slide-id") ||
      event.dataTransfer.getData("text/plain");

    if (!features.allowReorderSlides || readOnly || !draggedSlideId || draggedSlideId === targetSlideId) {
      setSlideDragState(null);
      return;
    }

    event.preventDefault();
    const placement =
      slideDragState?.targetSlideId === targetSlideId && slideDragState.placement
        ? slideDragState.placement
        : getSlideDropPlacement(event);

    setSlideDragState(null);
    setSelectedSlideId(draggedSlideId);
    updateSource(moveSlide(source, draggedSlideId, targetSlideId, placement), "slide-reorder", draggedSlideId);
    onSelectedSlideChange?.({ deckId, slideId: draggedSlideId });
  }

  const diagnostics = compileResult?.diagnostics ?? [];
  const effectiveViewMode = availableViewModes.includes(viewMode) ? viewMode : availableViewModes[0];
  const previewThemeClassName = compiledDeck?.theme.cssClassName ?? "";
  const previewThemeStyle = compiledDeck ? deckThemeStyle(compiledDeck.theme) : undefined;

  useEffect(() => {
    if (!focusEditorAfterSlideSelectRef.current) {
      return;
    }
    focusEditorAfterSlideSelectRef.current = false;

    const mainElement = mainRef.current;
    const editorSurface = mainElement?.querySelector<HTMLElement>(
      ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main",
    );
    const focusTarget = editorSurface?.matches("textarea")
      ? editorSurface
      : editorSurface?.querySelector<HTMLElement>(
        "input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]), button:not([disabled])",
      );

    if (focusTarget) {
      focusTarget.focus();
      return;
    }

    mainElement?.focus();
  }, [effectiveViewMode, selectedSlide?.id]);

  return (
    <div
      className="deck-studio-root"
      data-density={layoutOptions.density}
      data-slide-rail={layoutOptions.showSlideRail ? "visible" : "hidden"}
      data-inspector={layoutOptions.showInspector ? "visible" : "hidden"}
    >
      {layoutOptions.showSlideRail ? (
        <aside className="deck-studio-rail" style={{ width: layoutOptions.slideRailWidthPx }}>
          <header>
            <strong>{compiledDeck?.metadata.title ?? "Deck"}</strong>
            {features.allowAddSlide ? (
              <button type="button" onClick={handleAddSlide} disabled={readOnly}>
                Add
              </button>
            ) : null}
          </header>
          <nav aria-label="Slides">
            {compiledDeck?.slides.map((slide) => (
              <button
                type="button"
                key={slide.id}
                className={slide.id === selectedSlide?.id ? "is-active" : undefined}
                draggable={features.allowReorderSlides && !readOnly}
                data-drop-position={slideDragState?.targetSlideId === slide.id ? slideDragState.placement : undefined}
                aria-grabbed={slideDragState?.draggedSlideId === slide.id ? "true" : undefined}
                onClick={() => selectSlide(slide.id)}
                onDragStart={(event) => handleSlideDragStart(event, slide.id)}
                onDragOver={(event) => handleSlideDragOver(event, slide.id)}
                onDragLeave={() => {
                  if (slideDragState?.targetSlideId === slide.id) {
                    setSlideDragState({ draggedSlideId: slideDragState.draggedSlideId });
                  }
                }}
                onDrop={(event) => handleSlideDrop(event, slide.id)}
                onDragEnd={() => setSlideDragState(null)}
              >
                <span>{slide.index + 1}</span>
                <span>{slideDisplayTitle(slide)}</span>
                <small>{slide.layout.name}</small>
              </button>
            ))}
          </nav>
        </aside>
      ) : null}

      <main className="deck-studio-main" ref={mainRef} tabIndex={-1}>
        <header className="deck-studio-header">
          <div className="deck-studio-slide-heading">
            {features.allowLayoutChange && selectedSlide && effectiveViewMode !== "source" ? (
              <label className="deck-layout-select">
                <select
                  aria-label="Layout de la slide"
                  value={selectedSlide.layout.name}
                  onChange={(event) => {
                    if (storageConfig?.createVersionBeforeDestructiveAction) {
                      void createVersion("before-layout-change", "Before layout change");
                    }
                    updateSource(
                      updateSlideLayout(source, selectedSlide.id, event.currentTarget.value, runtime.layouts),
                      "layout-change",
                    );
                  }}
                  disabled={readOnly}
                >
                  {Array.from(runtime.layouts.values()).map((layout) => (
                    <option key={layout.name} value={layout.name}>
                      {layout.displayName}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          <div className="deck-studio-actions">
            {layoutOptions.showSourceModeToggle && availableViewModes.length > 1 ? (
              <label className="deck-view-mode-select">
                <span>Editor view</span>
                <select
                  value={effectiveViewMode}
                  onChange={(event) => setViewMode(event.currentTarget.value as DeckStudioViewMode)}
                >
                  {availableViewModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {viewModeLabel(mode)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <button
              type="button"
              onClick={() => setGlobalDefaultsOpen(true)}
              disabled={readOnly}
            >
              Global
            </button>
            {features.allowDuplicateSlide && selectedSlide ? (
              <button
                type="button"
                onClick={() => updateSource(duplicateSlide(source, selectedSlide.id), "slide-duplicate")}
                disabled={readOnly}
              >
                Duplicate
              </button>
            ) : null}
            {features.allowDeleteSlide && selectedSlide ? (
              <button
                type="button"
                onClick={() => updateSource(deleteSlide(source, selectedSlide.id), "slide-delete")}
                disabled={readOnly || (compiledDeck?.slides.length ?? 0) <= 1}
              >
                Delete
              </button>
            ) : null}
            {storageConfig ? (
              <button type="button" onClick={handleManualSave} disabled={readOnly}>
                Save
              </button>
            ) : null}
          </div>
        </header>

        {effectiveViewMode === "source" ? (
          <textarea
            className="deck-source-editor"
            value={source.content}
            onChange={(event) =>
              updateSource({ ...source, content: event.currentTarget.value }, "raw-source-edit")
            }
            spellCheck={false}
            readOnly={readOnly}
          />
        ) : effectiveViewMode === "preview" && selectedSlide ? (
          <section
            className={`deck-studio-preview deck-studio-preview-main ${previewThemeClassName}`}
            aria-label="Slide preview"
            tabIndex={-1}
            style={previewThemeStyle}
          >
            <SlideRenderer slide={selectedSlide} target="screen" />
          </section>
        ) : selectedSlide ? (
          <div className="deck-studio-editor">
            <SlideFormEditor
              source={source}
              slideId={selectedSlide.id}
              fields={selectedSlide.layout.definition.editor.fieldGroups.flatMap((group) => group.fields)}
              inheritedMarkdownSlots={inheritedMarkdownSlots}
              readOnly={Boolean(readOnly)}
              onUpdate={updateSource}
            />
          </div>
        ) : compileResult?.status === "invalid" ? (
          <DebugDeckFallback fallback={compileResult.fallback} />
        ) : null}

        {layoutOptions.showActiveSlidePreview && effectiveViewMode !== "preview" && selectedSlide ? (
          <section
            className={`deck-studio-preview ${previewThemeClassName}`}
            aria-label="Active slide preview"
            style={previewThemeStyle}
          >
            <SlideRenderer slide={selectedSlide} target="screen" />
          </section>
        ) : null}
      </main>

      {layoutOptions.showInspector ? (
        <aside className="deck-studio-inspector" style={{ width: layoutOptions.inspectorWidthPx }}>
          {layoutOptions.showDiagnosticsPanel ? (
            <section>
              <h3>Diagnostics</h3>
              <DiagnosticsList diagnostics={diagnostics} />
            </section>
          ) : null}
          {layoutOptions.showVersionHistory && storageConfig ? (
            <section>
              <h3>Versions</h3>
              <ul className="deck-version-list">
                {versions.map((version) => (
                  <li key={version.id}>
                    <button
                      type="button"
                      onClick={() => void restoreVersion(version.id)}
                      disabled={!features.allowVersionRestore || readOnly}
                    >
                      {version.label ?? version.reason}
                    </button>
                    <small>{new Date(version.createdAtIso).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      ) : null}
      {globalDefaultsOpen ? (
        <GlobalDefaultsDialog
          source={source}
          readOnly={Boolean(readOnly)}
          onUpdate={updateSource}
          onClose={() => setGlobalDefaultsOpen(false)}
        />
      ) : null}
    </div>
  );
}

function sessionId(): string {
  const key = "deck-runtime-session-id";
  const existing = window.sessionStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const next = createVersionId();
  window.sessionStorage.setItem(key, next);
  return next;
}

function createVersionId(): string {
  const random = Math.random().toString(16).slice(2, 10);
  return `${new Date().toISOString().replace(/[:.]/g, "-")}_${random}`;
}

function viewModeLabel(mode: DeckStudioViewMode): string {
  if (mode === "source") {
    return "YAML";
  }
  if (mode === "preview") {
    return "Preview";
  }
  return "Form";
}

function slideDisplayTitle(slide: CompiledSlide): string {
  const titleSlot = slide.slots.get("title");
  const markdown = titleSlot?.content.kind === "markdown" ? titleSlot.content.markdown : undefined;
  const title = markdown
    ?.split(/\r?\n/)
    .map((line) => line.replace(/^#{1,6}\s+/, "").trim())
    .find((line) => line.length > 0);

  return title ?? `Slide ${slide.index + 1}`;
}

function getSlideDropPlacement(event: DragEvent<HTMLElement>): SlideMovePlacement {
  const rect = event.currentTarget.getBoundingClientRect();
  if (rect.height <= 0) {
    return "after";
  }

  return event.clientY > rect.top + rect.height / 2 ? "after" : "before";
}
