import { parseDocument as M } from "yaml";
import { z as n } from "zod";
const N = /```(\w+)?\n([\s\S]*?)```/g, D = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;
function E(t, i) {
  const e = [];
  D.test(t) && e.push({
    code: "MARKDOWN_UNSUPPORTED_HTML",
    severity: "warning",
    message: "Raw HTML is ignored by the default markdown renderer.",
    path: i,
    hint: "Use Markdown syntax or a custom renderer instead."
  });
  const s = [];
  let r = 0;
  for (const o of t.matchAll(N)) {
    const [l, u, h] = o, g = o.index ?? 0, p = t.slice(r, g);
    p.trim().length > 0 && s.push({ kind: "markdown", markdown: p }), (u == null ? void 0 : u.toLowerCase()) === "mermaid" ? s.push({ kind: "mermaid", chart: h.trim() }) : s.push({ kind: "code", language: u, code: h.replace(/\n$/, "") }), r = g + l.length;
  }
  const a = t.slice(r);
  return (a.trim().length > 0 || s.length === 0) && s.push({ kind: "markdown", markdown: a }), { nodes: s, diagnostics: e };
}
function c(t, i, e, s, r, a) {
  return {
    code: t,
    severity: i,
    message: e,
    path: s,
    slideId: r,
    hint: a
  };
}
function K(t) {
  const i = /* @__PURE__ */ new Map();
  for (const e of t) {
    const s = `${e.code}:${e.severity}`, r = i.get(s);
    i.set(s, {
      code: e.code,
      severity: e.severity,
      message: String(r ? Number(r.message) + 1 : 1)
    });
  }
  return Array.from(i.values()).map((e) => ({
    code: e.code,
    severity: e.severity,
    count: Number(e.message)
  }));
}
const A = n.object({
  in: n.string().default("none"),
  out: n.string().default("none"),
  durationMs: n.number().int().nonnegative().default(0)
}).strict(), b = n.object({
  markdown: n.string()
}).strict(), v = n.object({
  image: n.object({
    assetId: n.string().optional(),
    src: n.string().optional(),
    alt: n.string().optional()
  }).strict()
}).strict(), O = n.object({
  renderer: n.object({
    kind: n.string(),
    props: n.record(n.unknown()).default({})
  }).strict()
}).strict(), U = n.union([b, v, O]), R = n.object({
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
    transition: A.default({ in: "none", out: "none", durationMs: 0 })
  }).strict().default({ aspectRatio: "16:9", transition: { in: "none", out: "none", durationMs: 0 } }),
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
      slots: n.record(U).default({}),
      transition: A.optional()
    }).strict()
  ).min(1)
}).strict();
async function z(t, i) {
  const e = [], s = i.compileMode ?? (i.mode === "editor" ? "authoring" : "strict");
  let r;
  try {
    const d = M(t.content, {
      prettyErrors: !1,
      strict: !0,
      uniqueKeys: !0
    });
    for (const m of d.errors)
      e.push(
        c("YAML_SYNTAX_ERROR", "error", m.message, void 0, void 0)
      );
    for (const m of d.warnings)
      e.push(
        c("YAML_PARSE_WARNING", "warning", m.message, void 0, void 0)
      );
    if (d.errors.length > 0)
      return w(t, e);
    r = d.toJSON();
  } catch (d) {
    return e.push(
      c(
        "YAML_SYNTAX_ERROR",
        "error",
        d instanceof Error ? d.message : "Unable to parse YAML source."
      )
    ), w(t, e);
  }
  const a = R.safeParse(r);
  if (!a.success)
    return e.push(...T(a.error)), w(t, e);
  const o = a.data, l = j(o, i, e);
  if (e.push(...l), l.some(
    (d) => d.code === "SLIDE_UNKNOWN_LAYOUT" || s === "strict" && d.severity === "error"
  ))
    return w(t, e);
  const h = new Map(Object.entries(o.assets)), g = i.runtime.themes.get(o.theme.id) ?? i.runtime.themes.get("default");
  if (!g)
    throw new Error("Deck runtime must provide at least one theme.");
  i.runtime.themes.has(o.theme.id) || e.push(
    c(
      "SCHEMA_INVALID_VALUE",
      "warning",
      `Unknown theme '${o.theme.id}'. Falling back to '${g.id}'.`,
      ["theme", "id"]
    )
  );
  const p = [];
  for (const [d, m] of o.slides.entries()) {
    const S = i.runtime.layouts.get(m.layout);
    if (!S)
      continue;
    const k = /* @__PURE__ */ new Map();
    for (const [f, L] of Object.entries(m.slots)) {
      const I = await $(f, L, h, [
        "slides",
        String(d),
        "slots",
        f
      ]);
      k.set(f, I), e.push(
        ...I.diagnostics.map((_) => ({
          ..._,
          slideId: _.slideId ?? m.id
        }))
      );
    }
    for (const f of S.requiredSlots)
      !k.has(f) && s === "authoring" && k.set(f, C(f));
    p.push({
      id: m.id,
      index: d,
      layout: {
        name: S.name,
        definition: S
      },
      transition: P(
        m.transition ?? o.defaults.transition,
        i,
        ["slides", String(d), "transition"],
        e
      ),
      slots: k,
      diagnostics: e.filter((f) => f.slideId === m.id)
    });
  }
  const y = {
    version: 1,
    metadata: o.metadata,
    theme: g,
    aspectRatio: o.defaults.aspectRatio,
    assets: h,
    slides: p
  };
  return e.length > 0 ? {
    status: "degraded",
    deck: y,
    diagnostics: e
  } : {
    status: "valid",
    deck: y,
    diagnostics: []
  };
}
function w(t, i) {
  return {
    status: "invalid",
    fallback: {
      source: t,
      title: "Invalid deck source",
      diagnostics: i
    },
    diagnostics: i
  };
}
function T(t) {
  return t.issues.map((i) => {
    const e = i.path.map(String), s = i.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";
    return c(
      s,
      "error",
      i.message,
      e.length > 0 ? e : void 0,
      void 0
    );
  });
}
function j(t, i, e) {
  const s = [], r = /* @__PURE__ */ new Set();
  t.slides.length === 0 && s.push(c("DECK_EMPTY_SLIDES", "error", "Deck must contain at least one slide.", ["slides"]));
  for (const [a, o] of t.slides.entries()) {
    r.has(o.id) && s.push(
      c(
        "SLIDE_DUPLICATE_ID",
        "error",
        `Slide id '${o.id}' is already used.`,
        ["slides", String(a), "id"],
        o.id
      )
    ), r.add(o.id);
    const l = i.runtime.layouts.get(o.layout);
    if (!l) {
      s.push(
        c(
          "SLIDE_UNKNOWN_LAYOUT",
          "error",
          `Unknown layout '${o.layout}'.`,
          ["slides", String(a), "layout"],
          o.id,
          "Register the layout in createDeckRuntime or choose a default layout."
        )
      );
      continue;
    }
    for (const u of l.requiredSlots)
      u in o.slots || s.push(
        c(
          "LAYOUT_MISSING_SLOT",
          "error",
          `Layout '${l.name}' requires slot '${u}'.`,
          ["slides", String(a), "slots"],
          o.id
        )
      );
    for (const u of Object.keys(o.slots))
      l.forbiddenSlots.includes(u) && s.push(
        c(
          "LAYOUT_FORBIDDEN_SLOT",
          "warning",
          `Layout '${l.name}' does not render slot '${u}'.`,
          ["slides", String(a), "slots", u],
          o.id
        )
      );
  }
  return e.length > 0, s;
}
async function $(t, i, e, s) {
  const r = [], a = await Y(i, e, s, r);
  return {
    name: t,
    kind: a.kind === "renderer" ? "renderer" : a.kind,
    content: a,
    origin: "source",
    diagnostics: r
  };
}
async function Y(t, i, e, s) {
  if ("markdown" in t) {
    const r = E(t.markdown, e);
    return s.push(...r.diagnostics), {
      kind: "markdown",
      markdown: t.markdown,
      nodes: r.nodes
    };
  }
  if ("image" in t) {
    t.image.assetId && !i.has(t.image.assetId) && s.push(
      c(
        "ASSET_NOT_FOUND",
        "error",
        `Asset '${t.image.assetId}' was not found.`,
        e
      )
    );
    const r = t.image.assetId ? i.get(t.image.assetId) : void 0;
    return {
      kind: "image",
      assetId: t.image.assetId,
      src: (r == null ? void 0 : r.src) ?? t.image.src,
      alt: (r == null ? void 0 : r.alt) ?? t.image.alt
    };
  }
  return {
    kind: "renderer",
    rendererKind: t.renderer.kind,
    props: t.renderer.props
  };
}
function C(t) {
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
function P(t, i, e, s) {
  const r = i.runtime.transitions.has(t.in) ? t.in : "none", a = i.runtime.transitions.has(t.out) ? t.out : "none";
  return r !== t.in && s.push(
    c("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${t.in}'.`, [...e, "in"])
  ), a !== t.out && s.push(
    c("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${t.out}'.`, [...e, "out"])
  ), {
    in: r,
    out: a,
    durationMs: t.durationMs
  };
}
function q(t) {
  let i = 2166136261;
  for (let e = 0; e < t.length; e += 1)
    i ^= t.charCodeAt(e), i = Math.imul(i, 16777619);
  return (i >>> 0).toString(16).padStart(8, "0");
}
export {
  E as a,
  z as c,
  q as h,
  K as s
};
