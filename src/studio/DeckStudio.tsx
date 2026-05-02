import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { compileDeck } from "../compiler/compileDeck";
import { summarizeDiagnostics } from "../compiler/diagnostics";
import { hashSource } from "../compiler/hash";
import { DebugDeckFallback, DiagnosticsList } from "../debug/DebugDeckFallback";
import type {
  CompileDeckResult,
  DeckSource,
  DeckSourceChangeEvent,
  DeckSourceChangeReason,
  DeckStudioProps,
  DeckVersionReason,
  DeckVersionSummary,
  LayoutEditorField,
} from "../publicTypes";
import { defaultDeckRuntime } from "../runtime/defaultDeckRuntime";
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
  getSlotImage,
  getSlotMarkdown,
  updateImageSlot,
  updateMarkdownSlot,
  updateSlideLayout,
} from "./editableSource";

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
  const [sourceMode, setSourceMode] = useState(false);
  const [versions, setVersions] = useState<readonly DeckVersionSummary[]>([]);
  const onCompileRef = useRef(onCompile);
  const onErrorRef = useRef(onError);

  onCompileRef.current = onCompile;
  onErrorRef.current = onError;

  const layoutOptions = useMemo(
    () => ({ ...defaultDeckStudioLayoutOptions, ...layoutProps }),
    [layoutProps],
  );
  const features = useMemo(
    () => ({ ...defaultDeckStudioFeatureFlags, ...featuresProps }),
    [featuresProps],
  );
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

      if (result.status === "failed") {
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
    setSelectedSlideId(slideId);
    onSelectedSlideChange?.({ deckId, slideId });
  }

  function updateSource(nextSource: DeckSource, reason: DeckSourceChangeReason): void {
    publishSource(nextSource, reason, selectedSlide?.id);
  }

  const diagnostics = compileResult?.diagnostics ?? [];

  return (
    <div className="deck-studio-root" data-density={layoutOptions.density}>
      <aside className="deck-studio-rail" style={{ width: layoutOptions.slideRailWidthPx }}>
        <header>
          <strong>{compiledDeck?.metadata.title ?? "Deck"}</strong>
          {features.allowAddSlide ? (
            <button type="button" onClick={() => updateSource(addSlide(source), "slide-add")} disabled={readOnly}>
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
              onClick={() => selectSlide(slide.id)}
            >
              <span>{slide.index + 1}</span>
              <span>{slide.id}</span>
              <small>{slide.layout.name}</small>
            </button>
          ))}
        </nav>
      </aside>

      <main className="deck-studio-main">
        <header className="deck-studio-header">
          <div>
            <strong>{selectedSlide?.id ?? "Source"}</strong>
            {selectedSlide ? <small>{selectedSlide.layout.definition.displayName}</small> : null}
          </div>
          <div className="deck-studio-actions">
            {layoutOptions.showSourceModeToggle && features.allowRawSourceEdit ? (
              <button type="button" onClick={() => setSourceMode((value) => !value)}>
                {sourceMode ? "Form" : "YAML"}
              </button>
            ) : null}
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

        {sourceMode ? (
          <textarea
            className="deck-source-editor"
            value={source.content}
            onChange={(event) =>
              updateSource({ ...source, content: event.currentTarget.value }, "raw-source-edit")
            }
            spellCheck={false}
            readOnly={readOnly}
          />
        ) : selectedSlide ? (
          <div className="deck-studio-editor">
            <SlideForm
              source={source}
              slideId={selectedSlide.id}
              fields={selectedSlide.layout.definition.editor.fieldGroups.flatMap((group) => group.fields)}
              readOnly={Boolean(readOnly)}
              onUpdate={updateSource}
            />
            {features.allowLayoutChange ? (
              <label className="deck-form-field">
                <span>Layout</span>
                <select
                  value={selectedSlide.layout.name}
                  onChange={(event) => {
                    if (storageConfig?.createVersionBeforeDestructiveAction) {
                      void createVersion("before-layout-change", "Before layout change");
                    }
                    updateSource(updateSlideLayout(source, selectedSlide.id, event.currentTarget.value), "layout-change");
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
        ) : compileResult?.status === "invalid" ? (
          <DebugDeckFallback fallback={compileResult.fallback} />
        ) : null}

        {layoutOptions.showActiveSlidePreview && selectedSlide ? (
          <section className="deck-studio-preview" aria-label="Active slide preview">
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
    </div>
  );
}

function SlideForm({
  source,
  slideId,
  fields,
  readOnly,
  onUpdate,
}: {
  readonly source: DeckSource;
  readonly slideId: string;
  readonly fields: readonly LayoutEditorField[];
  readonly readOnly: boolean;
  readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
}): React.ReactElement {
  return (
    <form className="deck-slide-form">
      {fields.map((field) => (
        <EditorField
          key={`${field.kind}-${"slotName" in field ? field.slotName : field.label}`}
          source={source}
          slideId={slideId}
          field={field}
          readOnly={readOnly}
          onUpdate={onUpdate}
        />
      ))}
    </form>
  );
}

function EditorField({
  source,
  slideId,
  field,
  readOnly,
  onUpdate,
}: {
  readonly source: DeckSource;
  readonly slideId: string;
  readonly field: LayoutEditorField;
  readonly readOnly: boolean;
  readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
}): React.ReactElement | null {
  if (field.kind === "markdown") {
    return (
      <label className="deck-form-field">
        <span>{field.label}</span>
        <textarea
          rows={field.minRows ?? 4}
          value={getSlotMarkdown(source, slideId, field.slotName)}
          onChange={(event) =>
            onUpdate(updateMarkdownSlot(source, slideId, field.slotName, event.currentTarget.value), "slide-field-edit")
          }
          readOnly={readOnly}
        />
      </label>
    );
  }

  if (field.kind === "image") {
    const image = getSlotImage(source, slideId, field.slotName);
    return (
      <fieldset className="deck-form-fieldset">
        <legend>{field.label}</legend>
        <label>
          <span>Asset id</span>
          <input
            value={image.assetId}
            onChange={(event) =>
              onUpdate(
                updateImageSlot(source, slideId, field.slotName, {
                  ...image,
                  assetId: event.currentTarget.value,
                }),
                "slide-field-edit",
              )
            }
            readOnly={readOnly}
          />
        </label>
        <label>
          <span>Source</span>
          <input
            value={image.src}
            onChange={(event) =>
              onUpdate(
                updateImageSlot(source, slideId, field.slotName, {
                  ...image,
                  src: event.currentTarget.value,
                }),
                "slide-field-edit",
              )
            }
            readOnly={readOnly}
          />
        </label>
        <label>
          <span>Alt</span>
          <input
            value={image.alt}
            onChange={(event) =>
              onUpdate(
                updateImageSlot(source, slideId, field.slotName, {
                  ...image,
                  alt: event.currentTarget.value,
                }),
                "slide-field-edit",
              )
            }
            readOnly={readOnly}
          />
        </label>
      </fieldset>
    );
  }

  return null;
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
