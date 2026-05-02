import YAML from "yaml";
import type { DeckSource, LayoutName, SlotName } from "../publicTypes";

type MutableDeck = Record<string, unknown> & {
  slides?: MutableSlide[];
};

type MutableSlide = Record<string, unknown> & {
  id?: string;
  layout?: string;
  slots?: Record<string, unknown>;
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

export function updateSlideLayout(source: DeckSource, slideId: string, layout: LayoutName): DeckSource {
  return updateSlide(source, slideId, (slide) => {
    slide.layout = layout;
  });
}

export function addSlide(source: DeckSource, layout: LayoutName = "title-body"): DeckSource {
  const deck = parseMutableDeck(source);
  if (!deck) {
    return source;
  }

  const slides = getMutableSlides(deck);
  const id = uniqueSlideId(slides, "slide");
  slides.push({
    id,
    layout,
    slots: {
      title: { markdown: "## New slide" },
      body: { markdown: "" },
    },
  });
  deck.slides = slides;
  return stringifyMutableDeck(source, deck);
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

function ensureSlots(slide: MutableSlide): Record<string, unknown> {
  if (!isRecord(slide.slots)) {
    slide.slots = {};
  }
  return slide.slots;
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
