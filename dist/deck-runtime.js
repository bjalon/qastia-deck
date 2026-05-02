import { jsxs as m, jsx as r } from "react/jsx-runtime";
import ue, { parseDocument as be } from "yaml";
import { z as u } from "zod";
import Ne from "react-markdown";
import { useState as E, useMemo as pe, useCallback as O, useEffect as x } from "react";
function De({ fallback: e }) {
  return /* @__PURE__ */ m("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ r("header", { children: /* @__PURE__ */ r("h2", { children: e.title }) }),
    /* @__PURE__ */ r(me, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ r("pre", { children: e.source.content })
  ] });
}
function me({
  diagnostics: e
}) {
  return /* @__PURE__ */ r("ul", { className: "deck-diagnostics-list", children: e.map((t, n) => /* @__PURE__ */ m("li", { "data-severity": t.severity, children: [
    /* @__PURE__ */ r("strong", { children: t.code }),
    /* @__PURE__ */ r("span", { children: t.message }),
    t.hint ? /* @__PURE__ */ r("small", { children: t.hint }) : null
  ] }, `${t.code}-${n}`)) });
}
const Ae = /```(\w+)?\n([\s\S]*?)```/g, Oe = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;
function Me(e, t) {
  const n = [];
  Oe.test(e) && n.push({
    code: "MARKDOWN_UNSUPPORTED_HTML",
    severity: "warning",
    message: "Raw HTML is ignored by the default markdown renderer.",
    path: t,
    hint: "Use Markdown syntax or a custom renderer instead."
  });
  const a = [];
  let s = 0;
  for (const o of e.matchAll(Ae)) {
    const [g, l, v] = o, D = o.index ?? 0, b = e.slice(s, D);
    b.trim().length > 0 && a.push({ kind: "markdown", markdown: b }), (l == null ? void 0 : l.toLowerCase()) === "mermaid" ? a.push({ kind: "mermaid", chart: v.trim() }) : a.push({ kind: "code", language: l, code: v.replace(/\n$/, "") }), s = D + g.length;
  }
  const i = e.slice(s);
  return (i.trim().length > 0 || a.length === 0) && a.push({ kind: "markdown", markdown: i }), { nodes: a, diagnostics: n };
}
function N(e, t, n, a, s, i) {
  return {
    code: e,
    severity: t,
    message: n,
    path: a,
    slideId: s,
    hint: i
  };
}
function Ce(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const a = `${n.code}:${n.severity}`, s = t.get(a);
    t.set(a, {
      code: n.code,
      severity: n.severity,
      message: String(s ? Number(s.message) + 1 : 1)
    });
  }
  return Array.from(t.values()).map((n) => ({
    code: n.code,
    severity: n.severity,
    count: Number(n.message)
  }));
}
const de = u.object({
  in: u.string().default("none"),
  out: u.string().default("none"),
  durationMs: u.number().int().nonnegative().default(0)
}).strict(), Ee = u.object({
  markdown: u.string()
}).strict(), xe = u.object({
  image: u.object({
    assetId: u.string().optional(),
    src: u.string().optional(),
    alt: u.string().optional()
  }).strict()
}).strict(), Re = u.object({
  renderer: u.object({
    kind: u.string(),
    props: u.record(u.unknown()).default({})
  }).strict()
}).strict(), Ve = u.union([Ee, xe, Re]), Le = u.object({
  version: u.literal(1),
  kind: u.literal("deck"),
  metadata: u.object({
    title: u.string().min(1),
    description: u.string().optional(),
    author: u.string().optional(),
    locale: u.string().optional()
  }).strict(),
  theme: u.object({
    id: u.string().default("default")
  }).strict().default({ id: "default" }),
  defaults: u.object({
    aspectRatio: u.union([u.literal("16:9"), u.literal("4:3")]).default("16:9"),
    transition: de.default({ in: "none", out: "none", durationMs: 0 })
  }).strict().default({ aspectRatio: "16:9", transition: { in: "none", out: "none", durationMs: 0 } }),
  assets: u.record(
    u.object({
      type: u.literal("image"),
      src: u.string().min(1),
      alt: u.string().min(1)
    }).strict()
  ).default({}),
  slides: u.array(
    u.object({
      id: u.string().min(1),
      layout: u.string().min(1),
      slots: u.record(Ve).default({}),
      transition: de.optional()
    }).strict()
  ).min(1)
}).strict();
async function Pe(e, t) {
  const n = [];
  let a;
  try {
    const k = be(e.content, {
      prettyErrors: !1,
      strict: !0,
      uniqueKeys: !0
    });
    for (const y of k.errors)
      n.push(
        N("YAML_SYNTAX_ERROR", "error", y.message, void 0, void 0)
      );
    for (const y of k.warnings)
      n.push(
        N("YAML_PARSE_WARNING", "warning", y.message, void 0, void 0)
      );
    if (k.errors.length > 0)
      return H(e, n);
    a = k.toJSON();
  } catch (k) {
    return n.push(
      N(
        "YAML_SYNTAX_ERROR",
        "error",
        k instanceof Error ? k.message : "Unable to parse YAML source."
      )
    ), H(e, n);
  }
  const s = Le.safeParse(a);
  if (!s.success)
    return n.push(...Te(s.error)), H(e, n);
  const i = s.data, o = _e(i, t, n);
  if (n.push(...o), o.some((k) => k.code === "SLIDE_UNKNOWN_LAYOUT"))
    return H(e, n);
  const l = new Map(Object.entries(i.assets)), v = t.runtime.themes.get(i.theme.id) ?? t.runtime.themes.get("default");
  if (!v)
    throw new Error("Deck runtime must provide at least one theme.");
  t.runtime.themes.has(i.theme.id) || n.push(
    N(
      "SCHEMA_INVALID_VALUE",
      "warning",
      `Unknown theme '${i.theme.id}'. Falling back to '${v.id}'.`,
      ["theme", "id"]
    )
  );
  const D = [];
  for (const [k, y] of i.slides.entries()) {
    const S = t.runtime.layouts.get(y.layout);
    if (!S)
      continue;
    const I = /* @__PURE__ */ new Map();
    for (const [c, L] of Object.entries(y.slots)) {
      const w = await $e(c, L, l, [
        "slides",
        String(k),
        "slots",
        c
      ]);
      I.set(c, w), n.push(
        ...w.diagnostics.map((h) => ({
          ...h,
          slideId: h.slideId ?? y.id
        }))
      );
    }
    for (const c of S.requiredSlots)
      I.has(c) || I.set(c, Be(c));
    D.push({
      id: y.id,
      index: k,
      layout: {
        name: S.name,
        definition: S
      },
      transition: Fe(
        y.transition ?? i.defaults.transition,
        t,
        ["slides", String(k), "transition"],
        n
      ),
      slots: I,
      diagnostics: n.filter((c) => c.slideId === y.id)
    });
  }
  const b = {
    version: 1,
    metadata: i.metadata,
    theme: v,
    aspectRatio: i.defaults.aspectRatio,
    assets: l,
    slides: D
  };
  return n.length > 0 ? {
    status: "degraded",
    deck: b,
    diagnostics: n
  } : {
    status: "valid",
    deck: b,
    diagnostics: []
  };
}
function H(e, t) {
  return {
    status: "invalid",
    fallback: {
      source: e,
      title: "Invalid deck source",
      diagnostics: t
    },
    diagnostics: t
  };
}
function Te(e) {
  return e.issues.map((t) => {
    const n = t.path.map(String), a = t.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";
    return N(
      a,
      "error",
      t.message,
      n.length > 0 ? n : void 0,
      void 0
    );
  });
}
function _e(e, t, n) {
  const a = [], s = /* @__PURE__ */ new Set();
  e.slides.length === 0 && a.push(N("DECK_EMPTY_SLIDES", "error", "Deck must contain at least one slide.", ["slides"]));
  for (const [i, o] of e.slides.entries()) {
    s.has(o.id) && a.push(
      N(
        "SLIDE_DUPLICATE_ID",
        "error",
        `Slide id '${o.id}' is already used.`,
        ["slides", String(i), "id"],
        o.id
      )
    ), s.add(o.id);
    const g = t.runtime.layouts.get(o.layout);
    if (!g) {
      a.push(
        N(
          "SLIDE_UNKNOWN_LAYOUT",
          "error",
          `Unknown layout '${o.layout}'.`,
          ["slides", String(i), "layout"],
          o.id,
          "Register the layout in createDeckRuntime or choose a default layout."
        )
      );
      continue;
    }
    for (const l of g.requiredSlots)
      l in o.slots || a.push(
        N(
          "LAYOUT_MISSING_SLOT",
          "error",
          `Layout '${g.name}' requires slot '${l}'.`,
          ["slides", String(i), "slots"],
          o.id
        )
      );
    for (const l of Object.keys(o.slots))
      g.forbiddenSlots.includes(l) && a.push(
        N(
          "LAYOUT_FORBIDDEN_SLOT",
          "warning",
          `Layout '${g.name}' does not render slot '${l}'.`,
          ["slides", String(i), "slots", l],
          o.id
        )
      );
  }
  return n.length > 0, a;
}
async function $e(e, t, n, a) {
  const s = [], i = await Ue(t, n, a, s);
  return {
    name: e,
    kind: i.kind === "renderer" ? "renderer" : i.kind,
    content: i,
    diagnostics: s
  };
}
async function Ue(e, t, n, a) {
  if ("markdown" in e) {
    const s = Me(e.markdown, n);
    return a.push(...s.diagnostics), {
      kind: "markdown",
      markdown: e.markdown,
      nodes: s.nodes
    };
  }
  if ("image" in e) {
    e.image.assetId && !t.has(e.image.assetId) && a.push(
      N(
        "ASSET_NOT_FOUND",
        "error",
        `Asset '${e.image.assetId}' was not found.`,
        n
      )
    );
    const s = e.image.assetId ? t.get(e.image.assetId) : void 0;
    return {
      kind: "image",
      assetId: e.image.assetId,
      src: (s == null ? void 0 : s.src) ?? e.image.src,
      alt: (s == null ? void 0 : s.alt) ?? e.image.alt
    };
  }
  return {
    kind: "renderer",
    rendererKind: e.renderer.kind,
    props: e.renderer.props
  };
}
function Be(e) {
  return {
    name: e,
    kind: "markdown",
    content: {
      kind: "markdown",
      markdown: "",
      nodes: [{ kind: "markdown", markdown: "" }]
    },
    diagnostics: []
  };
}
function Fe(e, t, n, a) {
  const s = t.runtime.transitions.has(e.in) ? e.in : "none", i = t.runtime.transitions.has(e.out) ? e.out : "none";
  return s !== e.in && a.push(
    N("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.in}'.`, [...n, "in"])
  ), i !== e.out && a.push(
    N("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.out}'.`, [...n, "out"])
  ), {
    in: s,
    out: i,
    durationMs: e.durationMs
  };
}
function ne({ slide: e, target: t }) {
  const n = e.layout.definition.component;
  return /* @__PURE__ */ r(
    "section",
    {
      className: "deck-slide-frame",
      "data-slide-id": e.id,
      "data-layout": e.layout.name,
      "data-target": t,
      children: /* @__PURE__ */ r(n, { slide: e, target: t })
    }
  );
}
function At({ deck: e }) {
  return /* @__PURE__ */ r("div", { className: `deck-print-root ${e.theme.cssClassName}`, children: e.slides.map((t) => /* @__PURE__ */ r("section", { className: "deck-print-page", "data-slide-id": t.id, children: /* @__PURE__ */ r(ne, { slide: t, target: "print" }) }, t.id)) });
}
const je = {
  async exportDeck(e) {
    return e.mode !== "browser-print" ? {
      status: "failed",
      diagnostics: [
        {
          code: "PDF_UNSUPPORTED_RENDERER",
          severity: "error",
          message: "Only browser-print PDF export is implemented."
        }
      ]
    } : (window.print(), { status: "opened-print-dialog" });
  }
};
function ce(e, t) {
  return `${e}:v1:${t}:current`;
}
function G(e, t) {
  return `${e}:v1:${t}:draft`;
}
function ee(e, t) {
  return `${e}:v1:${t}:versions:index`;
}
function Y(e, t, n) {
  return `${e}:v1:${t}:versions:${n}`;
}
class fe {
  async loadCurrent(t) {
    return z(ce(t.namespace, t.deckId));
  }
  async saveCurrent(t) {
    return _(ce(t.namespace, t.deckId), t);
  }
  async saveDraft(t) {
    return _(G(t.namespace, t.deckId), t);
  }
  async loadDraft(t) {
    return z(G(t.namespace, t.deckId));
  }
  async clearDraft(t) {
    var n;
    try {
      return (n = $()) == null || n.removeItem(G(t.namespace, t.deckId)), { status: "success" };
    } catch (a) {
      return te(a);
    }
  }
  async createVersion(t) {
    const n = {
      id: t.id,
      deckId: t.deckId,
      namespace: t.namespace,
      schemaVersion: 1,
      createdAtIso: t.createdAtIso,
      label: t.label,
      reason: t.reason,
      source: t.source,
      sourceHash: t.sourceHash,
      selectedSlideId: t.selectedSlideId,
      compilerStatus: t.compilerStatus,
      diagnosticsSummary: t.diagnosticsSummary
    }, a = JSON.stringify(n), s = await _(Y(t.namespace, t.deckId, t.id), n);
    if (s.status === "failed")
      return s;
    const i = await J(t.namespace, t.deckId), o = {
      deckId: t.deckId,
      namespace: t.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      versions: [
        {
          id: t.id,
          deckId: t.deckId,
          namespace: t.namespace,
          schemaVersion: 1,
          createdAtIso: t.createdAtIso,
          label: t.label,
          reason: t.reason,
          sourceHash: t.sourceHash,
          selectedSlideId: t.selectedSlideId,
          compilerStatus: t.compilerStatus,
          sizeBytes: a.length
        },
        ...i.versions.filter((l) => l.id !== t.id)
      ]
    }, g = He(o, t.limits);
    return _(ee(t.namespace, t.deckId), g);
  }
  async listVersions(t) {
    return (await J(t.namespace, t.deckId)).versions;
  }
  async loadVersion(t) {
    return z(
      Y(t.namespace, t.deckId, t.versionId)
    );
  }
  async deleteVersion(t) {
    var n;
    try {
      (n = $()) == null || n.removeItem(Y(t.namespace, t.deckId, t.versionId));
      const a = await J(t.namespace, t.deckId), s = {
        ...a,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        versions: a.versions.filter((i) => i.id !== t.versionId)
      };
      return _(ee(t.namespace, t.deckId), s);
    } catch (a) {
      return te(a);
    }
  }
}
function He(e, t) {
  var i;
  if (!t)
    return e;
  const n = [...e.versions], a = n.filter((o) => o.reason === "autosave");
  for (; n.length > t.maxVersionsPerDeck; ) {
    const o = X(n, (g) => g.reason === "autosave");
    n.splice(o >= 0 ? o : n.length - 1, 1);
  }
  for (; n.filter((o) => o.reason === "autosave").length > t.maxAutosaveVersionsPerDeck; ) {
    const o = X(n, (g) => g.reason === "autosave");
    if (o < 0)
      break;
    n.splice(o, 1);
  }
  let s = n.reduce((o, g) => o + g.sizeBytes, 0);
  for (; s > t.maxBytesPerDeck && n.length > 0; ) {
    const o = X(n, (v) => v.reason === "autosave"), g = o >= 0 ? o : n.length - 1, [l] = n.splice(g, 1);
    s -= (l == null ? void 0 : l.sizeBytes) ?? 0;
  }
  for (const o of a.filter((g) => !n.some((l) => l.id === g.id)))
    (i = $()) == null || i.removeItem(Y(e.namespace, e.deckId, o.id));
  return {
    ...e,
    versions: n
  };
}
async function J(e, t) {
  return await z(ee(e, t)) ?? {
    deckId: t,
    namespace: e,
    schemaVersion: 1,
    updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
    versions: []
  };
}
function z(e) {
  var t;
  try {
    const n = (t = $()) == null ? void 0 : t.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function _(e, t) {
  var n;
  try {
    return (n = $()) == null || n.setItem(e, JSON.stringify(t)), { status: "success" };
  } catch (a) {
    return te(a);
  }
}
function te(e) {
  return {
    status: "failed",
    diagnostics: [Ke(e)]
  };
}
function Ke(e) {
  return {
    code: "STORAGE_QUOTA_EXCEEDED",
    severity: "error",
    message: e instanceof Error ? e.message : "Unable to write deck state to storage."
  };
}
function $() {
  if (!(typeof window > "u"))
    return window.localStorage;
}
function X(e, t) {
  for (let n = e.length - 1; n >= 0; n -= 1)
    if (t(e[n]))
      return n;
  return -1;
}
const Ye = /^(javascript|data|vbscript):/i, ze = {
  async resolveImage(e) {
    const t = e.assetId ? e.assets.get(e.assetId) : void 0, n = (t == null ? void 0 : t.src) ?? e.src, a = (t == null ? void 0 : t.alt) ?? "";
    if (!n || Ye.test(n.trim()))
      throw new Error("Image source is missing or unsafe.");
    return {
      src: n,
      alt: a
    };
  }
};
function A({ content: e }) {
  return e.kind === "image" ? /* @__PURE__ */ r(
    "img",
    {
      className: "deck-slot-image",
      src: e.src ?? "",
      alt: e.alt ?? "",
      loading: "lazy"
    }
  ) : e.kind === "renderer" ? /* @__PURE__ */ m("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    e.rendererKind
  ] }) : /* @__PURE__ */ r("div", { className: "deck-markdown", children: e.nodes.map((t, n) => /* @__PURE__ */ r(We, { node: t }, `${t.kind}-${n}`)) });
}
function We({ node: e }) {
  return e.kind === "code" ? /* @__PURE__ */ r("pre", { className: "deck-code-block", children: /* @__PURE__ */ r("code", { children: e.code }) }) : e.kind === "mermaid" ? /* @__PURE__ */ r("pre", { className: "deck-mermaid-block", children: e.chart }) : /* @__PURE__ */ r(
    Ne,
    {
      allowedElements: [
        "p",
        "strong",
        "em",
        "a",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "br"
      ],
      urlTransform: (t) => /^(https?:|mailto:|\/|#)/i.test(t) ? t : "",
      children: e.markdown
    }
  );
}
function Ge({ slide: e, target: t }) {
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-cover", "data-target": t, children: [
    /* @__PURE__ */ m("div", { className: "deck-cover-copy", children: [
      /* @__PURE__ */ r(K, { slide: e, name: "eyebrow", className: "deck-cover-eyebrow" }),
      /* @__PURE__ */ r(K, { slide: e, name: "title", className: "deck-cover-title" }),
      /* @__PURE__ */ r(K, { slide: e, name: "subtitle", className: "deck-cover-subtitle" })
    ] }),
    /* @__PURE__ */ r(K, { slide: e, name: "footer", className: "deck-slide-footer" })
  ] });
}
function K({
  slide: e,
  name: t,
  className: n
}) {
  const a = e.slots.get(t);
  return a ? /* @__PURE__ */ r("div", { className: n, "data-slot": t, children: /* @__PURE__ */ r(A, { content: a.content }) }) : null;
}
function Je({ slide: e, target: t }) {
  const n = e.slots.get("image"), a = e.slots.get("caption");
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-image-only", "data-target": t, children: [
    /* @__PURE__ */ r("main", { children: n ? /* @__PURE__ */ r(A, { content: n.content }) : null }),
    /* @__PURE__ */ r("footer", { children: a ? /* @__PURE__ */ r(A, { content: a.content }) : null })
  ] });
}
function Xe({ slide: e, target: t }) {
  const n = e.slots.get("title"), a = e.slots.get("body"), s = e.slots.get("footer");
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-title-body", "data-target": t, children: [
    /* @__PURE__ */ r("header", { children: n ? /* @__PURE__ */ r(A, { content: n.content }) : null }),
    /* @__PURE__ */ r("main", { children: a ? /* @__PURE__ */ r(A, { content: a.content }) : null }),
    /* @__PURE__ */ r("footer", { children: s ? /* @__PURE__ */ r(A, { content: s.content }) : null })
  ] });
}
function Qe({ slide: e, target: t }) {
  const n = e.slots.get("title"), a = e.slots.get("left"), s = e.slots.get("right"), i = e.slots.get("footer");
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-two-columns", "data-target": t, children: [
    /* @__PURE__ */ r("header", { children: n ? /* @__PURE__ */ r(A, { content: n.content }) : null }),
    /* @__PURE__ */ m("main", { className: "deck-two-columns-grid", children: [
      /* @__PURE__ */ r("section", { children: a ? /* @__PURE__ */ r(A, { content: a.content }) : null }),
      /* @__PURE__ */ r("section", { children: s ? /* @__PURE__ */ r(A, { content: s.content }) : null })
    ] }),
    /* @__PURE__ */ r("footer", { children: i ? /* @__PURE__ */ r(A, { content: i.content }) : null })
  ] });
}
const Ze = [
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
            { kind: "markdown", slotName: "eyebrow", label: "Eyebrow", minRows: 2 },
            { kind: "markdown", slotName: "title", label: "Title", required: !0, minRows: 3 },
            { kind: "markdown", slotName: "subtitle", label: "Subtitle", minRows: 3 },
            { kind: "markdown", slotName: "footer", label: "Footer", minRows: 2 }
          ]
        }
      ]
    },
    component: Ge
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
            { kind: "markdown", slotName: "title", label: "Title", required: !0, minRows: 2 },
            { kind: "markdown", slotName: "body", label: "Body", required: !0, minRows: 10 },
            { kind: "markdown", slotName: "footer", label: "Footer", minRows: 2 }
          ]
        }
      ]
    },
    component: Xe
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
            { kind: "markdown", slotName: "title", label: "Title", required: !0, minRows: 2 },
            { kind: "markdown", slotName: "left", label: "Left column", required: !0, minRows: 8 },
            { kind: "markdown", slotName: "right", label: "Right column", required: !0, minRows: 8 },
            { kind: "markdown", slotName: "footer", label: "Footer", minRows: 2 }
          ]
        }
      ]
    },
    component: Qe
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
            { kind: "image", slotName: "image", label: "Image", required: !0 },
            { kind: "markdown", slotName: "caption", label: "Caption", minRows: 2 }
          ]
        }
      ]
    },
    component: Je
  }
];
function ae({ node: e }) {
  return /* @__PURE__ */ r(A, { content: { kind: "markdown", markdown: "", nodes: [e] } });
}
const qe = {
  kind: "markdown",
  render: ae
}, et = {
  kind: "code",
  render: ae
}, tt = {
  kind: "mermaid",
  render: ae
}, nt = [
  qe,
  et,
  tt
], Q = {
  color: {
    background: "#ffffff",
    foreground: "#111827",
    primary: "#155eef",
    muted: "#667085",
    danger: "#d92d20",
    warning: "#dc6803"
  },
  font: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    mono: "JetBrains Mono, ui-monospace, monospace"
  },
  spacing: {
    slidePadding: "4rem",
    gap: "2rem"
  },
  radius: {
    small: "4px",
    medium: "8px",
    large: "12px"
  }
}, at = [
  {
    id: "default",
    displayName: "Default",
    cssClassName: "deck-theme-default",
    tokens: Q
  },
  {
    id: "fintech-light",
    displayName: "Fintech light",
    cssClassName: "deck-theme-fintech-light",
    tokens: Q
  },
  {
    id: "fintech-dark",
    displayName: "Fintech dark",
    cssClassName: "deck-theme-fintech-dark",
    tokens: {
      ...Q,
      color: {
        background: "#0f172a",
        foreground: "#f8fafc",
        primary: "#60a5fa",
        muted: "#cbd5e1",
        danger: "#f87171",
        warning: "#fbbf24"
      }
    }
  }
], it = [
  { name: "none", displayName: "None" },
  { name: "fade", displayName: "Fade" },
  { name: "slide-left", displayName: "Slide left" },
  { name: "slide-right", displayName: "Slide right" },
  { name: "zoom", displayName: "Zoom" }
];
function st(e = {}) {
  const t = e.layouts ?? Ze, n = e.renderers ?? nt, a = e.themes ?? at, s = e.transitions ?? it;
  return {
    layouts: new Map(t.map((i) => [i.name, i])),
    renderers: new Map(n.map((i) => [i.kind, i])),
    themes: new Map(a.map((i) => [i.id, i])),
    transitions: new Map(s.map((i) => [i.name, i])),
    assets: ze,
    storage: e.storage ?? new fe(),
    pdf: e.pdf ?? je
  };
}
const ot = st();
function Ot({
  deck: e,
  initialSlideId: t,
  mode: n = "viewer",
  onAction: a,
  onSlideChange: s
}) {
  const i = Math.max(
    0,
    e.slides.findIndex((k) => k.id === t)
  ), [o, g] = E(i === -1 ? 0 : i), l = e.slides[o] ?? e.slides[0], v = pe(
    () => ({
      activeSlideId: l.id,
      activeSlideIndex: o
    }),
    [o, l.id]
  ), D = O(
    (k) => {
      a == null || a(k, v);
    },
    [a, v]
  ), b = O(
    (k, y) => {
      const S = Math.min(Math.max(k, 0), e.slides.length - 1), I = l.id;
      g(S);
      const c = e.slides[S];
      c && c.id !== I && (s == null || s({
        previousSlideId: I,
        activeSlideId: c.id,
        activeSlideIndex: S
      })), D({
        type: S > o ? "next-slide" : "previous-slide",
        origin: y,
        slideId: c == null ? void 0 : c.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [o, l.id, e.slides, D, s]
  );
  return x(() => {
    function k(y) {
      (y.key === "ArrowRight" || y.key === "PageDown" || y.key === " ") && (y.preventDefault(), b(o + 1, "keyboard")), (y.key === "ArrowLeft" || y.key === "PageUp") && (y.preventDefault(), b(o - 1, "keyboard"));
    }
    return window.addEventListener("keydown", k), () => window.removeEventListener("keydown", k);
  }, [o, b]), /* @__PURE__ */ m("div", { className: `deck-screen-root ${e.theme.cssClassName}`, "data-mode": n, children: [
    /* @__PURE__ */ m("div", { className: "deck-show-toolbar", "aria-label": "Deck navigation", children: [
      /* @__PURE__ */ r("button", { type: "button", onClick: () => b(o - 1, "mouse"), disabled: o === 0, children: "Previous" }),
      /* @__PURE__ */ m("span", { children: [
        o + 1,
        " / ",
        e.slides.length
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          onClick: () => b(o + 1, "mouse"),
          disabled: o >= e.slides.length - 1,
          children: "Next"
        }
      )
    ] }),
    l ? /* @__PURE__ */ r(ne, { slide: l, target: "screen" }) : null
  ] });
}
function C(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n += 1)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, "0");
}
const rt = {
  desktopBreakpointPx: 1024,
  slideRailWidthPx: 260,
  inspectorWidthPx: 340,
  showInspector: !0,
  showActiveSlidePreview: !0,
  showSourceModeToggle: !0,
  showVersionHistory: !0,
  showDiagnosticsPanel: !0,
  density: "comfortable"
}, dt = {
  allowAddSlide: !0,
  allowDuplicateSlide: !0,
  allowDeleteSlide: !0,
  allowReorderSlides: !1,
  allowLayoutChange: !0,
  allowThemeChange: !0,
  allowRawSourceEdit: !0,
  allowPdfExport: !0,
  allowVersionRestore: !0,
  allowVersionCompare: !1
}, Z = {
  adapter: new fe(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, ct = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function U(e) {
  try {
    const t = ue.parse(e.content);
    return V(t) ? t : null;
  } catch {
    return null;
  }
}
function W(e, t) {
  return {
    ...e,
    content: ue.stringify(t, { lineWidth: 0 })
  };
}
function R(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(V);
}
function lt(e, t, n, a) {
  return ie(e, t, (s) => {
    const i = ge(s);
    i[n] = { markdown: a };
  });
}
function q(e, t, n, a) {
  return ie(e, t, (s) => {
    const i = ge(s);
    i[n] = {
      image: yt({
        assetId: a.assetId,
        src: a.src,
        alt: a.alt
      })
    };
  });
}
function ut(e, t, n) {
  return ie(e, t, (a) => {
    a.layout = n;
  });
}
function mt(e, t = "title-body") {
  const n = U(e);
  if (!n)
    return e;
  const a = R(n), s = ke(a, "slide");
  return a.push({
    id: s,
    layout: t,
    slots: {
      title: { markdown: "## New slide" },
      body: { markdown: "" }
    }
  }), n.slides = a, W(e, n);
}
function ft(e, t) {
  const n = U(e);
  if (!n)
    return e;
  const a = R(n), s = a.findIndex((o) => o.id === t);
  if (s < 0)
    return e;
  const i = structuredClone(a[s]);
  return i.id = ke(a, `${t}-copy`), a.splice(s + 1, 0, i), n.slides = a, W(e, n);
}
function ht(e, t) {
  const n = U(e);
  if (!n)
    return e;
  const a = R(n).filter((s) => s.id !== t);
  return n.slides = a.length > 0 ? a : R(n), W(e, n);
}
function gt(e, t, n) {
  const a = he(e, t, n);
  return V(a) && typeof a.markdown == "string" ? a.markdown : "";
}
function kt(e, t, n) {
  const a = he(e, t, n), s = V(a) && V(a.image) ? a.image : {};
  return {
    assetId: typeof s.assetId == "string" ? s.assetId : "",
    src: typeof s.src == "string" ? s.src : "",
    alt: typeof s.alt == "string" ? s.alt : ""
  };
}
function ie(e, t, n) {
  const a = U(e);
  if (!a)
    return e;
  const s = R(a), i = s.find((o) => o.id === t);
  return i ? (n(i), a.slides = s, W(e, a)) : e;
}
function he(e, t, n) {
  var i;
  const a = U(e);
  if (!a)
    return;
  const s = R(a).find((o) => o.id === t);
  return (i = s == null ? void 0 : s.slots) == null ? void 0 : i[n];
}
function ge(e) {
  return V(e.slots) || (e.slots = {}), e.slots;
}
function ke(e, t) {
  const n = new Set(e.map((i) => i.id).filter((i) => !!i));
  let a = le(t), s = 2;
  for (; n.has(a); )
    a = `${le(t)}-${s}`, s += 1;
  return a;
}
function le(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function yt(e) {
  return Object.fromEntries(
    Object.entries(e).filter((t) => !!t[1])
  );
}
function V(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Mt(e) {
  var se, oe;
  const t = e.runtime ?? ot, n = e.mode === "controlled", [a, s] = E(
    n ? e.value : e.initialValue
  ), i = n ? e.value : a, [o, g] = E(null), [l, v] = E(
    e.initialSelectedSlideId
  ), [D, b] = E(!1), [k, y] = E([]), S = { ...rt, ...e.layout }, I = { ...dt, ...e.features }, c = e.storage === !1 ? void 0 : {
    ...Z,
    namespace: e.namespace ?? ((se = e.storage) == null ? void 0 : se.namespace) ?? Z.namespace,
    adapter: ((oe = e.storage) == null ? void 0 : oe.adapter) ?? t.storage ?? Z.adapter,
    ...e.storage
  }, L = e.autosave === !1 ? void 0 : { ...ct, ...e.autosave }, w = (o == null ? void 0 : o.status) === "valid" || (o == null ? void 0 : o.status) === "degraded" ? o.deck : void 0, h = (w == null ? void 0 : w.slides.find((d) => d.id === l)) ?? (w == null ? void 0 : w.slides[0]), B = O(
    (d, f, p) => {
      var T;
      const j = {
        reason: f,
        deckId: e.deckId,
        selectedSlideId: p ?? l,
        sourceHash: C(d.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      n || s(d), (T = e.onChange) == null || T.call(e, d, j);
    },
    [n, e, l]
  );
  x(() => {
    let d = !1;
    return Pe(i, {
      runtime: t,
      locale: e.locale ?? "fr-FR"
    }).then((f) => {
      var p;
      d || (g(f), (p = e.onCompile) == null || p.call(e, f));
    }).catch((f) => {
      var p;
      (p = e.onError) == null || p.call(e, {
        message: f instanceof Error ? f.message : "Deck compilation failed.",
        cause: f
      });
    }), () => {
      d = !0;
    };
  }, [e, t, i]), x(() => {
    if (!w || l)
      return;
    const d = w.slides[0];
    d && v(d.id);
  }, [w, l]), x(() => {
    c != null && c.recoverOnMount && c.adapter.loadDraft({ deckId: e.deckId, namespace: c.namespace }).then((d) => {
      !d || d.sourceHash === C(i.content) || (v(d.selectedSlideId), B(d.source, "crash-recovery", d.selectedSlideId));
    }).catch((d) => {
      var f;
      (f = e.onError) == null || f.call(e, {
        message: d instanceof Error ? d.message : "Unable to recover deck draft.",
        cause: d
      });
    });
  }, []), x(() => {
    if (!c || !L || !c.saveDraftOnChange)
      return;
    const d = window.setTimeout(() => {
      c.adapter.saveDraft({
        deckId: e.deckId,
        namespace: c.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: vt(),
        source: i,
        sourceHash: C(i.content),
        selectedSlideId: l,
        compilerStatus: (o == null ? void 0 : o.status) ?? "invalid"
      });
    }, L.draftDebounceMs);
    return () => window.clearTimeout(d);
  }, [L, o, e.deckId, l, i, c]);
  const F = O(() => {
    c && c.adapter.listVersions({ deckId: e.deckId, namespace: c.namespace }).then(y).catch((d) => {
      var f;
      (f = e.onError) == null || f.call(e, {
        message: d instanceof Error ? d.message : "Unable to list deck versions.",
        cause: d
      });
    });
  }, [e, c]);
  x(() => {
    F();
  }, [F]);
  const P = O(
    async (d, f) => {
      var T, re;
      if (!c)
        return;
      const p = (o == null ? void 0 : o.diagnostics) ?? [], j = await c.adapter.createVersion({
        id: ye(),
        deckId: e.deckId,
        namespace: c.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: f,
        reason: d,
        source: i,
        sourceHash: C(i.content),
        selectedSlideId: l,
        compilerStatus: (o == null ? void 0 : o.status) ?? "invalid",
        diagnosticsSummary: Ce(p),
        limits: {
          maxVersionsPerDeck: c.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: c.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: c.maxBytesPerDeck
        }
      });
      j.status === "failed" && ((re = e.onError) == null || re.call(e, { message: ((T = j.diagnostics[0]) == null ? void 0 : T.message) ?? "Unable to save deck version." })), F();
    },
    [o, e, F, l, i, c]
  ), we = O(() => {
    var d;
    c && (c.adapter.saveCurrent({
      deckId: e.deckId,
      namespace: c.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: i,
      sourceHash: C(i.content),
      selectedSlideId: l
    }), c.createVersionOnManualSave && P("manual", "Manual save"), (d = e.onSave) == null || d.call(e, {
      deckId: e.deckId,
      sourceHash: C(i.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [P, e, l, i, c]), Se = O(
    async (d) => {
      var p;
      if (!c)
        return;
      c.createVersionBeforeDestructiveAction && await P("before-version-restore", "Before restore");
      const f = await c.adapter.loadVersion({
        deckId: e.deckId,
        namespace: c.namespace,
        versionId: d
      });
      f && (v(f.selectedSlideId), B(f.source, "version-restore", f.selectedSlideId), (p = e.onRestoreVersion) == null || p.call(e, {
        deckId: e.deckId,
        versionId: d,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [P, e, B, c]
  );
  function ve(d) {
    var f;
    v(d), (f = e.onSelectedSlideChange) == null || f.call(e, { deckId: e.deckId, slideId: d });
  }
  function M(d, f) {
    B(d, f, h == null ? void 0 : h.id);
  }
  const Ie = (o == null ? void 0 : o.diagnostics) ?? [];
  return /* @__PURE__ */ m("div", { className: "deck-studio-root", "data-density": S.density, children: [
    /* @__PURE__ */ m("aside", { className: "deck-studio-rail", style: { width: S.slideRailWidthPx }, children: [
      /* @__PURE__ */ m("header", { children: [
        /* @__PURE__ */ r("strong", { children: (w == null ? void 0 : w.metadata.title) ?? "Deck" }),
        I.allowAddSlide ? /* @__PURE__ */ r("button", { type: "button", onClick: () => M(mt(i), "slide-add"), disabled: e.readOnly, children: "Add" }) : null
      ] }),
      /* @__PURE__ */ r("nav", { "aria-label": "Slides", children: w == null ? void 0 : w.slides.map((d) => /* @__PURE__ */ m(
        "button",
        {
          type: "button",
          className: d.id === (h == null ? void 0 : h.id) ? "is-active" : void 0,
          onClick: () => ve(d.id),
          children: [
            /* @__PURE__ */ r("span", { children: d.index + 1 }),
            /* @__PURE__ */ r("span", { children: d.id }),
            /* @__PURE__ */ r("small", { children: d.layout.name })
          ]
        },
        d.id
      )) })
    ] }),
    /* @__PURE__ */ m("main", { className: "deck-studio-main", children: [
      /* @__PURE__ */ m("header", { className: "deck-studio-header", children: [
        /* @__PURE__ */ m("div", { children: [
          /* @__PURE__ */ r("strong", { children: (h == null ? void 0 : h.id) ?? "Source" }),
          h ? /* @__PURE__ */ r("small", { children: h.layout.definition.displayName }) : null
        ] }),
        /* @__PURE__ */ m("div", { className: "deck-studio-actions", children: [
          S.showSourceModeToggle && I.allowRawSourceEdit ? /* @__PURE__ */ r("button", { type: "button", onClick: () => b((d) => !d), children: D ? "Form" : "YAML" }) : null,
          I.allowDuplicateSlide && h ? /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              onClick: () => M(ft(i, h.id), "slide-duplicate"),
              disabled: e.readOnly,
              children: "Duplicate"
            }
          ) : null,
          I.allowDeleteSlide && h ? /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              onClick: () => M(ht(i, h.id), "slide-delete"),
              disabled: e.readOnly || ((w == null ? void 0 : w.slides.length) ?? 0) <= 1,
              children: "Delete"
            }
          ) : null,
          c ? /* @__PURE__ */ r("button", { type: "button", onClick: we, disabled: e.readOnly, children: "Save" }) : null
        ] })
      ] }),
      D ? /* @__PURE__ */ r(
        "textarea",
        {
          className: "deck-source-editor",
          value: i.content,
          onChange: (d) => M({ ...i, content: d.currentTarget.value }, "raw-source-edit"),
          spellCheck: !1,
          readOnly: e.readOnly
        }
      ) : h ? /* @__PURE__ */ m("div", { className: "deck-studio-editor", children: [
        /* @__PURE__ */ r(
          wt,
          {
            source: i,
            slideId: h.id,
            fields: h.layout.definition.editor.fieldGroups.flatMap((d) => d.fields),
            readOnly: !!e.readOnly,
            onUpdate: M
          }
        ),
        I.allowLayoutChange ? /* @__PURE__ */ m("label", { className: "deck-form-field", children: [
          /* @__PURE__ */ r("span", { children: "Layout" }),
          /* @__PURE__ */ r(
            "select",
            {
              value: h.layout.name,
              onChange: (d) => {
                c != null && c.createVersionBeforeDestructiveAction && P("before-layout-change", "Before layout change"), M(ut(i, h.id, d.currentTarget.value), "layout-change");
              },
              disabled: e.readOnly,
              children: Array.from(t.layouts.values()).map((d) => /* @__PURE__ */ r("option", { value: d.name, children: d.displayName }, d.name))
            }
          )
        ] }) : null
      ] }) : (o == null ? void 0 : o.status) === "invalid" ? /* @__PURE__ */ r(De, { fallback: o.fallback }) : null,
      S.showActiveSlidePreview && h ? /* @__PURE__ */ r("section", { className: "deck-studio-preview", "aria-label": "Active slide preview", children: /* @__PURE__ */ r(ne, { slide: h, target: "screen" }) }) : null
    ] }),
    S.showInspector ? /* @__PURE__ */ m("aside", { className: "deck-studio-inspector", style: { width: S.inspectorWidthPx }, children: [
      S.showDiagnosticsPanel ? /* @__PURE__ */ m("section", { children: [
        /* @__PURE__ */ r("h3", { children: "Diagnostics" }),
        /* @__PURE__ */ r(me, { diagnostics: Ie })
      ] }) : null,
      S.showVersionHistory && c ? /* @__PURE__ */ m("section", { children: [
        /* @__PURE__ */ r("h3", { children: "Versions" }),
        /* @__PURE__ */ r("ul", { className: "deck-version-list", children: k.map((d) => /* @__PURE__ */ m("li", { children: [
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              onClick: () => void Se(d.id),
              disabled: !I.allowVersionRestore || e.readOnly,
              children: d.label ?? d.reason
            }
          ),
          /* @__PURE__ */ r("small", { children: new Date(d.createdAtIso).toLocaleString() })
        ] }, d.id)) })
      ] }) : null
    ] }) : null
  ] });
}
function wt({
  source: e,
  slideId: t,
  fields: n,
  readOnly: a,
  onUpdate: s
}) {
  return /* @__PURE__ */ r("form", { className: "deck-slide-form", children: n.map((i) => /* @__PURE__ */ r(
    St,
    {
      source: e,
      slideId: t,
      field: i,
      readOnly: a,
      onUpdate: s
    },
    `${i.kind}-${"slotName" in i ? i.slotName : i.label}`
  )) });
}
function St({
  source: e,
  slideId: t,
  field: n,
  readOnly: a,
  onUpdate: s
}) {
  if (n.kind === "markdown")
    return /* @__PURE__ */ m("label", { className: "deck-form-field", children: [
      /* @__PURE__ */ r("span", { children: n.label }),
      /* @__PURE__ */ r(
        "textarea",
        {
          rows: n.minRows ?? 4,
          value: gt(e, t, n.slotName),
          onChange: (i) => s(lt(e, t, n.slotName, i.currentTarget.value), "slide-field-edit"),
          readOnly: a
        }
      )
    ] });
  if (n.kind === "image") {
    const i = kt(e, t, n.slotName);
    return /* @__PURE__ */ m("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ r("legend", { children: n.label }),
      /* @__PURE__ */ m("label", { children: [
        /* @__PURE__ */ r("span", { children: "Asset id" }),
        /* @__PURE__ */ r(
          "input",
          {
            value: i.assetId,
            onChange: (o) => s(
              q(e, t, n.slotName, {
                ...i,
                assetId: o.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: a
          }
        )
      ] }),
      /* @__PURE__ */ m("label", { children: [
        /* @__PURE__ */ r("span", { children: "Source" }),
        /* @__PURE__ */ r(
          "input",
          {
            value: i.src,
            onChange: (o) => s(
              q(e, t, n.slotName, {
                ...i,
                src: o.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: a
          }
        )
      ] }),
      /* @__PURE__ */ m("label", { children: [
        /* @__PURE__ */ r("span", { children: "Alt" }),
        /* @__PURE__ */ r(
          "input",
          {
            value: i.alt,
            onChange: (o) => s(
              q(e, t, n.slotName, {
                ...i,
                alt: o.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: a
          }
        )
      ] })
    ] });
  }
  return null;
}
function vt() {
  const e = "deck-runtime-session-id", t = window.sessionStorage.getItem(e);
  if (t)
    return t;
  const n = ye();
  return window.sessionStorage.setItem(e, n), n;
}
function ye() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
export {
  De as DebugDeckFallback,
  Ot as DeckShow,
  Mt as DeckStudio,
  At as PrintDeck,
  Pe as compileDeck,
  st as createDeckRuntime,
  ot as defaultDeckRuntime
};
