import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import YAML from "yaml";
import {
  DeckPresentationOverlay,
  DeckPdfDownloadButton,
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

type WorkspaceMenu = "presentation" | "theme" | "panels" | null;

const previewPanelStorageKey = "qastia-deck-example:panel-preview";
const diagnosticsPanelStorageKey = "qastia-deck-example:panel-diagnostics";
const themeStorageKey = "qastia-deck-example:theme";

function IntegratedExample(): React.ReactElement {
  const [source, setSource] = useState<DeckSource>(() => {
    const storedThemeId = readStoredThemeId();
    return storedThemeId ? updateDeckTheme(initialSource, storedThemeId) : initialSource;
  });
  const [compileResult, setCompileResult] = useState<CompileDeckResult | null>(null);
  const [showPreviewPane, setShowPreviewPane] = useState(() =>
    readStoredBoolean(previewPanelStorageKey, true),
  );
  const [showDiagnostics, setShowDiagnostics] = useState(() =>
    readStoredBoolean(diagnosticsPanelStorageKey, true),
  );
  const [presentationControlsMode, setPresentationControlsMode] =
    useState<DeckPresentationControlsMode>("auto");
  const [openMenu, setOpenMenu] = useState<WorkspaceMenu>(null);
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

  const openPresentation = useCallback(
    (controlsMode: DeckPresentationControlsMode = "auto"): void => {
      setPresentationControlsMode(controlsMode);
      if (!canPresent) {
        return;
      }
      setPresentationInitialSlideId(activePreviewSlideId ?? renderedDeck?.slides[0]?.id);
      setPresentationOpen(true);
      setOpenMenu(null);
    },
    [activePreviewSlideId, canPresent, renderedDeck],
  );

  useEffect(() => {
    if (!canPresent) {
      setPresentationOpen(false);
    }
  }, [canPresent]);

  useEffect(() => {
    window.localStorage.setItem(previewPanelStorageKey, String(showPreviewPane));
  }, [showPreviewPane]);

  useEffect(() => {
    window.localStorage.setItem(diagnosticsPanelStorageKey, String(showDiagnostics));
  }, [showDiagnostics]);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, activeThemeId);
  }, [activeThemeId]);

  useEffect(() => {
    if (!openMenu) {
      return;
    }

    function closeMenu(): void {
      setOpenMenu(null);
    }

    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [openMenu]);

  return (
    <main className="integrated-shell">
      <section className="workspace-band">
        <div className="workspace-header">
          <div>
            <p>Session client</p>
            <h1>Support intégré</h1>
          </div>
          <div className="workspace-actions">
            {renderedDeck ? (
              <DeckPdfDownloadButton
                deck={renderedDeck}
                title="Télécharger les slides en PDF"
              />
            ) : (
              <button type="button" disabled title="Disponible quand le deck est compilable">
                Télécharger PDF
              </button>
            )}
            <div className="split-action" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="primary-action split-action-main"
                onClick={() => openPresentation("auto")}
                disabled={!canPresent}
                title={canPresent ? "Afficher en presentation plein ecran" : "Disponible uniquement sans erreur de compilation"}
              >
                Presentation
              </button>
              <button
                type="button"
                className="primary-action split-action-toggle"
                aria-label="Choisir le mode de presentation"
                aria-expanded={openMenu === "presentation"}
                onClick={() => setOpenMenu((current) => (current === "presentation" ? null : "presentation"))}
                disabled={!canPresent}
              >
                <ChevronIcon />
              </button>
              {openMenu === "presentation" ? (
                <div className="workspace-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => openPresentation("auto")}>
                    <span>Auto</span>
                    {presentationControlsMode === "auto" ? <span className="menu-check">✓</span> : null}
                  </button>
                  <button type="button" role="menuitem" onClick={() => openPresentation("visible")}>
                    <span>Boutons visibles</span>
                    {presentationControlsMode === "visible" ? <span className="menu-check">✓</span> : null}
                  </button>
                  <button type="button" role="menuitem" onClick={() => openPresentation("hidden")}>
                    <span>Boutons cachés</span>
                    {presentationControlsMode === "hidden" ? <span className="menu-check">✓</span> : null}
                  </button>
                </div>
              ) : null}
            </div>
            <div className="menu-action theme-action" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                aria-label="Style des slides"
                aria-expanded={openMenu === "theme"}
                onClick={() => setOpenMenu((current) => (current === "theme" ? null : "theme"))}
              >
                <span>{activeThemeLabel(activeThemeId)}</span>
                <ChevronIcon />
              </button>
              {openMenu === "theme" ? (
                <div className="workspace-menu" role="menu">
                  {slideThemeOptions.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={activeThemeId === theme.id}
                      onClick={() => {
                        setSource((currentSource) => updateDeckTheme(currentSource, theme.id));
                        setOpenMenu(null);
                      }}
                    >
                      <span>{theme.displayName}</span>
                      {activeThemeId === theme.id ? <span className="menu-check">✓</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="menu-action" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                aria-expanded={openMenu === "panels"}
                onClick={() => setOpenMenu((current) => (current === "panels" ? null : "panels"))}
              >
                Panels <ChevronIcon />
              </button>
              {openMenu === "panels" ? (
                <div className="workspace-menu" role="menu">
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={showPreviewPane}
                    onClick={() => setShowPreviewPane((value) => !value)}
                  >
                    <span>Preview</span>
                    {showPreviewPane ? <span className="menu-check">✓</span> : null}
                  </button>
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={showDiagnostics}
                    onClick={() => setShowDiagnostics((value) => !value)}
                  >
                    <span>Diagnostics</span>
                    {showDiagnostics ? <span className="menu-check">✓</span> : null}
                  </button>
                </div>
              ) : null}
            </div>
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
              storage={{
                namespace: "qastia-deck-example",
                recoverOnMount: true,
              }}
              autosave={{
                draftDebounceMs: 600,
                versionIntervalMs: 60_000,
              }}
              layout={{
                showInspector: showDiagnostics,
                showDiagnosticsPanel: showDiagnostics,
                showVersionHistory: true,
                showSourceModeToggle: true,
                showActiveSlidePreview: false,
                slideRailWidthPx: 220,
                inspectorWidthPx: 240,
                density: "compact",
              }}
              options={{
                editing: {
                  viewModes: ["form", "source", "preview"],
                },
              }}
              features={{
                allowPdfExport: false,
                allowVersionRestore: true,
                allowVersionCompare: true,
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

function readStoredBoolean(key: string, fallback: boolean): boolean {
  const value = window.localStorage.getItem(key);
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return fallback;
}

function readStoredThemeId(): string | undefined {
  const value = window.localStorage.getItem(themeStorageKey);
  if (!value) {
    return undefined;
  }
  return slideThemeOptions.some((theme) => theme.id === value) ? value : undefined;
}

function activeThemeLabel(themeId: string): string {
  return slideThemeOptions.find((theme) => theme.id === themeId)?.displayName ?? themeId;
}

function ChevronIcon({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <span
      aria-hidden="true"
      className={["workspace-chevron", className].filter(Boolean).join(" ")}
    />
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
