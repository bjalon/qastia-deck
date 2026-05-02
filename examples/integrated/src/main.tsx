import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import YAML from "yaml";
import {
  DeckPresentationOverlay,
  DeckShow,
  DeckStudio,
  PrintDeck,
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

type WorkspaceMenu = "presentation" | "panels" | null;

const previewPanelStorageKey = "qastia-deck-example:panel-preview";
const diagnosticsPanelStorageKey = "qastia-deck-example:panel-diagnostics";

function IntegratedExample(): React.ReactElement {
  const [source, setSource] = useState<DeckSource>(initialSource);
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
  const [pdfExporting, setPdfExporting] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [presentationInitialSlideId, setPresentationInitialSlideId] = useState<string | undefined>();
  const [activePreviewSlideId, setActivePreviewSlideId] = useState<string | undefined>();
  const pdfExportRef = useRef<HTMLDivElement>(null);

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

  const exportPdf = useCallback(async (): Promise<void> => {
    if (!renderedDeck || !pdfExportRef.current || pdfExporting) {
      return;
    }

    setPdfExporting(true);
    try {
      await downloadDeckAsPdf(pdfExportRef.current, renderedDeck.metadata.title);
    } finally {
      setPdfExporting(false);
    }
  }, [pdfExporting, renderedDeck]);

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
            <button
              type="button"
              onClick={() => void exportPdf()}
              disabled={!renderedDeck || pdfExporting}
              title={renderedDeck ? "Télécharger les slides en PDF" : "Disponible quand le deck est compilable"}
            >
              {pdfExporting ? "Export..." : "Télécharger PDF"}
            </button>
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
                <span aria-hidden="true">⌄</span>
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
            <div className="menu-action" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                aria-expanded={openMenu === "panels"}
                onClick={() => setOpenMenu((current) => (current === "panels" ? null : "panels"))}
              >
                Panels <span aria-hidden="true">⌄</span>
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
      {renderedDeck ? (
        <div ref={pdfExportRef} className="pdf-export-host" aria-hidden="true">
          <PrintDeck deck={renderedDeck} />
        </div>
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

async function downloadDeckAsPdf(root: HTMLElement, title: string): Promise<void> {
  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const html2canvas = html2canvasModule.default;
  const pages = Array.from(root.querySelectorAll<HTMLElement>(".deck-print-page"));

  if (pages.length === 0) {
    return;
  }

  await document.fonts?.ready;

  const pageWidth = 1600;
  const pageHeight = 900;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [pageWidth, pageHeight],
    compress: true,
  });

  for (const [index, page] of pages.entries()) {
    const canvas = await html2canvas(page, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      windowWidth: pageWidth,
      windowHeight: pageHeight,
    });
    const image = canvas.toDataURL("image/jpeg", 0.96);

    if (index > 0) {
      pdf.addPage([pageWidth, pageHeight], "landscape");
    }

    pdf.addImage(image, "JPEG", 0, 0, pageWidth, pageHeight);
  }

  pdf.save(`${slugifyFilename(title || "deck")}.pdf`);
}

function slugifyFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "") || "deck";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
