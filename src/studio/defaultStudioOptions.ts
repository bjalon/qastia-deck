import type { DeckAutosaveConfig, DeckStorageConfig, DeckStudioFeatureFlags, DeckStudioLayoutOptions } from "../publicTypes";
import { LocalStorageDeckPersistenceAdapter } from "../storage/LocalStorageDeckPersistenceAdapter";

export const defaultDeckStudioLayoutOptions: Required<DeckStudioLayoutOptions> = {
  desktopBreakpointPx: 1024,
  slideRailWidthPx: 220,
  inspectorWidthPx: 340,
  showSlideRail: true,
  showInspector: true,
  showActiveSlidePreview: true,
  showSourceModeToggle: true,
  showVersionHistory: true,
  showDiagnosticsPanel: true,
  density: "comfortable",
};

export const defaultDeckStudioFeatureFlags: Required<DeckStudioFeatureFlags> = {
  allowAddSlide: true,
  allowDuplicateSlide: true,
  allowDeleteSlide: true,
  allowReorderSlides: true,
  allowLayoutChange: true,
  allowThemeChange: true,
  allowRawSourceEdit: true,
  allowFullscreenPreview: true,
  allowPdfExport: true,
  allowVersionRestore: true,
  allowVersionCompare: true,
};

export const defaultDeckStorageConfig: Required<DeckStorageConfig> = {
  adapter: new LocalStorageDeckPersistenceAdapter(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4_000_000,
  saveDraftOnChange: true,
  createVersionOnManualSave: true,
  createVersionBeforeDestructiveAction: true,
  recoverOnMount: true,
};

export const defaultDeckAutosaveConfig: Required<DeckAutosaveConfig> = {
  draftDebounceMs: 800,
  versionIntervalMs: 300_000,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: false,
};
