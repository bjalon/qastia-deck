import type { CompiledDeck, LayoutRendererTarget } from "../publicTypes";
import { deckThemeStyle } from "../runtime/themeStyle";
import { SlideRenderer } from "./SlideRenderer";

type DeckViewportProps = {
  readonly deck: CompiledDeck;
  readonly activeIndex: number;
  readonly target?: LayoutRendererTarget;
};

export function DeckViewport({
  activeIndex,
  deck,
  target = "screen",
}: DeckViewportProps): React.ReactElement | null {
  const activeSlide = deck.slides[activeIndex] ?? deck.slides[0];

  return activeSlide ? (
    <div className={`deck-theme-surface ${deck.theme.cssClassName}`} style={deckThemeStyle(deck.theme)}>
      <SlideRenderer slide={activeSlide} target={target} renderers={deck.renderers} />
    </div>
  ) : null;
}
