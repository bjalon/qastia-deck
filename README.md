# qastia-deck

Package local `@qastia/deck-runtime` pour compiler, afficher, editer et imprimer des decks YAML/Markdown dans une application React + Vite.

## Build

```bash
npm install
npm run build
```

## Exemple intégré

```bash
npm run dev:example
```

La page montre `DeckShow` en mode `embedded` dans une zone applicative, avec `DeckStudio` en édition contrôlée sur la même source YAML.

Le workflow GitHub Actions construit aussi cet exemple et le déploie sur GitHub Pages depuis `main` :

```txt
https://bjalon.github.io/qastia-deck/
```

## Publication GitHub Packages

Le package est publié sous le scope npm `@qastia`.

Depuis un repository `bjalon/*`, le `GITHUB_TOKEN` du workflow ne peut pas publier sous le namespace `@qastia`. Le job `Publish to GitHub Packages` utilise donc le secret GitHub Actions suivant :

```txt
QASTIA_PACKAGES_TOKEN
```

Ce secret doit contenir un Personal Access Token autorisé à publier dans l’organisation ou le namespace GitHub `qastia`, avec au minimum :

```txt
write:packages
read:packages
```

Si le repository est transféré sous l’organisation `qastia`, le workflow pourra être simplifié pour réutiliser `secrets.GITHUB_TOKEN`.

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
