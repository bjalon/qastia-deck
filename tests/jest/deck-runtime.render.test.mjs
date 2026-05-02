import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import {
  DeckPresentationOverlay,
  DeckShow,
  DeckStudio,
  compileDeck,
  defaultDeckRuntime,
} from "../../dist/deck-runtime.js";

const source = {
  content: `
version: 1
kind: deck
metadata:
  title: Stable deck
theme:
  id: fintech-light
slides:
  - id: cover
    layout: cover
    slots:
      title:
        markdown: |
          # Stable title
      subtitle:
        markdown: |
          Runtime preview
  - id: details
    layout: title-body
    slots:
      title:
        markdown: |
          ## Details
      body:
        markdown: |
          - first point
          - second point
`,
};

const sourceWithDefaults = {
  content: `
version: 1
kind: deck
metadata:
  title: Defaults deck
theme:
  id: fintech-light
defaults:
  slots:
    eyebrow:
      markdown: Global eyebrow
    footer:
      markdown: Global footer
slides:
  - id: cover
    layout: cover
    slots:
      title:
        markdown: Stable title
      subtitle:
        markdown: Runtime preview
`,
};

async function compileValidDeck() {
  const result = await compileDeck(source, {
    runtime: defaultDeckRuntime,
    mode: "viewer",
    locale: "fr-FR",
  });

  if (result.status === "invalid") {
    throw new Error("Expected a renderable deck.");
  }

  return result.deck;
}

describe("deck-runtime public rendering", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("compiles a deck through the public API", async () => {
    const deck = await compileValidDeck();

    expect(deck.metadata.title).toBe("Stable deck");
    expect(deck.slides.map((slide) => slide.id)).toEqual(["cover", "details"]);
    expect(deck.slides[0].slots.get("title").content.markdown).toContain("Stable title");
  });

  it("renders DeckShow and keeps navigation stable", async () => {
    const deck = await compileValidDeck();
    const onSlideChange = jest.fn();

    render(React.createElement(DeckShow, { deck, mode: "embedded", onSlideChange }));

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("Stable title")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(onSlideChange).toHaveBeenCalledWith({
      previousSlideId: "cover",
      activeSlideId: "details",
      activeSlideIndex: 1,
    });
  });

  it("does not let an embedded DeckShow steal arrow keys from editing fields", async () => {
    const deck = await compileValidDeck();

    function EmbeddedHarness() {
      return React.createElement(
        "div",
        null,
        React.createElement("input", { "aria-label": "Host field", defaultValue: "editing" }),
        React.createElement(DeckShow, { deck, mode: "embedded" }),
      );
    }

    const { container } = render(React.createElement(EmbeddedHarness));
    const hostField = screen.getByLabelText("Host field");

    fireEvent.keyDown(hostField, { key: "ArrowRight" });

    expect(screen.getByText("Stable title")).toBeInTheDocument();

    const viewer = container.querySelector(".deck-screen-root");
    fireEvent.keyDown(viewer, { key: "ArrowRight" });

    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("can disable DeckShow keyboard navigation explicitly", async () => {
    const deck = await compileValidDeck();

    render(
      React.createElement(DeckShow, {
        deck,
        mode: "viewer",
        keyboardNavigation: false,
      }),
    );

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(screen.getByText("Stable title")).toBeInTheDocument();
  });

  it("renders title slots as titles without requiring markdown heading markers", async () => {
    const plainTitleSource = {
      content: source.content.replace("# Stable title", "A long stable title that adapts to the slide width automatically"),
    };
    const result = await compileDeck(plainTitleSource, {
      runtime: defaultDeckRuntime,
      mode: "viewer",
      locale: "fr-FR",
    });

    if (result.status === "invalid") {
      throw new Error("Expected a renderable deck.");
    }

    render(React.createElement(DeckShow, { deck: result.deck, mode: "embedded", controls: false }));

    const title = screen.getByText("A long stable title that adapts to the slide width automatically");
    expect(title.closest(".deck-title-slot")).toHaveAttribute("data-title-size", "long");
  });

  it("requests presentation from DeckShow without owning the overlay", async () => {
    const deck = await compileValidDeck();
    const onRequestPresentation = jest.fn();
    const onPresentationControlsModeChange = jest.fn();

    render(
      React.createElement(DeckShow, {
        deck,
        mode: "embedded",
        controls: {
          showPresentationButton: true,
          showPresentationControlsModeSelect: true,
          presentationControlsMode: "hidden",
          onPresentationControlsModeChange,
        },
        onRequestPresentation,
      }),
    );

    expect(screen.getByRole("combobox", { name: "Presentation controls" })).toHaveValue("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Presentation" }));

    expect(onRequestPresentation).toHaveBeenCalledWith({
      type: "presentation-requested",
      slideId: "cover",
      activeSlideIndex: 0,
      createdAtIso: expect.any(String),
    });
    expect(screen.queryByRole("dialog", { name: "Presentation plein ecran" })).not.toBeInTheDocument();
  });

  it("renders a standalone presentation overlay with configurable hidden controls", async () => {
    const deck = await compileValidDeck();

    function PresentationHarness() {
      const [open, setOpen] = React.useState(true);

      return React.createElement(DeckPresentationOverlay, {
        deck,
        open,
        options: {
          fullscreen: {
            strategy: "overlay",
          },
          controls: {
            visibility: "hidden",
          },
        },
        onOpenChange: (event) => setOpen(event.open),
      });
    }

    render(React.createElement(PresentationHarness));

    expect(screen.getByRole("dialog", { name: "Presentation plein ecran" })).toBeInTheDocument();
    expect(screen.getByText(/Fleches gauche\/droite/)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(screen.getByText("Details")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Presentation plein ecran" })).not.toBeInTheDocument();
    });
  });

  it("keeps browser fullscreen open when navigating with arrow keys", async () => {
    const deck = await compileValidDeck();
    let fullscreenElement = null;
    const originalRequestFullscreen = HTMLElement.prototype.requestFullscreen;
    const originalExitFullscreen = document.exitFullscreen;
    const fullscreenDescriptor = Object.getOwnPropertyDescriptor(document, "fullscreenElement");
    const requestFullscreen = jest.fn(function requestFullscreenMock() {
      fullscreenElement = this;
      return Promise.resolve();
    });
    const exitFullscreen = jest.fn(() => {
      fullscreenElement = null;
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    });

    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      get: () => fullscreenElement,
    });
    HTMLElement.prototype.requestFullscreen = requestFullscreen;
    document.exitFullscreen = exitFullscreen;
    let unmount = () => undefined;

    try {
      ({ unmount } = render(
        React.createElement(DeckPresentationOverlay, {
          deck,
          open: true,
          options: {
            fullscreen: {
              strategy: "browser-fullscreen",
            },
            controls: {
              visibility: "visible",
            },
          },
        }),
      ));

      expect(requestFullscreen).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: "ArrowRight" });

      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(exitFullscreen).not.toHaveBeenCalled();
      expect(screen.getByRole("dialog", { name: "Presentation plein ecran" })).toBeInTheDocument();
    } finally {
      unmount();
      HTMLElement.prototype.requestFullscreen = originalRequestFullscreen;
      document.exitFullscreen = originalExitFullscreen;
      if (fullscreenDescriptor) {
        Object.defineProperty(document, "fullscreenElement", fullscreenDescriptor);
      }
    }
  });

  it("renders DeckStudio in form mode without storage", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "stable-deck",
        initialValue: source,
        storage: false,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Stable deck")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /1 Stable title cover/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2 Details title-body/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
    expect(screen.getByLabelText("Subtitle")).toHaveValue("Runtime preview");
    expect(screen.getByLabelText("Title").tagName).toBe("INPUT");
    expect(screen.getByLabelText("Subtitle").tagName).toBe("INPUT");
  });

  it("edits the slideshow title on double click and commits on blur", async () => {
    const onChange = jest.fn();

    render(
      React.createElement(DeckStudio, {
        deckId: "editable-title-deck",
        initialValue: source,
        storage: false,
        onChange,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Stable deck")).toBeInTheDocument();
    });

    fireEvent.doubleClick(screen.getByText("Stable deck"));
    const titleInput = screen.getByLabelText("Titre du slideshow");

    expect(titleInput).toHaveValue("Stable deck");

    fireEvent.change(titleInput, { target: { value: "Updated deck title" } });
    fireEvent.blur(titleInput);

    await waitFor(() => {
      expect(screen.getByText("Updated deck title")).toBeInTheDocument();
    });
    expect(screen.queryByLabelText("Titre du slideshow")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("title: Updated deck title"),
      }),
      expect.objectContaining({
        reason: "metadata-edit",
      }),
    );
  });

  it("creates, renames, compares, and deletes manual versions", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "version-history-deck",
        initialValue: source,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Versions")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Nom de version"), {
      target: { value: "Baseline" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Créer version" }));

    await waitFor(() => {
      expect(screen.getByText("Baseline")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Renommer" }));
    fireEvent.change(screen.getByLabelText("Renommer version"), {
      target: { value: "Renamed baseline" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(screen.getByText("Renamed baseline")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Comparer actuel" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Version vs courant" })).toBeInTheDocument();
    });
    expect(screen.getAllByDisplayValue(/Stable deck/)).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));

    await waitFor(() => {
      expect(screen.queryByText("Renamed baseline")).not.toBeInTheDocument();
    });
  });

  it("restores a saved version from the history panel", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "version-restore-deck",
        initialValue: source,
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
    });

    fireEvent.change(screen.getByLabelText("Nom de version"), {
      target: { value: "Before edit" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Créer version" }));

    await waitFor(() => {
      expect(screen.getByText("Before edit")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Changed title" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Changed title");
    });

    fireEvent.click(screen.getByRole("button", { name: "Restaurer" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
    });
  });

  it("offers crash recovery instead of restoring a draft silently", async () => {
    window.localStorage.setItem(
      "deck-runtime:v1:recovery-deck:draft",
      JSON.stringify({
        deckId: "recovery-deck",
        namespace: "deck-runtime",
        schemaVersion: 1,
        updatedAtIso: "2026-05-02T20:00:00.000Z",
        sessionId: "session",
        source: {
          content: source.content.replace("Stable title", "Recovered title"),
        },
        sourceHash: "draft-hash",
        selectedSlideId: "cover",
        compilerStatus: "valid",
      }),
    );

    render(
      React.createElement(DeckStudio, {
        deckId: "recovery-deck",
        initialValue: source,
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Une version locale plus récente existe" })).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Title")).toHaveValue("Stable title");

    fireEvent.click(screen.getByRole("button", { name: "Restaurer cette version" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Recovered title");
    });
  });

  it("compares, previews, copies, and deletes a recovery draft", async () => {
    window.localStorage.setItem(
      "deck-runtime:v1:recovery-actions-deck:draft",
      JSON.stringify({
        deckId: "recovery-actions-deck",
        namespace: "deck-runtime",
        schemaVersion: 1,
        updatedAtIso: "2026-05-02T20:00:00.000Z",
        sessionId: "session",
        source: {
          content: source.content.replace("Stable title", "Draft actions title"),
        },
        sourceHash: "draft-actions-hash",
        selectedSlideId: "cover",
        compilerStatus: "valid",
      }),
    );

    render(
      React.createElement(DeckStudio, {
        deckId: "recovery-actions-deck",
        initialValue: source,
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Une version locale plus récente existe" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Comparer avec la version actuelle" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Draft vs courant" })).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue(/Draft actions title/)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Fermer" })[0]);

    fireEvent.click(screen.getByRole("button", { name: "Ouvrir en lecture seule" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Draft local" })).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue(/Draft actions title/)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Fermer" })[0]);

    fireEvent.click(screen.getByRole("button", { name: "Créer une copie" }));

    await waitFor(() => {
      expect(screen.getByText("Copie du draft de recovery")).toBeInTheDocument();
    });

    cleanup();

    window.localStorage.setItem(
      "deck-runtime:v1:recovery-delete-deck:draft",
      JSON.stringify({
        deckId: "recovery-delete-deck",
        namespace: "deck-runtime",
        schemaVersion: 1,
        updatedAtIso: "2026-05-02T20:00:00.000Z",
        sessionId: "session",
        source: {
          content: source.content.replace("Stable title", "Draft deleted title"),
        },
        sourceHash: "draft-delete-hash",
        selectedSlideId: "cover",
        compilerStatus: "valid",
      }),
    );

    render(
      React.createElement(DeckStudio, {
        deckId: "recovery-delete-deck",
        initialValue: source,
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Une version locale plus récente existe" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Supprimer le draft" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Une version locale plus récente existe" })).not.toBeInTheDocument();
    });
    expect(window.localStorage.getItem("deck-runtime:v1:recovery-delete-deck:draft")).toBeNull();
  });

  it("inserts a new slide after the selected slide", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "add-after-selected-deck",
        initialValue: source,
        storage: false,
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
    });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("New slide");
    });

    const slideButtons = within(screen.getByRole("navigation", { name: "Slides" })).getAllByRole("button");
    expect(slideButtons).toHaveLength(3);
    expect(slideButtons[0]).toHaveAccessibleName("1 Stable title cover");
    expect(slideButtons[1]).toHaveAccessibleName("2 New slide title-body");
    expect(slideButtons[2]).toHaveAccessibleName("3 Details title-body");
  });

  it("reorders slides with drag and drop", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "reorder-deck",
        initialValue: source,
        storage: false,
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
    });

    const slidesNav = screen.getByRole("navigation", { name: "Slides" });
    const stableSlide = within(slidesNav).getByRole("button", { name: "1 Stable title cover" });
    const detailsSlide = within(slidesNav).getByRole("button", { name: "2 Details title-body" });
    const transfer = createDataTransfer();

    fireEvent.dragStart(stableSlide, { dataTransfer: transfer });
    fireEvent.drop(detailsSlide, { dataTransfer: transfer });

    await waitFor(() => {
      expect(within(slidesNav).getByRole("button", { name: "1 Details title-body" })).toBeInTheDocument();
    });

    expect(within(slidesNav).getByRole("button", { name: "2 Stable title cover" })).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
  });

  it("edits global defaults and enables per-slide overrides", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "defaults-deck",
        initialValue: sourceWithDefaults,
        storage: false,
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Footer")).toHaveValue("Global footer");
    });

    expect(screen.getByLabelText("Footer")).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "Global" }));
    expect(screen.getByRole("dialog", { name: "Valeurs globales" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Footer global"), {
      target: { value: "Updated global footer" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Footer")).toHaveValue("Updated global footer");
    });

    fireEvent.click(screen.getByLabelText("Override Footer global"));

    await waitFor(() => {
      expect(screen.getByLabelText("Footer")).not.toHaveAttribute("readonly");
    });
    expect(screen.getByLabelText("Override Footer global")).toBeChecked();

    fireEvent.change(screen.getByLabelText("Footer"), {
      target: { value: "Local footer" },
    });

    expect(screen.getByLabelText("Footer")).toHaveValue("Local footer");

    fireEvent.click(screen.getByLabelText("Override Footer global"));

    await waitFor(() => {
      expect(screen.getByLabelText("Footer")).toHaveValue("Updated global footer");
    });
    expect(screen.getByLabelText("Footer")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Override Footer global")).not.toBeChecked();
  });

  it("switches DeckStudio between form, yaml, and preview views", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "view-mode-deck",
        initialValue: source,
        storage: false,
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
    });

    const viewSelect = screen.getByRole("combobox", { name: "Editor view" });
    expect(viewSelect).toHaveValue("form");

    fireEvent.change(viewSelect, { target: { value: "source" } });
    expect(screen.getByDisplayValue(/version: 1/)).toBeInTheDocument();

    fireEvent.change(viewSelect, { target: { value: "preview" } });
    expect(screen.getByRole("region", { name: "Slide preview" })).toHaveClass("deck-theme-fintech-light");
    expect(screen.getAllByText("Stable title").length).toBeGreaterThan(0);
  });

  it("can configure visible DeckStudio view modes", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "view-mode-options-deck",
        initialValue: source,
        storage: false,
        options: {
          editing: {
            viewModes: ["form", "preview"],
          },
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
    });

    const viewSelect = screen.getByRole("combobox", { name: "Editor view" });
    expect(Array.from(viewSelect.querySelectorAll("option")).map((option) => option.value)).toEqual([
      "form",
      "preview",
    ]);
    expect(screen.queryByText("YAML")).not.toBeInTheDocument();
  });

  it("supports DeckStudio panel options without legacy show flags", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "panel-options-deck",
        initialValue: source,
        storage: false,
        options: {
          panels: {
            slideRail: false,
            inspector: false,
            diagnostics: false,
            activeSlidePreview: false,
            versionHistory: false,
          },
          editing: {
            allowSourceMode: false,
          },
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
    });

    expect(screen.queryByRole("navigation", { name: "Slides" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "YAML" })).not.toBeInTheDocument();
    expect(screen.queryByText("Diagnostics")).not.toBeInTheDocument();
  });

  it("renders an explicit empty state when DeckStudio has no diagnostics", async () => {
    render(
      React.createElement(DeckStudio, {
        deckId: "empty-diagnostics-deck",
        initialValue: source,
        storage: false,
        layout: {
          showVersionHistory: false,
        },
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Diagnostics")).toBeInTheDocument();
    });

    expect(screen.getByText("Aucun diagnostic.")).toBeInTheDocument();
  });

  it("does not recompile DeckStudio only because integration props are recreated", async () => {
    const onCompile = jest.fn();

    function IntegratedHarness() {
      const [, setCompileStatus] = React.useState("pending");

      return React.createElement(DeckStudio, {
        mode: "controlled",
        deckId: "loop-guard",
        value: source,
        onChange: () => undefined,
        storage: false,
        layout: {
          showInspector: true,
          showVersionHistory: false,
          showActiveSlidePreview: false,
        },
        features: {
          allowPdfExport: false,
        },
        onCompile: (result) => {
          onCompile(result.status);
          setCompileStatus(result.status);
        },
      });
    }

    render(React.createElement(IntegratedHarness));

    await waitFor(() => {
      expect(onCompile).toHaveBeenCalledTimes(1);
    });

    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });

    expect(onCompile).toHaveBeenCalledTimes(1);
  });

  it("matches the stable DeckShow DOM snapshot", async () => {
    const deck = await compileValidDeck();
    const { container } = render(React.createElement(DeckShow, { deck, mode: "embedded" }));

    expect(container.firstChild).toMatchSnapshot();
  });

  it("exposes lightweight package entrypoints", async () => {
    await expect(import("../../dist/viewer.js")).resolves.toHaveProperty("DeckShow");
    await expect(import("../../dist/studio.js")).resolves.toHaveProperty("DeckStudio");
    await expect(import("../../dist/presentation.js")).resolves.toHaveProperty("DeckPresentationOverlay");
    await expect(import("../../dist/compiler.js")).resolves.toHaveProperty("compileDeck");
    await expect(import("../../dist/runtime.js")).resolves.toHaveProperty("createDeckRuntime");
    await expect(import("../../dist/pdf.js")).resolves.toHaveProperty("PrintDeck");
    await expect(import("../../dist/pdf.js")).resolves.toHaveProperty("DeckPdfDownloadButton");
    await expect(import("../../dist/pdf.js")).resolves.toHaveProperty("useDeckPdfExport");
    await expect(import("../../dist/pdf.js")).resolves.toHaveProperty("downloadDeckPdfFromElement");
  });
});

function createDataTransfer() {
  const values = new Map();

  return {
    effectAllowed: "none",
    dropEffect: "none",
    setData(type, value) {
      values.set(type, value);
    },
    getData(type) {
      return values.get(type) ?? "";
    },
  };
}
