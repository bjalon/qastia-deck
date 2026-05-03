import type { DeckSource } from "../../../src";

export const sampleDeckSource: DeckSource = {
  uri: "local://integrated-example.yml",
  content: `
version: 1
kind: deck
metadata:
  title: "Parcours leadership"
  description: "Exemple intégré dans une application métier"
  author: "Qastia"
  locale: "fr-FR"
theme:
  id: fintech-light
defaults:
  aspectRatio: "16:9"
  transition:
    in: fade
    out: fade
    durationMs: 180
  slots:
    eyebrow:
      markdown: |
        Atelier CODIR
    footer:
      markdown: |
        Sophie Jalon Conseil
slides:
  - id: ouverture
    layout: cover
    slots:
      title:
        markdown: |
          Aligner les décisions
      subtitle:
        markdown: |
          Un support éditable directement dans l’espace client.
  - id: cadrage
    layout: title-body
    slots:
      title:
        markdown: |
          Objectifs de la séquence
      body:
        markdown: |
          - Clarifier les arbitrages attendus
          - Partager les signaux faibles
          - Formaliser les prochaines décisions
          - Conserver une trace exploitable après l’atelier
  - id: comparaison
    layout: two-columns
    slots:
      title:
        markdown: |
          Avant / après
      left:
        markdown: |
          ### Avant

          - Slides figées
          - Retours dispersés
          - Versions difficiles à suivre
      right:
        markdown: |
          ### Avec Deck Runtime

          - Contenu structuré
          - Prévisualisation immédiate
          - Sauvegarde locale des versions
      footer:
        markdown: |
          Sophie Jalon Conseil - Synthèse comparative
`,
};
