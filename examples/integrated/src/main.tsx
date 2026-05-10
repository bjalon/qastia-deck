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
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import YAML from "yaml";
import {
  compileDeck,
  type CompileDeckResult,
  type DeckPersistenceAdapter,
  type DeckPresentationControlsMode,
  type DeckSource,
} from "../../../src";
import { hashSource } from "../../../src/compiler/hash";
import { summarizeDiagnostics } from "../../../src/compiler/diagnostics";
import {
  ObjectVcsDeckPersistenceAdapter,
  type ObjectVcsDeckHistory,
  type ObjectVcsDeckState,
} from "../../../src/storage/ObjectVcsDeckPersistenceAdapter";
import type { BranchRecord, Head, RevisionSummary, TagRecord } from "@bjalon/object-vcs-core";
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
const allowedGoogleEmails = new Set(["sophie.jalon@gmail.com", "bjalon@qastia.com"]);
const standardDeckId = "standard-localstorage-deck";
const standardStorageNamespace = "qastia-deck-example";
const gitlightDeckId = "gitlight-localstorage-deck";
const gitlightStorageNamespace = "qastia-deck-gitlight-example";
const previewPanelStorageKey = "qastia-deck-example:panel-preview";
const diagnosticsPanelStorageKey = "qastia-deck-example:panel-diagnostics";
const themeStorageKey = "qastia-deck-example:theme";

function App(): React.ReactElement {
  if (isGitlightRoute()) {
    return <GitlightLocalStorageExample />;
  }

  if (isStandardRoute()) {
    return (
      <DesignerWorkspace
        deckId={standardDeckId}
        headerTitle="Stockage standard"
        headerKicker="LocalStorage DeckPersistenceAdapter"
        initialSource={sampleDeckSource}
        storageEnabled
        storageNamespace={standardStorageNamespace}
      />
    );
  }

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

  if (isFirebaseRoute()) {
    return <FirebaseDeckApplication />;
  }

  return <ExampleChooser />;
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

  if (!isAllowedUser(user)) {
    return <AccessDeniedScreen services={services} user={user} />;
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

function ExampleChooser(): React.ReactElement {
  return (
    <main className="integrated-shell chooser-shell">
      <section className="chooser-panel">
        <div>
          <p>Qastia Deck Runtime</p>
          <h1>Exemples de stockage</h1>
        </div>
        <div className="chooser-links">
          <a href="./standard/">
            <strong>Stockage standard</strong>
            <span>DeckStudio avec l'adapter localStorage par défaut.</span>
          </a>
          <a href="./gitlight/">
            <strong>Stockage gitlight localStorage</strong>
            <span>DeckStudio avec commits Object VCS et graphe des révisions.</span>
          </a>
        </div>
        <div className="chooser-secondary">
          <a href="./firebase/">Exemple Firebase complet</a>
          <a href="./test/">Designer sans stockage</a>
        </div>
      </section>
    </main>
  );
}

function GitlightLocalStorageExample(): React.ReactElement {
  const adapter = useMemo(
    () =>
      new ObjectVcsDeckPersistenceAdapter({
        storageNamespace: gitlightStorageNamespace,
        author: "Qastia Deck Gitlight Example",
      }),
    [],
  );
  const [source, setSource] = useState<DeckSource>(sampleDeckSource);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    adapter
      .loadCurrent({ deckId: gitlightDeckId, namespace: gitlightStorageNamespace })
      .then((current) => {
        if (!cancelled && current) {
          setSource(current.source);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [adapter]);

  if (!loaded) {
    return <CenteredPanel title="Chargement" body="Lecture du repository gitlight local..." />;
  }

  return (
    <DesignerWorkspace
      deckId={gitlightDeckId}
      headerKicker="Object VCS localStorage"
      headerTitle="Stockage gitlight"
      initialSource={source}
      onSourceChange={setSource}
      releasePanel={
        <GitlightHistoryPanel
          adapter={adapter}
          deckId={gitlightDeckId}
          namespace={gitlightStorageNamespace}
          source={source}
          onRestoreSource={setSource}
        />
      }
      storageAdapter={adapter}
      storageEnabled
      storageNamespace={gitlightStorageNamespace}
    />
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
  storageAdapter,
  storageEnabled,
  storageNamespace = standardStorageNamespace,
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
  readonly storageAdapter?: DeckPersistenceAdapter;
  readonly storageEnabled: boolean;
  readonly storageNamespace?: string;
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
              storage={
                storageEnabled
                  ? { namespace: storageNamespace, adapter: storageAdapter, recoverOnMount: true }
                  : false
              }
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

function GitlightHistoryPanel({
  adapter,
  deckId,
  namespace,
  onRestoreSource,
  source,
}: {
  readonly adapter: ObjectVcsDeckPersistenceAdapter;
  readonly deckId: string;
  readonly namespace: string;
  readonly onRestoreSource: (source: DeckSource) => void;
  readonly source: DeckSource;
}): React.ReactElement {
  const [history, setHistory] = useState<ObjectVcsDeckHistory>({
    head: null,
    revisions: [],
    tags: [],
    branches: [],
  });
  const [selectedRevision, setSelectedRevision] = useState<RevisionSummary | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [commitLabel, setCommitLabel] = useState("Version manuelle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      setHistory(await adapter.getHistory({ deckId, namespace }));
    } catch (refreshError) {
      setError(errorMessage(refreshError));
    }
  }, [adapter, deckId, namespace]);

  useEffect(() => {
    void refresh();
  }, [refresh, source.content]);

  async function createCommit(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const compiled = await compileDeck(source, {
        runtime: defaultDeckRuntime,
        mode: "editor",
        locale: "fr-FR",
      });
      const label = commitLabel.trim() || "Version manuelle";
      const result = await adapter.createVersion({
        id: createVersionId(),
        deckId,
        namespace,
        schemaVersion: 1,
        createdAtIso: new Date().toISOString(),
        label,
        reason: "manual",
        source,
        sourceHash: hashSource(source.content),
        compilerStatus: compiled.status,
        diagnosticsSummary: summarizeDiagnostics(compiled.diagnostics),
        limits: {
          maxVersionsPerDeck: 200,
          maxAutosaveVersionsPerDeck: 100,
          maxBytesPerDeck: 20_000_000,
        },
      });
      if (result.status !== "success") {
        throw new Error(result.diagnostics[0]?.message ?? "Commit impossible.");
      }
      await refresh();
    } catch (commitError) {
      setError(errorMessage(commitError));
    } finally {
      setBusy(false);
    }
  }

  async function restoreRevision(revision: RevisionSummary): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const version = await adapter.restoreRevision({ deckId, namespace, revision: revision.revision });
      if (version) {
        onRestoreSource(version.source);
      }
      await refresh();
    } catch (restoreError) {
      setError(errorMessage(restoreError));
    } finally {
      setBusy(false);
    }
  }

  async function previewRevision(revision: RevisionSummary): Promise<void> {
    setSelectedRevision(revision);
    const repository = await adapter.getRepository({ deckId, namespace });
    const state = await repository.readRevision(revision.revision, { migrateTo: "current" });
    setSelectedVersion(state.deck.version?.source.content ?? null);
  }

  return (
    <section className="gitlight-panel">
      <header>
        <div>
          <h2>Gitlight localStorage</h2>
          <p>Chaque version DeckStudio devient un commit Object VCS taggé.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={busy}>
          Rafraîchir
        </button>
      </header>

      <div className="gitlight-toolbar">
        <label>
          Message
          <input value={commitLabel} onChange={(event) => setCommitLabel(event.currentTarget.value)} />
        </label>
        <button type="button" onClick={() => void createCommit()} disabled={busy}>
          Commit version
        </button>
        <span data-head-status={history.head?.status ?? "missing"}>
          {history.head ? `HEAD ${history.head.status}` : "Repository vide"}
        </span>
      </div>

      {error ? <p className="app-alert">{error}</p> : null}

      <RevisionGraph
        branches={history.branches}
        head={history.head}
        revisions={history.revisions}
        selectedRevision={selectedRevision?.revision ?? null}
        tags={history.tags}
        onRestoreRevision={(revision) => void restoreRevision(revision)}
        onSelectRevision={(revision) => void previewRevision(revision)}
      />

      {selectedRevision ? (
        <div className="gitlight-preview">
          <strong>Révision #{selectedRevision.revision}</strong>
          <span>{selectedRevision.message ?? "Checkpoint"}</span>
          <pre>{selectedVersion ?? "Aucune version DeckStudio sur cette révision."}</pre>
        </div>
      ) : null}
    </section>
  );
}

function RevisionGraph({
  branches,
  head,
  onRestoreRevision,
  onSelectRevision,
  revisions,
  selectedRevision,
  tags,
}: {
  readonly branches: readonly BranchRecord[];
  readonly head: Head<{ deck: ObjectVcsDeckState }> | null;
  readonly onRestoreRevision: (revision: RevisionSummary) => void;
  readonly onSelectRevision: (revision: RevisionSummary) => void;
  readonly revisions: readonly RevisionSummary[];
  readonly selectedRevision: number | null;
  readonly tags: readonly TagRecord[];
}): React.ReactElement {
  const graph = useMemo(() => buildRevisionGraph(revisions), [revisions]);
  const tagsByRevision = useMemo(() => groupTagsByRevision(tags), [tags]);
  const branchesByRevision = useMemo(() => groupBranchesByRevision(branches), [branches]);

  if (revisions.length === 0) {
    return <p className="empty-state">Aucune révision gitlight.</p>;
  }

  return (
    <ol className="gitlight-graph">
      {revisions.map((revision) => {
        const refs = [
          ...(branchesByRevision.get(revision.revision) ?? []).map((branch) => ({
            key: `branch:${branch.name}`,
            label: branch.name,
          })),
          ...(tagsByRevision.get(revision.revision) ?? []).map((tag) => ({
            key: `tag:${tag.name}`,
            label: tag.name.replace("deck-version/", "version/"),
          })),
        ];
        const isHead = head?.status === "clean" && head.headRevision === revision.revision;
        const isBase = head?.status === "dirty" && head.baseRevision === revision.revision;

        return (
          <li
            key={revision.revision}
            className={selectedRevision === revision.revision ? "selected" : ""}
          >
            <pre aria-hidden="true">{graph.get(revision.revision)?.text ?? "*"}</pre>
            <button type="button" onClick={() => onSelectRevision(revision)}>
              <strong>#{revision.revision}</strong>
              <span>{revision.message ?? "Checkpoint"}</span>
              <small>{revision.branchName} · {revision.stateHash.replace(/^sha256:/, "").slice(0, 8)}</small>
              <span className="gitlight-refs">
                {refs.map((ref) => (
                  <span key={ref.key}>{ref.label}</span>
                ))}
                {isHead ? <span>HEAD</span> : null}
                {isBase ? <span>BASE</span> : null}
              </span>
            </button>
            <button type="button" onClick={() => onRestoreRevision(revision)}>
              Restaurer
            </button>
          </li>
        );
      })}
    </ol>
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
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  async function signInWithGoogle(): Promise<void> {
    setAuthError(null);
    setSigningIn(true);

    try {
      await signInWithPopup(services.auth, services.googleProvider);
    } catch (error) {
      const message = errorMessage(error);

      if (
        message.includes("auth/popup-blocked") ||
        message.includes("auth/popup-closed-by-user") ||
        message.includes("auth/cancelled-popup-request")
      ) {
        try {
          await signInWithRedirect(services.auth, services.googleProvider);
          return;
        } catch (redirectError) {
          setAuthError(authErrorMessage(redirectError));
          return;
        }
      }

      setAuthError(authErrorMessage(error));
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <CenteredPanel
      title="Connexion Google"
      body="Connectez-vous pour accéder à la bibliothèque Firebase de decks."
      action={
        <>
          <button
            type="button"
            className="primary-action"
            onClick={() => void signInWithGoogle()}
            disabled={signingIn}
          >
            {signingIn ? "Connexion..." : "Se connecter avec Google"}
          </button>
          {authError ? <p className="app-alert">{authError}</p> : null}
        </>
      }
      secondary={<a href="./test/">Tester sans compte</a>}
    />
  );
}

function AccessDeniedScreen({
  services,
  user,
}: {
  readonly services: ExampleFirebaseServices;
  readonly user: User;
}): React.ReactElement {
  return (
    <CenteredPanel
      title="Accès non autorisé"
      body={`Le compte ${user.email ?? user.uid} n'est pas autorisé à accéder à la bibliothèque Firebase.`}
      action={
        <button type="button" onClick={() => void signOut(services.auth)}>
          Changer de compte
        </button>
      }
      secondary={<a href="./test/">Tester le designer sans compte</a>}
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

function isStandardRoute(): boolean {
  const pathname = window.location.pathname.replace(/\/+$/u, "");
  return pathname.endsWith("/standard") || new URLSearchParams(window.location.search).get("mode") === "standard";
}

function isGitlightRoute(): boolean {
  const pathname = window.location.pathname.replace(/\/+$/u, "");
  return pathname.endsWith("/gitlight") || new URLSearchParams(window.location.search).get("mode") === "gitlight";
}

function isFirebaseRoute(): boolean {
  const pathname = window.location.pathname.replace(/\/+$/u, "");
  return pathname.endsWith("/firebase") || new URLSearchParams(window.location.search).get("mode") === "firebase";
}

function isAllowedUser(user: User): boolean {
  return typeof user.email === "string" && allowedGoogleEmails.has(user.email.toLowerCase());
}

type RevisionGraphCell = {
  readonly text: string;
};

function buildRevisionGraph(revisions: readonly RevisionSummary[]): ReadonlyMap<number, RevisionGraphCell> {
  const revisionIndex = new Map<number, number>();
  const revisionByNumber = new Map<number, RevisionSummary>();
  const branchRows = new Map<string, number[]>();
  const lanes: string[] = [];

  revisions.forEach((revision, index) => {
    revisionIndex.set(revision.revision, index);
    revisionByNumber.set(revision.revision, revision);
    if (!branchRows.has(revision.branchName)) {
      branchRows.set(revision.branchName, []);
      lanes.push(revision.branchName);
    }
    branchRows.get(revision.branchName)?.push(index);
  });

  const laneByBranch = new Map(lanes.map((branchName, index) => [branchName, index]));
  const ranges = new Map<string, { readonly start: number; readonly end: number }>();
  const connections: Array<{
    readonly childBranch: string;
    readonly parentBranch: string;
    readonly parentIndex: number;
  }> = [];

  for (const [branchName, rows] of branchRows.entries()) {
    const branchStart = Math.min(...rows);
    const branchLastOwnRow = Math.max(...rows);
    let branchEnd = branchLastOwnRow;

    for (const row of rows) {
      const revision = revisions[row];
      if (!revision?.parentRevision) {
        continue;
      }
      const parent = revisionByNumber.get(revision.parentRevision);
      const parentIndex = revisionIndex.get(revision.parentRevision);
      if (!parent || parentIndex === undefined || parent.branchName === revision.branchName) {
        continue;
      }
      connections.push({
        childBranch: revision.branchName,
        parentBranch: parent.branchName,
        parentIndex,
      });
      branchEnd = Math.max(branchEnd, parentIndex);
    }

    ranges.set(branchName, { start: branchStart, end: branchEnd });
  }

  const graph = new Map<number, RevisionGraphCell>();
  revisions.forEach((revision, index) => {
    const currentLane = laneByBranch.get(revision.branchName) ?? 0;
    const cells = lanes.map((branchName) => {
      const range = ranges.get(branchName);
      return range && index >= range.start && index <= range.end ? "|" : " ";
    });

    for (const connection of connections.filter((item) => item.parentIndex === index)) {
      const childLane = laneByBranch.get(connection.childBranch);
      const parentLane = laneByBranch.get(connection.parentBranch);
      if (childLane === undefined || parentLane === undefined) {
        continue;
      }
      const minLane = Math.min(childLane, parentLane);
      const maxLane = Math.max(childLane, parentLane);
      for (let lane = minLane + 1; lane < maxLane; lane += 1) {
        cells[lane] = "-";
      }
      cells[childLane] = childLane < parentLane ? "\\" : "/";
    }

    cells[currentLane] = "*";
    graph.set(revision.revision, { text: cells.join(" ") });
  });

  return graph;
}

function groupTagsByRevision(tags: readonly TagRecord[]): ReadonlyMap<number, readonly TagRecord[]> {
  const grouped = new Map<number, TagRecord[]>();
  for (const tag of tags) {
    grouped.set(tag.revision, [...(grouped.get(tag.revision) ?? []), tag]);
  }
  return grouped;
}

function groupBranchesByRevision(branches: readonly BranchRecord[]): ReadonlyMap<number, readonly BranchRecord[]> {
  const grouped = new Map<number, BranchRecord[]>();
  for (const branch of branches) {
    if (branch.headRevision === null) {
      continue;
    }
    grouped.set(branch.headRevision, [...(grouped.get(branch.headRevision) ?? []), branch]);
  }
  return grouped;
}

function createVersionId(): string {
  const random = Math.random().toString(16).slice(2, 10);
  return `${new Date().toISOString().replace(/[:.]/g, "-")}_${random}`;
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

function authErrorMessage(error: unknown): string {
  const message = errorMessage(error);

  if (message.includes("auth/unauthorized-domain")) {
    return "Domaine non autorisé dans Firebase Auth. Ajoutez bjalon.github.io dans Authentication > Settings > Authorized domains.";
  }

  if (message.includes("auth/operation-not-allowed")) {
    return "Le fournisseur Google n'est pas activé dans Firebase Authentication.";
  }

  if (message.includes("auth/popup-blocked")) {
    return "Le navigateur a bloqué la fenêtre Google. Autorisez les popups ou réessayez.";
  }

  return message;
}
