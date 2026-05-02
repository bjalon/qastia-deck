# qastia-deck

Package local `@qastia/deck-runtime` pour compiler, afficher, editer et imprimer des decks YAML/Markdown dans une application React + Vite.

## Build

```bash
npm install
npm run build
```

## Utilisation dans qastia-coaching

Le projet consommateur reference la librairie en dependance locale :

```json
{
  "dependencies": {
    "@qastia/deck-runtime": "file:../qastia-deck"
  }
}
```

Exemple minimal :

```tsx
import { DeckStudio, type DeckSource } from "@qastia/deck-runtime";
import "@qastia/deck-runtime/styles.css";

const source: DeckSource = {
  content: `
version: 1
kind: deck
metadata:
  title: Demo
slides:
  - id: cover
    layout: cover
    slots:
      title:
        markdown: |
          # Demo
`,
};

export function DeckPage(): React.ReactElement {
  return <DeckStudio deckId="demo" initialValue={source} />;
}
```

Exports principaux :

- `compileDeck`
- `DeckShow`
- `DeckStudio`
- `PrintDeck`
- `DebugDeckFallback`
- `createDeckRuntime`
- `defaultDeckRuntime`
