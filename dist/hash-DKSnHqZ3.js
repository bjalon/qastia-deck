import { parseDocument as O } from "yaml";
import { z as s } from "zod";
const v = /```(\w+)?\n([\s\S]*?)```/g, D = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;
function U(t, n) {
  const e = [];
  D.test(t) && e.push({
    code: "MARKDOWN_UNSUPPORTED_HTML",
    severity: "warning",
    message: "Raw HTML is ignored by the default markdown renderer.",
    path: n,
    hint: "Use Markdown syntax or a custom renderer instead."
  });
  const i = [];
  let o = 0;
  for (const r of t.matchAll(v)) {
    const [f, d, g] = r, h = r.index ?? 0, S = t.slice(o, h);
    S.trim().length > 0 && i.push({ kind: "markdown", markdown: S }), (d == null ? void 0 : d.toLowerCase()) === "mermaid" ? i.push({ kind: "mermaid", chart: g.trim() }) : i.push({ kind: "code", language: d, code: g.replace(/\n$/, "") }), o = h + f.length;
  }
  const a = t.slice(o);
  return (a.trim().length > 0 || i.length === 0) && i.push({ kind: "markdown", markdown: a }), { nodes: i, diagnostics: e };
}
function u(t, n, e, i, o, a) {
  return {
    code: t,
    severity: n,
    message: e,
    path: i,
    slideId: o,
    hint: a
  };
}
function W(t) {
  const n = /* @__PURE__ */ new Map();
  for (const e of t) {
    const i = `${e.code}:${e.severity}`, o = n.get(i);
    n.set(i, {
      code: e.code,
      severity: e.severity,
      message: String(o ? Number(o.message) + 1 : 1)
    });
  }
  return Array.from(n.values()).map((e) => ({
    code: e.code,
    severity: e.severity,
    count: Number(e.message)
  }));
}
const N = s.object({
  in: s.string().default("none"),
  out: s.string().default("none"),
  durationMs: s.number().int().nonnegative().default(0)
}).strict(), R = s.object({
  markdown: s.string()
}).strict(), j = s.object({
  image: s.object({
    assetId: s.string().optional(),
    src: s.string().optional(),
    alt: s.string().optional()
  }).strict()
}).strict(), T = s.object({
  renderer: s.object({
    kind: s.string(),
    props: s.record(s.unknown()).default({})
  }).strict()
}).strict(), b = s.union([R, j, T]), $ = s.object({
  version: s.literal(1),
  kind: s.literal("deck"),
  metadata: s.object({
    title: s.string().min(1),
    description: s.string().optional(),
    author: s.string().optional(),
    locale: s.string().optional()
  }).strict(),
  theme: s.object({
    id: s.string().default("default")
  }).strict().default({ id: "default" }),
  defaults: s.object({
    aspectRatio: s.union([s.literal("16:9"), s.literal("4:3")]).default("16:9"),
    transition: N.default({ in: "none", out: "none", durationMs: 0 }),
    slots: s.record(b).default({})
  }).strict().default({
    aspectRatio: "16:9",
    transition: { in: "none", out: "none", durationMs: 0 },
    slots: {}
  }),
  assets: s.record(
    s.object({
      type: s.literal("image"),
      src: s.string().min(1),
      alt: s.string().min(1)
    }).strict()
  ).default({}),
  slides: s.array(
    s.object({
      id: s.string().min(1),
      layout: s.string().min(1),
      slots: s.record(b).default({}),
      unassignedSlots: s.record(b).default({}),
      transition: N.optional()
    }).strict()
  ).min(1)
}).strict();
async function G(t, n) {
  const e = [], i = n.compileMode ?? (n.mode === "editor" ? "authoring" : "strict");
  let o;
  try {
    const l = O(t.content, {
      prettyErrors: !1,
      strict: !0,
      uniqueKeys: !0
    });
    for (const m of l.errors)
      e.push(
        {
          ...u("YAML_SYNTAX_ERROR", "error", m.message, void 0, void 0),
          range: L(t.content, m)
        }
      );
    for (const m of l.warnings)
      e.push(
        {
          ...u("YAML_PARSE_WARNING", "warning", m.message, void 0, void 0),
          range: L(t.content, m)
        }
      );
    if (l.errors.length > 0)
      return A(t, e);
    o = l.toJSON();
  } catch (l) {
    return e.push(
      u(
        "YAML_SYNTAX_ERROR",
        "error",
        l instanceof Error ? l.message : "Unable to parse YAML source."
      )
    ), A(t, e);
  }
  const a = $.safeParse(o);
  if (!a.success)
    return e.push(...C(a.error)), A(t, e);
  const r = a.data, f = P(r, n, e);
  if (e.push(...f), f.some(
    (l) => l.code === "SLIDE_UNKNOWN_LAYOUT" || i === "strict" && l.severity === "error"
  ))
    return A(t, e);
  const g = new Map(Object.entries(r.assets)), h = n.runtime.themes.get(r.theme.id) ?? n.runtime.themes.get("default");
  if (!h)
    throw new Error("Deck runtime must provide at least one theme.");
  n.runtime.themes.has(r.theme.id) || e.push(
    u(
      "SCHEMA_INVALID_VALUE",
      "warning",
      `Unknown theme '${r.theme.id}'. Falling back to '${h.id}'.`,
      ["theme", "id"]
    )
  );
  const S = [];
  for (const [l, m] of r.slides.entries()) {
    const k = n.runtime.layouts.get(m.layout);
    if (!k)
      continue;
    const p = /* @__PURE__ */ new Map();
    for (const [c, I] of Object.entries(m.slots)) {
      const y = await E(c, I, g, [
        "slides",
        String(l),
        "slots",
        c
      ]);
      p.set(c, y), e.push(
        ...y.diagnostics.map((w) => ({
          ...w,
          slideId: w.slideId ?? m.id
        }))
      );
    }
    for (const [c, I] of Object.entries(r.defaults.slots)) {
      if (p.has(c) || !V(k, c))
        continue;
      const y = await E(
        c,
        I,
        g,
        ["defaults", "slots", c],
        "default"
      );
      p.set(c, y), e.push(
        ...y.diagnostics.map((w) => ({
          ...w,
          slideId: w.slideId ?? m.id
        }))
      );
    }
    for (const c of k.requiredSlots)
      !p.has(c) && i === "authoring" && p.set(c, K(c));
    S.push({
      id: m.id,
      index: l,
      layout: {
        name: k.name,
        definition: k
      },
      transition: q(
        m.transition ?? r.defaults.transition,
        n,
        ["slides", String(l), "transition"],
        e
      ),
      slots: p,
      diagnostics: e.filter((c) => c.slideId === m.id)
    });
  }
  const _ = {
    version: 1,
    metadata: r.metadata,
    theme: h,
    aspectRatio: r.defaults.aspectRatio,
    assets: g,
    renderers: n.runtime.renderers,
    slides: S
  };
  return e.length > 0 ? {
    status: "degraded",
    deck: _,
    diagnostics: e
  } : {
    status: "valid",
    deck: _,
    diagnostics: []
  };
}
function L(t, n) {
  if (!Y(n))
    return;
  const [e, i = e] = n.pos;
  return {
    start: M(t, e),
    end: M(t, i)
  };
}
function Y(t) {
  return typeof t == "object" && t !== null && "pos" in t && Array.isArray(t.pos) && typeof t.pos[0] == "number";
}
function M(t, n) {
  var a;
  const e = Math.min(Math.max(n, 0), t.length), o = t.slice(0, e).split(/\r?\n/);
  return {
    offset: e,
    line: o.length - 1,
    column: ((a = o[o.length - 1]) == null ? void 0 : a.length) ?? 0
  };
}
function A(t, n) {
  return {
    status: "invalid",
    fallback: {
      source: t,
      title: "Invalid deck source",
      diagnostics: n
    },
    diagnostics: n
  };
}
function C(t) {
  return t.issues.map((n) => {
    const e = n.path.map(String), i = n.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";
    return u(
      i,
      "error",
      n.message,
      e.length > 0 ? e : void 0,
      void 0
    );
  });
}
function P(t, n, e) {
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
    const f = n.runtime.layouts.get(r.layout);
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
    for (const d of f.requiredSlots)
      !(d in r.slots) && !(d in t.defaults.slots) && i.push(
        u(
          "LAYOUT_MISSING_SLOT",
          "error",
          `Layout '${f.name}' requires slot '${d}'.`,
          ["slides", String(a), "slots"],
          r.id
        )
      );
    for (const d of Object.keys(r.slots))
      f.forbiddenSlots.includes(d) && i.push(
        u(
          "LAYOUT_FORBIDDEN_SLOT",
          "warning",
          `Layout '${f.name}' does not render slot '${d}'.`,
          ["slides", String(a), "slots", d],
          r.id
        )
      );
    for (const d of Object.keys(r.unassignedSlots))
      i.push(
        u(
          "LAYOUT_UNASSIGNED_SLOT",
          "warning",
          `Slot '${d}' is preserved but is not rendered by layout '${f.name}'.`,
          ["slides", String(a), "unassignedSlots", d],
          r.id,
          "Change to a compatible layout or move the content back into a rendered slot."
        )
      );
  }
  return e.length > 0, i;
}
async function E(t, n, e, i, o = "source") {
  const a = [], r = await H(n, e, i, a);
  return {
    name: t,
    kind: r.kind === "renderer" ? "renderer" : r.kind,
    content: r,
    origin: o,
    diagnostics: a
  };
}
function V(t, n) {
  return t.requiredSlots.includes(n) || t.optionalSlots.includes(n);
}
async function H(t, n, e, i) {
  if ("markdown" in t) {
    const o = U(t.markdown, e);
    return i.push(...o.diagnostics), {
      kind: "markdown",
      markdown: t.markdown,
      nodes: o.nodes
    };
  }
  if ("image" in t) {
    t.image.assetId && !n.has(t.image.assetId) && i.push(
      u(
        "ASSET_NOT_FOUND",
        "error",
        `Asset '${t.image.assetId}' was not found.`,
        e
      )
    );
    const o = t.image.assetId ? n.get(t.image.assetId) : void 0;
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
function K(t) {
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
function q(t, n, e, i) {
  const o = n.runtime.transitions.has(t.in) ? t.in : "none", a = n.runtime.transitions.has(t.out) ? t.out : "none";
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
function B(t) {
  let n = 2166136261;
  for (let e = 0; e < t.length; e += 1)
    n ^= t.charCodeAt(e), n = Math.imul(n, 16777619);
  return (n >>> 0).toString(16).padStart(8, "0");
}
export {
  U as a,
  G as c,
  B as h,
  W as s
};
