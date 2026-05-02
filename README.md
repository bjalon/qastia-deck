# Qastia Deck

`@bjalon/deck-runtime` est une librairie React pour intégrer des supports de présentation YAML/Markdown dans une application métier.

L'objectif n'est pas de remplacer un outil de slides généraliste, mais de fournir un runtime embarquable pour des decks structurés, éditables, versionnables et rendus de manière cohérente dans un produit Qastia.

Exemple en ligne : https://bjalon.github.io/qastia-deck/

## Objectifs

- Décrire un deck dans un format source lisible, basé sur YAML et Markdown.
- Compiler ce format en modèle typé exploitable par une application React.
- Afficher un deck en mode lecture, intégré dans une page produit ou en présentation plein écran.
- Fournir un studio d'édition embarqué pour modifier les slides sans quitter l'application.
- Centraliser les layouts, thèmes, transitions et renderers pour garder une identité visuelle cohérente.
- Supporter les diagnostics de compilation afin d'aider l'édition, la validation et le debug.
- Préparer les usages métier : sauvegarde locale, versions, récupération de brouillon, export PDF.

## Cas d'usage

La librairie est pensée pour les applications qui doivent générer, éditer ou afficher des supports dans un workflow métier :

- supports d'atelier ou de coaching client ;
- restitutions structurées à partir de données applicatives ;
- decks éditables dans un espace client ou un back-office ;
- prévisualisation immédiate pendant l'édition ;
- présentation plein écran depuis une page applicative ;
- impression ou export PDF contrôlé par l'application.

## Concepts

Un deck est écrit comme une source YAML. Les contenus textuels des slots sont généralement en Markdown.

```yaml
version: 1
kind: deck
metadata:
  title: Demo
theme:
  id: fintech-light
slides:
  - id: cover
    layout: cover
    slots:
      title:
        markdown: |
          # Demo
      subtitle:
        markdown: |
          Un deck éditable dans une application React.
```

Le runtime compile cette source, résout les layouts et thèmes disponibles, puis produit un modèle de deck prêt à être rendu.

## Usage rapide

Importer le composant studio et la feuille de style du runtime :

```tsx
import { DeckStudio, type DeckSource } from "@bjalon/deck-runtime";
import "@bjalon/deck-runtime/styles.css";

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

Pour un affichage simple en lecture, compiler la source puis rendre le deck avec `DeckShow`.

```tsx
import { useEffect, useState } from "react";
import {
  DeckShow,
  compileDeck,
  defaultDeckRuntime,
  type CompiledDeck,
  type DeckSource,
} from "@bjalon/deck-runtime";
import "@bjalon/deck-runtime/styles.css";

export function DeckPreview({ source }: { readonly source: DeckSource }): React.ReactElement {
  const [deck, setDeck] = useState<CompiledDeck | null>(null);

  useEffect(() => {
    compileDeck(source, {
      runtime: defaultDeckRuntime,
      mode: "viewer",
      locale: "fr-FR",
    }).then((result) => {
      setDeck(result.status === "valid" || result.status === "degraded" ? result.deck : null);
    });
  }, [source]);

  return deck ? <DeckShow deck={deck} mode="embedded" /> : <p>Deck invalide.</p>;
}
```

## Composants principaux

- `DeckStudio` : studio d'édition embarqué, avec édition par formulaire ou source YAML, diagnostics, prévisualisation et options de stockage.
- `DeckShow` : lecteur de deck pour un affichage intégré ou viewer.
- `DeckPresentationOverlay` : présentation plein écran contrôlée depuis l'application.
- `PrintDeck` : rendu orienté impression/export PDF.
- `DebugDeckFallback` : affichage de fallback lorsque la source est invalide.
- `compileDeck` : compilation d'une source YAML/Markdown vers un modèle de deck typé.
- `createDeckRuntime` : création d'un runtime personnalisé avec layouts, renderers, thèmes et transitions.

## Exemple intégré

L'exemple montre une intégration typique dans une page applicative :

- un `DeckShow` en mode `embedded` pour la prévisualisation ;
- un `DeckStudio` contrôlé sur la même source YAML ;
- un changement de thème depuis l'interface hôte ;
- une présentation plein écran via `DeckPresentationOverlay` ;
- l'affichage du statut de compilation et des diagnostics.

Version en ligne : https://bjalon.github.io/qastia-deck/

Pour lancer l'exemple localement :

```bash
npm install
npm run dev:example
```

## Runtime personnalisé

Le runtime par défaut couvre les layouts, renderers, thèmes et transitions fournis par la librairie. Une application peut créer son propre runtime pour ajouter ou remplacer ces registres.

```tsx
import { createDeckRuntime } from "@bjalon/deck-runtime";

const runtime = createDeckRuntime({
  layouts: [...customLayouts],
  renderers: [...customRenderers],
  themes: [...customThemes],
  transitions: [...customTransitions],
  registryCollisionStrategy: "override",
});
```

Stratégies disponibles en cas de collision de registre :

- `override` : le dernier élément remplace le précédent ;
- `keep-first` : le premier élément est conservé ;
- `throw` : une erreur est levée dès qu'un doublon est détecté.

## Build

```bash
npm install
npm run build
```

Commandes utiles :

```bash
npm run typecheck
npm run test
npm run build:example
```

## Utilisation dans qastia-coaching

Le projet consommateur peut référencer la librairie en dépendance locale pendant le développement :

```json
{
  "dependencies": {
    "@bjalon/deck-runtime": "file:../qastia-deck"
  }
}
```

## Publication GitHub Packages

Le package est publié sous le scope npm `@bjalon`, car le repository GitHub est `bjalon/qastia-deck`.

GitHub Packages npm impose que le scope du package corresponde au propriétaire GitHub autorisé. Le workflow publie donc `@bjalon/deck-runtime` avec `secrets.GITHUB_TOKEN` et la permission Actions `packages: write`.

Le projet `qastia-coaching` doit pointer vers ce registry :

```ini
@bjalon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

et dépendre du package publié :

```json
{
  "dependencies": {
    "@bjalon/deck-runtime": "^1.0.0"
  }
}
```
