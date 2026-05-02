import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    expect(screen.getByRole("button", { name: /1 cover cover/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2 details title-body/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Stable title");
    expect(screen.getByLabelText("Subtitle")).toHaveValue("Runtime preview");
    expect(screen.getByLabelText("Title").tagName).toBe("INPUT");
    expect(screen.getByLabelText("Subtitle").tagName).toBe("INPUT");
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
    expect(screen.getByRole("region", { name: "Slide preview" })).toBeInTheDocument();
    expect(screen.getByText("Stable title")).toBeInTheDocument();
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
});
