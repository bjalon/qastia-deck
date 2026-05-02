import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import YAML from "yaml";
import {
  DeckPresentationOverlay,
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
  slots:
    eyebrow:
      markdown: |
        Atelier CODIR
    footer:
      markdown: |
        Sophie Jalon Conseil
slides:
  - id: ouverture
    layout: cover
    slots:
      title:
        markdown: |
          Aligner les décisions
      subtitle:
        markdown: |
          Un support éditable directement dans l’espace client.
  - id: cadrage
    layout: title-body
    slots:
      title:
        markdown: |
          Objectifs de la séquence
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
          Avant / après
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
      footer:
        markdown: |
          Sophie Jalon Conseil - Synthèse comparative
`,
};

const slideThemeOptions = Array.from(defaultDeckRuntime.themes.values()).filter(
  (theme) => theme.id !== "default",
);

function IntegratedExample(): React.ReactElement {
  const [source, setSource] = useState<DeckSource>(initialSource);
  const [compileResult, setCompileResult] = useState<CompileDeckResult | null>(null);
  const [showPreviewPane, setShowPreviewPane] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [presentationControlsMode, setPresentationControlsMode] =
    useState<DeckPresentationControlsMode>("auto");
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [presentationInitialSlideId, setPresentationInitialSlideId] = useState<string | undefined>();
  const [activePreviewSlideId, setActivePreviewSlideId] = useState<string | undefined>();

  const renderedDeck = useMemo(() => {
    if (compileResult?.status === "valid" || compileResult?.status === "degraded") {
      return compileResult.deck;
    }
    return undefined;
  }, [compileResult]);

  const canPresent = compileResult?.status === "valid" && renderedDeck !== undefined;
  const activeThemeId = readThemeId(source);

  useEffect(() => {
    if (!canPresent) {
      setPresentationOpen(false);
    }
  }, [canPresent]);

  return (
    <main className="integrated-shell">
      <section className="workspace-band">
        <div className="workspace-header">
          <div>
            <p>Session client</p>
            <h1>Support intégré</h1>
          </div>
          <div className="workspace-actions">
            <button
              type="button"
              className="primary-action"
              onClick={() => {
                if (!canPresent) {
                  return;
                }
                setPresentationInitialSlideId(activePreviewSlideId ?? renderedDeck?.slides[0]?.id);
                setPresentationOpen(true);
              }}
              disabled={!canPresent}
              title={canPresent ? "Afficher en presentation plein ecran" : "Disponible uniquement sans erreur de compilation"}
            >
              Presentation
            </button>
            <label className="workspace-select">
              <span>Style des slides</span>
              <select
                value={activeThemeId}
                onChange={(event) => {
                  const nextThemeId = event.currentTarget.value;
                  setSource((currentSource) => updateDeckTheme(currentSource, nextThemeId));
                }}
              >
                {slideThemeOptions.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="workspace-select">
              <span>Presentation controls</span>
              <select
                value={presentationControlsMode}
                onChange={(event) => setPresentationControlsMode(event.currentTarget.value as DeckPresentationControlsMode)}
              >
                <option value="visible">Boutons visibles</option>
                <option value="hidden">Boutons hidden</option>
                <option value="auto">Auto</option>
              </select>
            </label>
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
                  onSlideChange={(event) => {
                    setActivePreviewSlideId(event.activeSlideId);
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
                slideRailWidthPx: 240,
                inspectorWidthPx: 240,
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

      {renderedDeck ? (
        <DeckPresentationOverlay
          deck={renderedDeck}
          open={presentationOpen && canPresent}
          initialSlideId={presentationInitialSlideId}
          options={{
            fullscreen: {
              strategy: "browser-fullscreen",
              closeOnEscape: true,
            },
            controls:
              presentationControlsMode === "auto"
                ? { visibility: "auto", autoHideDelayMs: 1800 }
                : { visibility: presentationControlsMode },
            hint: {
              showWhenControlsHidden: true,
              text: "Fleches gauche/droite: precedent/suivant. Escape: quitter.",
              position: "bottom-right",
            },
          }}
          onOpenChange={(event) => setPresentationOpen(event.open)}
        />
      ) : null}
    </main>
  );
}

class ExampleErrorBoundary extends Component<
  { readonly children: ReactNode },
  { readonly error: Error | null }
> {
  state: { readonly error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { readonly error: Error } {
    return { error };
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="integrated-shell">
          <section className="example-error-boundary" role="alert">
            <p>Erreur dans l’exemple intégré.</p>
            <pre>{this.state.error.message}</pre>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <ExampleErrorBoundary>
    <IntegratedExample />
  </ExampleErrorBoundary>,
);

function readThemeId(source: DeckSource): string {
  const deck = parseDeckSource(source);
  const theme = isRecord(deck?.theme) ? deck.theme : undefined;
  return typeof theme?.id === "string" ? theme.id : "fintech-light";
}

function updateDeckTheme(source: DeckSource, themeId: string): DeckSource {
  const deck = parseDeckSource(source);
  if (!deck) {
    return source;
  }

  deck.theme = {
    ...(isRecord(deck.theme) ? deck.theme : {}),
    id: themeId,
  };

  return {
    ...source,
    content: YAML.stringify(deck, { lineWidth: 0 }),
  };
}

function parseDeckSource(source: DeckSource): Record<string, unknown> | null {
  try {
    const parsed = YAML.parse(source.content);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
