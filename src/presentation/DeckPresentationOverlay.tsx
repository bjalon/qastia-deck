import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ActionOrigin,
  DeckPresentationOverlayProps,
} from "../publicTypes";
import { DeckViewport } from "../slideshow/DeckViewport";
import { useDeckNavigation } from "../slideshow/useDeckNavigation";
import { PresentationControls } from "./PresentationControls";

export function DeckPresentationOverlay({
  deck,
  defaultOpen = false,
  initialSlideId,
  onAction,
  onOpenChange,
  onSlideChange,
  open,
  options,
  selectedSlideId,
}: DeckPresentationOverlayProps): React.ReactElement | null {
  const overlayRef = useRef<HTMLElement | null>(null);
  const autoHideTimeoutRef = useRef<number | undefined>(undefined);
  const activeSlideIdRef = useRef<string | undefined>(undefined);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [autoControlsVisible, setAutoControlsVisible] = useState(true);
  const { activeIndex, activeSlide, emitAction, goTo, resetToSlideId } = useDeckNavigation({
    deck,
    initialSlideId,
    onAction,
    onSlideChange,
    selectedSlideId,
  });
  const isOpen = open ?? internalOpen;
  const fullscreenStrategy = options?.fullscreen?.strategy ?? "browser-fullscreen";
  const closeOnEscape = options?.fullscreen?.closeOnEscape ?? true;
  const controlsVisibility = options?.controls?.visibility ?? "auto";
  const autoHideDelayMs = options?.controls?.visibility === "auto"
    ? options.controls.autoHideDelayMs ?? 1800
    : 1800;
  const showHintWhenControlsHidden = options?.hint?.showWhenControlsHidden ?? true;
  const hintText = options?.hint?.text ?? "Fleches gauche/droite: precedent/suivant. Escape: quitter.";
  const hintPosition = options?.hint?.position ?? "bottom-right";
  activeSlideIdRef.current = activeSlide?.id;

  const setOpen = useCallback(
    (nextOpen: boolean, origin: ActionOrigin): void => {
      if (open === undefined) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.({
        open: nextOpen,
        origin,
        slideId: activeSlideIdRef.current,
        createdAtIso: new Date().toISOString(),
      });
    },
    [onOpenChange, open],
  );

  const closePresentation = useCallback(
    (origin: ActionOrigin = "mouse"): void => {
      const overlayElement = overlayRef.current;
      if (document.fullscreenElement === overlayElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
      setOpen(false, origin);
      emitAction({
        type: "toggle-fullscreen",
        origin,
        slideId: activeSlide?.id,
        createdAtIso: new Date().toISOString(),
      });
    },
    [activeSlide?.id, emitAction, setOpen],
  );

  const clearAutoHideTimeout = useCallback((): void => {
    if (autoHideTimeoutRef.current !== undefined) {
      window.clearTimeout(autoHideTimeoutRef.current);
      autoHideTimeoutRef.current = undefined;
    }
  }, []);

  const showAutoControls = useCallback((): void => {
    if (controlsVisibility !== "auto") {
      return;
    }

    setAutoControlsVisible(true);
    clearAutoHideTimeout();
    autoHideTimeoutRef.current = window.setTimeout(() => {
      setAutoControlsVisible(false);
      autoHideTimeoutRef.current = undefined;
    }, autoHideDelayMs);
  }, [autoHideDelayMs, clearAutoHideTimeout, controlsVisibility]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    resetToSlideId(initialSlideId);
  }, [initialSlideId, isOpen, resetToSlideId]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    if (controlsVisibility === "auto") {
      showAutoControls();
      return clearAutoHideTimeout;
    }

    setAutoControlsVisible(controlsVisibility === "visible");
    clearAutoHideTimeout();
    return undefined;
  }, [clearAutoHideTimeout, controlsVisibility, isOpen, showAutoControls]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const overlayElement = overlayRef.current;
    if (fullscreenStrategy === "browser-fullscreen" && overlayElement?.requestFullscreen) {
      void overlayElement.requestFullscreen().catch(() => undefined);
    }

    function handleFullscreenChange(): void {
      if (fullscreenStrategy === "browser-fullscreen" && document.fullscreenElement === null) {
        setOpen(false, "keyboard");
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement === overlayElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
    };
  }, [fullscreenStrategy, isOpen, setOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePresentationKeys(event: KeyboardEvent): void {
      if (
        event.key === "Escape" ||
        event.key === "ArrowRight" ||
        event.key === "PageDown" ||
        event.key === " " ||
        event.key === "ArrowLeft" ||
        event.key === "PageUp"
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      if (event.key === "Escape" && closeOnEscape) {
        closePresentation("keyboard");
      }

      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        goTo(activeIndex + 1, "keyboard");
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        goTo(activeIndex - 1, "keyboard");
      }
    }

    window.addEventListener("keydown", handlePresentationKeys, true);
    return () => window.removeEventListener("keydown", handlePresentationKeys, true);
  }, [activeIndex, closeOnEscape, closePresentation, goTo, isOpen]);

  if (!isOpen || !activeSlide) {
    return null;
  }

  const showControls = controlsVisibility === "visible" || (controlsVisibility === "auto" && autoControlsVisible);
  const showHint = showHintWhenControlsHidden && !showControls;

  return (
    <section
      ref={overlayRef}
      className={`deck-presentation-overlay ${deck.theme.cssClassName}`}
      role="dialog"
      aria-modal="true"
      aria-label="Presentation plein ecran"
      onMouseMove={showAutoControls}
      onPointerMove={showAutoControls}
    >
      <div className="deck-presentation-stage">
        <DeckViewport deck={deck} activeIndex={activeIndex} />
      </div>
      {showControls ? (
        <PresentationControls
          activeIndex={activeIndex}
          slideCount={deck.slides.length}
          onPrevious={() => goTo(activeIndex - 1, "mouse")}
          onNext={() => goTo(activeIndex + 1, "mouse")}
          onClose={() => closePresentation("mouse")}
        />
      ) : null}
      {showHint ? (
        <p className="deck-presentation-hint" data-position={hintPosition}>
          {hintText}
        </p>
      ) : null}
    </section>
  );
}
