import { useCallback, useEffect, useRef, useState } from "react";
import type { CompiledDeck, DeckPresentationControlsMode } from "../publicTypes";
import { SlideRenderer } from "./SlideRenderer";

type DeckPresentationOverlayProps = {
  readonly deck: CompiledDeck;
  readonly activeIndex: number;
  readonly controlsMode: DeckPresentationControlsMode;
  readonly autoHideDelayMs: number;
  readonly requestBrowserFullscreen: boolean;
  readonly closeOnEscape: boolean;
  readonly hintText: string;
  readonly showHintWhenControlsHidden: boolean;
  readonly onClose: () => void;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
};

export function DeckPresentationOverlay({
  activeIndex,
  autoHideDelayMs,
  closeOnEscape,
  controlsMode,
  deck,
  hintText,
  onClose,
  onNext,
  onPrevious,
  requestBrowserFullscreen,
  showHintWhenControlsHidden,
}: DeckPresentationOverlayProps): React.ReactElement | null {
  const overlayRef = useRef<HTMLElement | null>(null);
  const autoHideTimeoutRef = useRef<number | undefined>(undefined);
  const [autoControlsVisible, setAutoControlsVisible] = useState(true);
  const activeSlide = deck.slides[activeIndex] ?? deck.slides[0];

  const closePresentation = useCallback((): void => {
    const overlayElement = overlayRef.current;
    if (document.fullscreenElement === overlayElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
    onClose();
  }, [onClose]);

  const clearAutoHideTimeout = useCallback((): void => {
    if (autoHideTimeoutRef.current !== undefined) {
      window.clearTimeout(autoHideTimeoutRef.current);
      autoHideTimeoutRef.current = undefined;
    }
  }, []);

  const showAutoControls = useCallback((): void => {
    if (controlsMode !== "auto") {
      return;
    }

    setAutoControlsVisible(true);
    clearAutoHideTimeout();
    autoHideTimeoutRef.current = window.setTimeout(() => {
      setAutoControlsVisible(false);
      autoHideTimeoutRef.current = undefined;
    }, autoHideDelayMs);
  }, [autoHideDelayMs, clearAutoHideTimeout, controlsMode]);

  useEffect(() => {
    if (controlsMode === "auto") {
      showAutoControls();
      return clearAutoHideTimeout;
    }

    setAutoControlsVisible(controlsMode === "visible");
    clearAutoHideTimeout();
    return undefined;
  }, [clearAutoHideTimeout, controlsMode, showAutoControls]);

  useEffect(() => {
    const overlayElement = overlayRef.current;
    if (requestBrowserFullscreen && overlayElement?.requestFullscreen) {
      void overlayElement.requestFullscreen().catch(() => undefined);
    }

    function handleFullscreenChange(): void {
      if (requestBrowserFullscreen && document.fullscreenElement === null) {
        onClose();
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement === overlayElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
    };
  }, [onClose, requestBrowserFullscreen]);

  useEffect(() => {
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
        closePresentation();
      }

      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        onNext();
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        onPrevious();
      }
    }

    window.addEventListener("keydown", handlePresentationKeys, true);
    return () => window.removeEventListener("keydown", handlePresentationKeys, true);
  }, [closeOnEscape, closePresentation, onNext, onPrevious]);

  if (!activeSlide) {
    return null;
  }

  const showControls = controlsMode === "visible" || (controlsMode === "auto" && autoControlsVisible);
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
        <SlideRenderer slide={activeSlide} target="screen" />
      </div>
      {showControls ? (
        <div className="deck-presentation-controls" aria-label="Navigation presentation">
          <button type="button" onClick={onPrevious} disabled={activeIndex === 0} aria-label="Slide precedente">
            Previous
          </button>
          <span>
            {activeIndex + 1} / {deck.slides.length}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={activeIndex >= deck.slides.length - 1}
            aria-label="Slide suivante"
          >
            Next
          </button>
          <button type="button" onClick={closePresentation}>
            Quitter
          </button>
        </div>
      ) : null}
      {showHint ? <p className="deck-presentation-hint">{hintText}</p> : null}
    </section>
  );
}
