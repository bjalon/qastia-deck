import type {
  DeckSource,
  DeckSourceChangeReason,
  LayoutEditorField,
  SlotName,
} from "../../publicTypes";
import {
  getSlotImage,
  getSlotMarkdown,
  hasSlideSlot,
  removeSlideSlot,
  updateImageSlot,
  updateMarkdownSlot,
} from "../editableSource";

type SlideFormEditorProps = {
  readonly source: DeckSource;
  readonly slideId: string;
  readonly fields: readonly LayoutEditorField[];
  readonly inheritedMarkdownSlots?: ReadonlyMap<SlotName, string>;
  readonly readOnly: boolean;
  readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
};

export function SlideFormEditor({
  fields,
  inheritedMarkdownSlots,
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
          inheritedMarkdownSlots={inheritedMarkdownSlots}
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
  inheritedMarkdownSlots,
  readOnly,
  onUpdate,
}: {
  readonly source: DeckSource;
  readonly slideId: string;
  readonly field: LayoutEditorField;
  readonly inheritedMarkdownSlots?: ReadonlyMap<SlotName, string>;
  readonly readOnly: boolean;
  readonly onUpdate: (nextSource: DeckSource, reason: DeckSourceChangeReason) => void;
}): React.ReactElement | null {
  if (field.kind === "markdown") {
    const isHeadingField = field.blockKind === "heading" || field.slotName === "title";
    const inheritedMarkdown = isInheritableSlotName(field.slotName)
      ? inheritedMarkdownSlots?.get(field.slotName)
      : undefined;
    const hasInheritedValue = inheritedMarkdown !== undefined;
    const hasLocalOverride = hasInheritedValue && hasSlideSlot(source, slideId, field.slotName);
    const markdown = hasInheritedValue && !hasLocalOverride
      ? inheritedMarkdown
      : getSlotMarkdown(source, slideId, field.slotName);
    const isSingleLineField = isHeadingField || isSingleLineMarkdownField(field);
    const value = isSingleLineField
      ? singleLineMarkdownValue(markdown, isHeadingField)
      : markdown;
    const fieldReadOnly = readOnly || (hasInheritedValue && !hasLocalOverride);
    const control = isSingleLineField ? (
      <input
        aria-label={field.label}
        className="deck-form-input"
        placeholder=" "
        value={value}
        onChange={(event) =>
          onUpdate(
            updateMarkdownSlot(source, slideId, field.slotName, event.currentTarget.value),
            "slide-field-edit",
          )
        }
        readOnly={fieldReadOnly}
      />
    ) : (
      <textarea
        aria-label={field.label}
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
        readOnly={fieldReadOnly}
      />
    );

    return (
      <div
        className="deck-form-field"
        data-inherited={hasInheritedValue && !hasLocalOverride ? "true" : undefined}
      >
        <span>{field.label}</span>
        <div className="deck-form-field__control">
          {control}
          {hasInheritedValue ? (
            <label className="deck-inherited-slot-toggle" title="Override global">
              <input
                aria-label={`Override ${field.label} global`}
                title={`Override ${field.label} global`}
                type="checkbox"
                checked={hasLocalOverride}
                onChange={(event) =>
                  onUpdate(
                    event.currentTarget.checked
                      ? updateMarkdownSlot(source, slideId, field.slotName, inheritedMarkdown)
                      : removeSlideSlot(source, slideId, field.slotName),
                    "slide-field-edit",
                  )
                }
                disabled={readOnly}
              />
            </label>
          ) : null}
        </div>
      </div>
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

function isInheritableSlotName(slotName: SlotName): boolean {
  return slotName === "eyebrow" || slotName === "footer";
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
