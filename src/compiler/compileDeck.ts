import { parseDocument } from "yaml";
import { ZodError } from "zod";
import type {
  AssetRegistry,
  CompiledContent,
  CompiledDeck,
  CompiledSlide,
  CompiledSlot,
  CompiledTransition,
  CompileContext,
  CompileDeckResult,
  DeckDiagnostic,
  DeckSource,
  SlotName,
  SourcePosition,
} from "../publicTypes";
import { compileMarkdown } from "./compileMarkdown";
import { diagnostic } from "./diagnostics";
import { type RawDeck, type RawSlot, rawDeckSchema } from "./sourceSchema";

export async function compileDeck(
  source: DeckSource,
  context: CompileContext,
): Promise<CompileDeckResult> {
  const diagnostics: DeckDiagnostic[] = [];
  const compileMode = context.compileMode ?? (context.mode === "editor" ? "authoring" : "strict");
  let parsed: unknown;

  try {
    const document = parseDocument(source.content, {
      prettyErrors: false,
      strict: true,
      uniqueKeys: true,
    });

    for (const error of document.errors) {
      diagnostics.push(
        {
          ...diagnostic("YAML_SYNTAX_ERROR", "error", error.message, undefined, undefined),
          range: rangeFromYamlError(source.content, error),
        },
      );
    }

    for (const warning of document.warnings) {
      diagnostics.push(
        {
          ...diagnostic("YAML_PARSE_WARNING", "warning", warning.message, undefined, undefined),
          range: rangeFromYamlError(source.content, warning),
        },
      );
    }

    if (document.errors.length > 0) {
      return invalid(source, diagnostics);
    }

    parsed = document.toJSON();
  } catch (error) {
    diagnostics.push(
      diagnostic(
        "YAML_SYNTAX_ERROR",
        "error",
        error instanceof Error ? error.message : "Unable to parse YAML source.",
      ),
    );
    return invalid(source, diagnostics);
  }

  const schemaResult = rawDeckSchema.safeParse(parsed);
  if (!schemaResult.success) {
    diagnostics.push(...zodDiagnostics(schemaResult.error));
    return invalid(source, diagnostics);
  }

  const rawDeck = schemaResult.data;
  const semanticDiagnostics = validateSemantics(rawDeck, context, diagnostics);
  diagnostics.push(...semanticDiagnostics);

  const fatal = semanticDiagnostics.some(
    (item) =>
      item.code === "SLIDE_UNKNOWN_LAYOUT" ||
      (compileMode === "strict" && item.severity === "error"),
  );
  if (fatal) {
    return invalid(source, diagnostics);
  }

  const assets: AssetRegistry = new Map(Object.entries(rawDeck.assets));
  const theme = context.runtime.themes.get(rawDeck.theme.id) ?? context.runtime.themes.get("default");
  if (!theme) {
    throw new Error("Deck runtime must provide at least one theme.");
  }

  if (!context.runtime.themes.has(rawDeck.theme.id)) {
    diagnostics.push(
      diagnostic(
        "SCHEMA_INVALID_VALUE",
        "warning",
        `Unknown theme '${rawDeck.theme.id}'. Falling back to '${theme.id}'.`,
        ["theme", "id"],
      ),
    );
  }

  const slides: CompiledSlide[] = [];

  for (const [index, slide] of rawDeck.slides.entries()) {
    const layout = context.runtime.layouts.get(slide.layout);
    if (!layout) {
      continue;
    }

    const slots = new Map<SlotName, CompiledSlot>();

    for (const [slotName, slot] of Object.entries(slide.slots)) {
      const compiledSlot = await compileSlot(slotName, slot, assets, [
        "slides",
        String(index),
        "slots",
        slotName,
      ]);
      slots.set(slotName, compiledSlot);
      diagnostics.push(
        ...compiledSlot.diagnostics.map((item) => ({
          ...item,
          slideId: item.slideId ?? slide.id,
        })),
      );
    }

    for (const [slotName, slot] of Object.entries(rawDeck.defaults.slots)) {
      if (slots.has(slotName) || !layoutSupportsSlot(layout, slotName)) {
        continue;
      }

      const compiledSlot = await compileSlot(
        slotName,
        slot,
        assets,
        ["defaults", "slots", slotName],
        "default",
      );
      slots.set(slotName, compiledSlot);
      diagnostics.push(
        ...compiledSlot.diagnostics.map((item) => ({
          ...item,
          slideId: item.slideId ?? slide.id,
        })),
      );
    }

    for (const requiredSlot of layout.requiredSlots) {
      if (!slots.has(requiredSlot) && compileMode === "authoring") {
        slots.set(requiredSlot, emptyMarkdownSlot(requiredSlot));
      }
    }

    slides.push({
      id: slide.id,
      index,
      layout: {
        name: layout.name,
        definition: layout,
      },
      transition: compileTransition(
        slide.transition ?? rawDeck.defaults.transition,
        context,
        ["slides", String(index), "transition"],
        diagnostics,
      ),
      slots,
      diagnostics: diagnostics.filter((item) => item.slideId === slide.id),
    });
  }

  const deck: CompiledDeck = {
    version: 1,
    metadata: rawDeck.metadata,
    theme,
    aspectRatio: rawDeck.defaults.aspectRatio,
    assets,
    renderers: context.runtime.renderers,
    slides,
  };

  if (diagnostics.length > 0) {
    return {
      status: "degraded",
      deck,
      diagnostics,
    };
  }

  return {
    status: "valid",
    deck,
    diagnostics: [],
  };
}

function rangeFromYamlError(source: string, error: unknown): DeckDiagnostic["range"] {
  if (!isYamlErrorWithPosition(error)) {
    return undefined;
  }

  const [startOffset, endOffset = startOffset] = error.pos;
  return {
    start: positionFromOffset(source, startOffset),
    end: positionFromOffset(source, endOffset),
  };
}

function isYamlErrorWithPosition(error: unknown): error is { readonly pos: readonly [number, number?] } {
  return (
    typeof error === "object" &&
    error !== null &&
    "pos" in error &&
    Array.isArray((error as { readonly pos?: unknown }).pos) &&
    typeof (error as { readonly pos: readonly unknown[] }).pos[0] === "number"
  );
}

function positionFromOffset(source: string, offset: number): SourcePosition {
  const safeOffset = Math.min(Math.max(offset, 0), source.length);
  const before = source.slice(0, safeOffset);
  const lines = before.split(/\r?\n/);

  return {
    offset: safeOffset,
    line: lines.length - 1,
    column: lines[lines.length - 1]?.length ?? 0,
  };
}

function invalid(source: DeckSource, diagnostics: readonly DeckDiagnostic[]): CompileDeckResult {
  return {
    status: "invalid",
    fallback: {
      source,
      title: "Invalid deck source",
      diagnostics,
    },
    diagnostics,
  };
}

function zodDiagnostics(error: ZodError): readonly DeckDiagnostic[] {
  return error.issues.map((issue) => {
    const path = issue.path.map(String);
    const code = issue.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";

    return diagnostic(
      code,
      "error",
      issue.message,
      path.length > 0 ? path : undefined,
      undefined,
    );
  });
}

function validateSemantics(
  deck: RawDeck,
  context: CompileContext,
  existingDiagnostics: readonly DeckDiagnostic[],
): readonly DeckDiagnostic[] {
  const diagnostics: DeckDiagnostic[] = [];
  const slideIds = new Set<string>();

  if (deck.slides.length === 0) {
    diagnostics.push(diagnostic("DECK_EMPTY_SLIDES", "error", "Deck must contain at least one slide.", ["slides"]));
  }

  for (const [index, slide] of deck.slides.entries()) {
    if (slideIds.has(slide.id)) {
      diagnostics.push(
        diagnostic(
          "SLIDE_DUPLICATE_ID",
          "error",
          `Slide id '${slide.id}' is already used.`,
          ["slides", String(index), "id"],
          slide.id,
        ),
      );
    }
    slideIds.add(slide.id);

    const layout = context.runtime.layouts.get(slide.layout);
    if (!layout) {
      diagnostics.push(
        diagnostic(
          "SLIDE_UNKNOWN_LAYOUT",
          "error",
          `Unknown layout '${slide.layout}'.`,
          ["slides", String(index), "layout"],
          slide.id,
          "Register the layout in createDeckRuntime or choose a default layout.",
        ),
      );
      continue;
    }

    for (const slotName of layout.requiredSlots) {
      if (!(slotName in slide.slots) && !(slotName in deck.defaults.slots)) {
        diagnostics.push(
          diagnostic(
            "LAYOUT_MISSING_SLOT",
            "error",
            `Layout '${layout.name}' requires slot '${slotName}'.`,
            ["slides", String(index), "slots"],
            slide.id,
          ),
        );
      }
    }

    for (const slotName of Object.keys(slide.slots)) {
      if (layout.forbiddenSlots.includes(slotName)) {
        diagnostics.push(
          diagnostic(
            "LAYOUT_FORBIDDEN_SLOT",
            "warning",
            `Layout '${layout.name}' does not render slot '${slotName}'.`,
            ["slides", String(index), "slots", slotName],
            slide.id,
          ),
        );
      }
    }

    for (const slotName of Object.keys(slide.unassignedSlots)) {
      diagnostics.push(
        diagnostic(
          "LAYOUT_UNASSIGNED_SLOT",
          "warning",
          `Slot '${slotName}' is preserved but is not rendered by layout '${layout.name}'.`,
          ["slides", String(index), "unassignedSlots", slotName],
          slide.id,
          "Change to a compatible layout or move the content back into a rendered slot.",
        ),
      );
    }
  }

  if (existingDiagnostics.length > 0) {
    return diagnostics;
  }

  return diagnostics;
}

async function compileSlot(
  slotName: SlotName,
  slot: RawSlot,
  assets: AssetRegistry,
  path: readonly string[],
  origin: CompiledSlot["origin"] = "source",
): Promise<CompiledSlot> {
  const diagnostics: DeckDiagnostic[] = [];
  const content = await compileSlotContent(slot, assets, path, diagnostics);

  return {
    name: slotName,
    kind: content.kind === "renderer" ? "renderer" : content.kind,
    content,
    origin,
    diagnostics,
  };
}

function layoutSupportsSlot(
  layout: { readonly requiredSlots: readonly SlotName[]; readonly optionalSlots: readonly SlotName[] },
  slotName: SlotName,
): boolean {
  return layout.requiredSlots.includes(slotName) || layout.optionalSlots.includes(slotName);
}

async function compileSlotContent(
  slot: RawSlot,
  assets: AssetRegistry,
  path: readonly string[],
  diagnostics: DeckDiagnostic[],
): Promise<CompiledContent> {
  if ("markdown" in slot) {
    const compiled = compileMarkdown(slot.markdown, path);
    diagnostics.push(...compiled.diagnostics);
    return {
      kind: "markdown",
      markdown: slot.markdown,
      nodes: compiled.nodes,
    };
  }

  if ("image" in slot) {
    if (slot.image.assetId && !assets.has(slot.image.assetId)) {
      diagnostics.push(
        diagnostic(
          "ASSET_NOT_FOUND",
          "error",
          `Asset '${slot.image.assetId}' was not found.`,
          path,
        ),
      );
    }

    const asset = slot.image.assetId ? assets.get(slot.image.assetId) : undefined;
    return {
      kind: "image",
      assetId: slot.image.assetId,
      src: asset?.src ?? slot.image.src,
      alt: asset?.alt ?? slot.image.alt,
    };
  }

  return {
    kind: "renderer",
    rendererKind: slot.renderer.kind,
    props: slot.renderer.props,
  };
}

function emptyMarkdownSlot(slotName: SlotName): CompiledSlot {
  return {
    name: slotName,
    kind: "markdown",
    content: {
      kind: "markdown",
      markdown: "",
      nodes: [{ kind: "markdown", markdown: "" }],
    },
    origin: "synthetic",
    diagnostics: [],
  };
}

function compileTransition(
  transition: CompiledTransition,
  context: CompileContext,
  path: readonly string[],
  diagnostics: DeckDiagnostic[],
): CompiledTransition {
  const transitionIn = context.runtime.transitions.has(transition.in) ? transition.in : "none";
  const transitionOut = context.runtime.transitions.has(transition.out) ? transition.out : "none";

  if (transitionIn !== transition.in) {
    diagnostics.push(
      diagnostic("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${transition.in}'.`, [...path, "in"]),
    );
  }

  if (transitionOut !== transition.out) {
    diagnostics.push(
      diagnostic("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${transition.out}'.`, [...path, "out"]),
    );
  }

  return {
    in: transitionIn,
    out: transitionOut,
    durationMs: transition.durationMs,
  };
}
