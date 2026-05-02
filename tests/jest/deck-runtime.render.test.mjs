import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import {
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
    expect(screen.getByLabelText("Title")).toHaveValue("# Stable title\n");
    expect(screen.getByLabelText("Subtitle")).toHaveValue("Runtime preview\n");
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
