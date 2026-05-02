import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  DeckShow,
  DeckStudio,
  defaultDeckRuntime,
  type CompileDeckResult,
  type DeckSource,
} from "../../../src";
import { SlideRenderer } from "../../../src/slideshow/SlideRenderer";
import "../../../src/styles/deck-runtime.css";
import "./styles.css";

const initialSource: DeckSource = {
  uri: "local://integrated-example.yml",
  content: `
version: 1
kind: deck
metadata:
  title: "Parcours leadership"
  description: "Exemple intégré dans une application métier"
  author: "Qastia"
  locale: "fr-FR"
theme:
  id: fintech-light
defaults:
  aspectRatio: "16:9"
  transition:
    in: fade
    out: fade
    durationMs: 180
slides:
  - id: ouverture
    layout: cover
    slots:
      eyebrow:
        markdown: |
          Atelier CODIR
      title:
        markdown: |
          # Aligner les décisions
      subtitle:
        markdown: |
          Un support éditable directement dans l’espace client.
      footer:
        markdown: |
          Sophie Jalon Conseil
  - id: cadrage
    layout: title-body
    slots:
      title:
        markdown: |
          ## Objectifs de la séquence
      body:
        markdown: |
          - Clarifier les arbitrages attendus
          - Partager les signaux faibles
          - Formaliser les prochaines décisions
          - Conserver une trace exploitable après l’atelier
  - id: comparaison
    layout: two-columns
    slots:
      title:
        markdown: |
          ## Avant / après
      left:
        markdown: |
          ### Avant

          - Slides figées
          - Retours dispersés
          - Versions difficiles à suivre
      right:
        markdown: |
          ### Avec Deck Runtime

          - Contenu structuré
          - Prévisualisation immédiate
          - Sauvegarde locale des versions
`,
};

function IntegratedExample(): React.ReactElement {
  const [source, setSource] = useState<DeckSource>(initialSource);
  const [compileResult, setCompileResult] = useState<CompileDeckResult | null>(null);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const presentationRef = useRef<HTMLElement | null>(null);

  const renderedDeck = useMemo(() => {
    if (compileResult?.status === "valid" || compileResult?.status === "degraded") {
      return compileResult.deck;
    }
    return undefined;
  }, [compileResult]);

  const canPresent = compileResult?.status === "valid" && renderedDeck !== undefined;
  const presentationSlide = renderedDeck?.slides[presentationIndex];

  const openPresentation = useCallback(() => {
    if (!canPresent) {
      return;
    }

    setPresentationIndex(0);
    setPresentationOpen(true);
  }, [canPresent]);

  const closePresentation = useCallback(() => {
    setPresentationOpen(false);

    if (document.fullscreenElement === presentationRef.current) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  const goToPresentationSlide = useCallback(
    (offset: number): void => {
      if (!renderedDeck) {
        return;
      }

      setPresentationIndex((currentIndex) =>
        Math.min(Math.max(currentIndex + offset, 0), renderedDeck.slides.length - 1),
      );
    },
    [renderedDeck],
  );

  useEffect(() => {
    if (presentationOpen && !canPresent) {
      closePresentation();
    }
  }, [canPresent, closePresentation, presentationOpen]);

  useEffect(() => {
    if (!presentationOpen) {
      return;
    }

    const presentationElement = presentationRef.current;
    if (presentationElement?.requestFullscreen && document.fullscreenElement !== presentationElement) {
      void presentationElement.requestFullscreen().catch(() => undefined);
    }

    function handleFullscreenChange(): void {
      if (document.fullscreenElement === null) {
        setPresentationOpen(false);
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [presentationOpen]);

  useEffect(() => {
    if (!presentationOpen) {
      return;
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

      if (event.key === "Escape") {
        closePresentation();
      }

      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        goToPresentationSlide(1);
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        goToPresentationSlide(-1);
      }
    }

    window.addEventListener("keydown", handlePresentationKeys, true);
    return () => window.removeEventListener("keydown", handlePresentationKeys, true);
  }, [closePresentation, goToPresentationSlide, presentationOpen]);

  return (
    <main className="integrated-shell">
      <section className="workspace-band">
        <div className="workspace-header">
          <div>
            <p>Session client</p>
            <h1>Support intégré</h1>
          </div>
          <div className="status-strip">
            <span data-status={compileResult?.status ?? "pending"}>
              {compileResult?.status ?? "pending"}
            </span>
            <span>{compileResult?.diagnostics.length ?? 0} diagnostic(s)</span>
          </div>
        </div>

        <div className="integrated-grid">
          <section className="viewer-pane" aria-label="Lecture intégrée">
            {renderedDeck ? (
              <div className="viewer-with-presentation">
                <button
                  type="button"
                  className="presentation-button"
                  onClick={openPresentation}
                  disabled={!canPresent}
                  aria-disabled={!canPresent}
                  title={
                    canPresent
                      ? "Afficher en presentation plein ecran"
                      : "Disponible uniquement sans erreur de compilation"
                  }
                >
                  Presentation
                </button>
                <DeckShow deck={renderedDeck} mode="embedded" />
              </div>
            ) : (
              <div className="fallback-pane">Le deck sera affiché dès que la source sera valide.</div>
            )}
          </section>

          <section className="editor-pane" aria-label="Edition intégrée">
            <DeckStudio
              mode="controlled"
              deckId="integrated-example"
              value={source}
              onChange={(nextSource) => setSource(nextSource)}
              runtime={defaultDeckRuntime}
              storage={false}
              layout={{
                showInspector: true,
                showVersionHistory: false,
                showSourceModeToggle: true,
                showActiveSlidePreview: false,
                density: "compact",
              }}
              features={{
                allowPdfExport: false,
                allowVersionRestore: false,
                allowVersionCompare: false,
              }}
              onCompile={setCompileResult}
            />
          </section>
        </div>
      </section>

      {presentationOpen && renderedDeck && presentationSlide ? (
        <section
          ref={presentationRef}
          className={`presentation-overlay ${renderedDeck.theme.cssClassName}`}
          role="dialog"
          aria-modal="true"
          aria-label="Presentation plein ecran"
        >
          <div className="presentation-stage">
            <SlideRenderer slide={presentationSlide} target="screen" />
          </div>
          <div className="presentation-controls" aria-label="Navigation presentation">
            <button
              type="button"
              onClick={() => goToPresentationSlide(-1)}
              disabled={presentationIndex === 0}
              aria-label="Slide precedente"
            >
              Previous
            </button>
            <span>
              {presentationIndex + 1} / {renderedDeck.slides.length}
            </span>
            <button
              type="button"
              onClick={() => goToPresentationSlide(1)}
              disabled={presentationIndex >= renderedDeck.slides.length - 1}
              aria-label="Slide suivante"
            >
              Next
            </button>
            <button type="button" onClick={closePresentation}>
              Quitter
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<IntegratedExample />);
