import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  DeckShow,
  DeckStudio,
  defaultDeckRuntime,
  type CompileDeckResult,
  type DeckPresentationControlsMode,
  type DeckSource,
} from "../../../src";
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
  const [showPreviewPane, setShowPreviewPane] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [presentationControlsMode, setPresentationControlsMode] =
    useState<DeckPresentationControlsMode>("auto");

  const renderedDeck = useMemo(() => {
    if (compileResult?.status === "valid" || compileResult?.status === "degraded") {
      return compileResult.deck;
    }
    return undefined;
  }, [compileResult]);

  const canPresent = compileResult?.status === "valid" && renderedDeck !== undefined;

  return (
    <main className="integrated-shell">
      <section className="workspace-band">
        <div className="workspace-header">
          <div>
            <p>Session client</p>
            <h1>Support intégré</h1>
          </div>
          <div className="workspace-actions">
            <button type="button" onClick={() => setShowPreviewPane((value) => !value)}>
              {showPreviewPane ? "Masquer preview" : "Afficher preview"}
            </button>
            <button type="button" onClick={() => setShowDiagnostics((value) => !value)}>
              {showDiagnostics ? "Masquer diagnostics" : "Afficher diagnostics"}
            </button>
            <div className="status-strip">
              <span data-status={compileResult?.status ?? "pending"}>
                {compileResult?.status ?? "pending"}
              </span>
              <span>{compileResult?.diagnostics.length ?? 0} diagnostic(s)</span>
            </div>
          </div>
        </div>

        <div className="integrated-grid" data-preview={showPreviewPane ? "visible" : "hidden"}>
          {showPreviewPane ? (
            <section className="viewer-pane" aria-label="Lecture intégrée">
              {renderedDeck ? (
                <DeckShow
                  deck={renderedDeck}
                  mode="embedded"
                  controls={{
                    showPresentationButton: true,
                    showPresentationControlsModeSelect: true,
                    presentationUnavailableLabel: "Disponible uniquement sans erreur de compilation",
                  }}
                  presentation={{
                    canOpen: canPresent,
                    controlsMode: presentationControlsMode,
                    onControlsModeChange: setPresentationControlsMode,
                    controls: {
                      autoHideDelayMs: 1800,
                    },
                    hint: {
                      text: "Fleches gauche/droite: precedent/suivant. Escape: quitter.",
                    },
                  }}
                />
              ) : (
                <div className="fallback-pane">Le deck sera affiché dès que la source sera valide.</div>
              )}
            </section>
          ) : null}

          <section className="editor-pane" aria-label="Edition intégrée">
            <DeckStudio
              mode="controlled"
              deckId="integrated-example"
              value={source}
              onChange={(nextSource) => setSource(nextSource)}
              runtime={defaultDeckRuntime}
              storage={false}
              layout={{
                showInspector: showDiagnostics,
                showDiagnosticsPanel: showDiagnostics,
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
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<IntegratedExample />);
