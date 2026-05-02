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
    displayName: "Default",
    cssClassName: "deck-theme-default",
    tokens: baseTokens,
  },
  {
    id: "fintech-light",
    displayName: "Fintech light",
    cssClassName: "deck-theme-fintech-light",
    tokens: baseTokens,
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
