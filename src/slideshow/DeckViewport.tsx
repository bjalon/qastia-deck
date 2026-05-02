import type { CompiledDeck, LayoutRendererTarget } from "../publicTypes";
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

  return activeSlide ? <SlideRenderer slide={activeSlide} target={target} /> : null;
}
