import { useCallback, useEffect, useMemo, useState } from "react";
import type { DeckShowProps, DeckUserAction } from "../publicTypes";
import { SlideRenderer } from "./SlideRenderer";

export function DeckShow({
  deck,
  initialSlideId,
  mode = "viewer",
  onAction,
  onSlideChange,
}: DeckShowProps): React.ReactElement {
  const initialIndex = Math.max(
    0,
    deck.slides.findIndex((slide) => slide.id === initialSlideId),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex === -1 ? 0 : initialIndex);
  const activeSlide = deck.slides[activeIndex] ?? deck.slides[0];

  const state = useMemo(
    () => ({
      activeSlideId: activeSlide.id,
      activeSlideIndex: activeIndex,
    }),
    [activeIndex, activeSlide.id],
  );

  const emitAction = useCallback(
    (event: DeckUserAction): void => {
      onAction?.(event, state);
    },
    [onAction, state],
  );

  const goTo = useCallback(
    (nextIndex: number, origin: DeckUserAction["origin"]): void => {
      const boundedIndex = Math.min(Math.max(nextIndex, 0), deck.slides.length - 1);
      const previousSlideId = activeSlide.id;

      setActiveIndex(boundedIndex);
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
    [activeIndex, activeSlide.id, deck.slides, emitAction, onSlideChange],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        goTo(activeIndex + 1, "keyboard");
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goTo(activeIndex - 1, "keyboard");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, goTo]);

  return (
    <div className={`deck-screen-root ${deck.theme.cssClassName}`} data-mode={mode}>
      <div className="deck-show-toolbar" aria-label="Deck navigation">
        <button type="button" onClick={() => goTo(activeIndex - 1, "mouse")} disabled={activeIndex === 0}>
          Previous
        </button>
        <span>
          {activeIndex + 1} / {deck.slides.length}
        </span>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1, "mouse")}
          disabled={activeIndex >= deck.slides.length - 1}
        >
          Next
        </button>
      </div>
      {activeSlide ? <SlideRenderer slide={activeSlide} target="screen" /> : null}
    </div>
  );
}
