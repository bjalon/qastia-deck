import type { CompiledDeck } from "../publicTypes";
import { SlideRenderer } from "../slideshow/SlideRenderer";

export type PrintDeckProps = {
  readonly deck: CompiledDeck;
};

export function PrintDeck({ deck }: PrintDeckProps): React.ReactElement {
  return (
    <div className={`deck-print-root ${deck.theme.cssClassName}`}>
      {deck.slides.map((slide) => (
        <section key={slide.id} className="deck-print-page" data-slide-id={slide.id}>
          <SlideRenderer slide={slide} target="print" />
        </section>
      ))}
    </div>
  );
}
