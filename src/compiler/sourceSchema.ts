import { z } from "zod";

const transitionSchema = z
  .object({
    in: z.string().default("none"),
    out: z.string().default("none"),
    durationMs: z.number().int().nonnegative().default(0),
  })
  .strict();

const markdownSlotSchema = z
  .object({
    markdown: z.string(),
  })
  .strict();

const imageSlotSchema = z
  .object({
    image: z
      .object({
        assetId: z.string().optional(),
        src: z.string().optional(),
        alt: z.string().optional(),
      })
      .strict(),
  })
  .strict();

const rendererSlotSchema = z
  .object({
    renderer: z
      .object({
        kind: z.string(),
        props: z.record(z.unknown()).default({}),
      })
      .strict(),
  })
  .strict();

export const rawSlotSchema = z.union([markdownSlotSchema, imageSlotSchema, rendererSlotSchema]);

export const rawDeckSchema = z
  .object({
    version: z.literal(1),
    kind: z.literal("deck"),
    metadata: z
      .object({
        title: z.string().min(1),
        description: z.string().optional(),
        author: z.string().optional(),
        locale: z.string().optional(),
      })
      .strict(),
    theme: z
      .object({
        id: z.string().default("default"),
      })
      .strict()
      .default({ id: "default" }),
    defaults: z
      .object({
        aspectRatio: z.union([z.literal("16:9"), z.literal("4:3")]).default("16:9"),
        transition: transitionSchema.default({ in: "none", out: "none", durationMs: 0 }),
      })
      .strict()
      .default({ aspectRatio: "16:9", transition: { in: "none", out: "none", durationMs: 0 } }),
    assets: z
      .record(
        z
          .object({
            type: z.literal("image"),
            src: z.string().min(1),
            alt: z.string().min(1),
          })
          .strict(),
      )
      .default({}),
    slides: z
      .array(
        z
          .object({
            id: z.string().min(1),
            layout: z.string().min(1),
            slots: z.record(rawSlotSchema).default({}),
            transition: transitionSchema.optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export type RawDeck = z.infer<typeof rawDeckSchema>;
export type RawSlot = z.infer<typeof rawSlotSchema>;
