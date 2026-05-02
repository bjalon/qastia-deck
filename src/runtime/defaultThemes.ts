import type { ThemeDefinition } from "../publicTypes";

const baseTokens = {
  color: {
    background: "#ffffff",
    foreground: "#111827",
    primary: "#155eef",
    muted: "#667085",
    danger: "#d92d20",
    warning: "#dc6803",
  },
  font: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    mono: "JetBrains Mono, ui-monospace, monospace",
  },
  spacing: {
    slidePadding: "4rem",
    gap: "2rem",
  },
  radius: {
    small: "4px",
    medium: "8px",
    large: "12px",
  },
} as const;

export const defaultThemes: readonly ThemeDefinition[] = [
  {
    id: "default",
    displayName: "Standard",
    cssClassName: "deck-theme-default",
    tokens: baseTokens,
  },
  {
    id: "fintech-light",
    displayName: "Standard actuel",
    cssClassName: "deck-theme-fintech-light",
    tokens: baseTokens,
  },
  {
    id: "qastia-coaching",
    displayName: "Qastia coaching",
    cssClassName: "deck-theme-qastia-coaching",
    tokens: {
      ...baseTokens,
      color: {
        background: "#fbf9f6",
        foreground: "#171717",
        primary: "#9c7a4d",
        muted: "#7f7467",
        danger: "#9d4037",
        warning: "#a66f2b",
      },
      font: {
        heading: "Fraunces, Georgia, serif",
        body: "Manrope, Inter, system-ui, sans-serif",
        mono: baseTokens.font.mono,
      },
    },
  },
  {
    id: "editorial-indigo",
    displayName: "Editorial indigo",
    cssClassName: "deck-theme-editorial-indigo",
    tokens: {
      ...baseTokens,
      color: {
        background: "#f7f5ff",
        foreground: "#17122f",
        primary: "#5b45d6",
        muted: "#6f6a86",
        danger: "#b42318",
        warning: "#b54708",
      },
    },
  },
  {
    id: "sage-coral",
    displayName: "Sage coral",
    cssClassName: "deck-theme-sage-coral",
    tokens: {
      ...baseTokens,
      color: {
        background: "#f7fbf8",
        foreground: "#13251d",
        primary: "#d75f45",
        muted: "#5d7468",
        danger: "#b42318",
        warning: "#a15c07",
      },
    },
  },
  {
    id: "midnight-gold",
    displayName: "Midnight gold",
    cssClassName: "deck-theme-midnight-gold",
    tokens: {
      ...baseTokens,
      color: {
        background: "#101624",
        foreground: "#f8f4e9",
        primary: "#d6a84f",
        muted: "#b7c0ce",
        danger: "#ff8a7a",
        warning: "#f4bf64",
      },
    },
  },
  {
    id: "fintech-dark",
    displayName: "Fintech dark",
    cssClassName: "deck-theme-fintech-dark",
    tokens: {
      ...baseTokens,
      color: {
        background: "#0f172a",
        foreground: "#f8fafc",
        primary: "#60a5fa",
        muted: "#cbd5e1",
        danger: "#f87171",
        warning: "#fbbf24",
      },
    },
  },
];
