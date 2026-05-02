import { useCallback, useEffect, useRef } from "react";
import type { DeckShowProps } from "../publicTypes";
import { DeckNavigationToolbar } from "./DeckNavigationToolbar";
import { DeckViewport } from "./DeckViewport";
import { useDeckNavigation } from "./useDeckNavigation";

export function DeckShow({
  controls,
  deck,
  defaultSelectedSlideId,
  initialSlideId,
  keyboardNavigation,
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
  const rootRef = useRef<HTMLDivElement>(null);
  const keyboardNavigationMode = keyboardNavigation ?? (mode === "embedded" ? "focus-within" : "global");

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
    if (keyboardNavigationMode === false) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (isEditableEventTarget(event.target)) {
        return;
      }

      if (
        keyboardNavigationMode === "focus-within" &&
        (!(event.target instanceof Node) || !rootRef.current?.contains(event.target))
      ) {
        return;
      }

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
  }, [activeIndex, goTo, keyboardNavigationMode]);

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
    <div
      ref={rootRef}
      className={`deck-screen-root ${deck.theme.cssClassName}`}
      data-mode={mode}
      tabIndex={keyboardNavigationMode === "focus-within" ? 0 : undefined}
    >
      {controlsPlacement === "top" ? toolbar : null}
      <DeckViewport deck={deck} activeIndex={activeIndex} />
      {controlsPlacement === "bottom" ? toolbar : null}
    </div>
  );
}

function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']"),
  );
}
