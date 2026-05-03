import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import { compileDeck } from "../compiler/compileDeck";
import { summarizeDiagnostics } from "../compiler/diagnostics";
import { hashSource } from "../compiler/hash";
import { DebugDeckFallback, DiagnosticsList } from "../debug/DebugDeckFallback";
import type {
  CompileDeckResult,
  CompiledSlide,
  DeckDraftSnapshot,
  DeckPersistedState,
  DeckSource,
  DeckSourceChangeEvent,
  DeckSourceChangeReason,
  DeckStudioProps,
  DeckStudioViewMode,
  DeckVersionReason,
  DeckVersionSummary,
  LayoutName,
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
  updateDeckTitle,
  updateSlideLayout,
} from "./editableSource";
import { SlideFormEditor } from "./form/SlideFormEditor";
import { GlobalDefaultsDialog } from "./global/GlobalDefaultsDialog";
import { CrashRecoveryDialog } from "./recovery/CrashRecoveryDialog";
import { VersionCompareDialog } from "./versions/VersionCompareDialog";
import { VersionHistoryPanel } from "./versions/VersionHistoryPanel";
import { VersionSourceDialog } from "./versions/VersionSourceDialog";

type RecoveryPrompt = {
  readonly draft: DeckDraftSnapshot;
  readonly current: DeckPersistedState | null;
  readonly versions: readonly DeckVersionSummary[];
};

type VersionCompareState = {
  readonly title: string;
  readonly leftLabel: string;
  readonly leftSource: string;
  readonly rightLabel: string;
  readonly rightSource: string;
};

type VersionSourceState = {
  readonly title: string;
  readonly label: string;
  readonly source: string;
};

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
  const [versionHistoryForcedOpen, setVersionHistoryForcedOpen] = useState(false);
  const [recoveryPrompt, setRecoveryPrompt] = useState<RecoveryPrompt | null>(null);
  const [versionCompare, setVersionCompare] = useState<VersionCompareState | null>(null);
  const [versionSource, setVersionSource] = useState<VersionSourceState | null>(null);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [deckTitleEditing, setDeckTitleEditing] = useState(false);
  const [deckTitleDraft, setDeckTitleDraft] = useState("");
  const [slideDragState, setSlideDragState] = useState<{
    readonly draggedSlideId: string;
    readonly targetSlideId?: string;
    readonly placement?: SlideMovePlacement;
  } | null>(null);
  const [versions, setVersions] = useState<readonly DeckVersionSummary[]>([]);
  const [committedSource, setCommittedSource] = useState<DeckSource>(source);
  const [committedSelectedSlideId, setCommittedSelectedSlideId] = useState<string | undefined>(
    initialSelectedSlideId,
  );
  const mainRef = useRef<HTMLElement | null>(null);
  const onCompileRef = useRef(onCompile);
  const onErrorRef = useRef(onError);
  const pendingEditorFocusSlideIdRef = useRef<string | null>(null);
  const recoveryCheckedRef = useRef(false);
  const lastAutosaveVersionHashRef = useRef<string | null>(null);

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

    return nextOptions;
  }, [layoutProps, studioOptions]);
  const features = useMemo(() => {
    const nextFeatures = { ...defaultDeckStudioFeatureFlags, ...featuresProps };
    const allowYamlMode =
      studioOptions?.editing?.allowYamlMode ?? studioOptions?.editing?.allowSourceMode;

    if (allowYamlMode !== undefined) {
      nextFeatures.allowRawSourceEdit = allowYamlMode;
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
    const allowYamlMode =
      studioOptions?.editing?.allowYamlMode ?? studioOptions?.editing?.allowSourceMode ?? true;
    const allowPreviewMode = studioOptions?.editing?.allowPreviewMode ?? true;
    const configuredModes = studioOptions?.editing?.viewModes ?? ["form", "source", "preview"];
    const uniqueModes = configuredModes.filter(
      (mode, index, modes): mode is DeckStudioViewMode =>
        (mode === "form" || mode === "source" || mode === "preview") && modes.indexOf(mode) === index,
    );
    const nextModes = uniqueModes.filter((mode) => {
      if (mode === "source") {
        return allowYamlMode && features.allowRawSourceEdit;
      }

      if (mode === "preview") {
        return allowPreviewMode;
      }

      return true;
    });
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
  const sourceDirty = hashSource(source.content) !== hashSource(committedSource.content);
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
    if (!storageConfig?.recoverOnMount || recoveryCheckedRef.current) {
      return;
    }
    recoveryCheckedRef.current = true;

    Promise.all([
      storageConfig.adapter.loadCurrent({ deckId, namespace: storageConfig.namespace }),
      storageConfig.adapter.loadDraft({ deckId, namespace: storageConfig.namespace }),
      storageConfig.adapter.listVersions({ deckId, namespace: storageConfig.namespace }),
    ])
      .then(([current, draft, storedVersions]) => {
        if (!draft) {
          return;
        }

        const sourceHash = hashSource(source.content);
        const isDifferentFromSource = draft.sourceHash !== sourceHash;
        const isDifferentFromCurrent = !current || draft.sourceHash !== current.sourceHash;
        const isNewerThanCurrent = !current || draft.updatedAtIso > current.updatedAtIso;

        if (!isDifferentFromSource || !isDifferentFromCurrent || !isNewerThanCurrent) {
          return;
        }
        setRecoveryPrompt({
          draft,
          current,
          versions: storedVersions,
        });
      })
      .catch((error: unknown) => {
        onError?.({
          message: error instanceof Error ? error.message : "Unable to inspect deck recovery state.",
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

  const createVersionFromSource = useCallback(
    async (
      nextSource: DeckSource,
      reason: DeckVersionReason,
      label?: string,
      nextSelectedSlideId?: string,
    ): Promise<void> => {
      if (!storageConfig) {
        return;
      }

      const nextCompileResult = await compileDeck(nextSource, {
        runtime,
        mode: "editor",
        locale,
      });
      const result = await storageConfig.adapter.createVersion({
        id: createVersionId(),
        deckId,
        namespace: storageConfig.namespace,
        schemaVersion: 1,
        createdAtIso: new Date().toISOString(),
        label,
        reason,
        source: nextSource,
        sourceHash: hashSource(nextSource.content),
        selectedSlideId: nextSelectedSlideId,
        compilerStatus: nextCompileResult.status,
        diagnosticsSummary: summarizeDiagnostics(nextCompileResult.diagnostics),
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
    [deckId, locale, onError, refreshVersions, runtime, storageConfig],
  );

  useEffect(() => {
    if (!storageConfig || !autosaveConfig || !storageConfig.saveDraftOnChange) {
      return;
    }

    if (autosaveConfig.createVersionOnValidDeckOnly && compileResult?.status === "invalid") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const sourceHash = hashSource(source.content);
      if (lastAutosaveVersionHashRef.current === sourceHash) {
        return;
      }
      lastAutosaveVersionHashRef.current = sourceHash;
      void createVersion("autosave", "Autosave");
    }, autosaveConfig.versionIntervalMs);

    return () => window.clearTimeout(timeoutId);
  }, [autosaveConfig, compileResult?.status, createVersion, source.content, storageConfig]);

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

    setCommittedSource(source);
    setCommittedSelectedSlideId(selectedSlideId);

    onSave?.({
      deckId,
      sourceHash: hashSource(source.content),
      createdAtIso: new Date().toISOString(),
    });
  }, [createVersion, deckId, onSave, selectedSlideId, source, storageConfig]);

  const saveCurrentState = useCallback(
    async (nextSource: DeckSource, nextSelectedSlideId?: string): Promise<void> => {
      if (!storageConfig) {
        return;
      }
      const result = await storageConfig.adapter.saveCurrent({
        deckId,
        namespace: storageConfig.namespace,
        schemaVersion: 1,
        updatedAtIso: new Date().toISOString(),
        source: nextSource,
        sourceHash: hashSource(nextSource.content),
        selectedSlideId: nextSelectedSlideId,
      });
      if (result.status !== "success") {
        onError?.({ message: result.diagnostics[0]?.message ?? "Unable to save current deck." });
        return;
      }
      setCommittedSource(nextSource);
      setCommittedSelectedSlideId(nextSelectedSlideId);
    },
    [deckId, onError, storageConfig],
  );

  const handleCancelChanges = useCallback((): void => {
    if (!sourceDirty) {
      return;
    }

    const confirmed = window.confirm(
      "Annuler les modifications non sauvegardées et revenir à la dernière version sauvegardée ?",
    );
    if (!confirmed) {
      return;
    }

    setSelectedSlideId(committedSelectedSlideId);
    publishSource(committedSource, "cancel-edit", committedSelectedSlideId);
  }, [committedSelectedSlideId, committedSource, publishSource, sourceDirty]);

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
      await saveCurrentState(version.source, version.selectedSlideId);
      await storageConfig.adapter.clearDraft({ deckId, namespace: storageConfig.namespace });
      onRestoreVersion?.({
        deckId,
        versionId,
        createdAtIso: new Date().toISOString(),
      });
    },
    [createVersion, deckId, onRestoreVersion, publishSource, saveCurrentState, storageConfig],
  );

  const deleteVersionById = useCallback(
    async (versionId: string): Promise<void> => {
      if (!storageConfig) {
        return;
      }
      const result = await storageConfig.adapter.deleteVersion({
        deckId,
        namespace: storageConfig.namespace,
        versionId,
      });
      if (result.status !== "success") {
        onError?.({ message: result.diagnostics[0]?.message ?? "Unable to delete deck version." });
      }
      refreshVersions();
    },
    [deckId, onError, refreshVersions, storageConfig],
  );

  const renameVersion = useCallback(
    async (versionId: string, label: string): Promise<void> => {
      if (!storageConfig) {
        return;
      }
      const version = await storageConfig.adapter.loadVersion({
        deckId,
        namespace: storageConfig.namespace,
        versionId,
      });
      if (!version) {
        return;
      }
      const result = await storageConfig.adapter.createVersion({
        ...version,
        label,
        limits: {
          maxVersionsPerDeck: storageConfig.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: storageConfig.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: storageConfig.maxBytesPerDeck,
        },
      });
      if (result.status !== "success") {
        onError?.({ message: result.diagnostics[0]?.message ?? "Unable to rename deck version." });
      }
      refreshVersions();
    },
    [deckId, onError, refreshVersions, storageConfig],
  );

  const compareWithCurrent = useCallback(
    async (versionId: string): Promise<void> => {
      if (!storageConfig) {
        return;
      }
      const version = await storageConfig.adapter.loadVersion({
        deckId,
        namespace: storageConfig.namespace,
        versionId,
      });
      if (!version) {
        return;
      }
      setVersionCompare({
        title: "Version vs courant",
        leftLabel: version.label ?? version.reason,
        leftSource: version.source.content,
        rightLabel: "Courant",
        rightSource: source.content,
      });
    },
    [deckId, source.content, storageConfig],
  );

  const previewVersion = useCallback(
    async (versionId: string): Promise<void> => {
      if (!storageConfig) {
        return;
      }
      const version = await storageConfig.adapter.loadVersion({
        deckId,
        namespace: storageConfig.namespace,
        versionId,
      });
      if (!version) {
        return;
      }
      setVersionSource({
        title: version.label ?? version.reason,
        label: "Source YAML",
        source: version.source.content,
      });
    },
    [deckId, storageConfig],
  );

  const compareVersions = useCallback(
    async (leftVersionId: string, rightVersionId: string): Promise<void> => {
      if (!storageConfig) {
        return;
      }
      const [left, right] = await Promise.all([
        storageConfig.adapter.loadVersion({
          deckId,
          namespace: storageConfig.namespace,
          versionId: leftVersionId,
        }),
        storageConfig.adapter.loadVersion({
          deckId,
          namespace: storageConfig.namespace,
          versionId: rightVersionId,
        }),
      ]);
      if (!left || !right) {
        return;
      }
      setVersionCompare({
        title: "Comparaison de versions",
        leftLabel: left.label ?? left.reason,
        leftSource: left.source.content,
        rightLabel: right.label ?? right.reason,
        rightSource: right.source.content,
      });
    },
    [deckId, storageConfig],
  );

  const restoreDraft = useCallback(async (): Promise<void> => {
    if (!recoveryPrompt || !storageConfig) {
      return;
    }
    if (storageConfig.createVersionBeforeDestructiveAction) {
      await createVersion("before-version-restore", "Before recovery restore");
    }
    setSelectedSlideId(recoveryPrompt.draft.selectedSlideId);
    publishSource(recoveryPrompt.draft.source, "crash-recovery", recoveryPrompt.draft.selectedSlideId);
    await saveCurrentState(recoveryPrompt.draft.source, recoveryPrompt.draft.selectedSlideId);
    await storageConfig.adapter.clearDraft({ deckId, namespace: storageConfig.namespace });
    setRecoveryPrompt(null);
  }, [createVersion, deckId, publishSource, recoveryPrompt, saveCurrentState, storageConfig]);

  const previewDraft = useCallback((): void => {
    if (!recoveryPrompt) {
      return;
    }
    setVersionSource({
      title: "Draft local",
      label: "Source YAML",
      source: recoveryPrompt.draft.source.content,
    });
  }, [recoveryPrompt]);

  const compareDraftWithCurrent = useCallback((): void => {
    if (!recoveryPrompt) {
      return;
    }
    setVersionCompare({
      title: "Draft vs courant",
      leftLabel: "Draft local",
      leftSource: recoveryPrompt.draft.source.content,
      rightLabel: "Courant",
      rightSource: recoveryPrompt.current?.source.content ?? source.content,
    });
  }, [recoveryPrompt, source.content]);

  const createCopyFromDraft = useCallback(async (): Promise<void> => {
    if (!recoveryPrompt) {
      return;
    }
    await createVersionFromSource(
      recoveryPrompt.draft.source,
      "manual",
      "Copie du draft de recovery",
      recoveryPrompt.draft.selectedSlideId,
    );
    setVersionHistoryForcedOpen(true);
    setRecoveryPrompt(null);
  }, [createVersionFromSource, recoveryPrompt]);

  const createCopyFromVersion = useCallback(
    async (versionId: string): Promise<void> => {
      if (!storageConfig) {
        return;
      }
      const version = await storageConfig.adapter.loadVersion({
        deckId,
        namespace: storageConfig.namespace,
        versionId,
      });
      if (!version) {
        return;
      }
      await createVersionFromSource(
        version.source,
        "manual",
        `Copie - ${version.label ?? version.reason}`,
        version.selectedSlideId,
      );
      setVersionHistoryForcedOpen(true);
      setRecoveryPrompt(null);
    },
    [createVersionFromSource, deckId, storageConfig],
  );

  const deleteRecoveryDraft = useCallback(async (): Promise<void> => {
    if (!storageConfig) {
      return;
    }
    await storageConfig.adapter.clearDraft({ deckId, namespace: storageConfig.namespace });
    setRecoveryPrompt(null);
  }, [deckId, storageConfig]);

  const keepCurrentAfterRecovery = useCallback(async (): Promise<void> => {
    if (!storageConfig) {
      return;
    }
    await storageConfig.adapter.clearDraft({ deckId, namespace: storageConfig.namespace });
    await saveCurrentState(source, selectedSlide?.id);
    setRecoveryPrompt(null);
  }, [deckId, saveCurrentState, selectedSlide?.id, source, storageConfig]);

  function selectSlide(slideId: string): void {
    pendingEditorFocusSlideIdRef.current = slideId;
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

  function handleAddSlide(layout: LayoutName = "title-body"): void {
    const result = addSlide(source, layout, selectedSlide?.id);
    if (result.slideId) {
      pendingEditorFocusSlideIdRef.current = result.slideId;
      if (availableViewModes.includes("form")) {
        setViewMode("form");
      }
      setSelectedSlideId(result.slideId);
      onSelectedSlideChange?.({ deckId, slideId: result.slideId });
    }
    updateSource(result.source, "slide-add", result.slideId);
  }

  function handleStudioKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!features.allowAddSlide || readOnly || !event.ctrlKey || event.altKey || event.key.toLowerCase() !== "m") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handleAddSlide(event.shiftKey && selectedSlide ? selectedSlide.layout.name : "title-body");
  }

  function handleDeleteSlide(): void {
    if (!selectedSlide) {
      return;
    }
    if (storageConfig?.createVersionBeforeDestructiveAction) {
      void createVersion("before-slide-delete", "Before slide delete");
    }
    updateSource(deleteSlide(source, selectedSlide.id), "slide-delete");
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
  const deckTitle = compiledDeck?.metadata.title ?? "Deck";

  function startDeckTitleEdit(): void {
    if (readOnly) {
      return;
    }
    setDeckTitleDraft(deckTitle);
    setDeckTitleEditing(true);
  }

  function commitDeckTitleEdit(): void {
    const nextTitle = deckTitleDraft.trim() || deckTitle;
    setDeckTitleEditing(false);
    setDeckTitleDraft(nextTitle);

    if (nextTitle !== deckTitle) {
      updateSource(updateDeckTitle(source, nextTitle), "metadata-edit", selectedSlide?.id);
    }
  }

  function cancelDeckTitleEdit(): void {
    setDeckTitleEditing(false);
    setDeckTitleDraft(deckTitle);
  }

  useEffect(() => {
    if (!pendingEditorFocusSlideIdRef.current || pendingEditorFocusSlideIdRef.current !== selectedSlide?.id) {
      return;
    }

    const mainElement = mainRef.current;
    const timeoutId = window.setTimeout(() => {
      const editorSurface = mainElement?.querySelector<HTMLElement>(
        ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main",
      );
      const focusTarget = editorSurface?.matches("textarea")
        ? editorSurface
        : editorSurface?.querySelector<HTMLElement>(
          "input:not([type='checkbox']):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])",
        );

      pendingEditorFocusSlideIdRef.current = null;
      if (focusTarget) {
        focusTarget.focus();
        return;
      }

      mainElement?.focus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [effectiveViewMode, selectedSlide?.id, source.content]);

  return (
    <div
      className="deck-studio-root"
      data-density={layoutOptions.density}
      data-slide-rail={layoutOptions.showSlideRail ? "visible" : "hidden"}
      data-inspector={layoutOptions.showInspector ? "visible" : "hidden"}
      onKeyDown={handleStudioKeyDown}
    >
      {layoutOptions.showSlideRail ? (
        <aside className="deck-studio-rail" style={{ width: layoutOptions.slideRailWidthPx }}>
          <header>
            {deckTitleEditing ? (
              <input
                className="deck-studio-title-input"
                aria-label="Titre du slideshow"
                value={deckTitleDraft}
                autoFocus
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => setDeckTitleDraft(event.currentTarget.value)}
                onBlur={commitDeckTitleEdit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitDeckTitleEdit();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelDeckTitleEdit();
                  }
                }}
              />
            ) : (
              <strong
                className="deck-studio-title-label"
                title={readOnly ? undefined : "Double-cliquer pour modifier"}
                onDoubleClick={startDeckTitleEdit}
              >
                {deckTitle}
              </strong>
            )}
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
            {features.allowAddSlide ? (
              <button type="button" onClick={() => handleAddSlide()} disabled={readOnly}>
                Add
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
                onClick={handleDeleteSlide}
                disabled={readOnly || (compiledDeck?.slides.length ?? 0) <= 1}
              >
                Delete
              </button>
            ) : null}
            {storageConfig ? (
              <>
                <button type="button" onClick={handleManualSave} disabled={readOnly || !sourceDirty}>
                  Save
                </button>
                <button
                  type="button"
                  className="deck-shortcuts-help-button"
                  aria-label="Afficher les raccourcis clavier"
                  onClick={() => setShortcutHelpOpen(true)}
                >
                  ?
                </button>
                <button type="button" onClick={handleCancelChanges} disabled={readOnly || !sourceDirty}>
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="deck-shortcuts-help-button"
                aria-label="Afficher les raccourcis clavier"
                onClick={() => setShortcutHelpOpen(true)}
              >
                ?
              </button>
            )}
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
          {(layoutOptions.showVersionHistory || versionHistoryForcedOpen) && storageConfig ? (
            <VersionHistoryPanel
              versions={versions}
              readOnly={Boolean(readOnly)}
              canRestore={features.allowVersionRestore}
              canCompare={features.allowVersionCompare}
              onCreateManualVersion={(label) => {
                void saveCurrentState(source, selectedSlide?.id);
                void createVersion("manual", label ?? "Manual save");
              }}
              onRestoreVersion={(versionId) => void restoreVersion(versionId)}
              onDeleteVersion={(versionId) => void deleteVersionById(versionId)}
              onRenameVersion={(versionId, label) => void renameVersion(versionId, label)}
              onCompareWithCurrent={(versionId) => void compareWithCurrent(versionId)}
              onCompareVersions={(leftVersionId, rightVersionId) => void compareVersions(leftVersionId, rightVersionId)}
            />
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
      {recoveryPrompt ? (
        <CrashRecoveryDialog
          draft={recoveryPrompt.draft}
          current={recoveryPrompt.current}
          versions={recoveryPrompt.versions}
          onRestoreDraft={() => void restoreDraft()}
          onRestoreVersion={(versionId) => {
            setRecoveryPrompt(null);
            void restoreVersion(versionId);
          }}
          onPreviewDraft={previewDraft}
          onPreviewVersion={(versionId) => void previewVersion(versionId)}
          onCompareDraftWithCurrent={compareDraftWithCurrent}
          onCompareVersionWithCurrent={(versionId) => void compareWithCurrent(versionId)}
          onCreateCopyFromDraft={() => void createCopyFromDraft()}
          onCreateCopyFromVersion={(versionId) => void createCopyFromVersion(versionId)}
          onDeleteDraft={() => void deleteRecoveryDraft()}
          onKeepCurrent={() => void keepCurrentAfterRecovery()}
          onOpenVersionHistory={() => {
            setVersionHistoryForcedOpen(true);
            setRecoveryPrompt(null);
          }}
        />
      ) : null}
      {versionCompare ? (
        <VersionCompareDialog
          title={versionCompare.title}
          leftLabel={versionCompare.leftLabel}
          leftSource={versionCompare.leftSource}
          rightLabel={versionCompare.rightLabel}
          rightSource={versionCompare.rightSource}
          onClose={() => setVersionCompare(null)}
        />
      ) : null}
      {versionSource ? (
        <VersionSourceDialog
          title={versionSource.title}
          label={versionSource.label}
          source={versionSource.source}
          onClose={() => setVersionSource(null)}
        />
      ) : null}
      {shortcutHelpOpen ? (
        <ShortcutHelpDialog onClose={() => setShortcutHelpOpen(false)} />
      ) : null}
    </div>
  );
}

function ShortcutHelpDialog({ onClose }: { readonly onClose: () => void }): React.ReactElement {
  return (
    <div className="deck-modal-backdrop" role="presentation">
      <section
        aria-labelledby="deck-shortcuts-title"
        aria-modal="true"
        className="deck-modal-dialog deck-shortcuts-dialog"
        role="dialog"
      >
        <header>
          <div>
            <p>Aide</p>
            <h3 id="deck-shortcuts-title">Raccourcis clavier</h3>
          </div>
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </header>
        <dl className="deck-shortcuts-list">
          <div>
            <dt>Ctrl + M</dt>
            <dd>Ajouter une slide avec le layout par défaut.</dd>
          </div>
          <div>
            <dt>Ctrl + Maj + M</dt>
            <dd>Ajouter une slide avec le même layout que la slide sélectionnée.</dd>
          </div>
        </dl>
      </section>
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
