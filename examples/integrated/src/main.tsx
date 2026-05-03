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
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import YAML from "yaml";
import { type CompileDeckResult, type DeckPresentationControlsMode, type DeckSource } from "../../../src";
import { DeckPdfDownloadButton } from "../../../src/pdf";
import { DeckPresentationOverlay } from "../../../src/presentation";
import { defaultDeckRuntime } from "../../../src/runtime";
import { DeckShow } from "../../../src/viewer";
import { DeckStudio } from "../../../src/editor";
import {
  createDeck,
  createDeckRelease,
  deckSourceFromRecord,
  deleteDeck,
  exportDecks,
  importDecks,
  listDeckReleases,
  listDecks,
  saveDeck,
  type ExampleDeckImportPayload,
  type ExampleDeckRecord,
  type ExampleDeckReleaseRecord,
} from "./deckRepository";
import {
  createExampleFirebaseServices,
  hasUsableFirebaseConfig,
  readExampleFirebaseConfig,
  type ExampleFirebaseServices,
} from "./firebaseExample";
import { sampleDeckSource } from "./sampleDeck";
import "../../../src/styles/deck-runtime.css";
import "./styles.css";

type WorkspaceMenu = "presentation" | "theme" | "panels" | null;
type AppView = "list" | "edit";

const slideThemeOptions = Array.from(defaultDeckRuntime.themes.values()).filter(
  (theme) => theme.id !== "default",
);
const previewPanelStorageKey = "qastia-deck-example:panel-preview";
const diagnosticsPanelStorageKey = "qastia-deck-example:panel-diagnostics";
const themeStorageKey = "qastia-deck-example:theme";

function App(): React.ReactElement {
  if (isTestRoute()) {
    return (
      <DesignerWorkspace
        deckId="test-designer"
        headerTitle="Tester le designer"
        headerKicker="Mode démo"
        initialSource={sampleDeckSource}
        storageEnabled={false}
      />
    );
  }

  return <FirebaseDeckApplication />;
}

function FirebaseDeckApplication(): React.ReactElement {
  const firebaseConfig = useMemo(() => readExampleFirebaseConfig(), []);
  const firebaseReady = hasUsableFirebaseConfig(firebaseConfig);
  const services = useMemo(
    () => (firebaseReady ? createExampleFirebaseServices(firebaseConfig) : null),
    [firebaseConfig, firebaseReady],
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!services) {
      setAuthLoading(false);
      return undefined;
    }

    return onAuthStateChanged(services.auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
  }, [services]);

  if (!services) {
    return <FirebaseSetupScreen />;
  }

  if (authLoading) {
    return <CenteredPanel title="Chargement" body="Vérification de la session Google..." />;
  }

  if (!user) {
    return <SignInScreen services={services} />;
  }

  return <DeckManager services={services} user={user} />;
}

function DeckManager({
  services,
  user,
}: {
  readonly services: ExampleFirebaseServices;
  readonly user: User;
}): React.ReactElement {
  const [view, setView] = useState<AppView>("list");
  const [decks, setDecks] = useState<readonly ExampleDeckRecord[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<ExampleDeckRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actor = useMemo(
    () => ({
      uid: user.uid,
      email: user.email,
    }),
    [user.email, user.uid],
  );

  const refreshDecks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setDecks(await listDecks(services.db, user.uid));
    } catch (refreshError) {
      setError(errorMessage(refreshError));
    } finally {
      setLoading(false);
    }
  }, [services.db, user.uid]);

  useEffect(() => {
    void refreshDecks();
  }, [refreshDecks]);

  async function createNewDeck(): Promise<void> {
    const nextDeck = await createDeck(services.db, actor, sampleDeckSource);
    setSelectedDeck(nextDeck);
    setView("edit");
    await refreshDecks();
  }

  async function removeDeck(deck: ExampleDeckRecord): Promise<void> {
    if (!window.confirm(`Supprimer "${deck.title}" ?`)) {
      return;
    }

    await deleteDeck(services.db, deck);
    await refreshDecks();
  }

  if (view === "edit" && selectedDeck) {
    return (
      <DeckEditorView
        actor={actor}
        deck={selectedDeck}
        onDeckSaved={(deck) => setSelectedDeck(deck)}
        onExit={async () => {
          setView("list");
          setSelectedDeck(null);
          await refreshDecks();
        }}
        services={services}
      />
    );
  }

  return (
    <DeckListView
      decks={decks}
      error={error}
      loading={loading}
      onCreate={() => void createNewDeck()}
      onDelete={(deck) => void removeDeck(deck)}
      onEdit={(deck) => {
        setSelectedDeck(deck);
        setView("edit");
      }}
      onRefresh={() => void refreshDecks()}
      services={services}
      user={user}
    />
  );
}

function DeckEditorView({
  actor,
  deck,
  onDeckSaved,
  onExit,
  services,
}: {
  readonly actor: { readonly uid: string; readonly email: string | null };
  readonly deck: ExampleDeckRecord;
  readonly onDeckSaved: (deck: ExampleDeckRecord) => void;
  readonly onExit: () => void | Promise<void>;
  readonly services: ExampleFirebaseServices;
}): React.ReactElement {
  const [source, setSource] = useState<DeckSource>(() => deckSourceFromRecord(deck));
  const [savedSource, setSavedSource] = useState<DeckSource>(() => deckSourceFromRecord(deck));
  const [currentDeck, setCurrentDeck] = useState(deck);
  const [releases, setReleases] = useState<readonly ExampleDeckReleaseRecord[]>([]);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = source.content !== savedSource.content;

  const refreshReleases = useCallback(async (): Promise<void> => {
    setReleases(await listDeckReleases(services.db, currentDeck.id));
  }, [currentDeck.id, services.db]);

  useEffect(() => {
    void refreshReleases();
  }, [refreshReleases]);

  async function saveCurrentDeck(): Promise<ExampleDeckRecord> {
    setSaving(true);
    try {
      const savedDeck = await saveDeck(services.db, actor, currentDeck, source);
      setCurrentDeck(savedDeck);
      onDeckSaved(savedDeck);
      setSavedSource(source);
      return savedDeck;
    } finally {
      setSaving(false);
    }
  }

  async function createRelease(): Promise<void> {
    const label = window.prompt("Nom de la release", `Release ${currentDeck.latestReleaseNumber + 1}`);
    if (label === null) {
      return;
    }

    setSaving(true);
    try {
      const result = await createDeckRelease(services.db, actor, currentDeck, source, label);
      setCurrentDeck(result.deck);
      onDeckSaved(result.deck);
      setSavedSource(source);
      await refreshReleases();
    } finally {
      setSaving(false);
    }
  }

  function requestBack(): void {
    if (!dirty) {
      void onExit();
      return;
    }
    setReturnDialogOpen(true);
  }

  return (
    <>
      <DesignerWorkspace
        deckId={currentDeck.id}
        headerKicker="Édition Firebase"
        headerTitle={currentDeck.title}
        initialSource={source}
        onBack={requestBack}
        onCreateRelease={() => void createRelease()}
        onSave={() => void saveCurrentDeck()}
        onSourceChange={setSource}
        releasePanel={<ReleasePanel releases={releases} />}
        saveDisabled={!dirty || saving}
        saving={saving}
        sourceDirty={dirty}
        storageEnabled={false}
      />
      {returnDialogOpen ? (
        <ConfirmLeaveDialog
          onCancel={() => setReturnDialogOpen(false)}
          onDiscard={() => {
            setSource(savedSource);
            setReturnDialogOpen(false);
            void onExit();
          }}
          onSave={async () => {
            await saveCurrentDeck();
            setReturnDialogOpen(false);
            await onExit();
          }}
        />
      ) : null}
    </>
  );
}

function DeckListView({
  decks,
  error,
  loading,
  onCreate,
  onDelete,
  onEdit,
  onRefresh,
  services,
  user,
}: {
  readonly decks: readonly ExampleDeckRecord[];
  readonly error: string | null;
  readonly loading: boolean;
  readonly onCreate: () => void;
  readonly onDelete: (deck: ExampleDeckRecord) => void;
  readonly onEdit: (deck: ExampleDeckRecord) => void;
  readonly onRefresh: () => void;
  readonly services: ExampleFirebaseServices;
  readonly user: User;
}): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function exportCurrentDecks(): Promise<void> {
    const payload = await exportDecks(services.db, user.uid);
    downloadTextFile(
      `qastia-decks-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
  }

  async function importFile(file: File): Promise<void> {
    const text = await file.text();
    const payload = JSON.parse(text) as ExampleDeckImportPayload;
    await importDecks(
      services.db,
      {
        uid: user.uid,
        email: user.email,
      },
      payload,
    );
    onRefresh();
  }

  return (
    <main className="integrated-shell">
      <section className="workspace-band">
        <div className="workspace-header">
          <div>
            <p>Firebase deck repository</p>
            <h1>Decks</h1>
          </div>
          <div className="workspace-actions">
            <button type="button" onClick={onCreate}>Nouveau deck</button>
            <button type="button" onClick={() => void exportCurrentDecks()}>Exporter</button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>Importer</button>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) {
                  void importFile(file);
                }
              }}
            />
            <button type="button" onClick={() => void signOut(services.auth)}>
              Déconnexion
            </button>
          </div>
        </div>
        <section className="deck-list-panel">
          <header>
            <div>
              <h2>Bibliothèque de decks</h2>
              <p>{user.email ?? user.uid}</p>
            </div>
            <button type="button" onClick={onRefresh}>Rafraîchir</button>
          </header>
          {error ? <p className="app-alert">{error}</p> : null}
          {loading ? <p className="empty-state">Chargement des decks...</p> : null}
          {!loading && decks.length === 0 ? (
            <p className="empty-state">Aucun deck. Créez un premier support ou importez un fichier JSON.</p>
          ) : null}
          {decks.length > 0 ? (
            <div className="deck-list" role="list">
              {decks.map((deck) => (
                <article key={deck.id} className="deck-list-card" role="listitem">
                  <div>
                    <strong>{deck.title}</strong>
                    <span>{deck.slug}</span>
                    <small>
                      Mis à jour le {formatDate(deck.updatedAtIso)} · {deck.releaseCount} release(s)
                    </small>
                  </div>
                  <div className="deck-list-actions">
                    <button type="button" onClick={() => onEdit(deck)}>Éditer</button>
                    <button type="button" onClick={() => onDelete(deck)}>Supprimer</button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function DesignerWorkspace({
  deckId,
  headerKicker,
  headerTitle,
  initialSource,
  onBack,
  onCreateRelease,
  onSave,
  onSourceChange,
  releasePanel,
  saveDisabled = true,
  saving = false,
  sourceDirty = false,
  storageEnabled,
}: {
  readonly deckId: string;
  readonly headerKicker: string;
  readonly headerTitle: string;
  readonly initialSource: DeckSource;
  readonly onBack?: () => void;
  readonly onCreateRelease?: () => void;
  readonly onSave?: () => void;
  readonly onSourceChange?: (source: DeckSource) => void;
  readonly releasePanel?: ReactNode;
  readonly saveDisabled?: boolean;
  readonly saving?: boolean;
  readonly sourceDirty?: boolean;
  readonly storageEnabled: boolean;
}): React.ReactElement {
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

  useEffect(() => {
    setSource(initialSource);
  }, [initialSource]);

  const renderedDeck = useMemo(() => {
    if (compileResult?.status === "valid" || compileResult?.status === "degraded") {
      return compileResult.deck;
    }
    return undefined;
  }, [compileResult]);

  const canPresent = compileResult?.status === "valid" && renderedDeck !== undefined;
  const activeThemeId = readThemeId(source);

  const updateSource = useCallback(
    (nextSource: DeckSource): void => {
      setSource(nextSource);
      onSourceChange?.(nextSource);
    },
    [onSourceChange],
  );

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
      return undefined;
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
            <p>{headerKicker}</p>
            <h1>{headerTitle}</h1>
          </div>
          <div className="workspace-actions">
            {onBack ? <button type="button" onClick={onBack}>Retour</button> : null}
            {onSave ? (
              <button type="button" onClick={onSave} disabled={saveDisabled}>
                {saving ? "Sauvegarde..." : sourceDirty ? "Sauvegarder" : "Sauvegardé"}
              </button>
            ) : null}
            {onCreateRelease ? (
              <button type="button" onClick={onCreateRelease} disabled={saving || !renderedDeck}>
                Créer release
              </button>
            ) : null}
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
                title={canPresent ? "Afficher en présentation plein écran" : "Disponible uniquement sans erreur de compilation"}
              >
                Présentation
              </button>
              <button
                type="button"
                className="primary-action split-action-toggle"
                aria-label="Choisir le mode de présentation"
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
                        updateSource(updateDeckTheme(source, theme.id));
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
                  onSlideChange={(event) => setActivePreviewSlideId(event.activeSlideId)}
                />
              ) : (
                <div className="fallback-pane">Le deck sera affiché dès que la source sera valide.</div>
              )}
            </section>
          ) : null}

          <section className="editor-pane" aria-label="Édition intégrée">
            <DeckStudio
              mode="controlled"
              deckId={deckId}
              value={source}
              onChange={updateSource}
              runtime={defaultDeckRuntime}
              storage={storageEnabled ? { namespace: "qastia-deck-example", recoverOnMount: true } : false}
              autosave={storageEnabled ? { draftDebounceMs: 600, versionIntervalMs: 60_000 } : false}
              layout={{
                showInspector: showDiagnostics,
                showDiagnosticsPanel: showDiagnostics,
                showVersionHistory: storageEnabled,
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
                allowVersionRestore: storageEnabled,
                allowVersionCompare: storageEnabled,
              }}
              onCompile={setCompileResult}
            />
          </section>
        </div>
        {releasePanel}
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
              text: "Flèches gauche/droite: précédent/suivant. Escape: quitter.",
              position: "bottom-right",
            },
          }}
          onOpenChange={(event) => setPresentationOpen(event.open)}
        />
      ) : null}
    </main>
  );
}

function ReleasePanel({
  releases,
}: {
  readonly releases: readonly ExampleDeckReleaseRecord[];
}): React.ReactElement {
  return (
    <section className="release-panel">
      <header>
        <h2>Releases</h2>
        <p>Chaque release conserve une copie immuable de la source YAML.</p>
      </header>
      {releases.length === 0 ? (
        <p className="empty-state">Aucune release publiée.</p>
      ) : (
        <div className="release-list">
          {releases.map((release) => (
            <article key={release.id}>
              <strong>v{release.releaseNumber} · {release.label}</strong>
              <span>{formatDate(release.createdAtIso)}</span>
              <small>{release.sourceHash}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ConfirmLeaveDialog({
  onCancel,
  onDiscard,
  onSave,
}: {
  readonly onCancel: () => void;
  readonly onDiscard: () => void;
  readonly onSave: () => void | Promise<void>;
}): React.ReactElement {
  return (
    <div className="app-dialog-backdrop" role="presentation">
      <section className="app-dialog" role="dialog" aria-modal="true" aria-label="Modifications non sauvegardées">
        <h2>Modifications non sauvegardées</h2>
        <p>Voulez-vous sauvegarder le deck avant de revenir à la liste ?</p>
        <div className="app-dialog-actions">
          <button type="button" onClick={onCancel}>Continuer l'édition</button>
          <button type="button" onClick={onDiscard}>Annuler les changements</button>
          <button type="button" className="primary-action" onClick={() => void onSave()}>
            Sauvegarder et revenir
          </button>
        </div>
      </section>
    </div>
  );
}

function SignInScreen({ services }: { readonly services: ExampleFirebaseServices }): React.ReactElement {
  return (
    <CenteredPanel
      title="Connexion Google"
      body="Connectez-vous pour accéder à la bibliothèque Firebase de decks."
      action={
        <button
          type="button"
          className="primary-action"
          onClick={() => void signInWithPopup(services.auth, services.googleProvider)}
        >
          Se connecter avec Google
        </button>
      }
      secondary={<a href="./test/">Tester sans compte</a>}
    />
  );
}

function FirebaseSetupScreen(): React.ReactElement {
  return (
    <CenteredPanel
      title="Configuration Firebase manquante"
      body="Renseignez les variables Vite Firebase pour activer l'auth Google et Firestore."
      secondary={
        <pre>{[
          "VITE_FIREBASE_API_KEY=...",
          "VITE_FIREBASE_AUTH_DOMAIN=...",
          "VITE_FIREBASE_PROJECT_ID=...",
          "VITE_FIREBASE_STORAGE_BUCKET=...",
          "VITE_FIREBASE_MESSAGING_SENDER_ID=...",
          "VITE_FIREBASE_APP_ID=...",
        ].join("\n")}</pre>
      }
    />
  );
}

function CenteredPanel({
  action,
  body,
  secondary,
  title,
}: {
  readonly action?: ReactNode;
  readonly body: string;
  readonly secondary?: ReactNode;
  readonly title: string;
}): React.ReactElement {
  return (
    <main className="integrated-shell centered-shell">
      <section className="centered-panel">
        <h1>{title}</h1>
        <p>{body}</p>
        {action}
        {secondary ? <div className="centered-panel-secondary">{secondary}</div> : null}
      </section>
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
    <App />
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

function isTestRoute(): boolean {
  const pathname = window.location.pathname.replace(/\/+$/u, "");
  return pathname.endsWith("/test") || new URLSearchParams(window.location.search).get("mode") === "test";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function downloadTextFile(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erreur inconnue.";
}
