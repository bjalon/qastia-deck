import { useCallback, useMemo, useState } from "react";
import type {
  ActionOrigin,
  CompiledDeck,
  DeckRuntimeState,
  DeckUserAction,
  SlideChangeEvent,
} from "../publicTypes";

type UseDeckNavigationOptions = {
  readonly deck: CompiledDeck;
  readonly selectedSlideId?: string;
  readonly defaultSelectedSlideId?: string;
  readonly initialSlideId?: string;
  readonly onAction?: (event: DeckUserAction, state: DeckRuntimeState) => void;
  readonly onSlideChange?: (event: SlideChangeEvent) => void;
};

function slideIndex(deck: CompiledDeck, slideId?: string): number {
  if (!slideId) {
    return 0;
  }

  const index = deck.slides.findIndex((slide) => slide.id === slideId);
  return index === -1 ? 0 : index;
}

export function useDeckNavigation({
  deck,
  defaultSelectedSlideId,
  initialSlideId,
  onAction,
  onSlideChange,
  selectedSlideId,
}: UseDeckNavigationOptions) {
  const initialIndex = slideIndex(deck, defaultSelectedSlideId ?? initialSlideId);
  const controlledIndex = selectedSlideId
    ? deck.slides.findIndex((slide) => slide.id === selectedSlideId)
    : -1;
  const [internalActiveIndex, setInternalActiveIndex] = useState(initialIndex);
  const activeIndex = controlledIndex >= 0 ? controlledIndex : internalActiveIndex;
  const activeSlide = deck.slides[activeIndex] ?? deck.slides[0];

  const state = useMemo<DeckRuntimeState>(
    () => ({
      activeSlideId: activeSlide?.id ?? "",
      activeSlideIndex: activeIndex,
    }),
    [activeIndex, activeSlide?.id],
  );

  const emitAction = useCallback(
    (event: DeckUserAction): void => {
      onAction?.(event, state);
    },
    [onAction, state],
  );

  const goTo = useCallback(
    (nextIndex: number, origin: ActionOrigin): void => {
      const boundedIndex = Math.min(Math.max(nextIndex, 0), deck.slides.length - 1);
      const previousSlideId = activeSlide?.id;

      if (controlledIndex < 0) {
        setInternalActiveIndex(boundedIndex);
      }

      const nextSlide = deck.slides[boundedIndex];
      if (nextSlide && nextSlide.id !== previousSlideId) {
        onSlideChange?.({
          previousSlideId,
          activeSlideId: nextSlide.id,
          activeSlideIndex: boundedIndex,
        });
      }

      emitAction({
        type: boundedIndex > activeIndex ? "next-slide" : "previous-slide",
        origin,
        slideId: nextSlide?.id,
        createdAtIso: new Date().toISOString(),
      });
    },
    [activeIndex, activeSlide?.id, controlledIndex, deck.slides, emitAction, onSlideChange],
  );

  const resetToSlideId = useCallback(
    (slideId?: string): void => {
      if (controlledIndex >= 0) {
        return;
      }

      setInternalActiveIndex(slideIndex(deck, slideId));
    },
    [controlledIndex, deck],
  );

  return {
    activeIndex,
    activeSlide,
    emitAction,
    goTo,
    resetToSlideId,
    state,
  };
}
