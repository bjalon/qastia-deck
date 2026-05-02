import type { CreateDeckRuntimeOptions, DeckRuntime } from "../publicTypes";
import { browserPrintPdfAdapter } from "../pdf/browserPrintPdfAdapter";
import { LocalStorageDeckPersistenceAdapter } from "../storage/LocalStorageDeckPersistenceAdapter";
import { defaultAssetResolver } from "./defaultAssetResolver";
import { defaultLayouts } from "./defaultLayouts";
import { defaultRenderers } from "./defaultRenderers";
import { defaultThemes } from "./defaultThemes";
import { defaultTransitions } from "./defaultTransitions";

export function createDeckRuntime(options: CreateDeckRuntimeOptions = {}): DeckRuntime {
  const layouts = options.layouts ?? defaultLayouts;
  const renderers = options.renderers ?? defaultRenderers;
  const themes = options.themes ?? defaultThemes;
  const transitions = options.transitions ?? defaultTransitions;

  return {
    layouts: new Map(layouts.map((layout) => [layout.name, layout])),
    renderers: new Map(renderers.map((renderer) => [renderer.kind, renderer])),
    themes: new Map(themes.map((theme) => [theme.id, theme])),
    transitions: new Map(transitions.map((transition) => [transition.name, transition])),
    assets: defaultAssetResolver,
    storage: options.storage ?? new LocalStorageDeckPersistenceAdapter(),
    pdf: options.pdf ?? browserPrintPdfAdapter,
  };
}
