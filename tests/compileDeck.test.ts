import { describe, expect, it } from "vitest";
import { compileDeck, createDeckRuntime, defaultDeckRuntime, type DeckSource } from "../src";

const validSource: DeckSource = {
  content: `
version: 1
kind: deck
metadata:
  title: Test deck
theme:
  id: fintech-light
slides:
  - id: cover
    layout: cover
    slots:
      title:
        markdown: |
          # Hello
`,
};

describe("compileDeck", () => {
  it("compiles a valid deck", async () => {
    const result = await compileDeck(validSource, {
      runtime: defaultDeckRuntime,
      mode: "editor",
      locale: "fr-FR",
    });

    expect(result.status).toBe("valid");
    if (result.status !== "valid") {
      throw new Error("Expected valid deck.");
    }
    expect(result.deck.slides).toHaveLength(1);
  });

  it("exposes the slide-only style presets through the default runtime", async () => {
    const expectedThemeIds = [
      "fintech-light",
      "qastia-coaching",
      "editorial-indigo",
      "sage-coral",
      "midnight-gold",
    ];

    for (const themeId of expectedThemeIds) {
      expect(defaultDeckRuntime.themes.has(themeId)).toBe(true);
    }

    const result = await compileDeck(
      { content: validSource.content.replace("id: fintech-light", "id: qastia-coaching") },
      {
        runtime: defaultDeckRuntime,
        mode: "editor",
        locale: "fr-FR",
      },
    );

    expect(result.status).toBe("valid");
    if (result.status !== "valid") {
      throw new Error("Expected valid deck.");
    }
    expect(result.deck.theme.cssClassName).toBe("deck-theme-qastia-coaching");
  });

  it("keeps incomplete decks renderable in authoring mode with synthetic slots", async () => {
    const result = await compileDeck(
      {
        content: validSource.content.replace("layout: cover", "layout: title-body"),
      },
      {
        runtime: defaultDeckRuntime,
        mode: "editor",
        compileMode: "authoring",
        locale: "fr-FR",
      },
    );

    expect(result.status).toBe("degraded");
    if (result.status === "invalid") {
      throw new Error("Expected degraded deck.");
    }
    expect(result.deck.slides[0].slots.get("body")?.origin).toBe("synthetic");
  });

  it("inherits supported default slots without mutating slide slots", async () => {
    const result = await compileDeck(
      {
        content: `
version: 1
kind: deck
metadata:
  title: Defaults deck
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
        markdown: Hello
  - id: details
    layout: title-body
    slots:
      title:
        markdown: Details
      body:
        markdown: Body
      footer:
        markdown: Local footer
`,
      },
      {
        runtime: defaultDeckRuntime,
        mode: "editor",
        locale: "fr-FR",
      },
    );

    expect(result.status).toBe("valid");
    if (result.status === "invalid") {
      throw new Error("Expected valid deck.");
    }

    const cover = result.deck.slides[0];
    expect(cover.slots.get("eyebrow")?.origin).toBe("default");
    expect(cover.slots.get("footer")?.origin).toBe("default");
    expect(cover.slots.get("footer")?.content.kind).toBe("markdown");
    expect(result.deck.slides[1].slots.get("footer")?.origin).toBe("source");
    expect(result.deck.slides[1].slots.has("eyebrow")).toBe(false);
  });

  it("rejects incomplete decks in strict mode", async () => {
    const result = await compileDeck(
      {
        content: validSource.content.replace("layout: cover", "layout: title-body"),
      },
      {
        runtime: defaultDeckRuntime,
        mode: "viewer",
        compileMode: "strict",
        locale: "fr-FR",
      },
    );

    expect(result.status).toBe("invalid");
    expect(result.diagnostics.some((diagnostic) => diagnostic.code === "LAYOUT_MISSING_SLOT")).toBe(true);
  });

  it("supports explicit registry collision strategies", () => {
    expect(() =>
      createDeckRuntime({
        registryCollisionStrategy: "throw",
        themes: [
          ...Array.from(defaultDeckRuntime.themes.values()),
          {
            ...defaultDeckRuntime.themes.get("fintech-light")!,
            displayName: "Duplicate",
          },
        ],
      }),
    ).toThrow(/Duplicate theme id 'fintech-light'/);
  });

  it("returns invalid diagnostics for unknown layouts", async () => {
    const result = await compileDeck(
      {
        content: validSource.content.replace("layout: cover", "layout: nope"),
      },
      {
        runtime: defaultDeckRuntime,
        mode: "editor",
        locale: "fr-FR",
      },
    );

    expect(result.status).toBe("invalid");
    expect(result.diagnostics.some((diagnostic) => diagnostic.code === "SLIDE_UNKNOWN_LAYOUT")).toBe(true);
  });

  it("does not throw for arbitrary invalid yaml", async () => {
    const result = await compileDeck(
      { content: "version: [1\nkind:" },
      {
        runtime: defaultDeckRuntime,
        mode: "editor",
        locale: "fr-FR",
      },
    );

    expect(result.status).toBe("invalid");
  });
});
