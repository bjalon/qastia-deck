# Qastia Deck Runtime - Architecture

Ce document complète `spec-deck-runtime-editor.md`.

La spec historique décrit la cible fonctionnelle initiale. Ce document fixe les règles d'architecture applicables au code courant et aux prochaines évolutions de `@bjalon/deck-runtime`.

## 1. Objectif

La librairie doit permettre plusieurs usages sans imposer le studio complet :

```txt
compiler seul          -> compileDeck
preview seule          -> DeckShow
presentation seule     -> DeckPresentationOverlay
edition integree       -> DeckStudio
print / PDF            -> PrintDeck
runtime extensible     -> createDeckRuntime
```

La règle structurante est simple :

```txt
DeckSource YAML
  -> compiler pur
  -> CompiledDeck
  -> surfaces de rendu
```

## 2. Frontieres

```txt
compiler/
  Ne depend pas de React.
  Transforme YAML/Markdown en CompileDeckResult.

runtime/
  Fournit les registries layouts/renderers/themes/transitions/assets.
  Permet a l'application hote d'injecter ses extensions.

slideshow/
  Affiche un deck.
  Ne depend pas du studio.
  Ne possede pas la presentation fullscreen.

presentation/
  Presentation plein ecran.
  Ne depend pas du studio.
  Reutilise la navigation partagee.

studio/
  Facade d'edition.
  Assemble formulaire, source YAML, preview, diagnostics et persistence.

storage/
  Persistence par adapter.
  Ne depend pas de React.

pdf/
  Rendu print/PDF.
  Reutilise SlideRenderer et les layouts existants.

examples/
  Demonstration d'integration.
  Ne fait pas partie du coeur librairie.
```

## 3. Regles D'Architecture

Les regles suivantes sont obligatoires :

```txt
1. compileDeck ne depend pas de React.
2. SlideRenderer ne depend pas du studio.
3. DeckShow ne possede pas DeckPresentationOverlay.
4. DeckPresentationOverlay ne depend pas du studio.
5. useDeckNavigation centralise la navigation.
6. DeckStudio reste une facade et doit deleguer aux sous-composants.
7. La persistence passe par un adapter.
8. Les themes impactent uniquement les slides.
9. Integrated example reste une app de demo.
10. publicTypes.ts reste la facade de contrat public.
11. Les layouts ne dependent pas du studio, mais exposent leur definition d'edition.
12. Les renderers sont resolus par registry.
13. Le storage n'est jamais requis pour compiler ou afficher.
14. Le print n'a pas de modele de rendu parallele.
15. Les themes sont appliques par surface de rendu, jamais sur body.
16. Les composants publics supportent autant que possible controle et non-controle.
17. Les erreurs utilisateur deviennent des diagnostics.
18. Les throw sont reserves aux bugs internes ou erreurs systeme non recuperables.
19. L'entree racine ne doit pas empecher les entrypoints legers.
20. Les tests doivent valider le package buildé.
```

## 4. Compilation

Le compiler supporte deux modes :

```ts
export type CompileMode = "authoring" | "strict";
```

Mode `authoring` :

```txt
- utilise par le studio ;
- garde le deck rendable quand c'est possible ;
- cree des slots synthetiques pour les slots obligatoires manquants ;
- retourne degraded avec diagnostics.
```

Mode `strict` :

```txt
- utilise par viewer/publish/export ;
- ne repare pas les erreurs structurelles ;
- un slot requis manquant rend le deck invalid ;
- utile avant publication ou export final.
```

Les slots compiles portent leur origine :

```ts
origin: "source" | "default" | "synthetic"
```

Cette information permet au studio de rendre le formulaire sans masquer que le contenu n'existe pas encore dans la source. Un slot `default` vient de `defaults.slots` au niveau deck. Il est affiche comme une valeur heritee dans le studio et peut etre remplace par un override local sur la slide.

Les defaults de slots servent aux contenus repetes, par exemple `eyebrow` et `footer` :

```yaml
defaults:
  slots:
    eyebrow:
      markdown: Atelier CODIR
    footer:
      markdown: Sophie Jalon Conseil
```

Le compiler applique uniquement ces slots aux layouts qui les declarent dans `requiredSlots` ou `optionalSlots`. Un slot local garde toujours la priorite sur le default global.

## 5. Runtime Et Registries

`createDeckRuntime` est le point d'extension officiel.

```ts
createDeckRuntime({
  layouts,
  renderers,
  themes,
  transitions,
  registryCollisionStrategy,
});
```

Les collisions d'identifiants sont explicites :

```ts
type RegistryCollisionStrategy = "throw" | "override" | "keep-first";
```

Par defaut, `override` est utilise. Pour les tests ou les applications qui veulent detecter une configuration ambigue, `throw` est recommande.

## 6. Viewer

`DeckShow` reste un viewer :

```txt
- affiche toolbar + viewport ;
- emet onRequestPresentation ;
- ne monte pas DeckPresentationOverlay ;
- ne connait pas le studio ;
- ne connait pas le storage.
```

Navigation clavier :

```ts
keyboardNavigation?: false | "global" | "focus-within";
```

Les evenements clavier issus de champs editables ou menus interactifs sont ignores par :

```ts
shouldIgnoreDeckKeyboardEvent(event)
```

## 7. Presentation

`DeckPresentationOverlay` est independant.

Il supporte :

```txt
browser-fullscreen
overlay
```

Le fullscreen navigateur peut echouer. L'overlay CSS reste donc la surface fiable. La navigation utilise `useDeckNavigation`, comme `DeckShow`.

## 8. Studio

`DeckStudio` est une facade.

Le code interne doit continuer a se decomposer vers :

```txt
studio/form/
  SlideFormEditor
  fields

studio/preview/
  ActiveSlidePreview

studio/diagnostics/
  StudioDiagnosticsPanel

studio/versions/
  VersionHistoryPanel
```

La premiere extraction effective est `SlideFormEditor`, qui porte le formulaire de slide et les champs.

## 9. Layouts Et Edition

Chaque layout fournit :

```txt
- son rendu ;
- ses slots requis ;
- ses slots optionnels ;
- ses slots interdits ;
- sa definition d'edition ;
- ses plans de migration depuis d'autres layouts quand necessaire.
```

Le changement de layout doit passer par un plan de migration quand il existe :

```txt
title-body.body -> two-columns.left
cover.subtitle  -> title-body.body
two-columns.left -> cover.subtitle
```

Le changement brutal sans migration ne doit etre qu'un fallback.

## 10. TitleSlot

`TitleSlot` est une abstraction de rendu.

Il doit :

```txt
- rendre un titre sans obliger l'utilisateur a saisir # ;
- rester compatible avec les anciens titres Markdown ;
- adapter la taille de maniere deterministe ;
- ne pas modifier la source ;
- ne pas dependre du studio.
```

## 11. Renderers

Les renderers doivent etre resolus par registry.

Le renderer Markdown/code/mermaid par defaut peut rester simple, mais l'ajout d'un renderer ne doit pas obliger a modifier les layouts.

Mermaid reel est volontairement exclu de cette etape. Le placeholder actuel reste acceptable.

## 12. Themes

Les themes sont resolus au runtime.

```yaml
theme:
  id: qastia-coaching
```

La resolution se fait via :

```ts
runtime.themes.get(themeId)
```

Les tokens du theme sont appliques comme variables CSS sur la surface de rendu :

```ts
deckThemeStyle(theme)
```

Les classes CSS de presets restent possibles :

```css
.deck-theme-qastia-coaching .deck-slide-frame
```

Regle importante :

```txt
un theme ne modifie que les slides.
```

Il ne doit jamais modifier :

```txt
- top bar ;
- boutons viewer ;
- panneaux studio ;
- diagnostics ;
- application hote ;
- body.
```

Designer CSS exclu pour le moment.

## 13. CSS

Le CSS runtime est encapsule dans un layer :

```css
@layer qastia.deck { ... }
```

La sortie peut rester un seul fichier `deck-runtime.css`, mais la structure source devra etre separee si le fichier grossit :

```txt
base.css
layouts.css
themes.css
viewer.css
presentation.css
studio.css
forms.css
print.css
```

## 14. Storage

Le storage retourne des resultats types :

```ts
status: "success" | "unavailable" | "quota-exceeded" | "failed"
```

Il doit gerer :

```txt
- localStorage indisponible ;
- quota exceeded ;
- JSON corrompu ;
- pruning des versions ;
- absence de storage sans bloquer le viewer.
```

## 15. Print

`PrintDeck` reutilise :

```txt
CompiledDeck -> SlideRenderer -> Layout -> ContentRenderer
```

Le print est un target de rendu, pas un moteur parallele.

## 16. API Publique

L'API racine reste disponible :

```ts
import { DeckShow, DeckStudio } from "@bjalon/deck-runtime";
```

Des entrypoints legers existent aussi :

```ts
import { DeckShow } from "@bjalon/deck-runtime/viewer";
import { DeckStudio } from "@bjalon/deck-runtime/studio";
import { DeckPresentationOverlay } from "@bjalon/deck-runtime/presentation";
import { compileDeck } from "@bjalon/deck-runtime/compiler";
import { createDeckRuntime } from "@bjalon/deck-runtime/runtime";
import { PrintDeck } from "@bjalon/deck-runtime/pdf";
```

Objectif :

```txt
une application qui veut seulement une preview ne doit pas etre forcee de charger le studio.
```

## 17. Build

Le build package produit :

```txt
dist/
  deck-runtime.js
  viewer.js
  studio.js
  presentation.js
  compiler.js
  runtime.js
  pdf.js
  deck-runtime.css
  types/
```

Le CSS est marque comme side effect dans `package.json`.

## 18. Tests

La validation minimale est :

```bash
npm run typecheck
npm test
npm run test:jest
npm run build:example
```

`test:jest` teste le package buildé depuis `dist`, ce qui est obligatoire pour detecter les problemes d'exports et de packaging.

## 19. Exclusions Actuelles

Non inclus dans cette etape :

```txt
- vrai plugin Mermaid ;
- designer CSS/theme ;
- edition collaborative ;
- designer de layout.
```

Ces exclusions ne doivent pas bloquer l'architecture : les registries et les tokens runtime laissent ces evolutions possibles plus tard.
