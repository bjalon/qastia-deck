import { ContentRenderer } from "../renderers/ContentRenderer";
import type { CompiledContent, LayoutRendererProps } from "../publicTypes";

type TitleSlotProps = {
  readonly slide: LayoutRendererProps["slide"];
  readonly renderers: LayoutRendererProps["renderers"];
  readonly name?: string;
  readonly className?: string;
  readonly variant?: "cover" | "section";
};

export function TitleSlot({
  slide,
  renderers,
  name = "title",
  className,
  variant = "section",
}: TitleSlotProps): React.ReactElement | null {
  const slot = slide.slots.get(name);
  if (!slot) {
    return null;
  }

  const titleSize = titleSizeFromLength(readableText(slot.content).length);

  return (
    <div
      className={["deck-title-slot", className].filter(Boolean).join(" ")}
      data-slot={name}
      data-title-variant={variant}
      data-title-size={titleSize}
    >
      <ContentRenderer content={slot.content} renderers={renderers} />
    </div>
  );
}

function titleSizeFromLength(length: number): "short" | "medium" | "long" | "xlong" {
  if (length > 72) {
    return "xlong";
  }
  if (length > 48) {
    return "long";
  }
  if (length > 30) {
    return "medium";
  }
  return "short";
}

function readableText(content: CompiledContent): string {
  if (content.kind !== "markdown") {
    return "";
  }

  return content.markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`~[\]()>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
