import YAML from "yaml";
import type { DeckDiagnostic, DeckSource, LayoutName, LayoutRegistry, SlotName } from "../publicTypes";

type MutableDeck = Record<string, unknown> & {
  metadata?: MutableMetadata;
  defaults?: MutableDefaults;
  slides?: MutableSlide[];
};

type MutableMetadata = Record<string, unknown> & {
  title?: string;
};

type MutableDefaults = Record<string, unknown> & {
  slots?: Record<string, unknown>;
};

type MutableSlide = Record<string, unknown> & {
  id?: string;
  layout?: string;
  slots?: Record<string, unknown>;
  unassignedSlots?: Record<string, unknown>;
};

export type SlideMovePlacement = "before" | "after";

export type LayoutMigrationResult = {
  readonly source: DeckSource;
  readonly diagnostics: readonly DeckDiagnostic[];
  readonly movedSlots: readonly {
    readonly from: SlotName;
    readonly to: SlotName;
  }[];
  readonly unassignedSlots: readonly SlotName[];
};

export function parseMutableDeck(source: DeckSource): MutableDeck | null {
  try {
    const parsed = YAML.parse(source.content);
    if (isRecord(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function stringifyMutableDeck(source: DeckSource, deck: MutableDeck): DeckSource {
  return {
    ...source,
    content: YAML.stringify(deck, { lineWidth: 0 }),
  };
}

export function getMutableSlides(deck: MutableDeck): MutableSlide[] {
  if (!Array.isArray(deck.slides)) {
    deck.slides = [];
  }

  return deck.slides.filter(isRecord) as MutableSlide[];
}

export function updateMarkdownSlot(
  source: DeckSource,
  slideId: string,
  slotName: SlotName,
  markdown: string,
): DeckSource {
  return updateSlide(source, slideId, (slide) => {
    const slots = ensureSlots(slide);
    slots[slotName] = { markdown };
  });
}

export function removeSlideSlot(
  source: DeckSource,
  slideId: string,
  slotName: SlotName,
): DeckSource {
  return updateSlide(source, slideId, (slide) => {
    if (!isRecord(slide.slots)) {
      return;
    }

    delete slide.slots[slotName];
    if (Object.keys(slide.slots).length === 0) {
      delete slide.slots;
    }
  });
}

export function hasSlideSlot(source: DeckSource, slideId: string, slotName: SlotName): boolean {
  const slot = getSlot(source, slideId, slotName);
  return slot !== undefined;
}

export function getDefaultSlotMarkdown(source: DeckSource, slotName: SlotName): string {
  const slot = getDefaultSlot(source, slotName);
  if (isRecord(slot) && typeof slot.markdown === "string") {
    return slot.markdown;
  }
  return "";
}

export function hasDefaultSlot(source: DeckSource, slotName: SlotName): boolean {
  return getDefaultSlot(source, slotName) !== undefined;
}

export function updateDefaultMarkdownSlot(
  source: DeckSource,
  slotName: SlotName,
  markdown: string,
): DeckSource {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return source;
  }

  const slots = ensureDefaultSlots(deck);
  slots[slotName] = { markdown };
  return stringifyMutableDeck(source, deck);
}

export function updateDeckTitle(source: DeckSource, title: string): DeckSource {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return source;
  }

  if (!isRecord(deck.metadata)) {
    deck.metadata = {};
  }
  deck.metadata.title = title;
  return stringifyMutableDeck(source, deck);
}

export function updateImageSlot(
  source: DeckSource,
  slideId: string,
  slotName: SlotName,
  image: { readonly assetId?: string; readonly src?: string; readonly alt?: string },
): DeckSource {
  return updateSlide(source, slideId, (slide) => {
    const slots = ensureSlots(slide);
    slots[slotName] = {
      image: removeEmptyFields({
        assetId: image.assetId,
        src: image.src,
        alt: image.alt,
      }),
    };
  });
}

export function updateSlideLayout(
  source: DeckSource,
  slideId: string,
  layout: LayoutName,
  layouts?: LayoutRegistry,
): DeckSource {
  return updateSlideLayoutWithMigration(source, slideId, layout, layouts).source;
}

export function updateSlideLayoutWithMigration(
  source: DeckSource,
  slideId: string,
  layout: LayoutName,
  layouts?: LayoutRegistry,
): LayoutMigrationResult {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return emptyLayoutMigrationResult(source);
  }

  const slides = getMutableSlides(deck);
  const slide = slides.find((candidate) => candidate.id === slideId);
  if (!slide) {
    return emptyLayoutMigrationResult(source);
  }

  const migration = layouts && slide.layout && slide.layout !== layout
    ? migrateSlots(slide, layout, layouts)
    : {
        slots: isRecord(slide.slots) ? slide.slots : {},
        unassignedSlots: isRecord(slide.unassignedSlots) ? slide.unassignedSlots : {},
        diagnostics: [],
        movedSlots: [],
      };

  slide.slots = migration.slots;
  if (Object.keys(migration.unassignedSlots).length > 0) {
    slide.unassignedSlots = migration.unassignedSlots;
  } else {
    delete slide.unassignedSlots;
  }
  slide.layout = layout;
  deck.slides = slides;

  return {
    source: stringifyMutableDeck(source, deck),
    diagnostics: migration.diagnostics,
    movedSlots: migration.movedSlots,
    unassignedSlots: Object.keys(migration.unassignedSlots),
  };
}

export function addSlide(
  source: DeckSource,
  layout: LayoutName = "title-body",
  afterSlideId?: string,
): { readonly source: DeckSource; readonly slideId?: string } {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return { source };
  }

  const slides = getMutableSlides(deck);
  const id = uniqueSlideId(slides, "slide");
  const slide: MutableSlide = {
    id,
    layout,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" },
    },
  };
  const insertIndex = afterSlideId ? slides.findIndex((candidate) => candidate.id === afterSlideId) : -1;
  slides.splice(insertIndex >= 0 ? insertIndex + 1 : slides.length, 0, slide);
  deck.slides = slides;
  return { source: stringifyMutableDeck(source, deck), slideId: id };
}

export function duplicateSlide(source: DeckSource, slideId: string): DeckSource {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return source;
  }

  const slides = getMutableSlides(deck);
  const index = slides.findIndex((slide) => slide.id === slideId);
  if (index < 0) {
    return source;
  }

  const copy = structuredClone(slides[index]) as MutableSlide;
  copy.id = uniqueSlideId(slides, `${slideId}-copy`);
  slides.splice(index + 1, 0, copy);
  deck.slides = slides;
  return stringifyMutableDeck(source, deck);
}

export function deleteSlide(source: DeckSource, slideId: string): DeckSource {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return source;
  }

  const slides = getMutableSlides(deck).filter((slide) => slide.id !== slideId);
  deck.slides = slides.length > 0 ? slides : getMutableSlides(deck);
  return stringifyMutableDeck(source, deck);
}

export function moveSlide(
  source: DeckSource,
  slideId: string,
  targetSlideId: string,
  placement: SlideMovePlacement,
): DeckSource {
  if (slideId === targetSlideId) {
    return source;
  }

  const deck = parseMutableDeck(source);
  if (!deck) {
    return source;
  }

  const slides = getMutableSlides(deck);
  const sourceIndex = slides.findIndex((slide) => slide.id === slideId);
  const targetIndex = slides.findIndex((slide) => slide.id === targetSlideId);

  if (sourceIndex < 0 || targetIndex < 0) {
    return source;
  }

  const [slide] = slides.splice(sourceIndex, 1);
  const targetIndexAfterRemoval = slides.findIndex((candidate) => candidate.id === targetSlideId);
  const insertionIndex = placement === "after" ? targetIndexAfterRemoval + 1 : targetIndexAfterRemoval;

  slides.splice(insertionIndex, 0, slide);
  deck.slides = slides;
  return stringifyMutableDeck(source, deck);
}

export function getSlotMarkdown(source: DeckSource, slideId: string, slotName: SlotName): string {
  const slot = getSlot(source, slideId, slotName);
  if (isRecord(slot) && typeof slot.markdown === "string") {
    return slot.markdown;
  }
  return "";
}

export function getSlotImage(
  source: DeckSource,
  slideId: string,
  slotName: SlotName,
): { readonly assetId: string; readonly src: string; readonly alt: string } {
  const slot = getSlot(source, slideId, slotName);
  const image = isRecord(slot) && isRecord(slot.image) ? slot.image : {};

  return {
    assetId: typeof image.assetId === "string" ? image.assetId : "",
    src: typeof image.src === "string" ? image.src : "",
    alt: typeof image.alt === "string" ? image.alt : "",
  };
}

export function getSlideUnassignedSlots(
  source: DeckSource,
  slideId: string,
): Readonly<Record<string, unknown>> {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return {};
  }

  const slide = getMutableSlides(deck).find((candidate) => candidate.id === slideId);
  return isRecord(slide?.unassignedSlots) ? slide.unassignedSlots : {};
}

export function restoreUnassignedSlot(
  source: DeckSource,
  slideId: string,
  slotName: SlotName,
): DeckSource {
  return updateSlide(source, slideId, (slide) => {
    if (!isRecord(slide.unassignedSlots) || !(slotName in slide.unassignedSlots)) {
      return;
    }

    const slots = ensureSlots(slide);
    slots[slotName] = slide.unassignedSlots[slotName];
    delete slide.unassignedSlots[slotName];
    if (Object.keys(slide.unassignedSlots).length === 0) {
      delete slide.unassignedSlots;
    }
  });
}

function updateSlide(
  source: DeckSource,
  slideId: string,
  apply: (slide: MutableSlide) => void,
): DeckSource {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return source;
  }

  const slides = getMutableSlides(deck);
  const slide = slides.find((candidate) => candidate.id === slideId);
  if (!slide) {
    return source;
  }

  apply(slide);
  deck.slides = slides;
  return stringifyMutableDeck(source, deck);
}

function getSlot(source: DeckSource, slideId: string, slotName: SlotName): unknown {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return undefined;
  }

  const slide = getMutableSlides(deck).find((candidate) => candidate.id === slideId);
  return slide?.slots?.[slotName];
}

function getDefaultSlot(source: DeckSource, slotName: SlotName): unknown {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return undefined;
  }

  return isRecord(deck.defaults?.slots) ? deck.defaults.slots[slotName] : undefined;
}

function ensureSlots(slide: MutableSlide): Record<string, unknown> {
  if (!isRecord(slide.slots)) {
    slide.slots = {};
  }
  return slide.slots;
}

function ensureDefaultSlots(deck: MutableDeck): Record<string, unknown> {
  if (!isRecord(deck.defaults)) {
    deck.defaults = {};
  }

  if (!isRecord(deck.defaults.slots)) {
    deck.defaults.slots = {};
  }

  return deck.defaults.slots;
}

function migrateSlots(
  slide: MutableSlide,
  toLayout: LayoutName,
  layouts: LayoutRegistry,
): {
  readonly slots: Record<string, unknown>;
  readonly unassignedSlots: Record<string, unknown>;
  readonly diagnostics: readonly DeckDiagnostic[];
  readonly movedSlots: readonly {
    readonly from: SlotName;
    readonly to: SlotName;
  }[];
} {
  const previousSlots = isRecord(slide.slots) ? slide.slots : {};
  const previousUnassignedSlots = isRecord(slide.unassignedSlots) ? slide.unassignedSlots : {};
  const targetLayout = layouts.get(toLayout);
  const plan = slide.layout ? layouts.get(toLayout)?.migrateFrom?.[slide.layout] : undefined;

  const nextSlots: Record<string, unknown> = {};
  const nextUnassignedSlots: Record<string, unknown> = { ...previousUnassignedSlots };
  const consumedSlots = new Set<string>();
  const diagnostics: DeckDiagnostic[] = [];
  const movedSlots: { from: SlotName; to: SlotName }[] = [];

  if (plan) {
    for (const operation of plan.operations) {
      if (operation.kind === "move-slot" && operation.from in previousSlots) {
        nextSlots[operation.to] = previousSlots[operation.from];
        consumedSlots.add(operation.from);
        movedSlots.push({ from: operation.from, to: operation.to });

        if (operation.from !== operation.to) {
          diagnostics.push(layoutMigrationDiagnostic(
            "info",
            `Le contenu du slot '${operation.from}' a ete deplace vers '${operation.to}'.`,
            slide.id,
          ));
        }
      }

      if ((operation.kind === "drop-slot" || operation.kind === "keep-unassigned") && operation.slotName in previousSlots) {
        nextUnassignedSlots[operation.slotName] = previousSlots[operation.slotName];
        consumedSlots.add(operation.slotName);
        diagnostics.push(layoutMigrationDiagnostic(
          "warning",
          `Le slot '${operation.slotName}' a ete conserve hors rendu: ${operation.reason}`,
          slide.id,
        ));
      }
    }
  }

  for (const [slotName, slot] of Object.entries(previousSlots)) {
    if (consumedSlots.has(slotName)) {
      continue;
    }

    if (targetLayout && layoutSupportsSlot(targetLayout, slotName) && !(slotName in nextSlots)) {
      nextSlots[slotName] = slot;
      continue;
    }

    nextUnassignedSlots[slotName] = slot;
    diagnostics.push(layoutMigrationDiagnostic(
      "warning",
      `Le slot '${slotName}' ne correspond pas au layout '${toLayout}' et a ete conserve hors rendu.`,
      slide.id,
    ));
  }

  return {
    slots: nextSlots,
    unassignedSlots: nextUnassignedSlots,
    diagnostics,
    movedSlots,
  };
}

function layoutSupportsSlot(
  layout: { readonly requiredSlots: readonly SlotName[]; readonly optionalSlots: readonly SlotName[] },
  slotName: SlotName,
): boolean {
  return layout.requiredSlots.includes(slotName) || layout.optionalSlots.includes(slotName);
}

function layoutMigrationDiagnostic(
  severity: DeckDiagnostic["severity"],
  message: string,
  slideId?: string,
): DeckDiagnostic {
  return {
    code: "LAYOUT_UNASSIGNED_SLOT",
    severity,
    message,
    slideId,
    hint: "Le contenu reste disponible dans les slots non assignes du YAML.",
  };
}

function emptyLayoutMigrationResult(source: DeckSource): LayoutMigrationResult {
  return {
    source,
    diagnostics: [],
    movedSlots: [],
    unassignedSlots: [],
  };
}

function uniqueSlideId(slides: readonly MutableSlide[], prefix: string): string {
  const used = new Set(slides.map((slide) => slide.id).filter((id): id is string => Boolean(id)));
  let candidate = slugify(prefix);
  let index = 2;

  while (used.has(candidate)) {
    candidate = `${slugify(prefix)}-${index}`;
    index += 1;
  }

  return candidate;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "slide";
}

function removeEmptyFields(value: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
