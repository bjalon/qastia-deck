import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  DeckShow,
  DeckStudio,
  compileDeck,
  defaultDeckRuntime,
  type CompileDeckResult,
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

  const renderedDeck = useMemo(() => {
    if (compileResult?.status === "valid" || compileResult?.status === "degraded") {
      return compileResult.deck;
    }
    return undefined;
  }, [compileResult]);

  useEffect(() => {
    let cancelled = false;

    void compileDeck(source, {
      runtime: defaultDeckRuntime,
      mode: "viewer",
      locale: "fr-FR",
    }).then((result) => {
      if (!cancelled) {
        setCompileResult(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [source]);

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
              <DeckShow deck={renderedDeck} mode="embedded" />
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
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<IntegratedExample />);
