import type { CompiledDeck } from "../publicTypes";
import { deckThemeStyle } from "../runtime/themeStyle";
import { SlideRenderer } from "../slideshow/SlideRenderer";

export type PrintDeckProps = {
  readonly deck: CompiledDeck;
};

export function PrintDeck({ deck }: PrintDeckProps): React.ReactElement {
  return (
    <div className={`deck-print-root ${deck.theme.cssClassName}`}>
      {deck.slides.map((slide) => (
        <section
          key={slide.id}
          className={`deck-print-page ${deck.theme.cssClassName}`}
          data-slide-id={slide.id}
          style={deckThemeStyle(deck.theme)}
        >
          <SlideRenderer slide={slide} target="print" renderers={deck.renderers} />
        </section>
      ))}
    </div>
  );
}
