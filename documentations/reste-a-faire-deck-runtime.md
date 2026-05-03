# Qastia Deck Runtime - Reste a faire

Ce document complete :

- `documentations/spec-deck-runtime-editor.md`
- `documentations/spec-deck-runtime-architecture.md`

Il liste les ecarts restants entre la cible de specification et l'etat courant de la librairie `@bjalon/deck-runtime`.

Date de reference : 2026-05-03.

## 1. Etat Resume

Deja largement couvert :

- compilation YAML stricte avec modes `authoring` et `strict` ;
- layouts de base `cover`, `title-body`, `two-columns`, `image-only` ;
- formulaire dynamique selon le layout ;
- viewer `DeckShow` ;
- presentation fullscreen via `DeckPresentationOverlay` ;
- navigation partagee via `useDeckNavigation` ;
- themes runtime limites aux slides ;
- `DeckStudio` avec edition, rail, drag and drop, preview, diagnostics, mode source ;
- defaults globaux `eyebrow` / `footer` avec override par slide ;
- persistance `localStorage`, drafts, versions, recovery dialog, diff, version history ;
- export PDF direct via composant, hook et fonction bas niveau ;
- entrypoints package `viewer`, `editor`, `presentation`, `compiler`, `runtime`, `pdf` ;
- tests Jest sur le package buildé.

Les prochains chantiers ne sont donc pas un redemarrage. Il s'agit surtout de durcir l'architecture, terminer certains contrats publics et reduire les zones encore trop monolithiques.

## 2. P0 - Ecarts Corriges Le 2026-05-03

Ces points etaient les ecarts critiques avant usage produit. Ils restent dans ce
document comme historique de decision et comme checklist de regression.

### 2.1. Propager reellement le registry de renderers au rendu

Reference :

- `spec-deck-runtime-architecture.md`, section 11 ;
- `spec-deck-runtime-editor.md`, sections 2.6, 16 et 17.

Etat implemente :

- `compileDeck` stocke le registry dans `CompiledDeck.renderers`.
- `SlideRenderer` transmet le registry aux layouts via `LayoutRendererProps.renderers`.
- Les layouts par defaut passent ce registry a `ContentRenderer`.
- `ContentRenderer` resout les plugins via registry, avec fallback par defaut.
- un test valide un renderer custom injecte avec `createDeckRuntime`.

Risque residuel :

- les renderers lourds restent a isoler/lazy-loader plus tard.

Statut : fait.

### 2.2. Finaliser la migration de layout sans perte silencieuse

Reference :

- `spec-deck-runtime-editor.md`, section 8 ;
- `spec-deck-runtime-architecture.md`, section 9.

Etat implemente :

- des plans de migration existent dans les layouts par defaut ;
- `updateSlideLayoutWithMigration` produit un resultat explicite ;
- les slots non repris sont conserves dans `unassignedSlots` ;
- le schema YAML accepte `unassignedSlots` ;
- le compiler produit un diagnostic `LAYOUT_UNASSIGNED_SLOT` ;
- le studio affiche une zone recuperable "Contenus conserves hors rendu" ;
- un test couvre la migration `two-columns -> title-body`.

Risque residuel :

- l'UX de previsualisation avant migration reste a enrichir si besoin.

Statut : fait pour le chemin non destructeur et les diagnostics.

### 2.3. Durcir le mode source

Reference :

- `spec-deck-runtime-editor.md`, sections 9.4, 12, 13 et 28.

Etat implemente :

- mode source via composant dedie `DeckSourceEditor` ;
- CodeMirror YAML actif ;
- diagnostics par ligne quand un `range` est disponible ;
- clic diagnostic -> passage en mode source et focus sur la position disponible ;
- textarea masque conserve comme fallback technique.

Risque residuel :

- les diagnostics schema bases uniquement sur `path` n'ont pas encore tous un `range` source.

Statut : fait pour le composant source et le parcours range disponible.

### 2.4. Rendre les options du rail configurables

Reference :

- `spec-deck-runtime-editor.md`, sections 9.5 et 10.

Etat implemente :

- `slideRail.maxVisibleItems` configure le nombre d'items visibles ;
- `slideRail.itemHeightPx` configure la hauteur d'une carte ;
- `thumbnailMode: "compact" | "live" | "simplified"` est expose ;
- le scroll reste local ;
- un test valide les variables de dimensions appliquees.

Risque residuel :

- le mode `live` reste visuellement proche du mode compact pour l'instant.

Statut : fait pour l'API et le scroll local.

## 3. P1 - Durcissement Architecture

### 3.1. Continuer a decouper `DeckStudio`

Reference :

- `spec-deck-runtime-architecture.md`, sections 3 et 8 ;
- `spec-deck-runtime-editor.md`, sections 9.8 et 26.

Etat actuel :

- `SlideFormEditor`, `GlobalDefaultsDialog`, `CrashRecoveryDialog`, `VersionHistoryPanel` et dialogs versions sont extraits ;
- `DeckStudio.tsx` reste encore le centre de beaucoup de logique.

A faire :

- extraire `SlideRail` ;
- extraire `DeckStudioToolbar` ;
- extraire `useDeckStudioPersistence` ;
- extraire `useDeckStudioDirtyState` ;
- extraire `useDeckStudioShortcuts` ;
- extraire `useDeckStudioSelection` ;
- isoler les actions source dans un reducer ou un module d'actions.

Objectif :

```txt
DeckStudio = facade d'assemblage
state/hooks = logique
subcomponents = UI
editableSource = mutations YAML structurees
```

### 3.2. Structurer le CSS source

Reference :

- `spec-deck-runtime-architecture.md`, section 13.

Etat actuel :

- le CSS est bien dans `@layer qastia.deck` ;
- le fichier `src/styles/deck-runtime.css` grossit fortement ;
- il contient base, layouts, themes, viewer, presentation, studio, forms, recovery, PDF.

A faire :

- scinder la source CSS en fichiers :

```txt
base.css
layouts.css
themes.css
viewer.css
presentation.css
studio.css
forms.css
recovery.css
versions.css
print.css
```

- conserver une sortie package unique `dist/deck-runtime.css` ;
- garder le layer et les prefixes actuels.

### 3.3. Verifier le tree-shaking des entrypoints

Reference :

- `spec-deck-runtime-architecture.md`, sections 16 et 17 ;
- `spec-deck-runtime-editor.md`, section 4.

Etat actuel :

- les entrypoints existent, avec `editor` comme module public d'edition ;
- le build produit des chunks separes ;
- les tests valident surtout le package buildé fonctionnellement.

A faire :

- ajouter un test ou script de smoke import :

```ts
import { DeckShow } from "@bjalon/deck-runtime/viewer";
```

- verifier que `viewer` ne force pas le studio, storage UI, PDF raster ou renderers lourds ;
- verifier que `pdf` charge `jspdf/html2canvas` seulement au moment de l'export direct.

### 3.4. Stabiliser le contrat public apres les ajouts recents

Reference :

- `spec-deck-runtime-architecture.md`, section 16 ;
- `spec-deck-runtime-editor.md`, sections 9.4, 9.5 et 9.7.

Etat actuel :

- plusieurs besoins UX ont ete ajoutes rapidement : `cancel-edit`, shortcuts, Save/Cancel, recovery simplifie, rail borne.

A faire :

- mettre a jour les specs principales avec les nouveaux choix valides ;
- documenter les events `cancel-edit` et les raccourcis clavier ;
- decider quelles options deviennent publiques et lesquelles restent CSS/internal ;
- verifier la compatibilite de `DeckStudioOptions` avec les usages `qastia-coaching`.

## 4. P1 - Persistance, Recovery Et Versions

### 4.1. Ajouter des tests unitaires dedies a l'adapter storage

Reference :

- `spec-deck-runtime-editor.md`, sections 19, 20, 21, 22 et 29.

Etat actuel :

- le fonctionnement est couvert via tests composants ;
- l'adapter `LocalStorageDeckPersistenceAdapter` n'a pas encore une suite unitaire exhaustive.

A faire :

- tester `localStorage` indisponible ;
- tester JSON corrompu ;
- tester quota exceeded avec mock ;
- tester pruning `maxVersionsPerDeck` ;
- tester pruning `maxAutosaveVersionsPerDeck` ;
- tester suppression physique des snapshots prunes ;
- tester isolation `namespace + deckId`.

### 4.2. Ameliorer le diff de versions

Reference :

- `spec-deck-runtime-editor.md`, section 21.5.

Etat actuel :

- un diff textuel ligne par ligne existe ;
- la comparaison structurelle est encore absente.

A faire :

- ajouter une comparaison structurelle de haut niveau :

```txt
slides ajoutees
slides supprimees
slides modifiees
slots modifies
layout change
theme change
defaults modifies
```

- afficher ce resume avant le diff YAML ;
- garder le diff texte comme vue detail.

### 4.3. Clarifier la strategie de version manuelle vs Save

Reference :

- `spec-deck-runtime-editor.md`, sections 19.4 et 22.

Etat actuel :

- `Save` cree une version manuelle si configure ;
- le panneau versions permet aussi de creer une version manuelle nommee.

A faire :

- clarifier dans l'UX si `Save` est une sauvegarde courante, une version, ou les deux ;
- permettre un label optionnel au Save si besoin ;
- eviter les versions "Manual save" trop nombreuses ou peu informatives ;
- documenter le comportement dans README et spec.

## 5. P2 - Rendu, Renderers Et Assets

### 5.1. Renderers lourds et rendu code enrichi

Reference :

- `spec-deck-runtime-editor.md`, sections 16, 25.2, 30 phase 6 et 35.5 ;
- `spec-deck-runtime-architecture.md`, sections 11 et 19.

Etat courant :

- Mermaid est compile en noeud et rendu par un plugin charge dynamiquement ;
- Mermaid utilise `securityLevel: "strict"` et affiche un fallback lisible en cas d'erreur ;
- code blocks rendus simplement ;
- Shiki est disponible dans la stack, mais pas encore branche au renderer code.

A faire :

- extraire Mermaid dans `src/renderers/mermaid/` si le fichier de plugins grossit ;
- valider le diagramme en amont quand un mode strict renderer sera ajoute ;
- brancher Shiki en lazy-load pour code blocks ;
- garder des fallbacks compacts pour thumbnails et print.

### 5.2. Assets et images

Reference :

- `spec-deck-runtime-editor.md`, sections 5, 6, 7 et 25.3.

Etat actuel :

- layout image supporte un slot image ;
- resolver assets par defaut present ;
- pas de gestion UI avancee des assets.

A faire :

- clarifier `assetId` vs `src` ;
- ajouter validation URL/allowlist si necessaire ;
- exposer un picker d'assets optionnel cote studio ;
- eviter tout stockage base64 lourd en localStorage.

### 5.3. Thumbnails live

Reference :

- `spec-deck-runtime-editor.md`, section 10.3.

Etat actuel :

- le rail affiche des cartes compactes ;
- pas de thumbnails live reduites.

A faire :

- garder le mode compact par defaut pour performance ;
- ajouter un mode live optionnel ;
- fallback compact pour renderers couteux ;
- tester overflow et performance avec beaucoup de slides.

## 6. P2 - PDF Et Print

Reference :

- `spec-deck-runtime-editor.md`, section 23 ;
- `spec-deck-runtime-architecture.md`, section 15.

Etat actuel :

- `PrintDeck`, `DeckPdfDownloadButton`, `useDeckPdfExport` et `downloadDeckPdfFromElement` existent ;
- export client-side via `html2canvas` et `jspdf` ;
- build exemple OK.

A faire :

- tests visuels print/PDF ;
- verifier pagination avec themes et layouts longs ;
- verifier rendu image/code/mermaid quand renderers avances arriveront ;
- documenter les limites client-side : polices, images cross-origin, taille PDF.

## 7. P2 - Accessibilite Et UX

Reference :

- `spec-deck-runtime-editor.md`, section 28.

Etat actuel :

- les controles principaux ont des roles/labels de base ;
- le recovery a ete simplifie pour utilisateurs non techniques ;
- les raccourcis sont listes dans une popin.

A faire :

- audit clavier complet du studio ;
- focus trap dans les dialogs ;
- fermeture Escape des dialogs ;
- annonce ARIA des changements de slide et recovery ;
- verifier contraste des themes et de l'UI studio ;
- documenter les raccourcis clavier publics.

## 8. P2 - Tests Et Qualite

Reference :

- `spec-deck-runtime-editor.md`, section 29 ;
- `spec-deck-runtime-architecture.md`, section 18.

Etat actuel :

- `npm test` couvre le compiler ;
- `npm run test:jest` teste le package buildé ;
- `npm run build:example` valide l'exemple.

A faire :

- property-based tests sur le YAML ;
- tests de migrations layout ;
- tests storage unitaires ;
- tests d'import entrypoints ;
- tests visuels Playwright pour :

```txt
viewer desktop/mobile
studio avec beaucoup de slides
presentation fullscreen
recovery dialog
diff versions
print/PDF smoke
```

- test bundle pour verifier que les imports legers restent legers.

## 9. Extensions Futures Non Prioritaires

Ces sujets sont prevus par la spec, mais ne doivent pas bloquer la V1 actuelle :

- designer CSS/theme ;
- designer de layout ;
- undo/redo complet ;
- IndexedDB ;
- backend persistence ;
- collaboration temps reel ;
- renderers avances : Excalidraw, PlantUML, Graphviz, Quiz, Poll, Video, iframe allowlistee, composants React custom.

## 10. Ordre De Traitement Recommande

### Iteration 1 - Contrat runtime fiable - fait

1. Propager les renderers runtime jusqu'a `ContentRenderer` - fait.
2. Ajouter test renderer custom - fait.
3. Stabiliser spec/API pour `cancel-edit`, shortcuts et rail options - fait.

### Iteration 2 - Studio maintenable

1. Extraire `SlideRail`.
2. Extraire `DeckStudioToolbar`.
3. Extraire hooks persistence/dirty/shortcuts.
4. Ajouter options publiques du rail - fait.

### Iteration 3 - Source et diagnostics

1. Introduire source editor dedie - fait.
2. Ajouter diagnostics par ligne quand `range` disponible - fait.
3. Ajouter clic diagnostic -> source - fait.

### Iteration 4 - Storage robuste

1. Tests unitaires adapter.
2. Tests pruning/quota/corruption.
3. Ameliorer diff structurel.

### Iteration 5 - CSS et visuel

1. Split CSS source.
2. Tests visuels studio/viewer/presentation/recovery.
3. Verifier responsive mobile/tablette.

## 11. Definition D'Une V1 Stable

La V1 peut etre consideree stable quand :

- les renderers custom injectes au runtime fonctionnent dans les layouts par defaut - fait ;
- le changement de layout ne perd jamais de contenu sans diagnostic clair - fait pour `unassignedSlots` ;
- l'adapter storage est couvert par tests unitaires ;
- les entrypoints publics sont testes ;
- le studio est decoupe en sous-composants critiques ;
- le CSS source est separable et maintenable ;
- l'exemple integre couvre recovery, PDF, presentation, themes, rail, Save/Cancel ;
- `qastia-coaching` peut integrer la lib sans override CSS structurel obligatoire.
