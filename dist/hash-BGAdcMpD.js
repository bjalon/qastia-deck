import { parseDocument as D } from "yaml";
import { z as n } from "zod";
const b = /```(\w+)?\n([\s\S]*?)```/g, E = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;
function v(t, s) {
  const e = [];
  E.test(t) && e.push({
    code: "MARKDOWN_UNSUPPORTED_HTML",
    severity: "warning",
    message: "Raw HTML is ignored by the default markdown renderer.",
    path: s,
    hint: "Use Markdown syntax or a custom renderer instead."
  });
  const i = [];
  let o = 0;
  for (const r of t.matchAll(b)) {
    const [f, l, g] = r, h = r.index ?? 0, S = t.slice(o, h);
    S.trim().length > 0 && i.push({ kind: "markdown", markdown: S }), (l == null ? void 0 : l.toLowerCase()) === "mermaid" ? i.push({ kind: "mermaid", chart: g.trim() }) : i.push({ kind: "code", language: l, code: g.replace(/\n$/, "") }), o = h + f.length;
  }
  const a = t.slice(o);
  return (a.trim().length > 0 || i.length === 0) && i.push({ kind: "markdown", markdown: a }), { nodes: i, diagnostics: e };
}
function u(t, s, e, i, o, a) {
  return {
    code: t,
    severity: s,
    message: e,
    path: i,
    slideId: o,
    hint: a
  };
}
function q(t) {
  const s = /* @__PURE__ */ new Map();
  for (const e of t) {
    const i = `${e.code}:${e.severity}`, o = s.get(i);
    s.set(i, {
      code: e.code,
      severity: e.severity,
      message: String(o ? Number(o.message) + 1 : 1)
    });
  }
  return Array.from(s.values()).map((e) => ({
    code: e.code,
    severity: e.severity,
    count: Number(e.message)
  }));
}
const L = n.object({
  in: n.string().default("none"),
  out: n.string().default("none"),
  durationMs: n.number().int().nonnegative().default(0)
}).strict(), O = n.object({
  markdown: n.string()
}).strict(), U = n.object({
  image: n.object({
    assetId: n.string().optional(),
    src: n.string().optional(),
    alt: n.string().optional()
  }).strict()
}).strict(), R = n.object({
  renderer: n.object({
    kind: n.string(),
    props: n.record(n.unknown()).default({})
  }).strict()
}).strict(), M = n.union([O, U, R]), j = n.object({
  version: n.literal(1),
  kind: n.literal("deck"),
  metadata: n.object({
    title: n.string().min(1),
    description: n.string().optional(),
    author: n.string().optional(),
    locale: n.string().optional()
  }).strict(),
  theme: n.object({
    id: n.string().default("default")
  }).strict().default({ id: "default" }),
  defaults: n.object({
    aspectRatio: n.union([n.literal("16:9"), n.literal("4:3")]).default("16:9"),
    transition: L.default({ in: "none", out: "none", durationMs: 0 }),
    slots: n.record(M).default({})
  }).strict().default({
    aspectRatio: "16:9",
    transition: { in: "none", out: "none", durationMs: 0 },
    slots: {}
  }),
  assets: n.record(
    n.object({
      type: n.literal("image"),
      src: n.string().min(1),
      alt: n.string().min(1)
    }).strict()
  ).default({}),
  slides: n.array(
    n.object({
      id: n.string().min(1),
      layout: n.string().min(1),
      slots: n.record(M).default({}),
      transition: L.optional()
    }).strict()
  ).min(1)
}).strict();
async function z(t, s) {
  const e = [], i = s.compileMode ?? (s.mode === "editor" ? "authoring" : "strict");
  let o;
  try {
    const c = D(t.content, {
      prettyErrors: !1,
      strict: !0,
      uniqueKeys: !0
    });
    for (const m of c.errors)
      e.push(
        u("YAML_SYNTAX_ERROR", "error", m.message, void 0, void 0)
      );
    for (const m of c.warnings)
      e.push(
        u("YAML_PARSE_WARNING", "warning", m.message, void 0, void 0)
      );
    if (c.errors.length > 0)
      return I(t, e);
    o = c.toJSON();
  } catch (c) {
    return e.push(
      u(
        "YAML_SYNTAX_ERROR",
        "error",
        c instanceof Error ? c.message : "Unable to parse YAML source."
      )
    ), I(t, e);
  }
  const a = j.safeParse(o);
  if (!a.success)
    return e.push(...T(a.error)), I(t, e);
  const r = a.data, f = $(r, s, e);
  if (e.push(...f), f.some(
    (c) => c.code === "SLIDE_UNKNOWN_LAYOUT" || i === "strict" && c.severity === "error"
  ))
    return I(t, e);
  const g = new Map(Object.entries(r.assets)), h = s.runtime.themes.get(r.theme.id) ?? s.runtime.themes.get("default");
  if (!h)
    throw new Error("Deck runtime must provide at least one theme.");
  s.runtime.themes.has(r.theme.id) || e.push(
    u(
      "SCHEMA_INVALID_VALUE",
      "warning",
      `Unknown theme '${r.theme.id}'. Falling back to '${h.id}'.`,
      ["theme", "id"]
    )
  );
  const S = [];
  for (const [c, m] of r.slides.entries()) {
    const k = s.runtime.layouts.get(m.layout);
    if (!k)
      continue;
    const p = /* @__PURE__ */ new Map();
    for (const [d, _] of Object.entries(m.slots)) {
      const w = await N(d, _, g, [
        "slides",
        String(c),
        "slots",
        d
      ]);
      p.set(d, w), e.push(
        ...w.diagnostics.map((y) => ({
          ...y,
          slideId: y.slideId ?? m.id
        }))
      );
    }
    for (const [d, _] of Object.entries(r.defaults.slots)) {
      if (p.has(d) || !Y(k, d))
        continue;
      const w = await N(
        d,
        _,
        g,
        ["defaults", "slots", d],
        "default"
      );
      p.set(d, w), e.push(
        ...w.diagnostics.map((y) => ({
          ...y,
          slideId: y.slideId ?? m.id
        }))
      );
    }
    for (const d of k.requiredSlots)
      !p.has(d) && i === "authoring" && p.set(d, P(d));
    S.push({
      id: m.id,
      index: c,
      layout: {
        name: k.name,
        definition: k
      },
      transition: V(
        m.transition ?? r.defaults.transition,
        s,
        ["slides", String(c), "transition"],
        e
      ),
      slots: p,
      diagnostics: e.filter((d) => d.slideId === m.id)
    });
  }
  const A = {
    version: 1,
    metadata: r.metadata,
    theme: h,
    aspectRatio: r.defaults.aspectRatio,
    assets: g,
    slides: S
  };
  return e.length > 0 ? {
    status: "degraded",
    deck: A,
    diagnostics: e
  } : {
    status: "valid",
    deck: A,
    diagnostics: []
  };
}
function I(t, s) {
  return {
    status: "invalid",
    fallback: {
      source: t,
      title: "Invalid deck source",
      diagnostics: s
    },
    diagnostics: s
  };
}
function T(t) {
  return t.issues.map((s) => {
    const e = s.path.map(String), i = s.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";
    return u(
      i,
      "error",
      s.message,
      e.length > 0 ? e : void 0,
      void 0
    );
  });
}
function $(t, s, e) {
  const i = [], o = /* @__PURE__ */ new Set();
  t.slides.length === 0 && i.push(u("DECK_EMPTY_SLIDES", "error", "Deck must contain at least one slide.", ["slides"]));
  for (const [a, r] of t.slides.entries()) {
    o.has(r.id) && i.push(
      u(
        "SLIDE_DUPLICATE_ID",
        "error",
        `Slide id '${r.id}' is already used.`,
        ["slides", String(a), "id"],
        r.id
      )
    ), o.add(r.id);
    const f = s.runtime.layouts.get(r.layout);
    if (!f) {
      i.push(
        u(
          "SLIDE_UNKNOWN_LAYOUT",
          "error",
          `Unknown layout '${r.layout}'.`,
          ["slides", String(a), "layout"],
          r.id,
          "Register the layout in createDeckRuntime or choose a default layout."
        )
      );
      continue;
    }
    for (const l of f.requiredSlots)
      !(l in r.slots) && !(l in t.defaults.slots) && i.push(
        u(
          "LAYOUT_MISSING_SLOT",
          "error",
          `Layout '${f.name}' requires slot '${l}'.`,
          ["slides", String(a), "slots"],
          r.id
        )
      );
    for (const l of Object.keys(r.slots))
      f.forbiddenSlots.includes(l) && i.push(
        u(
          "LAYOUT_FORBIDDEN_SLOT",
          "warning",
          `Layout '${f.name}' does not render slot '${l}'.`,
          ["slides", String(a), "slots", l],
          r.id
        )
      );
  }
  return e.length > 0, i;
}
async function N(t, s, e, i, o = "source") {
  const a = [], r = await C(s, e, i, a);
  return {
    name: t,
    kind: r.kind === "renderer" ? "renderer" : r.kind,
    content: r,
    origin: o,
    diagnostics: a
  };
}
function Y(t, s) {
  return t.requiredSlots.includes(s) || t.optionalSlots.includes(s);
}
async function C(t, s, e, i) {
  if ("markdown" in t) {
    const o = v(t.markdown, e);
    return i.push(...o.diagnostics), {
      kind: "markdown",
      markdown: t.markdown,
      nodes: o.nodes
    };
  }
  if ("image" in t) {
    t.image.assetId && !s.has(t.image.assetId) && i.push(
      u(
        "ASSET_NOT_FOUND",
        "error",
        `Asset '${t.image.assetId}' was not found.`,
        e
      )
    );
    const o = t.image.assetId ? s.get(t.image.assetId) : void 0;
    return {
      kind: "image",
      assetId: t.image.assetId,
      src: (o == null ? void 0 : o.src) ?? t.image.src,
      alt: (o == null ? void 0 : o.alt) ?? t.image.alt
    };
  }
  return {
    kind: "renderer",
    rendererKind: t.renderer.kind,
    props: t.renderer.props
  };
}
function P(t) {
  return {
    name: t,
    kind: "markdown",
    content: {
      kind: "markdown",
      markdown: "",
      nodes: [{ kind: "markdown", markdown: "" }]
    },
    origin: "synthetic",
    diagnostics: []
  };
}
function V(t, s, e, i) {
  const o = s.runtime.transitions.has(t.in) ? t.in : "none", a = s.runtime.transitions.has(t.out) ? t.out : "none";
  return o !== t.in && i.push(
    u("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${t.in}'.`, [...e, "in"])
  ), a !== t.out && i.push(
    u("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${t.out}'.`, [...e, "out"])
  ), {
    in: o,
    out: a,
    durationMs: t.durationMs
  };
}
function W(t) {
  let s = 2166136261;
  for (let e = 0; e < t.length; e += 1)
    s ^= t.charCodeAt(e), s = Math.imul(s, 16777619);
  return (s >>> 0).toString(16).padStart(8, "0");
}
export {
  v as a,
  z as c,
  W as h,
  q as s
};
