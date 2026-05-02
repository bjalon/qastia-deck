import type React from "react";
import type { CompiledTheme } from "../publicTypes";

export function deckThemeStyle(theme: CompiledTheme): React.CSSProperties {
  return {
    "--deck-color-background": theme.tokens.color.background,
    "--deck-color-foreground": theme.tokens.color.foreground,
    "--deck-color-primary": theme.tokens.color.primary,
    "--deck-color-muted": theme.tokens.color.muted,
    "--deck-color-danger": theme.tokens.color.danger,
    "--deck-color-warning": theme.tokens.color.warning,
    "--deck-font-heading": theme.tokens.font.heading,
    "--deck-font-body": theme.tokens.font.body,
    "--deck-font-mono": theme.tokens.font.mono,
    "--deck-slide-padding": theme.tokens.spacing.slidePadding,
    "--deck-gap": theme.tokens.spacing.gap,
  } as React.CSSProperties;
}
