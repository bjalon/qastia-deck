# Spécification technique — moteur de slides runtime et éditeur React

**Version :** 1.0  
**Cible :** application React + Vite + TypeScript  
**Contrainte principale :** rendu et édition des slides au runtime, sans backend obligatoire  
**Format de source :** YAML pour la structure, Markdown pour le contenu riche des slides  
**Nom de module proposé :** `deck-runtime`  
**Nom du composant éditeur proposé :** `DeckStudio`

---

## 1. Résumé

L’objectif est de construire un module React autonome permettant de :

- définir un jeu de slides avec un document YAML strict ;
- écrire le contenu textuel des slides en Markdown ;
- rendre les slides au runtime dans le navigateur ;
- éditer les slides avec une interface structurée ;
- changer dynamiquement le layout d’une slide ;
- afficher une prévisualisation miniature de toutes les slides ;
- valider très strictement le document source ;
- remonter des erreurs localisées, exploitables par l’éditeur ;
- sauvegarder automatiquement des versions en `localStorage` ;
- récupérer plusieurs versions après crash ou fermeture inattendue ;
- produire une sortie PDF cohérente avec le rendu React ;
- ajouter à terme des renderers spécialisés : Mermaid, code, image, quiz, schémas externes, composants interactifs.

Le moteur ne doit pas être organisé comme une page applicative figée. Il doit être conçu comme une brique intégrable dans un site existant.

Le composant principal côté édition est `DeckStudio`.

Le composant principal côté lecture est `DeckShow`.

Le compilateur principal est `compileDeck`.

---

## 2. Principes d’architecture

### 2.1. Le YAML est la source structurelle

Le YAML décrit :

- les métadonnées du deck ;
- le thème ;
- les layouts ;
- les transitions ;
- les assets ;
- la liste ordonnée des slides ;
- les slots de chaque slide ;
- les options d’édition et de rendu.

Le Markdown ne porte pas la structure du deck. Il ne contient pas le choix du layout, la transition ou les règles de composition. Il est limité au contenu riche d’un slot.

### 2.2. Le Markdown est un contenu de slot

Un slot peut contenir :

- du Markdown ;
- une image ;
- un bloc Mermaid ;
- un bloc code ;
- un renderer custom ;
- une référence d’asset.

Exemples de slots :

```yaml
slots:
  title:
    markdown: |
      # Gestion des risques
  body:
    markdown: |
      Les risques opérationnels doivent être identifiés, évalués et suivis.
```

### 2.3. Le rendu ne reçoit jamais du YAML brut

Les composants React ne doivent pas parser eux-mêmes le YAML.

Ils consomment un modèle compilé :

```tsx
<DeckShow deck={compiledDeck} />
<SlideRenderer slide={compiledSlide} target="screen" />
```

et non :

```tsx
<DeckShow yaml={rawYaml} />
```

### 2.4. Le compilateur est une brique centrale

Le compilateur transforme :

```txt
YAML source
  -> AST YAML
  -> modèle brut validé
  -> modèle normalisé
  -> modèle compilé
  -> diagnostics
```

Le compilateur doit être robuste. Une erreur utilisateur ne doit pas provoquer un crash React.

Il retourne un résultat typé :

```ts
export type CompileDeckResult =
  | {
      readonly status: "valid";
      readonly deck: CompiledDeck;
      readonly diagnostics: readonly [];
    }
  | {
      readonly status: "degraded";
      readonly deck: CompiledDeck;
      readonly diagnostics: readonly DeckDiagnostic[];
    }
  | {
      readonly status: "invalid";
      readonly fallback: DebugDeckViewModel;
      readonly diagnostics: readonly DeckDiagnostic[];
    };
```

`degraded` signifie que le deck peut être rendu, mais qu’il contient des warnings ou des fallbacks locaux.

`invalid` signifie que le deck ne peut pas être rendu comme slideshow, mais qu’un affichage debug reste possible.

### 2.5. L’éditeur est structuré, pas seulement textuel

L’éditeur principal ne doit pas forcer l’utilisateur à modifier directement le YAML.

Sur desktop, il doit afficher :

```txt
┌──────────────────────────────┬──────────────────────────────────────────────┬──────────────────────┐
│ Rail gauche                  │ Zone principale d’édition                    │ Panneau optionnel     │
│ miniatures des slides        │ formulaire adapté au layout sélectionné      │ diagnostics/versions  │
│                              │ + preview de la slide active                 │                      │
└──────────────────────────────┴──────────────────────────────────────────────┴──────────────────────┘
```

Le mode source YAML reste disponible en debug ou pour les utilisateurs techniques.

### 2.6. Découpage des responsabilités publiques

La librairie doit rester utilisable par couches. `IntegratedDeckWorkspace` est une façade de commodité, pas le centre réel du système.

Hiérarchie conceptuelle :

```txt
core + compiler
   ↓
SlideRenderer / DeckViewport
   ↓
DeckShow
   ↓
DeckStudio / DeckPresentationOverlay
   ↓
IntegratedDeckWorkspace
```

Règles :

- `IntegratedDeckWorkspace` peut dépendre de tout ;
- `DeckStudio` peut dépendre du compilateur, des layouts, des diagnostics et du viewer ;
- `DeckShow` ne dépend pas de l’éditeur ;
- `DeckShow` ne doit pas ouvrir directement `DeckPresentationOverlay` ;
- `DeckPresentationOverlay` ne dépend pas de l’éditeur ;
- `DeckPresentationOverlay` et `DeckShow` doivent réutiliser un niveau de rendu/navigation partagé (`DeckViewport`, et à terme un contrôleur de navigation commun) ;
- `SlideRenderer` ne dépend ni du workspace, ni de l’éditeur, ni de la présentation ;
- la persistance ne dépend pas de React ;
- les layouts définissent leur rendu, leur validation et leurs champs d’édition ;
- les renderers Mermaid/code/image restent dans des plugins ou registries dédiés.

Conséquence API : `DeckShow` peut afficher un bouton de présentation, mais il ne fait qu’émettre `onRequestPresentation`. L’ouverture réelle de l’overlay appartient au workspace ou à l’application hôte.

### 2.7. Composants contrôlés et non contrôlés

Les composants importants doivent supporter un mode non contrôlé et un mode contrôlé :

- slide active ;
- présentation ouverte/fermée ;
- panneau diagnostics visible/masqué ;
- rail de slides visible/masqué ;
- mode source actif/inactif ;
- historique de versions visible/masqué.

Pattern attendu :

```ts
type DeckSelectionProps = {
  readonly selectedSlideId?: string;
  readonly defaultSelectedSlideId?: string;
  readonly onSlideChange?: (event: SlideChangeEvent) => void;
};
```

Le composant peut gérer son état par défaut, mais l’application hôte doit pouvoir reprendre la main sans réécrire l’UI.

---

## 3. Stack technique recommandée

### 3.1. Obligatoire

```txt
React
Vite
TypeScript strict
Zod
yaml
unified / remark
react-markdown
CodeMirror 6
Mermaid
Vitest
```

### 3.2. Recommandé

```txt
react-hook-form
@hookform/resolvers/zod
Shiki
fast-check
Playwright
```

### 3.3. À éviter dans le cœur

```txt
Reveal.js
Slidev
Marp
```

Ces frameworks peuvent servir de références UX, mais ils ne doivent pas être le socle technique du moteur, parce que le besoin principal est un modèle de données éditable, validable et extensible au runtime.

---

## 4. Modules publics

Le module exporte uniquement une API claire.

```ts
export { DeckShow } from "./slideshow/DeckShow";
export { DeckPresentationOverlay } from "./presentation/DeckPresentationOverlay";
export { DeckStudio } from "./studio/DeckStudio";
export { DebugDeckFallback } from "./debug/DebugDeckFallback";
export { PrintDeck } from "./pdf/PrintDeck";

export { compileDeck } from "./compiler/compileDeck";
export { createDeckRuntime } from "./runtime/createDeckRuntime";
export { defaultDeckRuntime } from "./runtime/defaultDeckRuntime";

export type {
  DeckSource,
  CompiledDeck,
  CompiledSlide,
  CompileDeckResult,
  DeckDiagnostic,
  DeckPresentationOptions,
  DeckPresentationOverlayProps,
  DeckPresentationRequestEvent,
  DeckStudioProps,
  DeckRuntime,
  DeckUserAction,
  DeckVersionSnapshot,
} from "./publicTypes";
```

Les sous-modules internes ne doivent pas être importés directement par l’application consommatrice.

À terme, les entrypoints publics doivent permettre de ne charger que la couche utile :

```ts
import { DeckShow } from "@bjalon/deck-runtime/viewer";
import { DeckStudio } from "@bjalon/deck-runtime/editor";
import { DeckPresentationOverlay } from "@bjalon/deck-runtime/presentation";
import { IntegratedDeckWorkspace } from "@bjalon/deck-runtime/workspace";
```

Une page de preview seule ne doit pas embarquer inutilement l’éditeur, l’historique ou des renderers spécialisés non utilisés.

---

## 5. Modèle de source YAML

### 5.1. Exemple complet

```yaml
version: 1
kind: deck

metadata:
  title: "Formation risque opérationnel"
  description: "Support de formation interne"
  author: "Risk Academy"
  locale: "fr-FR"

theme:
  id: "fintech-light"

defaults:
  aspectRatio: "16:9"
  transition:
    in: "fade"
    out: "fade"
    durationMs: 250
  slots:
    eyebrow:
      markdown: |
        Formation interne
    footer:
      markdown: |
        Risk Academy

assets:
  logo:
    type: image
    src: "/assets/logo.svg"
    alt: "Logo société"
  riskMap:
    type: image
    src: "/assets/risk-map.png"
    alt: "Cartographie des risques"

slides:
  - id: cover
    layout: cover
    slots:
      title:
        markdown: |
          # Gestion des risques
      subtitle:
        markdown: |
          Formation interne — niveau 1
    transition:
      in: "zoom"
      out: "fade"

  - id: context
    layout: title-body
    slots:
      title:
        markdown: |
          ## Contexte
      body:
        markdown: |
          Les risques opérationnels doivent être identifiés, évalués et suivis.

          - Identifier
          - Mesurer
          - Réduire
          - Contrôler

  - id: process
    layout: title-body
    slots:
      title:
        markdown: |
          ## Processus cible
      body:
        markdown: |
          ```mermaid
          flowchart LR
            A[Détection] --> B[Qualification]
            B --> C[Traitement]
            C --> D[Suivi]
          ```

  - id: comparison
    layout: two-columns
    slots:
      title:
        markdown: |
          ## Avant / après
      left:
        markdown: |
          ### Avant

          - Processus manuel
          - Peu de traçabilité
          - Reporting lent
      right:
        markdown: |
          ### Après

          - Workflow guidé
          - Événements historisés
          - Reporting automatisé

  - id: visual
    layout: image-only
    slots:
      image:
        image:
          assetId: riskMap
```

### 5.2. Règles générales

- `version` est obligatoire.
- `kind` vaut toujours `deck`.
- `metadata.title` est obligatoire.
- `slides` doit contenir au moins une slide.
- Chaque slide doit avoir un `id` unique.
- Chaque slide doit avoir un `layout` connu du runtime.
- Chaque slide doit respecter le contrat de slots de son layout.
- Les champs inconnus doivent produire une erreur.
- Les assets référencés doivent exister.
- Les transitions doivent appartenir au registry de transitions.

---

## 6. Layouts

### 6.1. Concept

Un layout est un contrat de composition.

Il définit :

- un nom technique ;
- un libellé UI ;
- une description ;
- une catégorie ;
- les slots requis ;
- les slots optionnels ;
- les slots interdits ;
- le composant React de rendu ;
- le modèle de formulaire utilisé par `DeckStudio` ;
- les règles de migration depuis ou vers d’autres layouts.

### 6.2. Type `LayoutDefinition`

```ts
export type LayoutName =
  | "cover"
  | "title-body"
  | "two-columns"
  | "image-only";

export type SlotName = string;

export type LayoutCategory =
  | "cover"
  | "text"
  | "visual"
  | "comparison"
  | "custom";

export type LayoutDefinition = {
  readonly name: LayoutName;
  readonly displayName: string;
  readonly description: string;
  readonly category: LayoutCategory;
  readonly requiredSlots: readonly SlotName[];
  readonly optionalSlots: readonly SlotName[];
  readonly forbiddenSlots: readonly SlotName[];
  readonly editor: LayoutEditorDefinition;
  readonly migrateFrom?: LayoutMigrationMap;
  readonly component: React.ComponentType<LayoutRendererProps>;
};
```

### 6.3. Exemple `cover`

```ts
export const coverLayoutDefinition: LayoutDefinition = {
  name: "cover",
  displayName: "Titre centré",
  description: "Slide d’ouverture avec titre principal et sous-titre optionnel.",
  category: "cover",
  requiredSlots: ["title"],
  optionalSlots: ["subtitle", "eyebrow", "footer"],
  forbiddenSlots: ["body", "left", "right", "image"],
  editor: {
    fieldGroups: [
      {
        id: "content",
        label: "Contenu",
        fields: [
          {
            kind: "markdown",
            slotName: "title",
            label: "Titre",
            required: true,
            minRows: 3,
          },
          {
            kind: "markdown",
            slotName: "subtitle",
            label: "Sous-titre",
            required: false,
            minRows: 2,
          },
        ],
      },
    ],
  },
  component: CoverLayout,
};
```

### 6.4. Exemple `two-columns`

```ts
export const twoColumnsLayoutDefinition: LayoutDefinition = {
  name: "two-columns",
  displayName: "Titre + deux colonnes",
  description: "Slide avec un titre et deux zones de texte équilibrées.",
  category: "comparison",
  requiredSlots: ["title", "left", "right"],
  optionalSlots: ["footer"],
  forbiddenSlots: ["body", "image"],
  editor: {
    fieldGroups: [
      {
        id: "content",
        label: "Contenu",
        fields: [
          {
            kind: "markdown",
            slotName: "title",
            label: "Titre",
            required: true,
            minRows: 2,
          },
          {
            kind: "markdown",
            slotName: "left",
            label: "Colonne gauche",
            required: true,
            minRows: 8,
          },
          {
            kind: "markdown",
            slotName: "right",
            label: "Colonne droite",
            required: true,
            minRows: 8,
          },
        ],
      },
    ],
  },
  component: TwoColumnsLayout,
};
```

---

## 7. Formulaires dynamiques de slide

### 7.1. Objectif

Quand l’utilisateur sélectionne une slide dans le rail gauche, la zone principale affiche un formulaire adapté au layout courant.

Exemples :

- layout `cover` : champ titre, champ sous-titre, champ eyebrow, champ footer ;
- layout `title-body` : champ titre, champ body ;
- layout `two-columns` : champ titre, champ colonne gauche, champ colonne droite ;
- layout `image-only` : champ image, champ alt, options d’ajustement ;
- layout futur `quiz` : question, réponses, correction, feedback.

### 7.2. Type `LayoutEditorDefinition`

```ts
export type LayoutEditorDefinition = {
  readonly fieldGroups: readonly LayoutEditorFieldGroup[];
};

export type LayoutEditorFieldGroup = {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly fields: readonly LayoutEditorField[];
};

export type LayoutEditorField =
  | MarkdownEditorField
  | TextEditorField
  | ImageEditorField
  | SelectEditorField
  | BooleanEditorField
  | RendererEditorField;

export type MarkdownEditorField = {
  readonly kind: "markdown";
  readonly slotName: SlotName;
  readonly label: string;
  readonly required: boolean;
  readonly minRows?: number;
  readonly maxRows?: number;
  readonly placeholder?: string;
  readonly allowedBlocks?: readonly MarkdownBlockKind[];
};

export type TextEditorField = {
  readonly kind: "text";
  readonly path: readonly string[];
  readonly label: string;
  readonly required: boolean;
  readonly placeholder?: string;
};

export type ImageEditorField = {
  readonly kind: "image";
  readonly slotName: SlotName;
  readonly label: string;
  readonly required: boolean;
  readonly allowAssetPicker: boolean;
  readonly allowExternalUrl: boolean;
};

export type SelectEditorField = {
  readonly kind: "select";
  readonly path: readonly string[];
  readonly label: string;
  readonly options: readonly SelectEditorOption[];
};

export type BooleanEditorField = {
  readonly kind: "boolean";
  readonly path: readonly string[];
  readonly label: string;
};

export type RendererEditorField = {
  readonly kind: "renderer";
  readonly slotName: SlotName;
  readonly label: string;
  readonly rendererKind: RendererKind;
};

export type SelectEditorOption = {
  readonly value: string;
  readonly label: string;
};

export type MarkdownBlockKind =
  | "paragraph"
  | "heading"
  | "list"
  | "blockquote"
  | "code"
  | "mermaid"
  | "table";
```

Convention UI :

- un champ Markdown avec `minRows: 1` est rendu comme un input simple ligne ;
- les slots courts `title`, `eyebrow`, `subtitle` et `footer` sont éditables en simple ligne par défaut ;
- les champs du formulaire utilisent un label flottant intégré au champ, réduit au focus ou quand une valeur existe ;
- le slot `title` est un titre sémantique du layout : l’utilisateur ne doit pas avoir à saisir `#` ou `##` pour obtenir un rendu de titre ;
- le rendu adapte la taille du titre selon la longueur du texte afin d’éviter les débordements.

### 7.3. Form state

L’état éditable ne doit pas être le modèle compilé.

On distingue :

```txt
DeckSource         = texte YAML original
RawDeck           = modèle brut après parse YAML
EditableDeckDraft = modèle éditable par formulaire
CompiledDeck      = modèle renderable
```

Type proposé :

```ts
export type EditableDeckDraft = {
  readonly version: 1;
  readonly kind: "deck";
  readonly metadata: EditableDeckMetadata;
  readonly theme: EditableThemeRef;
  readonly defaults: EditableDeckDefaults;
  readonly assets: Readonly<Record<string, EditableAsset>>;
  readonly slides: readonly EditableSlideDraft[];
};

export type EditableSlideDraft = {
  readonly id: string;
  readonly layout: LayoutName;
  readonly slots: Readonly<Record<SlotName, EditableSlotDraft>>;
  readonly transition?: EditableTransition;
  readonly unassignedSlots?: Readonly<Record<SlotName, EditableSlotDraft>>;
};
```

`unassignedSlots` permet de ne pas perdre des contenus lors d’un changement de layout.

---

## 8. Changement de layout

### 8.1. Principe

Le changement de layout est une opération sensible.

Il peut rendre certains slots incompatibles avec le nouveau layout.

Exemple :

```txt
title-body
  slots: title, body

vers

two-columns
  slots: title, left, right
```

Le contenu de `body` ne peut pas être deviné parfaitement.

### 8.2. Règles

Lorsqu’un utilisateur change de layout :

1. créer une version de sécurité `before-layout-change` ;
2. calculer un plan de migration ;
3. afficher un aperçu des changements si des contenus risquent de devenir non assignés ;
4. migrer les slots compatibles ;
5. placer les slots incompatibles dans `unassignedSlots` ;
6. afficher une alerte non bloquante si du contenu a été mis de côté.

### 8.3. Type `LayoutMigrationPlan`

```ts
export type LayoutMigrationPlan = {
  readonly from: LayoutName;
  readonly to: LayoutName;
  readonly operations: readonly LayoutMigrationOperation[];
  readonly diagnostics: readonly DeckDiagnostic[];
};

export type LayoutMigrationOperation =
  | {
      readonly kind: "copy-slot";
      readonly fromSlot: SlotName;
      readonly toSlot: SlotName;
    }
  | {
      readonly kind: "move-slot";
      readonly fromSlot: SlotName;
      readonly toSlot: SlotName;
    }
  | {
      readonly kind: "stash-slot";
      readonly fromSlot: SlotName;
      readonly reason: string;
    }
  | {
      readonly kind: "create-empty-slot";
      readonly toSlot: SlotName;
      readonly slotKind: SlotKind;
    };
```

### 8.4. Exemple de migration

Migration de `title-body` vers `two-columns` :

```ts
const titleBodyToTwoColumns: LayoutMigrationPlan = {
  from: "title-body",
  to: "two-columns",
  operations: [
    { kind: "copy-slot", fromSlot: "title", toSlot: "title" },
    { kind: "move-slot", fromSlot: "body", toSlot: "left" },
    { kind: "create-empty-slot", toSlot: "right", slotKind: "markdown" },
  ],
  diagnostics: [],
};
```

Migration de `image-only` vers `title-body` :

```ts
const imageOnlyToTitleBody: LayoutMigrationPlan = {
  from: "image-only",
  to: "title-body",
  operations: [
    { kind: "create-empty-slot", toSlot: "title", slotKind: "markdown" },
    { kind: "create-empty-slot", toSlot: "body", slotKind: "markdown" },
    {
      kind: "stash-slot",
      fromSlot: "image",
      reason: "Le layout title-body ne supporte pas le slot image.",
    },
  ],
  diagnostics: [],
};
```

---

## 9. Composant `DeckStudio`

### 9.1. Rôle

`DeckStudio` est le composant d’édition complet.

Il encapsule :

- compilation du deck ;
- rail de miniatures ;
- sélection de slide ;
- formulaire dynamique de slide ;
- changement de layout ;
- preview de la slide active ;
- diagnostics ;
- sauvegarde locale ;
- historique de versions ;
- récupération après crash ;
- accès optionnel au mode source brut.

### 9.2. UX desktop

Sur desktop, l’interface se compose de trois zones.

```txt
┌─────────────────────┬─────────────────────────────────────────────┬────────────────────────┐
│ SlideRail            │ SlideEditWorkspace                          │ InspectorPanel          │
│                     │                                             │                        │
│ + Ajouter slide      │ Header: titre, layout, actions              │ Diagnostics             │
│ Thumbnail slide 1    │                                             │ Versions                │
│ Thumbnail slide 2    │ Formulaire adapté au layout                 │ Recovery                │
│ Thumbnail slide 3    │                                             │ Métadonnées             │
│ ...                  │ Preview active optionnelle                  │                        │
└─────────────────────┴─────────────────────────────────────────────┴────────────────────────┘
```

Le panneau droit est optionnel.

Si l’intégrateur ne veut qu’une édition compacte :

```txt
┌─────────────────────┬─────────────────────────────────────────────┐
│ SlideRail            │ SlideEditWorkspace                          │
└─────────────────────┴─────────────────────────────────────────────┘
```

### 9.3. UX mobile/tablette

Sur petit écran :

- le rail devient un tiroir ou une barre horizontale ;
- les panneaux sont affichés sous forme d’onglets ;
- le formulaire prend toute la largeur ;
- la preview peut être masquée par défaut ;
- le panneau versions est accessible par bouton.

Modes d’affichage proposés :

```ts
export type DeckStudioResponsiveMode =
  | "auto"
  | "desktop"
  | "compact"
  | "mobile";
```

### 9.4. Props publiques

Le composant doit être utilisable en mode contrôlé ou non contrôlé.

```ts
export type DeckStudioProps =
  | ControlledDeckStudioProps
  | UncontrolledDeckStudioProps;

export type ControlledDeckStudioProps = DeckStudioSharedProps & {
  readonly mode: "controlled";
  readonly value: DeckSource;
  readonly onChange: (
    nextSource: DeckSource,
    event: DeckSourceChangeEvent,
  ) => void;
  readonly initialValue?: never;
};

export type UncontrolledDeckStudioProps = DeckStudioSharedProps & {
  readonly mode?: "uncontrolled";
  readonly initialValue: DeckSource;
  readonly onChange?: (
    nextSource: DeckSource,
    event: DeckSourceChangeEvent,
  ) => void;
  readonly value?: never;
};

export type DeckStudioSharedProps = {
  readonly deckId: string;
  readonly namespace?: string;
  readonly runtime?: DeckRuntime;
  readonly readOnly?: boolean;
  readonly locale?: string;
  readonly responsiveMode?: DeckStudioResponsiveMode;
  readonly layout?: DeckStudioLayoutOptions;
  readonly storage?: false | DeckStorageConfig;
  readonly autosave?: false | DeckAutosaveConfig;
  readonly features?: DeckStudioFeatureFlags;
  readonly initialSelectedSlideId?: string;
  readonly onCompile?: (result: CompileDeckResult) => void;
  readonly onSave?: (event: DeckSaveEvent) => void;
  readonly onRestoreVersion?: (event: DeckRestoreVersionEvent) => void;
  readonly onSelectedSlideChange?: (event: DeckSelectedSlideChangeEvent) => void;
  readonly onUserAction?: (event: DeckUserAction) => void;
  readonly onPdfExportRequest?: (event: DeckPdfExportRequestEvent) => void;
  readonly onError?: (error: DeckRuntimeError) => void;
};
```

### 9.5. Options de layout UI

La version initiale peut exposer des booléens simples, mais l’API cible doit évoluer vers des panels nommés pour éviter les ambiguïtés entre :

- `slideRail` : liste des slides dans l’éditeur ;
- `activeSlidePreview` : preview de la slide sélectionnée dans l’éditeur ;
- `deckPreviewPane` : viewer complet du deck dans un workspace intégré ;
- `diagnosticsPanel` : affichage des diagnostics.

```ts
export type DeckStudioLayoutOptions = {
  readonly desktopBreakpointPx?: number;
  readonly slideRailWidthPx?: number;
  readonly inspectorWidthPx?: number;
  readonly showInspector?: boolean;
  readonly showActiveSlidePreview?: boolean;
  readonly showSourceModeToggle?: boolean;
  readonly showVersionHistory?: boolean;
  readonly showDiagnosticsPanel?: boolean;
  readonly density?: "compact" | "comfortable";
};
```

API cible pour les nouveaux développements :

```ts
export type DeckStudioOptions = {
  readonly panels?: {
    readonly slideRail?: false | SlideRailOptions;
    readonly inspector?: false | InspectorOptions;
    readonly diagnostics?: false | DiagnosticsPanelOptions;
    readonly activeSlidePreview?: false | ActiveSlidePreviewOptions;
    readonly versionHistory?: false | VersionHistoryPanelOptions;
  };

  readonly editing?: {
    readonly defaultMode?: "form" | "source" | "preview";
    readonly viewModes?: readonly ("form" | "source" | "preview")[];
    readonly allowYamlMode?: boolean;
    readonly allowSourceMode?: boolean;
    readonly allowPreviewMode?: boolean;
    readonly allowLayoutChange?: boolean;
  };
};

export type SlideRailOptions = {
  readonly visibleDefault?: boolean;
  readonly userToggle?: boolean;
  readonly placement?: "left" | "right";
  readonly widthPx?: number;
  readonly maxVisibleItems?: number;
  readonly itemHeightPx?: number;
  readonly thumbnailMode?: "compact" | "live" | "simplified";
  readonly allowReorder?: boolean;
  readonly allowAddDelete?: boolean;
};

export type DiagnosticsPanelOptions = {
  readonly visibleDefault?: boolean;
  readonly userToggle?: boolean;
  readonly placement?: "bottom" | "right" | "inspector";
};
```

`maxVisibleItems` et `itemHeightPx` pilotent la hauteur du rail sans imposer
d'override CSS cote application hotesse. Le scroll reste local au rail.

Regles d'affichage des vues :

- `form` est la vue de base du studio.
- `source` correspond a l'edition YAML brute.
- `allowYamlMode` active ou desactive explicitement la vue YAML.
- `allowSourceMode` reste supporte comme alias historique de `allowYamlMode`.
- `allowPreviewMode` active ou desactive explicitement la vue preview.
- `viewModes` permet de restreindre et ordonner les vues exposees.
- si YAML et preview sont desactives, la dropdown de selection de vue n'est pas affichee.

Valeurs par défaut :

```ts
export const defaultDeckStudioLayoutOptions: Required<DeckStudioLayoutOptions> = {
  desktopBreakpointPx: 1024,
  slideRailWidthPx: 260,
  inspectorWidthPx: 340,
  showInspector: true,
  showActiveSlidePreview: true,
  showSourceModeToggle: true,
  showVersionHistory: true,
  showDiagnosticsPanel: true,
  density: "comfortable",
};
```

### 9.6. Feature flags

```ts
export type DeckStudioFeatureFlags = {
  readonly allowAddSlide?: boolean;
  readonly allowDuplicateSlide?: boolean;
  readonly allowDeleteSlide?: boolean;
  readonly allowReorderSlides?: boolean;
  readonly allowLayoutChange?: boolean;
  readonly allowThemeChange?: boolean;
  readonly allowRawSourceEdit?: boolean;
  readonly allowPdfExport?: boolean;
  readonly allowVersionRestore?: boolean;
  readonly allowVersionCompare?: boolean;
};
```

### 9.7. Événements de changement

```ts
export type DeckSourceChangeReason =
  | "slide-field-edit"
  | "slide-add"
  | "slide-duplicate"
  | "slide-delete"
  | "slide-reorder"
  | "layout-change"
  | "theme-change"
  | "defaults-edit"
  | "metadata-edit"
  | "raw-source-edit"
  | "version-restore"
  | "crash-recovery";

export type DeckSourceChangeEvent = {
  readonly reason: DeckSourceChangeReason;
  readonly deckId: string;
  readonly selectedSlideId?: string;
  readonly sourceHash: string;
  readonly createdAtIso: string;
};
```

### 9.8. Composants internes

```txt
DeckStudio
  DeckStudioProvider
  DeckStudioLayout
    SlideRail
      SlideThumbnail
      AddSlideButton
      SlideContextMenu
    SlideEditWorkspace
      SlideEditHeader
      LayoutSelector
      SlideEditForm
      ActiveSlidePreview
    InspectorPanel
      DiagnosticsPanel
      VersionHistoryPanel
      RecoveryPanel
      DeckMetadataPanel
  RawSourceEditor
  CrashRecoveryDialog
```

### 9.9. Workspace intégré

`IntegratedDeckWorkspace` est un assemblage haut niveau destiné aux intégrations rapides. Il centralise l’état UI partagé et le redistribue aux briques bas niveau.

États centralisés :

- `deckPreviewPaneVisible` ;
- `diagnosticsVisible` ;
- `presentationOpen` ;
- `presentationControlsVisibility` ;
- `selectedSlideId` ;
- `sourceMode` ;
- `versionHistoryVisible`.

API cible :

```ts
export type IntegratedDeckWorkspaceProps = {
  readonly source: DeckSource;
  readonly runtime?: DeckRuntime;

  readonly selectedSlideId?: string;
  readonly defaultSelectedSlideId?: string;

  readonly options?: IntegratedDeckWorkspaceOptions;
  readonly persistence?: false | DeckPersistenceOptions;

  readonly onSourceChange?: (event: DeckSourceChangeEvent) => void;
  readonly onCompile?: (result: CompileDeckResult) => void;
  readonly onSlideChange?: (event: SlideChangeEvent) => void;
  readonly onAction?: (
    event: DeckUserAction,
    state: DeckRuntimeState,
  ) => void;
};

export type IntegratedDeckWorkspaceOptions = {
  readonly topBar?: false | {
    readonly showPreviewToggle?: boolean;
    readonly showDiagnosticsToggle?: boolean;
    readonly showVersionHistoryButton?: boolean;
    readonly showPresentationButton?: boolean;
  };

  readonly layout?: DeckWorkspaceLayoutOptions;
  readonly presentation?: false | DeckPresentationOptions;

  readonly diagnostics?: {
    readonly openOnlyWhenErrors?: boolean;
  };
};

export type DeckWorkspaceLayoutOptions = {
  readonly slideRail?: false | SlideRailOptions;
  readonly editorPane?: false | EditorPaneOptions;
  readonly activeSlidePreview?: false | ActiveSlidePreviewOptions;
  readonly deckPreviewPane?: false | DeckPreviewPaneOptions;
  readonly diagnosticsPanel?: false | DiagnosticsPanelOptions;
  readonly versionHistoryPanel?: false | VersionHistoryPanelOptions;
};
```

Le workspace peut ouvrir `DeckPresentationOverlay` après un `onRequestPresentation` émis par `DeckShow`. `DeckShow` ne doit pas connaître l’existence du workspace.

---

## 10. Rail gauche de miniatures

### 10.1. Objectif

Le rail gauche affiche toutes les slides sous forme de previews.

Chaque miniature doit permettre :

- de sélectionner une slide ;
- de voir rapidement le layout ;
- de voir les erreurs associées à la slide ;
- de dupliquer une slide ;
- de supprimer une slide ;
- de déplacer une slide ;
- d’ajouter une nouvelle slide.

### 10.2. Type `SlideThumbnailViewModel`

```ts
export type SlideThumbnailViewModel = {
  readonly slideId: string;
  readonly index: number;
  readonly title: string;
  readonly layout: LayoutName;
  readonly hasError: boolean;
  readonly hasWarning: boolean;
  readonly diagnostics: readonly DeckDiagnostic[];
  readonly compiledSlide?: CompiledSlide;
};
```

### 10.3. Rendu des miniatures

Les miniatures utilisent le même `SlideRenderer`, mais avec un target spécifique :

```tsx
<SlideRenderer slide={slide} target="thumbnail" />
```

Le target `thumbnail` doit :

- désactiver les animations ;
- réduire les polices via CSS ;
- éviter les interactions ;
- afficher un fallback compact si un renderer est coûteux ;
- signaler visuellement les erreurs.

### 10.4. Drag and drop

Le drag and drop du `SlideRail` est supporté par le studio et reste configurable via :

```ts
features={{
  allowReorderSlides: true,
}}
```

ou :

```ts
options={{
  panels: {
    slideRail: {
      allowReorder: true,
    },
  },
}}
```

Quand l’utilisateur dépose une slide sur une autre, l’ordre est réécrit dans la source YAML et la slide déplacée reste sélectionnée. Le comportement doit rester local au `SlideRail` : le renderer, le viewer et la présentation ne connaissent pas la mécanique de drag and drop.

Des alternatives pourront être ajoutées ensuite pour l’accessibilité clavier :

- boutons monter/descendre ;
- menu contextuel ;
- raccourcis clavier.

Un adapter DnD pourra être ajouté plus tard.

---

## 11. Formulaire d’édition de slide

### 11.1. Objectif

Le formulaire s’adapte au layout sélectionné.

Il ne doit pas connaître tous les layouts en dur. Il lit `LayoutEditorDefinition` depuis le registry.

### 11.2. Flux

```txt
slide active
  -> layout courant
  -> LayoutDefinition
  -> LayoutEditorDefinition
  -> génération des field groups
  -> édition des slots
  -> update EditableDeckDraft
  -> serialisation YAML
  -> compileDeck
  -> refresh preview + diagnostics
```

### 11.3. Type `SlideEditFormProps`

```ts
export type SlideEditFormProps = {
  readonly slide: EditableSlideDraft;
  readonly layoutDefinition: LayoutDefinition;
  readonly diagnostics: readonly DeckDiagnostic[];
  readonly readOnly: boolean;
  readonly onSlidePatch: (patch: SlidePatch) => void;
  readonly onLayoutChange: (nextLayout: LayoutName) => void;
};
```

### 11.4. Patchs de slide

```ts
export type SlidePatch =
  | {
      readonly kind: "set-slot-markdown";
      readonly slotName: SlotName;
      readonly markdown: string;
    }
  | {
      readonly kind: "set-slot-image";
      readonly slotName: SlotName;
      readonly image: EditableImageSlot;
    }
  | {
      readonly kind: "set-transition";
      readonly transition: EditableTransition;
    }
  | {
      readonly kind: "set-slide-id";
      readonly slideId: string;
    }
  | {
      readonly kind: "set-slide-metadata";
      readonly key: string;
      readonly value: string;
    };
```

### 11.5. Champs Markdown

Les champs Markdown peuvent être édités avec CodeMirror.

Avantages :

- support des diagnostics ;
- coloration minimale ;
- gestion des raccourcis ;
- possibilité d’afficher des erreurs précises dans le champ.

Pour un champ Markdown simple, un `textarea` peut être suffisant en première version. Mais l’intégration CodeMirror est préférable si l’objectif est d’avoir des diagnostics fins.

---

## 12. Mode source et fallback debug

### 12.1. Mode source

Le mode source affiche le YAML complet.

Il doit être disponible :

- via un bouton si `allowRawSourceEdit` est activé ;
- automatiquement si le document devient invalide au point de ne plus pouvoir produire un modèle éditable ;
- dans le panneau debug.

Implementation courante :

- le mode source utilise un composant dedie `DeckSourceEditor` ;
- l'edition YAML est fournie par CodeMirror 6 ;
- un textarea masque reste present comme fallback technique et pour la valeur brute ;
- les diagnostics disposant d'un `range` peuvent repositionner le focus dans l'editeur source.

### 12.2. Fallback debug

Lorsque le compilateur retourne `invalid`, `DeckStudio` affiche :

```txt
RawSourceEditor + diagnostics + zones soulignées
```

Le fallback doit :

- afficher le YAML brut ;
- souligner les ranges en erreur ;
- montrer le message au hover ;
- synchroniser le panneau diagnostics ;
- permettre de corriger le YAML ;
- rebasculer vers l’éditeur structuré dès que le document redevient suffisamment valide.

### 12.3. Diagnostics vers CodeMirror

```ts
export type CodeEditorDiagnostic = {
  readonly from: number;
  readonly to: number;
  readonly severity: "error" | "warning" | "info";
  readonly message: string;
  readonly code: string;
};

export function toCodeEditorDiagnostics(
  diagnostics: readonly DeckDiagnostic[],
): readonly CodeEditorDiagnostic[] {
  return diagnostics
    .filter((diagnostic): diagnostic is DeckDiagnosticWithRange =>
      diagnostic.range !== undefined,
    )
    .map((diagnostic) => ({
      from: diagnostic.range.start.offset,
      to: diagnostic.range.end.offset,
      severity: diagnostic.severity,
      message: diagnostic.message,
      code: diagnostic.code,
    }));
}
```

---

## 13. Diagnostics

### 13.1. Type central

```ts
export type DiagnosticSeverity = "error" | "warning" | "info";

export type SourcePosition = {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
};

export type SourceRange = {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
};

export type DeckDiagnostic = {
  readonly code: DiagnosticCode;
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly path?: readonly string[];
  readonly range?: SourceRange;
  readonly slideId?: string;
  readonly hint?: string;
  readonly related?: readonly RelatedDiagnostic[];
};

export type RelatedDiagnostic = {
  readonly message: string;
  readonly range?: SourceRange;
};
```

### 13.2. Codes de diagnostic

```ts
export type DiagnosticCode =
  | "YAML_SYNTAX_ERROR"
  | "YAML_PARSE_WARNING"
  | "SCHEMA_UNKNOWN_FIELD"
  | "SCHEMA_MISSING_FIELD"
  | "SCHEMA_INVALID_VALUE"
  | "DECK_EMPTY_SLIDES"
  | "SLIDE_DUPLICATE_ID"
  | "SLIDE_UNKNOWN_LAYOUT"
  | "LAYOUT_MISSING_SLOT"
  | "LAYOUT_FORBIDDEN_SLOT"
  | "LAYOUT_UNASSIGNED_SLOT"
  | "ASSET_NOT_FOUND"
  | "MARKDOWN_UNSUPPORTED_HTML"
  | "MARKDOWN_INVALID_TABLE"
  | "MERMAID_PARSE_ERROR"
  | "RENDERER_UNKNOWN_KIND"
  | "RENDER_OVERFLOW_WARNING"
  | "PDF_UNSUPPORTED_RENDERER"
  | "STORAGE_QUOTA_EXCEEDED"
  | "STORAGE_VERSION_CORRUPTED";
```

### 13.3. Exemple

```ts
const diagnostic: DeckDiagnostic = {
  code: "LAYOUT_MISSING_SLOT",
  severity: "error",
  message: "Le layout 'two-columns' requiert le slot 'right'.",
  path: ["slides", "3", "slots"],
  slideId: "comparison",
  range: {
    start: { line: 42, column: 5, offset: 1092 },
    end: { line: 46, column: 1, offset: 1228 },
  },
  hint: "Ajoutez un slot 'right' ou choisissez le layout 'title-body'.",
};
```

---

## 14. Pipeline de compilation

### 14.1. Étapes

```txt
1. parse YAML avec conservation des ranges
2. collecter erreurs/warnings YAML
3. transformer YAML AST en unknown
4. valider avec Zod
5. normaliser les defaults
6. valider les règles sémantiques
7. résoudre le thème
8. résoudre les assets
9. compiler les slots Markdown
10. détecter les blocs Mermaid/code/image
11. valider les contrats de layout
12. produire CompiledDeck ou DebugDeckViewModel
```

### 14.2. Signature

```ts
export type CompileContext = {
  readonly runtime: DeckRuntime;
  readonly mode: "viewer" | "editor" | "print" | "thumbnail";
  readonly locale: string;
};

export function compileDeck(
  source: DeckSource,
  context: CompileContext,
): Promise<CompileDeckResult>;
```

### 14.3. Règle anti-crash

`compileDeck` ne doit pas lever d’exception pour une erreur utilisateur.

Cas qui doivent retourner des diagnostics :

- YAML invalide ;
- champ inconnu ;
- layout inconnu ;
- slot manquant ;
- slot interdit ;
- ID dupliqué ;
- Mermaid invalide ;
- asset manquant.

Cas qui peuvent throw :

- bug interne ;
- runtime incomplet ;
- invariant impossible ;
- erreur de programmation.

---

## 15. Modèle compilé

```ts
export type CompiledDeck = {
  readonly version: 1;
  readonly metadata: DeckMetadata;
  readonly theme: CompiledTheme;
  readonly aspectRatio: AspectRatio;
  readonly assets: AssetRegistry;
  readonly slides: readonly CompiledSlide[];
};

export type CompiledSlide = {
  readonly id: string;
  readonly index: number;
  readonly layout: CompiledLayout;
  readonly transition: CompiledTransition;
  readonly slots: ReadonlyMap<SlotName, CompiledSlot>;
  readonly diagnostics: readonly DeckDiagnostic[];
};

export type CompiledSlot = {
  readonly name: SlotName;
  readonly kind: SlotKind;
  readonly content: CompiledContent;
  readonly origin: "source" | "default" | "synthetic";
  readonly diagnostics: readonly DeckDiagnostic[];
};

export type SlotKind =
  | "markdown"
  | "image"
  | "renderer";
```

---

## 16. Renderers de contenu

### 16.1. Principe

Les types de contenu ne doivent pas être codés en dur dans `SlideRenderer`.

Le runtime possède un registry :

```ts
export type RendererKind =
  | "markdown"
  | "image"
  | "code"
  | "diagram.mermaid"
  | "custom";

export interface ContentRendererPlugin {
  readonly kind: string;

  validate(
    node: TNode,
    context: RendererValidationContext,
  ): readonly DeckDiagnostic[];

  render(props: ContentRendererProps<RenderableContentNode>): React.ReactElement;

  renderFallback?(
    props: ContentRendererFallbackProps<RenderableContentNode>,
  ): React.ReactElement;
}
```

### 16.2. Mermaid

Les blocs Markdown suivants :

````md
```mermaid
flowchart TD
  A --> B
```
````

sont transformés en nœuds compilés :

```ts
export type CompiledMermaidNode = {
  readonly kind: "diagram.mermaid";
  readonly source: string;
  readonly range: SourceRange;
  readonly config?: MermaidConfigRef;
};
```

Le plugin Mermaid doit :

- désactiver le rendu automatique au chargement ;
- rendre explicitement chaque diagramme ;
- utiliser un niveau de sécurité strict ;
- avoir un fallback texte en cas d’erreur ;
- remonter un diagnostic `MERMAID_PARSE_ERROR` si possible.

### 16.3. Code

Les blocs code doivent être rendus par un plugin dédié.

```ts
export type CompiledCodeNode = {
  readonly kind: "code";
  readonly language: string;
  readonly source: string;
  readonly range: SourceRange;
};
```

Shiki peut être lazy-loadé pour éviter d’alourdir le bundle initial.

---

## 17. Runtime

### 17.1. Type `DeckRuntime`

```ts
export type DeckRuntime = {
  readonly layouts: LayoutRegistry;
  readonly renderers: RendererRegistry;
  readonly themes: ThemeRegistry;
  readonly transitions: TransitionRegistry;
  readonly assets: AssetResolver;
  readonly storage?: DeckPersistenceAdapter;
  readonly pdf?: PdfExportAdapter;
};
```

### 17.2. Création

```ts
export function createDeckRuntime(
  options: CreateDeckRuntimeOptions,
): DeckRuntime;

export type CreateDeckRuntimeOptions = {
  readonly layouts?: readonly LayoutDefinition[];
  readonly renderers?: readonly ContentRendererPlugin[];
  readonly themes?: readonly ThemeDefinition[];
  readonly transitions?: readonly TransitionDefinition[];
  readonly storage?: DeckPersistenceAdapter;
  readonly pdf?: PdfExportAdapter;
};
```

### 17.3. Runtime par défaut

```ts
export const defaultDeckRuntime = createDeckRuntime({
  layouts: [
    coverLayoutDefinition,
    titleBodyLayoutDefinition,
    twoColumnsLayoutDefinition,
    imageOnlyLayoutDefinition,
  ],
  renderers: [
    markdownRendererPlugin,
    imageRendererPlugin,
    codeRendererPlugin,
    mermaidRendererPlugin,
  ],
  themes: [
    defaultTheme,
    fintechLightTheme,
    fintechDarkTheme,
  ],
  transitions: [
    noneTransition,
    fadeTransition,
    slideLeftTransition,
    slideRightTransition,
    zoomTransition,
  ],
});
```

---

## 18. Viewer, navigation et présentation

### 18.1. `DeckShow`

`DeckShow` affiche un deck compilé en mode lecture ou preview. Il reste un viewer : il ne possède pas l’overlay plein écran.

Il gère :

- slide active ;
- navigation clavier/souris/touch ;
- callbacks d’action ;
- mode embedded ;
- toolbar optionnelle ;
- demande de présentation via événement.

Il ne gère pas :

- ouverture réelle du fullscreen ;
- persistance ;
- diagnostics d’édition ;
- état du workspace.

Props cibles :

```ts
export type DeckShowProps = {
  readonly deck: CompiledDeck;
  readonly mode?: "viewer" | "embedded";

  readonly selectedSlideId?: string;
  readonly defaultSelectedSlideId?: string;
  readonly initialSlideId?: string;

  readonly keyboardNavigation?: false | DeckKeyboardNavigationMode;
  readonly controls?: false | DeckShowControlsOptions;

  readonly onSlideChange?: (event: SlideChangeEvent) => void;
  readonly onAction?: (
    event: DeckUserAction,
    state: DeckRuntimeState,
  ) => void;
  readonly onRequestPresentation?: (
    event: DeckPresentationRequestEvent,
  ) => void;
  readonly onDiagnosticClick?: (diagnostic: DeckDiagnostic) => void;
};

export type DeckKeyboardNavigationMode = "global" | "focus-within";

export type DeckShowControlsOptions = {
  readonly placement?: "top" | "bottom";
  readonly showPreviousNext?: boolean;
  readonly showCounter?: boolean;
  readonly showPresentationButton?: boolean;
  readonly showPresentationControlsModeSelect?: boolean;
  readonly presentationControlsMode?: DeckPresentationControlsMode;
  readonly onPresentationControlsModeChange?: (
    mode: DeckPresentationControlsMode,
  ) => void;
  readonly presentationButtonLabel?: string;
  readonly presentationDisabled?: boolean;
  readonly presentationUnavailableLabel?: string;
};

export type DeckPresentationRequestEvent = {
  readonly type: "presentation-requested";
  readonly slideId?: string;
  readonly activeSlideIndex: number;
  readonly createdAtIso: string;
};
```

Règle d’intégration :

- `mode: "viewer"` navigue au clavier globalement par défaut ;
- `mode: "embedded"` navigue au clavier uniquement quand le focus est dans `DeckShow` ;
- les événements issus de `input`, `textarea`, `select` ou `contenteditable` ne doivent jamais déclencher la navigation du deck ;
- l’application hôte peut désactiver explicitement la navigation clavier avec `keyboardNavigation={false}`.

Le bouton `Presentation`, quand il est affiché, déclenche uniquement `onRequestPresentation`.

### 18.2. `DeckPresentationOverlay`

`DeckPresentationOverlay` est la brique plein écran autonome. Elle peut être utilisée sans `DeckStudio` ni `IntegratedDeckWorkspace`.

Elle doit réutiliser `DeckViewport` ou un contrôleur de navigation partagé pour éviter de dupliquer les règles de navigation avec `DeckShow`.

Props cibles :

```ts
export type DeckPresentationOverlayProps = {
  readonly deck: CompiledDeck;

  readonly open?: boolean;
  readonly defaultOpen?: boolean;

  readonly initialSlideId?: string;
  readonly selectedSlideId?: string;

  readonly options?: DeckPresentationOptions;

  readonly onOpenChange?: (
    event: DeckPresentationOpenChangeEvent,
  ) => void;
  readonly onSlideChange?: (event: SlideChangeEvent) => void;
  readonly onAction?: (
    event: DeckUserAction,
    state: DeckRuntimeState,
  ) => void;
};

export type DeckPresentationOptions = {
  readonly fullscreen?: {
    readonly strategy?: "overlay" | "browser-fullscreen";
    readonly closeOnEscape?: boolean;
  };

  readonly controls?: PresentationControlsOptions;

  readonly hint?: {
    readonly showWhenControlsHidden?: boolean;
    readonly text?: string;
    readonly position?: "bottom-right" | "bottom-center";
  };
};

export type PresentationControlsOptions =
  | { readonly visibility: "visible" }
  | { readonly visibility: "hidden" }
  | {
      readonly visibility: "auto";
      readonly autoHideDelayMs?: number;
    };
```

`fullscreen.strategy = "browser-fullscreen"` demande le fullscreen navigateur. Si le navigateur refuse, l’overlay CSS reste rendu. `fullscreen.strategy = "overlay"` rend seulement l’overlay CSS.

Quand `controls.visibility = "hidden"`, les boutons `Previous`, `Next` et `Quitter` ne sont pas affichés. Un hint discret peut rappeler les raccourcis clavier.

Quand `controls.visibility = "auto"`, les boutons sont affichés au mouvement souris puis masqués après `autoHideDelayMs`.

### 18.3. Actions utilisateur

```ts
export type DeckUserAction =
  | { readonly type: "next-slide"; readonly origin: ActionOrigin; readonly slideId?: string }
  | { readonly type: "previous-slide"; readonly origin: ActionOrigin; readonly slideId?: string }
  | { readonly type: "go-to-slide"; readonly origin: ActionOrigin; readonly slideId?: string }
  | { readonly type: "toggle-fullscreen"; readonly origin: ActionOrigin; readonly slideId?: string }
  | { readonly type: "pdf-export"; readonly origin: ActionOrigin; readonly slideId?: string };

export type ActionOrigin =
  | "keyboard"
  | "mouse"
  | "touch"
  | "programmatic";
```

---

## 19. Sauvegarde locale et versions

### 19.1. Objectif

La librairie doit pouvoir sauvegarder localement plusieurs versions du deck sans backend, mais la persistance ne doit pas être enfouie dans l’UI. `DeckStudio` et `IntegratedDeckWorkspace` consomment une interface de persistance.

Cette sauvegarde sert à :

- éviter la perte de travail ;
- restaurer après crash ;
- revenir à une version antérieure ;
- sécuriser les opérations destructrices ;
- comparer plusieurs versions.

### 19.2. Adapter de persistance

La persistance passe par un adapter indépendant de React :

```ts
export interface DeckVersionStore {
  saveSnapshot(request: SaveDeckSnapshotRequest): Promise<DeckVersionMeta>;
  listVersions(deckId: string): Promise<readonly DeckVersionMeta[]>;
  loadVersion(request: LoadDeckVersionRequest): Promise<DeckSource>;
  deleteVersion(request: DeleteDeckVersionRequest): Promise<void>;
  prune(request: PruneDeckVersionsRequest): Promise<void>;
}
```

Implémentation par défaut :

```ts
createLocalStorageDeckVersionStore({
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxBytesPerDeck: 2_000_000,
});
```

Le même contrat doit permettre à terme IndexedDB ou un backend applicatif.

### 19.3. Stockage par défaut

Le stockage par défaut est `localStorage`.

Règles :

- stocker uniquement la source YAML et des métadonnées ;
- ne pas stocker de gros binaires ;
- ne pas stocker les images en base64 ;
- limiter le nombre de versions ;
- compacter l’historique ;
- gérer les erreurs de quota ;
- exposer un adapter alternatif pour IndexedDB ou backend.

### 19.4. Configuration

```ts
export type DeckStorageConfig = {
  readonly adapter?: DeckPersistenceAdapter;
  readonly namespace?: string;
  readonly maxVersionsPerDeck?: number;
  readonly maxAutosaveVersionsPerDeck?: number;
  readonly maxBytesPerDeck?: number;
  readonly saveDraftOnChange?: boolean;
  readonly createVersionOnManualSave?: boolean;
  readonly createVersionBeforeDestructiveAction?: boolean;
  readonly recoverOnMount?: boolean;
};
```

Valeurs par défaut :

```ts
export const defaultDeckStorageConfig: Required<DeckStorageConfig> = {
  adapter: new LocalStorageDeckPersistenceAdapter(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4_000_000,
  saveDraftOnChange: true,
  createVersionOnManualSave: true,
  createVersionBeforeDestructiveAction: true,
  recoverOnMount: true,
};
```

### 19.4. Autosave

```ts
export type DeckAutosaveConfig = {
  readonly draftDebounceMs?: number;
  readonly versionIntervalMs?: number;
  readonly minChangeDistanceForVersion?: number;
  readonly createVersionOnValidDeckOnly?: boolean;
};
```

Valeurs par défaut :

```ts
export const defaultDeckAutosaveConfig: Required<DeckAutosaveConfig> = {
  draftDebounceMs: 800,
  versionIntervalMs: 300_000,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: false,
};
```

Interprétation :

- un draft est sauvegardé très souvent ;
- une version autosave complète est créée moins souvent ;
- une version manuelle est créée explicitement ;
- une version de sécurité est créée avant suppression, restauration ou changement de layout.

### 19.5. Adapter de persistance

```ts
export interface DeckPersistenceAdapter {
  loadCurrent(request: LoadCurrentDeckRequest): Promise<DeckPersistedState | null>;

  saveCurrent(request: SaveCurrentDeckRequest): Promise<DeckPersistenceResult>;

  saveDraft(request: SaveDraftRequest): Promise<DeckPersistenceResult>;

  loadDraft(request: LoadDraftRequest): Promise<DeckDraftSnapshot | null>;

  clearDraft(request: ClearDraftRequest): Promise<DeckPersistenceResult>;

  createVersion(request: CreateDeckVersionRequest): Promise<DeckPersistenceResult>;

  listVersions(request: ListDeckVersionsRequest): Promise<readonly DeckVersionSummary[]>;

  loadVersion(request: LoadDeckVersionRequest): Promise<DeckVersionSnapshot | null>;

  deleteVersion(request: DeleteDeckVersionRequest): Promise<DeckPersistenceResult>;
}
```

### 19.6. Résultat de persistance

```ts
export type DeckPersistenceResult =
  | {
      readonly status: "success";
    }
  | {
      readonly status: "failed";
      readonly diagnostics: readonly DeckDiagnostic[];
    };
```

### 19.7. Version snapshot

```ts
export type DeckVersionReason =
  | "manual"
  | "autosave"
  | "before-layout-change"
  | "before-slide-delete"
  | "before-version-restore"
  | "crash-recovery"
  | "import"
  | "external-save";

export type DeckVersionSnapshot = {
  readonly id: string;
  readonly deckId: string;
  readonly namespace: string;
  readonly schemaVersion: 1;
  readonly createdAtIso: string;
  readonly label?: string;
  readonly reason: DeckVersionReason;
  readonly source: DeckSource;
  readonly sourceHash: string;
  readonly selectedSlideId?: string;
  readonly compilerStatus: "valid" | "degraded" | "invalid";
  readonly diagnosticsSummary: readonly DeckDiagnosticSummary[];
};

export type DeckDiagnosticSummary = {
  readonly code: DiagnosticCode;
  readonly severity: DiagnosticSeverity;
  readonly count: number;
};
```

### 19.8. Draft snapshot

```ts
export type DeckDraftSnapshot = {
  readonly deckId: string;
  readonly namespace: string;
  readonly schemaVersion: 1;
  readonly updatedAtIso: string;
  readonly sessionId: string;
  readonly source: DeckSource;
  readonly sourceHash: string;
  readonly selectedSlideId?: string;
  readonly compilerStatus: "valid" | "degraded" | "invalid";
};
```

---

## 20. Clés `localStorage`

### 20.1. Format

```txt
{namespace}:v1:{deckId}:current
{namespace}:v1:{deckId}:draft
{namespace}:v1:{deckId}:versions:index
{namespace}:v1:{deckId}:versions:{versionId}
```

Exemple :

```txt
deck-runtime:v1:risk-training:current
deck-runtime:v1:risk-training:draft
deck-runtime:v1:risk-training:versions:index
deck-runtime:v1:risk-training:versions:2026-05-02T14-22-10-123Z_a8f91c
```

### 20.2. Index de versions

```ts
export type DeckVersionIndex = {
  readonly deckId: string;
  readonly namespace: string;
  readonly schemaVersion: 1;
  readonly updatedAtIso: string;
  readonly versions: readonly DeckVersionIndexEntry[];
};

export type DeckVersionIndexEntry = {
  readonly id: string;
  readonly createdAtIso: string;
  readonly label?: string;
  readonly reason: DeckVersionReason;
  readonly sourceHash: string;
  readonly compilerStatus: "valid" | "degraded" | "invalid";
  readonly sizeBytes: number;
};
```

### 20.3. Nettoyage

Quand une nouvelle version est créée :

1. ajouter la version ;
2. mettre à jour l’index ;
3. vérifier `maxVersionsPerDeck` ;
4. vérifier `maxAutosaveVersionsPerDeck` ;
5. vérifier `maxBytesPerDeck` ;
6. supprimer d’abord les anciennes autosaves ;
7. conserver les versions manuelles autant que possible ;
8. remonter un warning si le quota empêche la sauvegarde.

---

## 21. Recovery après crash

### 21.1. Détection

Au montage de `DeckStudio`, si `recoverOnMount` est activé :

1. charger `current` ;
2. charger `draft` ;
3. charger l’index des versions ;
4. comparer les hashes ;
5. comparer les dates ;
6. déterminer s’il existe un état plus récent que l’état courant.

Le recovery est proposé si :

```txt
draft existe
AND draft.sourceHash != current.sourceHash
AND draft.updatedAtIso > current.updatedAtIso
```

ou si :

```txt
plusieurs versions récentes existent après la dernière version manuelle
```

### 21.2. Dialog de récupération

`CrashRecoveryDialog` affiche :

- le draft le plus récent ;
- la dernière version courante ;
- les dernières versions autosave ;
- les dernières versions manuelles ;
- le statut de compilation de chaque version ;
- le nombre d’erreurs/warnings ;
- les actions disponibles.

Actions :

```txt
Restaurer cette version
Ouvrir en lecture seule
Comparer avec la version actuelle
Créer une copie depuis cette version
Ignorer
Supprimer le draft
```

### 21.3. Type `DeckRecoveryCandidate`

```ts
export type DeckRecoveryCandidate = {
  readonly kind: "draft" | "version" | "current";
  readonly id: string;
  readonly label: string;
  readonly updatedAtIso: string;
  readonly sourceHash: string;
  readonly compilerStatus: "valid" | "degraded" | "invalid";
  readonly diagnosticsSummary: readonly DeckDiagnosticSummary[];
  readonly load: () => Promise<DeckSource>;
};
```

### 21.4. Restauration

Lorsqu’une version est restaurée :

1. créer une version `before-version-restore` de l’état courant ;
2. remplacer la source courante ;
3. sauvegarder `current` ;
4. vider ou conserver le draft selon action utilisateur ;
5. compiler la version restaurée ;
6. afficher les diagnostics si nécessaire ;
7. déclencher `onRestoreVersion`.

### 21.5. Comparaison

Le système doit prévoir une comparaison textuelle simple :

```txt
version A source YAML
vs
version B source YAML
```

Une comparaison structurelle peut être ajoutée plus tard :

```txt
slides ajoutées
slides supprimées
slides modifiées
slots modifiés
layout changé
```

---

## 22. Version history panel

### 22.1. Rôle

Le panneau historique liste les versions stockées.

Il doit permettre :

- de filtrer par type : manuel, autosave, sécurité, recovery ;
- de restaurer une version ;
- de comparer deux versions ;
- de supprimer une version ;
- de renommer une version manuelle ;
- de créer une version manuelle depuis l’état courant.

### 22.2. View model

```ts
export type VersionHistoryViewModel = {
  readonly versions: readonly VersionHistoryEntryViewModel[];
  readonly currentSourceHash: string;
  readonly draftSourceHash?: string;
  readonly storageWarning?: DeckDiagnostic;
};

export type VersionHistoryEntryViewModel = {
  readonly id: string;
  readonly label: string;
  readonly reason: DeckVersionReason;
  readonly createdAtIso: string;
  readonly isCurrent: boolean;
  readonly isDraft: boolean;
  readonly compilerStatus: "valid" | "degraded" | "invalid";
  readonly errorCount: number;
  readonly warningCount: number;
  readonly sizeBytes: number;
};
```

---

## 23. PDF

### 23.1. Principe

Le PDF doit être produit à partir du même modèle compilé et des mêmes composants React.

Le rendu PDF utilise :

```txt
CompiledDeck
  -> PrintDeck
  -> SlideRenderer target="print"
  -> CSS @media print
  -> window.print()
```

### 23.2. Composant `PrintDeck`

```tsx
export type PrintDeckProps = {
  readonly deck: CompiledDeck;
};

export function PrintDeck({ deck }: PrintDeckProps): React.ReactElement {
  return (
    <div className="deck-print-root">
      {deck.slides.map((slide) => (
        <section
          key={slide.id}
          className="deck-print-page"
          data-slide-id={slide.id}
        >
          <SlideRenderer slide={slide} target="print" />
        </section>
      ))}
    </div>
  );
}
```

### 23.3. CSS print

```css
@media print {
  html,
  body {
    margin: 0;
    padding: 0;
    background: white;
  }

  .deck-screen-root,
  .deck-studio-root {
    display: none;
  }

  .deck-print-root {
    display: block;
  }

  .deck-print-page {
    width: 16in;
    height: 9in;
    break-after: page;
    page-break-after: always;
    overflow: hidden;
  }
}

@page {
  size: 16in 9in;
  margin: 0;
}
```

### 23.4. Adapter

```ts
export interface PdfExportAdapter {
  exportDeck(
    request: PdfExportRequest,
    context: PdfExportContext,
  ): Promise<PdfExportResult>;
}

export type PdfExportRequest = {
  readonly deck: CompiledDeck;
  readonly filename?: string;
  readonly mode: "browser-print" | "client-raster";
};

export type PdfExportResult =
  | { readonly status: "opened-print-dialog" }
  | { readonly status: "downloaded" }
  | { readonly status: "blob"; readonly blob: Blob }
  | { readonly status: "failed"; readonly diagnostics: readonly DeckDiagnostic[] };
```

La première version doit implémenter `browser-print`.

### 23.5. Export PDF direct client-side

La librairie expose aussi une surface plus simple pour les applications React :

```tsx
<DeckPdfDownloadButton deck={deck}>
  Télécharger PDF
</DeckPdfDownloadButton>
```

Pour les interfaces custom :

```tsx
const { exportHostRef, exportPdf, exporting } = useDeckPdfExport({ deck });

return (
  <>
    <button type="button" onClick={() => void exportPdf()} disabled={exporting}>
      PDF
    </button>
    <DeckPdfExportHost ref={exportHostRef} deck={deck} />
  </>
);
```

La fonction bas niveau `downloadDeckPdfFromElement` prend un élément DOM contenant les `.deck-print-page` et télécharge directement un PDF. Le rendu client-side repose sur `PrintDeck`, `html2canvas` et `jspdf`.

---

## 24. Thèmes

### 24.1. Objectif

Un thème doit être :

- centralisé ;
- typé ;
- applicable au rendu screen, thumbnail et print ;
- extensible ;
- configurable par deck ;
- cohérent avec les layouts.

### 24.2. Modèle

```ts
export type ThemeDefinition = {
  readonly id: string;
  readonly displayName: string;
  readonly cssClassName: string;
  readonly tokens: ThemeTokens;
};

export type ThemeTokens = {
  readonly color: {
    readonly background: string;
    readonly foreground: string;
    readonly primary: string;
    readonly muted: string;
    readonly danger: string;
    readonly warning: string;
  };
  readonly font: {
    readonly heading: string;
    readonly body: string;
    readonly mono: string;
  };
  readonly spacing: {
    readonly slidePadding: string;
    readonly gap: string;
  };
  readonly radius: {
    readonly small: string;
    readonly medium: string;
    readonly large: string;
  };
};
```

### 24.3. CSS variables

```css
.deck-theme-fintech-light .deck-slide-frame {
  --deck-color-background: #ffffff;
  --deck-color-foreground: #101828;
  --deck-color-primary: #155eef;
  --deck-color-muted: #667085;
  --deck-color-danger: #d92d20;
  --deck-color-warning: #dc6803;

  --deck-font-heading: Inter, system-ui, sans-serif;
  --deck-font-body: Inter, system-ui, sans-serif;
  --deck-font-mono: "JetBrains Mono", monospace;

  --deck-slide-padding: 4rem;
  --deck-gap: 2rem;
}
```

Les variables de thème doivent être appliquées au cadre de slide, pas au workspace ni aux contrôles du viewer. Un changement de preset de style ne doit impacter que :

- `DeckViewport` / `SlideRenderer` ;
- `DeckPresentationOverlay` uniquement pour les slides affichées ;
- `PrintDeck` uniquement pour les pages de slides.

Il ne doit pas modifier :

- la top bar ;
- les boutons previous / next / presentation ;
- les panneaux d’édition ;
- les diagnostics ;
- les contrôles de l’application hôte.

### 24.4. Presets fournis

Le runtime par défaut expose au minimum :

```txt
fintech-light       -> standard actuel
qastia-coaching     -> style aligné avec qastia-coaching
editorial-indigo    -> éditorial sobre avec accent indigo
sage-coral          -> clair, végétal, accent corail
midnight-gold       -> sombre premium, accent doré
fintech-dark        -> variante sombre technique
```

---

## 25. Sécurité

### 25.1. Markdown

Règles par défaut :

- HTML brut désactivé ;
- liens filtrés ;
- images résolues via asset resolver ;
- iframes interdites ;
- scripts interdits ;
- plugins Markdown explicitement déclarés.

### 25.2. Mermaid

Configuration par défaut :

```ts
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  theme: "base",
});
```

### 25.3. Assets

Les assets doivent être résolus par un `AssetResolver`.

```ts
export interface AssetResolver {
  resolveImage(request: ResolveImageAssetRequest): Promise<ResolvedImageAsset>;
}

export type ResolveImageAssetRequest = {
  readonly assetId?: string;
  readonly src?: string;
};

export type ResolvedImageAsset = {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
};
```

Règles :

- une image doit avoir un texte alternatif ;
- les URL externes peuvent être désactivées ;
- les protocoles dangereux sont interdits ;
- les blobs temporaires ne sont pas persistés dans le YAML.

---

## 26. Structure de répertoire

Structure recommandée :

```txt
src/
  features/
    deck-runtime/
      README.md
      index.ts
      publicTypes.ts

      domain/
        Deck.ts
        Slide.ts
        Slot.ts
        Layout.ts
        Theme.ts
        Asset.ts
        Transition.ts
        Diagnostic.ts
        Result.ts
        assertNever.ts

      schema/
        rawDeck.schema.ts
        rawSlide.schema.ts
        rawSlot.schema.ts
        rawTheme.schema.ts
        rawAsset.schema.ts
        rawTransition.schema.ts

      compiler/
        compileDeck.ts
        parseYamlDocument.ts
        validateRawDeck.ts
        normalizeDeck.ts
        validateSemantics.ts
        compileSlide.ts
        compileSlot.ts
        compileMarkdown.ts
        resolveAssets.ts
        resolveTheme.ts
        sourceMap/
          SourceMap.ts
          yamlRanges.ts
          markdownRanges.ts

      runtime/
        DeckRuntime.ts
        createDeckRuntime.ts
        defaultDeckRuntime.ts
        registries/
          LayoutRegistry.ts
          RendererRegistry.ts
          ThemeRegistry.ts
          TransitionRegistry.ts

      layouts/
        registry.ts
        LayoutDefinition.ts
        cover/
          CoverLayout.tsx
          coverLayout.definition.ts
          coverLayout.css
        titleBody/
          TitleBodyLayout.tsx
          titleBodyLayout.definition.ts
          titleBodyLayout.css
        twoColumns/
          TwoColumnsLayout.tsx
          twoColumnsLayout.definition.ts
          twoColumnsLayout.css
        imageOnly/
          ImageOnlyLayout.tsx
          imageOnlyLayout.definition.ts
          imageOnlyLayout.css

      renderers/
        registry.ts
        ContentRendererPlugin.ts
        markdown/
          MarkdownRenderer.tsx
          markdownPlugin.ts
        mermaid/
          MermaidBlock.tsx
          mermaidPlugin.ts
          mermaidConfig.ts
          validateMermaid.ts
        code/
          CodeBlock.tsx
          codePlugin.ts
          shikiHighlighter.ts
        image/
          ImageBlock.tsx
          imagePlugin.ts
        fallback/
          UnsupportedRenderer.tsx

      slideshow/
        index.ts
        DeckShow.tsx
        DeckViewport.tsx
        useDeckNavigation.ts
        SlideRenderer.tsx
        DeckNavigationToolbar.tsx
        LayoutRenderer.tsx
        SlotRenderer.tsx
        ContentRenderer.tsx
        navigation/
          DeckController.ts
          deckReducer.ts
          keyboardBindings.ts
          actions.ts
        transitions/
          TransitionRenderer.tsx
          transitionClasses.css

      presentation/
        index.ts
        DeckPresentationOverlay.tsx
        PresentationControls.tsx
        usePresentationFullscreen.ts

      studio/
        index.ts
        DeckStudio.tsx
        DeckStudioProvider.tsx
        DeckStudioLayout.tsx
        state/
          DeckStudioState.ts
          deckStudioReducer.ts
          deckStudioActions.ts
          selectors.ts
        slideRail/
          SlideRail.tsx
          SlideThumbnail.tsx
          AddSlideButton.tsx
          SlideContextMenu.tsx
        workspace/
          SlideEditWorkspace.tsx
          SlideEditHeader.tsx
          LayoutSelector.tsx
          SlideEditForm.tsx
          ActiveSlidePreview.tsx
        fields/
          MarkdownField.tsx
          TextField.tsx
          ImageField.tsx
          SelectField.tsx
          BooleanField.tsx
          RendererField.tsx
        inspector/
          InspectorPanel.tsx
          DiagnosticsPanel.tsx
          VersionHistoryPanel.tsx
          RecoveryPanel.tsx
          DeckMetadataPanel.tsx
        source/
          RawSourceEditor.tsx
          createDeckLintExtension.ts
          diagnosticsToCodeMirror.ts
        recovery/
          CrashRecoveryDialog.tsx
          buildRecoveryCandidates.ts

      workspace/
        index.ts
        IntegratedDeckWorkspace.tsx
        WorkspaceTopBar.tsx
        WorkspaceBody.tsx
        DeckPreviewPane.tsx
        useDeckWorkspaceState.ts

      persistence/
        DeckPersistenceAdapter.ts
        LocalStorageDeckPersistenceAdapter.ts
        versionKeys.ts
        versionCleanup.ts
        sourceHash.ts
        storageSize.ts
        recovery.ts

      pdf/
        PrintDeck.tsx
        PdfExportAdapter.ts
        browserPrintAdapter.ts
        clientRasterAdapter.ts
        print.css

      themes/
        ThemeDefinition.ts
        ThemeRegistry.ts
        defaultTheme.ts
        fintechLightTheme.ts
        fintechDarkTheme.ts
        theme.css

      examples/
        validDeck.yml
        invalidDeck.yml
        mermaidDeck.yml
        recoveryDeck.yml

      tests/
        compiler/
          compileDeck.test.ts
          diagnostics.test.ts
          sourceMap.test.ts
        studio/
          deckStudioReducer.test.ts
          layoutMigration.test.ts
          recovery.test.ts
        persistence/
          localStorageAdapter.test.ts
          versionCleanup.test.ts
        renderers/
          mermaidPlugin.test.ts
        fixtures/
          validDeck.yml
          invalidYaml.yml
          invalidMermaid.yml
```

---

## 27. Règles d’import

```txt
domain      -> aucun React, aucun browser API
schema      -> domain + zod
compiler    -> domain + schema + contracts runtime
runtime     -> domain + registries
layouts     -> React + domain
renderers   -> React + domain
slideshow   -> React + layouts + renderers + domain
presentation -> React + slideshow + domain
studio      -> React + compiler + persistence + slideshow
workspace   -> React + compiler + studio + slideshow + presentation + persistence
persistence -> domain + browser storage adapter
pdf         -> slideshow + domain
themes      -> domain
```

Interdictions :

- `domain` ne doit jamais importer React ;
- `compiler` ne doit jamais importer `DeckStudio` ;
- `layouts` ne doivent pas importer `studio` ;
- `renderers` ne doivent pas importer `studio` ;
- `slideshow` ne doit pas importer `presentation` ;
- `presentation` ne doit pas importer `studio` ;
- `persistence` ne doit pas importer React ;
- l’application consommatrice ne doit pas importer les fichiers internes.

---

## 28. Accessibilité

### 28.1. Éditeur

`DeckStudio` doit :

- permettre la navigation clavier dans le rail ;
- exposer des labels sur les champs ;
- signaler les erreurs aux lecteurs d’écran ;
- permettre d’ouvrir le panneau diagnostics au clavier ;
- ne pas dépendre uniquement de la couleur pour les erreurs ;
- garder le focus après changement de slide ;
- confirmer les suppressions destructrices.

### 28.2. Slideshow

`DeckShow` doit :

- permettre navigation clavier ;
- respecter `prefers-reduced-motion` ;
- désactiver les transitions si nécessaire ;
- rendre les images avec `alt` ;
- conserver un ordre de lecture logique.

---

## 29. Tests

### 29.1. Unitaires

À couvrir avec Vitest :

```txt
parse YAML invalide
schema strict
champs inconnus
slides sans id
ids dupliqués
layout inconnu
slot manquant
slot interdit
migration de layout
slots non assignés
normalisation des defaults
résolution de thème
résolution d’asset
création de version
nettoyage localStorage
recovery après crash
```

### 29.2. Property-based tests

Avec fast-check :

```txt
compileDeck ne throw jamais pour une string quelconque
un diagnostic avec range a toujours start <= end
un deck valid contient au moins une slide
les IDs compilés sont uniques
un deck invalid produit toujours un fallback
la sérialisation YAML est stable sur un deck valide
```

### 29.3. Tests composants

À couvrir :

```txt
sélection de slide dans le rail
édition d’un champ Markdown
changement de layout
création d’un slot manquant
suppression d’une slide
restauration d’une version
ouverture du recovery dialog
passage mode source -> mode structuré
```

### 29.4. Tests visuels

Avec Playwright à terme :

```txt
rendu cover
rendu title-body
rendu two-columns
rendu image-only
miniatures
mode print
fallback debug
recovery dialog
```

---

## 30. Plan d’implémentation

### Phase 1 — Domaine et compilation

Livrables :

```txt
DeckSource
RawDeck schema
parse YAML
Zod validation
CompiledDeck minimal
diagnostics
source ranges basiques
```

Layouts :

```txt
cover
title-body
two-columns
image-only
```

Renderers :

```txt
markdown
image
fallback unsupported
```

### Phase 2 — Slideshow runtime

Livrables :

```txt
DeckShow
SlideRenderer
LayoutRenderer
SlotRenderer
ContentRenderer
navigation clavier
transitions CSS simples
thèmes CSS variables
```

### Phase 3 — DeckStudio minimal

Livrables :

```txt
DeckStudio
SlideRail
SlideThumbnail
SlideEditWorkspace
SlideEditForm dynamique
LayoutSelector
ActiveSlidePreview
```

Objectif : éditer un deck valide sans mode source avancé.

### Phase 4 — Diagnostics et mode source

Livrables :

```txt
RawSourceEditor
CodeMirror
diagnostics dans l’éditeur
ProblemsPanel
DebugDeckFallback
hover sur erreur
```

### Phase 5 — Persistance locale

Livrables :

```txt
LocalStorageDeckPersistenceAdapter
save current
save draft
create version
list versions
restore version
cleanup
CrashRecoveryDialog
RecoveryPanel
```

### Phase 6 — Mermaid et code

Livrables :

```txt
fences mermaid
CompiledMermaidNode
MermaidBlock
securityLevel strict
fallback Mermaid
code blocks
Shiki lazy loading
```

### Phase 7 — PDF

Livrables :

```txt
PrintDeck
target print
CSS @media print
browserPrintAdapter
callback onPdfExportRequest
```

### Phase 8 — Durcissement

Livrables :

```txt
tests property-based
tests visuels
accessibilité
mesure overflow
optimisation thumbnails
migration schema v1 -> v2
```

---

## 31. Exemple d’intégration simple

```tsx
import {
  DeckStudio,
  defaultDeckRuntime,
  type DeckSource,
} from "@/features/deck-runtime";

const initialSource: DeckSource = {
  uri: "local://risk-training.yml",
  content: `
version: 1
kind: deck
metadata:
  title: "Formation risque"
theme:
  id: "fintech-light"
slides:
  - id: cover
    layout: cover
    slots:
      title:
        markdown: |
          # Formation risque
`,
};

export function TrainingDeckEditorPage(): React.ReactElement {
  return (
    <DeckStudio
      mode="uncontrolled"
      deckId="risk-training"
      initialValue={initialSource}
      runtime={defaultDeckRuntime}
      storage={{
        namespace: "training-platform",
        maxVersionsPerDeck: 50,
        recoverOnMount: true,
      }}
      autosave={{
        draftDebounceMs: 800,
        versionIntervalMs: 300_000,
      }}
      layout={{
        showInspector: true,
        showActiveSlidePreview: true,
        showSourceModeToggle: true,
      }}
    />
  );
}
```

---

## 32. Exemple d’intégration contrôlée

```tsx
import { useState } from "react";
import {
  DeckStudio,
  defaultDeckRuntime,
  type DeckSource,
  type DeckSourceChangeEvent,
} from "@/features/deck-runtime";

export function ControlledDeckEditor({
  initialSource,
}: {
  readonly initialSource: DeckSource;
}): React.ReactElement {
  const [source, setSource] = useState<DeckSource>(initialSource);

  function handleChange(
    nextSource: DeckSource,
    event: DeckSourceChangeEvent,
  ): void {
    setSource(nextSource);

    if (event.reason === "layout-change") {
      console.info("Layout changé", event.selectedSlideId);
    }
  }

  return (
    <DeckStudio
      mode="controlled"
      deckId="controlled-risk-training"
      value={source}
      onChange={handleChange}
      runtime={defaultDeckRuntime}
      storage={false}
    />
  );
}
```

---

## 33. Décisions importantes

### 33.1. Le modèle compilé est immutable

Tous les modèles exposés doivent utiliser `readonly`.

Les modifications passent par des actions ou des patchs.

### 33.2. Pas de `any`

Le projet doit rester compatible avec une configuration TypeScript stricte.

Utiliser :

```ts
unknown
```

à la place de :

```ts
any
```

puis raffiner avec Zod, guards ou discriminated unions.

### 33.3. Pas de mutations silencieuses

Chaque action structurante doit avoir une raison explicite :

```ts
"slide-field-edit"
"layout-change"
"version-restore"
"crash-recovery"
```

Cela facilite :

- logs ;
- analytics ;
- debugging ;
- versioning ;
- undo/redo futur.

### 33.4. Les versions protègent les opérations destructrices

Avant chaque opération destructrice :

```txt
supprimer slide
changer layout
restaurer version
éditer source brut invalide
```

le système crée une version de sécurité si la persistance est active.

---

## 34. Limitations assumées en v1

- Pas de backend obligatoire.
- Pas de collaboration temps réel.
- Pas de stockage de gros assets en `localStorage`.
- Pas de génération PDF programmatique parfaite côté client.
- Pas de drag and drop obligatoire en première version.
- Pas de moteur de templates complexe.
- Pas de mode presenter avancé en première version.

---

## 35. Extensions futures

### 35.1. Undo/redo

Ajouter un historique en mémoire :

```ts
export type DeckUndoRedoState = {
  readonly past: readonly EditableDeckDraft[];
  readonly present: EditableDeckDraft;
  readonly future: readonly EditableDeckDraft[];
};
```

### 35.2. IndexedDB

Pour les decks volumineux ou assets locaux :

```txt
DeckPersistenceAdapter
  -> IndexedDbDeckPersistenceAdapter
```

### 35.3. Backend

Pour synchroniser avec un serveur :

```txt
DeckPersistenceAdapter
  -> HttpDeckPersistenceAdapter
```

### 35.4. Collaboration

À terme :

```txt
CRDT ou OT
presence users
version server-side
conflict resolution
```

### 35.5. Renderers avancés

Plugins possibles :

```txt
Excalidraw
PlantUML via service externe ou worker
Graphviz
Quiz
Poll
Video
Iframe allowlistée
Composant React custom
```

---

## 36. Conclusion

La bonne architecture n’est pas un framework de slides utilisé comme boîte noire.

La bonne architecture est un moteur de deck orienté domaine :

```txt
YAML strict
  -> compiler
  -> diagnostics
  -> modèle compilé
  -> rendu React
  -> éditeur structuré
  -> versions locales
  -> recovery
  -> print/PDF
```

`DeckStudio` devient la brique produit principale : un composant React intégrable, configurable et robuste, capable d’éditer des slides de manière structurée tout en gardant un mode source/debug pour les cas complexes.

Cette approche demande plus d’effort initial qu’un outil comme Reveal.js, mais elle donne un meilleur contrôle sur :

- la validation ;
- l’UX d’édition ;
- l’évolutivité ;
- la maintenance ;
- l’export ;
- les diagnostics ;
- la récupération après crash ;
- l’intégration dans une application front existante.
