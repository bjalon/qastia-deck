# Qastia Deck

`@bjalon/deck-runtime` est une librairie React pour compiler, afficher, presenter, editer et exporter des decks YAML/Markdown dans une application metier.

L'objectif n'est pas de remplacer un outil de slides generaliste. La librairie fournit un runtime embarquable pour des supports structures, themables, editables, versionnables et rendus de maniere coherente dans les produits Qastia.

Exemple en ligne : https://bjalon.github.io/qastia-deck/

## Objectifs

- Decrire un deck dans un format source lisible, base sur YAML et Markdown.
- Compiler ce format en modele type exploitable par une application React.
- Afficher un deck en preview integree, viewer ou presentation plein ecran.
- Fournir un studio d'edition embarque avec formulaire, YAML et preview de slide.
- Centraliser layouts, themes, transitions et renderers.
- Supporter les diagnostics de compilation pour guider l'edition et le debug.
- Gerer des valeurs globales reutilisees par les slides, avec override local.
- Proposer une sauvegarde locale, des versions, une recuperation de brouillon et un export PDF.

## Cas D'Usage

La librairie est pensee pour les applications qui doivent generer, editer ou afficher des supports dans un workflow metier :

- supports d'atelier ou de coaching client ;
- restitutions structurees a partir de donnees applicatives ;
- decks editables dans un espace client ou un back-office ;
- preview immediate pendant l'edition ;
- presentation plein ecran depuis une page applicative ;
- impression ou telechargement PDF controle par l'application.

## Installation

Pour un projet qui consomme le package publie sur GitHub Packages :

```ini
@bjalon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

```bash
npm install @bjalon/deck-runtime
```

Pendant le developpement local avec `qastia-coaching`, il est aussi possible d'utiliser une dependance locale :

```json
{
  "dependencies": {
    "@bjalon/deck-runtime": "file:../qastia-deck"
  }
}
```

La feuille de style doit etre importee par l'application :

```ts
import "@bjalon/deck-runtime/styles.css";
```

## Format Source

Un deck est une source YAML. Les contenus textuels des slots sont en Markdown.

```yaml
version: 1
kind: deck
metadata:
  title: Support integre
theme:
  id: qastia-coaching
defaults:
  slots:
    eyebrow:
      markdown: Atelier CODIR
    footer:
      markdown: Sophie Jalon Conseil
slides:
  - id: ouverture
    layout: cover
    slots:
      title:
        markdown: Aligner les decisions
      subtitle:
        markdown: Un support editable directement dans l'espace client.
  - id: cadrage
    layout: title-body
    slots:
      title:
        markdown: Cadrage
      body:
        markdown: |
          - Objectifs
          - Decisions attendues
```

`metadata.title` est le titre du slideshow. Dans `DeckStudio`, il est editable directement par double-clic dans le rail de gauche.

`defaults.slots` permet de definir des valeurs globales, aujourd'hui utilisees notamment pour `eyebrow` et `footer`. Dans le formulaire de slide, ces champs apparaissent en valeur heritee. L'utilisateur peut cocher l'override pour remplacer la valeur globale localement sur une slide.

## Usage Rapide

Studio complet non controle :

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
        markdown: Demo
`,
};

export function DeckPage(): React.ReactElement {
  return <DeckStudio deckId="demo" initialValue={source} />;
}
```

Studio controle par l'application :

```tsx
import { useState } from "react";
import { DeckStudio, type DeckSource } from "@bjalon/deck-runtime/studio";
import "@bjalon/deck-runtime/styles.css";

export function ControlledDeckStudio({ initialSource }: { readonly initialSource: DeckSource }) {
  const [source, setSource] = useState(initialSource);

  return (
    <DeckStudio
      mode="controlled"
      deckId="client-session"
      value={source}
      onChange={(nextSource) => setSource(nextSource)}
    />
  );
}
```

Preview simple avec `DeckShow` :

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

## Composants Principaux

- `DeckStudio` : studio d'edition embarque.
- `DeckShow` : viewer/preview de deck compile.
- `DeckPresentationOverlay` : presentation plein ecran autonome.
- `PrintDeck` : rendu print base sur les memes slides compilees.
- `DeckPdfDownloadButton` : bouton React pret a l'emploi pour telecharger un PDF.
- `DeckPdfExportHost` et `useDeckPdfExport` : primitives pour composer une UI PDF custom.
- `DebugDeckFallback` : fallback quand la source est invalide.
- `compileDeck` : compilation YAML/Markdown vers un modele type.
- `createDeckRuntime` : runtime personnalise avec layouts, renderers, themes et transitions.

## DeckStudio

`DeckStudio` est la facade d'edition. Il regroupe :

- rail de slides a gauche ;
- edition par formulaire ;
- edition YAML ;
- preview de la slide active ;
- diagnostics ;
- stockage local optionnel ;
- versions locales ;
- edition des valeurs globales ;
- actions de slides ;
- drag and drop de l'ordre des slides.

### Interactions Disponibles

- Double-clic sur le titre du slideshow dans le rail : edition de `metadata.title`.
- Blur ou `Entree` sur ce titre : sauvegarde.
- `Echap` sur ce titre : annulation.
- `Add` : ajoute une slide apres la slide selectionnee et selectionne la nouvelle slide.
- `Duplicate` : duplique la slide selectionnee juste apres elle.
- `Delete` : supprime la slide selectionnee.
- Glisser-deposer dans le rail : change l'ordre des slides dans le YAML.
- `Global` : ouvre une popin pour modifier les valeurs globales `eyebrow` et `footer`.
- Checkbox d'override sur un champ herite : remplace la valeur globale pour la slide courante.

### Options D'Edition

Les vues visibles du studio sont configurables :

```tsx
<DeckStudio
  deckId="demo"
  initialValue={source}
  options={{
    editing: {
      defaultMode: "form",
      viewModes: ["form", "source", "preview"],
      allowYamlMode: true,
      allowPreviewMode: true,
      allowLayoutChange: true,
    },
  }}
/>
```

Valeurs possibles pour `viewModes` :

- `form` : formulaire structure ;
- `source` : YAML brut ;
- `preview` : rendu de la slide active.

`viewModes` permet de fixer la liste et l'ordre des vues. Les flags plus fins
permettent ensuite d'activer ou non chaque vue optionnelle :

```tsx
<DeckStudio
  deckId="demo"
  initialValue={source}
  options={{
    editing: {
      allowYamlMode: false,
      allowPreviewMode: true,
    },
  }}
/>
```

`form` reste la vue de base du studio. Si `allowYamlMode` et
`allowPreviewMode` sont tous les deux a `false`, la liste deroulante de choix de
vue n'est pas affichee. `allowSourceMode` reste supporte comme alias historique
de `allowYamlMode`.

### Panels Et Rail

Les panneaux du studio peuvent etre actives, masques ou configures :

```tsx
<DeckStudio
  deckId="demo"
  initialValue={source}
  options={{
    panels: {
      slideRail: {
        visibleDefault: true,
        userToggle: true,
        widthPx: 220,
        allowReorder: true,
        allowAddDelete: true,
      },
      diagnostics: {
        visibleDefault: true,
        userToggle: true,
        placement: "bottom",
      },
      activeSlidePreview: false,
      inspector: {
        visibleDefault: true,
        widthPx: 340,
      },
      versionHistory: false,
    },
  }}
/>
```

Le rail de slides est volontairement compact. S'il contient beaucoup de slides, il scrolle localement pour garder le focus sur le panneau d'edition principal.

### Feature Flags

```tsx
<DeckStudio
  deckId="demo"
  initialValue={source}
  features={{
    allowAddSlide: true,
    allowDuplicateSlide: true,
    allowDeleteSlide: true,
    allowReorderSlides: true,
    allowLayoutChange: true,
    allowRawSourceEdit: true,
    allowVersionRestore: true,
  }}
/>
```

`allowReorderSlides` est active par defaut dans la configuration courante.

## DeckShow

`DeckShow` affiche un deck compile sans dependre du studio.

```tsx
<DeckShow
  deck={deck}
  mode="embedded"
  controls={{
    placement: "bottom",
    showPreviousNext: true,
    showCounter: true,
    showPresentationButton: true,
    showPresentationControlsModeSelect: true,
    presentationControlsMode: "auto",
    onPresentationControlsModeChange: setPresentationControlsMode,
  }}
  onRequestPresentation={(event) => {
    openPresentation(event.slideId);
  }}
/>
```

`DeckShow` ne monte pas lui-meme `DeckPresentationOverlay`. Il emet seulement `onRequestPresentation`, ce qui laisse l'application hote gerer l'ouverture.

Navigation clavier :

- `mode="viewer"` : navigation globale ;
- `mode="embedded"` : navigation limitee au focus dans le viewer ;
- `keyboardNavigation={false}` : navigation clavier desactivee.

Les champs `input`, `textarea`, `select`, `contenteditable` et zones similaires ne sont pas interceptes par la navigation du viewer.

## Presentation Plein Ecran

```tsx
import { DeckPresentationOverlay } from "@bjalon/deck-runtime/presentation";

<DeckPresentationOverlay
  deck={deck}
  open={presentationOpen}
  initialSlideId={selectedSlideId}
  options={{
    fullscreen: {
      strategy: "browser-fullscreen",
      closeOnEscape: true,
    },
    controls: {
      visibility: "auto",
      autoHideDelayMs: 1800,
    },
    hint: {
      showWhenControlsHidden: true,
      text: "Fleches gauche/droite : naviguer - Escape : quitter",
      position: "bottom-right",
    },
  }}
  onOpenChange={(event) => setPresentationOpen(event.open)}
/>
```

Modes de controles :

- `visible` : boutons de navigation toujours visibles ;
- `hidden` : pas de boutons, seulement le hint si configure ;
- `auto` : controles visibles puis masques automatiquement.

Strategies fullscreen :

- `browser-fullscreen` : tente l'API navigateur ;
- `overlay` : plein ecran CSS fiable sans API navigateur.

## Export PDF Direct

Bouton pret a l'emploi :

```tsx
import { DeckPdfDownloadButton } from "@bjalon/deck-runtime/pdf";
import "@bjalon/deck-runtime/styles.css";

export function PdfAction({ deck }: { readonly deck: CompiledDeck }): React.ReactElement {
  return (
    <DeckPdfDownloadButton deck={deck}>
      Telecharger PDF
    </DeckPdfDownloadButton>
  );
}
```

UI custom avec hook :

```tsx
import { DeckPdfExportHost, useDeckPdfExport } from "@bjalon/deck-runtime/pdf";

function CustomPdfAction({ deck }: { readonly deck: CompiledDeck }) {
  const { exportHostRef, exportPdf, exporting } = useDeckPdfExport({ deck });

  return (
    <>
      <button type="button" onClick={() => void exportPdf()} disabled={exporting}>
        {exporting ? "Export..." : "PDF"}
      </button>
      <DeckPdfExportHost ref={exportHostRef} deck={deck} />
    </>
  );
}
```

Le PDF client-side est genere en rasterisant les pages issues de `PrintDeck`. `jspdf` et `html2canvas` sont charges dynamiquement au moment de l'export.

## Runtime Personnalise

Le runtime par defaut contient les layouts, renderers, themes et transitions fournis par la librairie. Une application peut ajouter ou remplacer ces registres :

```tsx
import { createDeckRuntime } from "@bjalon/deck-runtime/runtime";

const runtime = createDeckRuntime({
  layouts: [...customLayouts],
  renderers: [...customRenderers],
  themes: [...customThemes],
  transitions: [...customTransitions],
  registryCollisionStrategy: "override",
});
```

Strategies disponibles en cas de collision de registre :

- `override` : le dernier element remplace le precedent ;
- `keep-first` : le premier element est conserve ;
- `throw` : une erreur est levee des qu'un doublon est detecte.

## Themes

Les themes impactent uniquement le rendu des slides, pas l'interface du studio ou de l'application hote.

La resolution du theme se fait au runtime via le deck compile et `deckThemeStyle`. Les presets actuels sont declares dans le runtime par defaut et appliques par classe CSS + variables CSS.

L'exemple integre montre un selecteur de theme persiste dans `localStorage` cote application exemple.

## Entrypoints

Le package expose des entrypoints separes pour limiter ce qu'une application importe :

```ts
import { DeckShow } from "@bjalon/deck-runtime/viewer";
import { DeckStudio } from "@bjalon/deck-runtime/studio";
import { DeckPresentationOverlay } from "@bjalon/deck-runtime/presentation";
import { compileDeck } from "@bjalon/deck-runtime/compiler";
import { createDeckRuntime } from "@bjalon/deck-runtime/runtime";
import { DeckPdfDownloadButton, PrintDeck } from "@bjalon/deck-runtime/pdf";
import "@bjalon/deck-runtime/styles.css";
```

L'entree racine reste disponible pour un usage simple :

```ts
import { DeckShow, DeckStudio, compileDeck } from "@bjalon/deck-runtime";
```

## Exemple Integre

L'exemple montre une integration typique dans une page applicative :

- preview integree avec `DeckShow` ;
- `DeckStudio` controle sur la meme source YAML ;
- selecteur de theme persiste dans `localStorage` ;
- menu de panels preview/diagnostics persiste dans `localStorage` ;
- presentation plein ecran avec choix `auto`, `visible`, `hidden` ;
- export PDF direct ;
- statut de compilation et diagnostics.

Version en ligne : https://bjalon.github.io/qastia-deck/

Lancement local :

```bash
npm install
npm run dev:example
```

## Build Et Tests

```bash
npm install
npm run build
```

Commandes utiles :

```bash
npm run typecheck
npm test
npm run test:jest
npm run build:example
npm pack --dry-run
```

`npm run test:jest` reconstruit le package puis teste les fichiers `dist`, afin de valider ce qui sera reellement consomme par les applications.

## Publication GitHub Packages

Le package est publie sous le scope npm `@bjalon`, car le repository GitHub est `bjalon/qastia-deck`.

GitHub Packages npm impose que le scope du package corresponde au proprietaire GitHub autorise. Le workflow publie donc `@bjalon/deck-runtime` avec `secrets.GITHUB_TOKEN` et la permission Actions `packages: write`.

Configuration cote consommateur :

```ini
@bjalon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Dependance publiee :

```json
{
  "dependencies": {
    "@bjalon/deck-runtime": "^1.2.0"
  }
}
```

## Documentation D'Architecture

Les documents de reference sont dans `documentations/` :

- `spec-deck-runtime-editor.md` : specification fonctionnelle et API cible ;
- `spec-deck-runtime-architecture.md` : regles d'architecture et choix structurants.
