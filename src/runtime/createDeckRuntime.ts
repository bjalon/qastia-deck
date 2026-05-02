import type {
  ContentRendererPlugin,
  CreateDeckRuntimeOptions,
  DeckRuntime,
  LayoutDefinition,
  RegistryCollisionStrategy,
  ThemeDefinition,
  TransitionDefinition,
} from "../publicTypes";
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
  const collisionStrategy = options.registryCollisionStrategy ?? "override";

  return {
    layouts: registryFrom(layouts, (layout) => layout.name, collisionStrategy, "layout"),
    renderers: registryFrom(renderers, (renderer) => renderer.kind, collisionStrategy, "renderer"),
    themes: registryFrom(themes, (theme) => theme.id, collisionStrategy, "theme"),
    transitions: registryFrom(transitions, (transition) => transition.name, collisionStrategy, "transition"),
    assets: defaultAssetResolver,
    storage: options.storage ?? new LocalStorageDeckPersistenceAdapter(),
    pdf: options.pdf ?? browserPrintPdfAdapter,
  };
}

type RegistryItem = LayoutDefinition | ContentRendererPlugin | ThemeDefinition | TransitionDefinition;

function registryFrom<TItem extends RegistryItem>(
  items: readonly TItem[],
  keyOf: (item: TItem) => string,
  collisionStrategy: RegistryCollisionStrategy,
  registryName: string,
): ReadonlyMap<string, TItem> {
  const registry = new Map<string, TItem>();

  for (const item of items) {
    const key = keyOf(item);
    if (registry.has(key)) {
      if (collisionStrategy === "throw") {
        throw new Error(`Duplicate ${registryName} id '${key}'.`);
      }
      if (collisionStrategy === "keep-first") {
        continue;
      }
    }
    registry.set(key, item);
  }

  return registry;
}
