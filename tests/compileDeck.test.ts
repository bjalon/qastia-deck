import { describe, expect, it } from "vitest";
import { compileDeck, defaultDeckRuntime, type DeckSource } from "../src";

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
