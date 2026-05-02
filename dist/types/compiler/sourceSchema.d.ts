import { z } from "zod";
export declare const rawSlotSchema: z.ZodUnion<[z.ZodObject<{
    markdown: z.ZodString;
}, "strict", z.ZodTypeAny, {
    markdown: string;
}, {
    markdown: string;
}>, z.ZodObject<{
    image: z.ZodObject<{
        assetId: z.ZodOptional<z.ZodString>;
        src: z.ZodOptional<z.ZodString>;
        alt: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        assetId?: string | undefined;
        src?: string | undefined;
        alt?: string | undefined;
    }, {
        assetId?: string | undefined;
        src?: string | undefined;
        alt?: string | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    image: {
        assetId?: string | undefined;
        src?: string | undefined;
        alt?: string | undefined;
    };
}, {
    image: {
        assetId?: string | undefined;
        src?: string | undefined;
        alt?: string | undefined;
    };
}>, z.ZodObject<{
    renderer: z.ZodObject<{
        kind: z.ZodString;
        props: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        kind: string;
        props: Record<string, unknown>;
    }, {
        kind: string;
        props?: Record<string, unknown> | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    renderer: {
        kind: string;
        props: Record<string, unknown>;
    };
}, {
    renderer: {
        kind: string;
        props?: Record<string, unknown> | undefined;
    };
}>]>;
export declare const rawDeckSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"deck">;
    metadata: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        locale: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        title: string;
        description?: string | undefined;
        author?: string | undefined;
        locale?: string | undefined;
    }, {
        title: string;
        description?: string | undefined;
        author?: string | undefined;
        locale?: string | undefined;
    }>;
    theme: z.ZodDefault<z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        id: string;
    }, {
        id?: string | undefined;
    }>>;
    defaults: z.ZodDefault<z.ZodObject<{
        aspectRatio: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"16:9">, z.ZodLiteral<"4:3">]>>;
        transition: z.ZodDefault<z.ZodObject<{
            in: z.ZodDefault<z.ZodString>;
            out: z.ZodDefault<z.ZodString>;
            durationMs: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            in: string;
            out: string;
            durationMs: number;
        }, {
            in?: string | undefined;
            out?: string | undefined;
            durationMs?: number | undefined;
        }>>;
        slots: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodObject<{
            markdown: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            markdown: string;
        }, {
            markdown: string;
        }>, z.ZodObject<{
            image: z.ZodObject<{
                assetId: z.ZodOptional<z.ZodString>;
                src: z.ZodOptional<z.ZodString>;
                alt: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            }, {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            }>;
        }, "strict", z.ZodTypeAny, {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        }, {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        }>, z.ZodObject<{
            renderer: z.ZodObject<{
                kind: z.ZodString;
                props: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strict", z.ZodTypeAny, {
                kind: string;
                props: Record<string, unknown>;
            }, {
                kind: string;
                props?: Record<string, unknown> | undefined;
            }>;
        }, "strict", z.ZodTypeAny, {
            renderer: {
                kind: string;
                props: Record<string, unknown>;
            };
        }, {
            renderer: {
                kind: string;
                props?: Record<string, unknown> | undefined;
            };
        }>]>>>;
    }, "strict", z.ZodTypeAny, {
        aspectRatio: "16:9" | "4:3";
        transition: {
            in: string;
            out: string;
            durationMs: number;
        };
        slots: Record<string, {
            markdown: string;
        } | {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        } | {
            renderer: {
                kind: string;
                props: Record<string, unknown>;
            };
        }>;
    }, {
        aspectRatio?: "16:9" | "4:3" | undefined;
        transition?: {
            in?: string | undefined;
            out?: string | undefined;
            durationMs?: number | undefined;
        } | undefined;
        slots?: Record<string, {
            markdown: string;
        } | {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        } | {
            renderer: {
                kind: string;
                props?: Record<string, unknown> | undefined;
            };
        }> | undefined;
    }>>;
    assets: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        type: z.ZodLiteral<"image">;
        src: z.ZodString;
        alt: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        type: "image";
        src: string;
        alt: string;
    }, {
        type: "image";
        src: string;
        alt: string;
    }>>>;
    slides: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        layout: z.ZodString;
        slots: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodObject<{
            markdown: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            markdown: string;
        }, {
            markdown: string;
        }>, z.ZodObject<{
            image: z.ZodObject<{
                assetId: z.ZodOptional<z.ZodString>;
                src: z.ZodOptional<z.ZodString>;
                alt: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            }, {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            }>;
        }, "strict", z.ZodTypeAny, {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        }, {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        }>, z.ZodObject<{
            renderer: z.ZodObject<{
                kind: z.ZodString;
                props: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strict", z.ZodTypeAny, {
                kind: string;
                props: Record<string, unknown>;
            }, {
                kind: string;
                props?: Record<string, unknown> | undefined;
            }>;
        }, "strict", z.ZodTypeAny, {
            renderer: {
                kind: string;
                props: Record<string, unknown>;
            };
        }, {
            renderer: {
                kind: string;
                props?: Record<string, unknown> | undefined;
            };
        }>]>>>;
        transition: z.ZodOptional<z.ZodObject<{
            in: z.ZodDefault<z.ZodString>;
            out: z.ZodDefault<z.ZodString>;
            durationMs: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            in: string;
            out: string;
            durationMs: number;
        }, {
            in?: string | undefined;
            out?: string | undefined;
            durationMs?: number | undefined;
        }>>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        slots: Record<string, {
            markdown: string;
        } | {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        } | {
            renderer: {
                kind: string;
                props: Record<string, unknown>;
            };
        }>;
        layout: string;
        transition?: {
            in: string;
            out: string;
            durationMs: number;
        } | undefined;
    }, {
        id: string;
        layout: string;
        transition?: {
            in?: string | undefined;
            out?: string | undefined;
            durationMs?: number | undefined;
        } | undefined;
        slots?: Record<string, {
            markdown: string;
        } | {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        } | {
            renderer: {
                kind: string;
                props?: Record<string, unknown> | undefined;
            };
        }> | undefined;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    kind: "deck";
    version: 1;
    metadata: {
        title: string;
        description?: string | undefined;
        author?: string | undefined;
        locale?: string | undefined;
    };
    theme: {
        id: string;
    };
    defaults: {
        aspectRatio: "16:9" | "4:3";
        transition: {
            in: string;
            out: string;
            durationMs: number;
        };
        slots: Record<string, {
            markdown: string;
        } | {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        } | {
            renderer: {
                kind: string;
                props: Record<string, unknown>;
            };
        }>;
    };
    assets: Record<string, {
        type: "image";
        src: string;
        alt: string;
    }>;
    slides: {
        id: string;
        slots: Record<string, {
            markdown: string;
        } | {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        } | {
            renderer: {
                kind: string;
                props: Record<string, unknown>;
            };
        }>;
        layout: string;
        transition?: {
            in: string;
            out: string;
            durationMs: number;
        } | undefined;
    }[];
}, {
    kind: "deck";
    version: 1;
    metadata: {
        title: string;
        description?: string | undefined;
        author?: string | undefined;
        locale?: string | undefined;
    };
    slides: {
        id: string;
        layout: string;
        transition?: {
            in?: string | undefined;
            out?: string | undefined;
            durationMs?: number | undefined;
        } | undefined;
        slots?: Record<string, {
            markdown: string;
        } | {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        } | {
            renderer: {
                kind: string;
                props?: Record<string, unknown> | undefined;
            };
        }> | undefined;
    }[];
    theme?: {
        id?: string | undefined;
    } | undefined;
    defaults?: {
        aspectRatio?: "16:9" | "4:3" | undefined;
        transition?: {
            in?: string | undefined;
            out?: string | undefined;
            durationMs?: number | undefined;
        } | undefined;
        slots?: Record<string, {
            markdown: string;
        } | {
            image: {
                assetId?: string | undefined;
                src?: string | undefined;
                alt?: string | undefined;
            };
        } | {
            renderer: {
                kind: string;
                props?: Record<string, unknown> | undefined;
            };
        }> | undefined;
    } | undefined;
    assets?: Record<string, {
        type: "image";
        src: string;
        alt: string;
    }> | undefined;
}>;
export type RawDeck = z.infer<typeof rawDeckSchema>;
export type RawSlot = z.infer<typeof rawSlotSchema>;
//# sourceMappingURL=sourceSchema.d.ts.map