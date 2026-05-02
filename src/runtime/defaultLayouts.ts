import type { LayoutDefinition } from "../publicTypes";
import { CoverLayout } from "../layouts/CoverLayout";
import { ImageOnlyLayout } from "../layouts/ImageOnlyLayout";
import { TitleBodyLayout } from "../layouts/TitleBodyLayout";
import { TwoColumnsLayout } from "../layouts/TwoColumnsLayout";

export const defaultLayouts: readonly LayoutDefinition[] = [
  {
    name: "cover",
    displayName: "Centered title",
    description: "Opening slide with title and optional subtitle.",
    category: "cover",
    requiredSlots: ["title"],
    optionalSlots: ["subtitle", "eyebrow", "footer"],
    forbiddenSlots: ["body", "left", "right", "image"],
    editor: {
      fieldGroups: [
        {
          id: "content",
          label: "Content",
          fields: [
            { kind: "markdown", slotName: "eyebrow", label: "Eyebrow", minRows: 1, blockKind: "plain" },
            { kind: "markdown", slotName: "title", label: "Title", required: true, minRows: 1, blockKind: "heading" },
            { kind: "markdown", slotName: "subtitle", label: "Subtitle", minRows: 1, blockKind: "plain" },
            { kind: "markdown", slotName: "footer", label: "Footer", minRows: 1, blockKind: "plain" },
          ],
        },
      ],
    },
    component: CoverLayout,
  },
  {
    name: "title-body",
    displayName: "Title and body",
    description: "Slide with title and rich body content.",
    category: "text",
    requiredSlots: ["title", "body"],
    optionalSlots: ["footer"],
    forbiddenSlots: ["left", "right", "image"],
    editor: {
      fieldGroups: [
        {
          id: "content",
          label: "Content",
          fields: [
            { kind: "markdown", slotName: "title", label: "Title", required: true, minRows: 1, blockKind: "heading" },
            { kind: "markdown", slotName: "body", label: "Body", required: true, minRows: 10 },
            { kind: "markdown", slotName: "footer", label: "Footer", minRows: 1, blockKind: "plain" },
          ],
        },
      ],
    },
    component: TitleBodyLayout,
  },
  {
    name: "two-columns",
    displayName: "Two columns",
    description: "Slide with a title and two balanced text columns.",
    category: "comparison",
    requiredSlots: ["title", "left", "right"],
    optionalSlots: ["footer"],
    forbiddenSlots: ["body", "image"],
    editor: {
      fieldGroups: [
        {
          id: "content",
          label: "Content",
          fields: [
            { kind: "markdown", slotName: "title", label: "Title", required: true, minRows: 1, blockKind: "heading" },
            { kind: "markdown", slotName: "left", label: "Left column", required: true, minRows: 8 },
            { kind: "markdown", slotName: "right", label: "Right column", required: true, minRows: 8 },
            { kind: "markdown", slotName: "footer", label: "Footer", minRows: 1, blockKind: "plain" },
          ],
        },
      ],
    },
    component: TwoColumnsLayout,
  },
  {
    name: "image-only",
    displayName: "Image",
    description: "Full slide image with optional caption.",
    category: "visual",
    requiredSlots: ["image"],
    optionalSlots: ["caption"],
    forbiddenSlots: ["title", "body", "left", "right"],
    editor: {
      fieldGroups: [
        {
          id: "content",
          label: "Content",
          fields: [
            { kind: "image", slotName: "image", label: "Image", required: true },
            { kind: "markdown", slotName: "caption", label: "Caption", minRows: 2 },
          ],
        },
      ],
    },
    component: ImageOnlyLayout,
  },
];
