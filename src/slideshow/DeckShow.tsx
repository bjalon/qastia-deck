import { useCallback, useEffect } from "react";
import type { DeckShowProps } from "../publicTypes";
import { DeckNavigationToolbar } from "./DeckNavigationToolbar";
import { DeckViewport } from "./DeckViewport";
import { useDeckNavigation } from "./useDeckNavigation";

export function DeckShow({
  controls,
  deck,
  defaultSelectedSlideId,
  initialSlideId,
  mode = "viewer",
  onAction,
  onRequestPresentation,
  onSlideChange,
  selectedSlideId,
}: DeckShowProps): React.ReactElement {
  const { activeIndex, activeSlide, emitAction, goTo } = useDeckNavigation({
    deck,
    defaultSelectedSlideId,
    initialSlideId,
    onAction,
    onSlideChange,
    selectedSlideId,
  });
  const controlsOptions = controls === false ? undefined : controls;
  const showToolbar = controls !== false;
  const showPreviousNext = controlsOptions?.showPreviousNext ?? true;
  const showCounter = controlsOptions?.showCounter ?? true;
  const showPresentationButton = Boolean(controlsOptions?.showPresentationButton);

  const requestPresentation = useCallback((): void => {
    if (controlsOptions?.presentationDisabled) {
      return;
    }

    onRequestPresentation?.({
      type: "presentation-requested",
      slideId: activeSlide?.id,
      activeSlideIndex: activeIndex,
      createdAtIso: new Date().toISOString(),
    });
    emitAction({
      type: "toggle-fullscreen",
      origin: "mouse",
      slideId: activeSlide?.id,
      createdAtIso: new Date().toISOString(),
    });
  }, [activeIndex, activeSlide?.id, controlsOptions?.presentationDisabled, emitAction, onRequestPresentation]);

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

  const controlsPlacement = controlsOptions?.placement ?? "top";
  const toolbar = showToolbar ? (
    <DeckNavigationToolbar
      activeIndex={activeIndex}
      slideCount={deck.slides.length}
      placement={controlsPlacement}
      showPreviousNext={showPreviousNext}
      showCounter={showCounter}
      showPresentationButton={showPresentationButton}
      presentationDisabled={Boolean(controlsOptions?.presentationDisabled)}
      showPresentationControlsModeSelect={Boolean(controlsOptions?.showPresentationControlsModeSelect)}
      presentationControlsMode={controlsOptions?.presentationControlsMode ?? "auto"}
      presentationButtonLabel={controlsOptions?.presentationButtonLabel ?? "Presentation"}
      presentationUnavailableLabel={
        controlsOptions?.presentationUnavailableLabel ?? "Presentation is unavailable"
      }
      onOpenPresentation={requestPresentation}
      onPresentationControlsModeChange={(nextMode) =>
        controlsOptions?.onPresentationControlsModeChange?.(nextMode)
      }
      onPrevious={() => goTo(activeIndex - 1, "mouse")}
      onNext={() => goTo(activeIndex + 1, "mouse")}
    />
  ) : null;

  return (
    <div className={`deck-screen-root ${deck.theme.cssClassName}`} data-mode={mode}>
      {controlsPlacement === "top" ? toolbar : null}
      <DeckViewport deck={deck} activeIndex={activeIndex} />
      {controlsPlacement === "bottom" ? toolbar : null}
    </div>
  );
}
