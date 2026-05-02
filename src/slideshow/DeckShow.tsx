import { useCallback, useEffect, useMemo, useState } from "react";
import type { DeckPresentationControlsMode, DeckShowProps, DeckUserAction } from "../publicTypes";
import { DeckNavigationToolbar } from "./DeckNavigationToolbar";
import { DeckPresentationOverlay } from "./DeckPresentationOverlay";
import { SlideRenderer } from "./SlideRenderer";

export function DeckShow({
  controls,
  deck,
  initialSlideId,
  mode = "viewer",
  onAction,
  onSlideChange,
  presentation,
}: DeckShowProps): React.ReactElement {
  const initialIndex = Math.max(
    0,
    deck.slides.findIndex((slide) => slide.id === initialSlideId),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex === -1 ? 0 : initialIndex);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [localPresentationControlsMode, setLocalPresentationControlsMode] =
    useState<DeckPresentationControlsMode>(
      presentation !== false
        ? presentation?.controlsMode ?? presentation?.controls?.mode ?? "auto"
        : "auto",
    );
  const activeSlide = deck.slides[activeIndex] ?? deck.slides[0];
  const presentationOptions = presentation === false ? undefined : presentation;
  const presentationEnabled = presentation !== false && presentationOptions?.enabled !== false;
  const presentationAvailable = presentationOptions?.canOpen ?? true;
  const showToolbar = controls?.visible !== false;
  const showPresentationButton = Boolean(controls?.showPresentationButton && presentationEnabled);
  const presentationControlsMode =
    presentationOptions?.controlsMode ?? presentationOptions?.controls?.mode ?? localPresentationControlsMode;

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

  const openPresentation = useCallback((): void => {
    if (!presentationEnabled || !presentationAvailable) {
      return;
    }

    setPresentationOpen(true);
    emitAction({
      type: "toggle-fullscreen",
      origin: "mouse",
      slideId: activeSlide.id,
      createdAtIso: new Date().toISOString(),
    });
  }, [activeSlide.id, emitAction, presentationAvailable, presentationEnabled]);

  const closePresentation = useCallback((): void => {
    setPresentationOpen(false);
    emitAction({
      type: "toggle-fullscreen",
      origin: "mouse",
      slideId: activeSlide.id,
      createdAtIso: new Date().toISOString(),
    });
  }, [activeSlide.id, emitAction]);

  const updatePresentationControlsMode = useCallback(
    (nextMode: DeckPresentationControlsMode): void => {
      setLocalPresentationControlsMode(nextMode);
      presentationOptions?.onControlsModeChange?.(nextMode);
    },
    [presentationOptions],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (presentationOpen) {
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
  }, [activeIndex, goTo, presentationOpen]);

  useEffect(() => {
    if (presentationOpen && (!presentationEnabled || !presentationAvailable)) {
      setPresentationOpen(false);
    }
  }, [presentationAvailable, presentationEnabled, presentationOpen]);

  return (
    <div className={`deck-screen-root ${deck.theme.cssClassName}`} data-mode={mode}>
      {showToolbar ? (
        <DeckNavigationToolbar
          activeIndex={activeIndex}
          slideCount={deck.slides.length}
          showPresentationButton={showPresentationButton}
          canOpenPresentation={presentationAvailable}
          showPresentationControlsModeSelect={Boolean(controls?.showPresentationControlsModeSelect)}
          presentationControlsMode={presentationControlsMode}
          presentationButtonLabel={controls?.presentationButtonLabel ?? "Presentation"}
          presentationUnavailableLabel={
            controls?.presentationUnavailableLabel ?? "Presentation is unavailable"
          }
          onOpenPresentation={openPresentation}
          onPresentationControlsModeChange={updatePresentationControlsMode}
          onPrevious={() => goTo(activeIndex - 1, "mouse")}
          onNext={() => goTo(activeIndex + 1, "mouse")}
        />
      ) : null}
      {activeSlide ? <SlideRenderer slide={activeSlide} target="screen" /> : null}
      {presentationOpen && presentationEnabled ? (
        <DeckPresentationOverlay
          deck={deck}
          activeIndex={activeIndex}
          controlsMode={presentationControlsMode}
          autoHideDelayMs={presentationOptions?.controls?.autoHideDelayMs ?? 1800}
          requestBrowserFullscreen={presentationOptions?.fullscreen?.requestBrowserFullscreen ?? true}
          closeOnEscape={presentationOptions?.fullscreen?.closeOnEscape ?? true}
          hintText={
            presentationOptions?.hint?.text ??
            "Fleches gauche/droite: precedent/suivant. Escape: quitter."
          }
          showHintWhenControlsHidden={presentationOptions?.hint?.showWhenControlsHidden ?? true}
          onClose={closePresentation}
          onPrevious={() => goTo(activeIndex - 1, "keyboard")}
          onNext={() => goTo(activeIndex + 1, "keyboard")}
        />
      ) : null}
    </div>
  );
}
