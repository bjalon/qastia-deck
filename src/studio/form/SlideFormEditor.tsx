import type {
  DeckSource,
  DeckSourceChangeReason,
  LayoutEditorField,
} from "../../publicTypes";
import {
  getSlotImage,
  getSlotMarkdown,
  updateImageSlot,
  updateMarkdownSlot,
} from "../editableSource";

type SlideFormEditorProps = {
  readonly source: DeckSource;
  readonly slideId: string;
  readonly fields: readonly LayoutEditorField[];
  readonly readOnly: boolean;
  readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
};

export function SlideFormEditor({
  fields,
  onUpdate,
  readOnly,
  slideId,
  source,
}: SlideFormEditorProps): React.ReactElement {
  return (
    <form className="deck-slide-form">
      {fields.map((field) => (
        <EditorField
          key={`${field.kind}-${"slotName" in field ? field.slotName : field.label}`}
          source={source}
          slideId={slideId}
          field={field}
          readOnly={readOnly}
          onUpdate={onUpdate}
        />
      ))}
    </form>
  );
}

function EditorField({
  source,
  slideId,
  field,
  readOnly,
  onUpdate,
}: {
  readonly source: DeckSource;
  readonly slideId: string;
  readonly field: LayoutEditorField;
  readonly readOnly: boolean;
  readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
}): React.ReactElement | null {
  if (field.kind === "markdown") {
    const isHeadingField = field.blockKind === "heading" || field.slotName === "title";
    const markdown = getSlotMarkdown(source, slideId, field.slotName);
    const isSingleLineField = isHeadingField || isSingleLineMarkdownField(field);
    const value = isSingleLineField
      ? singleLineMarkdownValue(markdown, isHeadingField)
      : markdown;

    return (
      <label className="deck-form-field">
        <span>{field.label}</span>
        {isSingleLineField ? (
          <input
            className="deck-form-input"
            placeholder=" "
            value={value}
            onChange={(event) =>
              onUpdate(
                updateMarkdownSlot(source, slideId, field.slotName, event.currentTarget.value),
                "slide-field-edit",
              )
            }
            readOnly={readOnly}
          />
        ) : (
          <textarea
            className="deck-form-textarea"
            placeholder=" "
            rows={field.minRows ?? 4}
            value={value}
            onChange={(event) =>
              onUpdate(
                updateMarkdownSlot(source, slideId, field.slotName, event.currentTarget.value),
                "slide-field-edit",
              )
            }
            readOnly={readOnly}
          />
        )}
      </label>
    );
  }

  if (field.kind === "image") {
    const image = getSlotImage(source, slideId, field.slotName);
    return (
      <fieldset className="deck-form-fieldset">
        <legend>{field.label}</legend>
        <label className="deck-form-field">
          <span>Asset id</span>
          <input
            placeholder=" "
            value={image.assetId}
            onChange={(event) =>
              onUpdate(
                updateImageSlot(source, slideId, field.slotName, {
                  ...image,
                  assetId: event.currentTarget.value,
                }),
                "slide-field-edit",
              )
            }
            readOnly={readOnly}
          />
        </label>
        <label className="deck-form-field">
          <span>Source</span>
          <input
            placeholder=" "
            value={image.src}
            onChange={(event) =>
              onUpdate(
                updateImageSlot(source, slideId, field.slotName, {
                  ...image,
                  src: event.currentTarget.value,
                }),
                "slide-field-edit",
              )
            }
            readOnly={readOnly}
          />
        </label>
        <label className="deck-form-field">
          <span>Alt</span>
          <input
            placeholder=" "
            value={image.alt}
            onChange={(event) =>
              onUpdate(
                updateImageSlot(source, slideId, field.slotName, {
                  ...image,
                  alt: event.currentTarget.value,
                }),
                "slide-field-edit",
              )
            }
            readOnly={readOnly}
          />
        </label>
      </fieldset>
    );
  }

  return null;
}

function isSingleLineMarkdownField(field: LayoutEditorField): boolean {
  if (field.kind !== "markdown") {
    return false;
  }

  return (
    field.minRows === 1 ||
    field.slotName === "eyebrow" ||
    field.slotName === "subtitle" ||
    field.slotName === "footer"
  );
}

function singleLineMarkdownValue(markdown: string, stripHeading: boolean): string {
  const nextMarkdown = stripHeading
    ? markdown.replace(/^(\s*)#{1,6}\s+/u, "$1")
    : markdown;

  return nextMarkdown
    .replace(/\s*\n\s*/gu, " ")
    .trim();
}
