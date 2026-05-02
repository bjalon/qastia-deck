import { jsxs as m, jsx as o } from "react/jsx-runtime";
import Ie, { parseDocument as $e } from "yaml";
import { z as c } from "zod";
import Ue from "react-markdown";
import { useState as _, useMemo as K, useCallback as V, useEffect as $, useRef as ye } from "react";
function Be({ fallback: e }) {
  return /* @__PURE__ */ m("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ o("header", { children: /* @__PURE__ */ o("h2", { children: e.title }) }),
    /* @__PURE__ */ o(Ne, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ o("pre", { children: e.source.content })
  ] });
}
function Ne({
  diagnostics: e
}) {
  return /* @__PURE__ */ o("ul", { className: "deck-diagnostics-list", children: e.map((t, n) => /* @__PURE__ */ m("li", { "data-severity": t.severity, children: [
    /* @__PURE__ */ o("strong", { children: t.code }),
    /* @__PURE__ */ o("span", { children: t.message }),
    t.hint ? /* @__PURE__ */ o("small", { children: t.hint }) : null
  ] }, `${t.code}-${n}`)) });
}
const Fe = /```(\w+)?\n([\s\S]*?)```/g, je = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;
function He(e, t) {
  const n = [];
  je.test(e) && n.push({
    code: "MARKDOWN_UNSUPPORTED_HTML",
    severity: "warning",
    message: "Raw HTML is ignored by the default markdown renderer.",
    path: t,
    hint: "Use Markdown syntax or a custom renderer instead."
  });
  const s = [];
  let a = 0;
  for (const r of e.matchAll(Fe)) {
    const [h, u, A] = r, k = r.index ?? 0, D = e.slice(a, k);
    D.trim().length > 0 && s.push({ kind: "markdown", markdown: D }), (u == null ? void 0 : u.toLowerCase()) === "mermaid" ? s.push({ kind: "mermaid", chart: A.trim() }) : s.push({ kind: "code", language: u, code: A.replace(/\n$/, "") }), a = k + h.length;
  }
  const i = e.slice(a);
  return (i.trim().length > 0 || s.length === 0) && s.push({ kind: "markdown", markdown: i }), { nodes: s, diagnostics: n };
}
function M(e, t, n, s, a, i) {
  return {
    code: e,
    severity: t,
    message: n,
    path: s,
    slideId: a,
    hint: i
  };
}
function Ke(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const s = `${n.code}:${n.severity}`, a = t.get(s);
    t.set(s, {
      code: n.code,
      severity: n.severity,
      message: String(a ? Number(a.message) + 1 : 1)
    });
  }
  return Array.from(t.values()).map((n) => ({
    code: n.code,
    severity: n.severity,
    count: Number(n.message)
  }));
}
const Se = c.object({
  in: c.string().default("none"),
  out: c.string().default("none"),
  durationMs: c.number().int().nonnegative().default(0)
}).strict(), Ye = c.object({
  markdown: c.string()
}).strict(), ze = c.object({
  image: c.object({
    assetId: c.string().optional(),
    src: c.string().optional(),
    alt: c.string().optional()
  }).strict()
}).strict(), We = c.object({
  renderer: c.object({
    kind: c.string(),
    props: c.record(c.unknown()).default({})
  }).strict()
}).strict(), Ge = c.union([Ye, ze, We]), Je = c.object({
  version: c.literal(1),
  kind: c.literal("deck"),
  metadata: c.object({
    title: c.string().min(1),
    description: c.string().optional(),
    author: c.string().optional(),
    locale: c.string().optional()
  }).strict(),
  theme: c.object({
    id: c.string().default("default")
  }).strict().default({ id: "default" }),
  defaults: c.object({
    aspectRatio: c.union([c.literal("16:9"), c.literal("4:3")]).default("16:9"),
    transition: Se.default({ in: "none", out: "none", durationMs: 0 })
  }).strict().default({ aspectRatio: "16:9", transition: { in: "none", out: "none", durationMs: 0 } }),
  assets: c.record(
    c.object({
      type: c.literal("image"),
      src: c.string().min(1),
      alt: c.string().min(1)
    }).strict()
  ).default({}),
  slides: c.array(
    c.object({
      id: c.string().min(1),
      layout: c.string().min(1),
      slots: c.record(Ge).default({}),
      transition: Se.optional()
    }).strict()
  ).min(1)
}).strict();
async function Xe(e, t) {
  const n = [];
  let s;
  try {
    const f = $e(e.content, {
      prettyErrors: !1,
      strict: !0,
      uniqueKeys: !0
    });
    for (const p of f.errors)
      n.push(
        M("YAML_SYNTAX_ERROR", "error", p.message, void 0, void 0)
      );
    for (const p of f.warnings)
      n.push(
        M("YAML_PARSE_WARNING", "warning", p.message, void 0, void 0)
      );
    if (f.errors.length > 0)
      return ee(e, n);
    s = f.toJSON();
  } catch (f) {
    return n.push(
      M(
        "YAML_SYNTAX_ERROR",
        "error",
        f instanceof Error ? f.message : "Unable to parse YAML source."
      )
    ), ee(e, n);
  }
  const a = Je.safeParse(s);
  if (!a.success)
    return n.push(...Qe(a.error)), ee(e, n);
  const i = a.data, r = Ze(i, t, n);
  if (n.push(...r), r.some((f) => f.code === "SLIDE_UNKNOWN_LAYOUT"))
    return ee(e, n);
  const u = new Map(Object.entries(i.assets)), A = t.runtime.themes.get(i.theme.id) ?? t.runtime.themes.get("default");
  if (!A)
    throw new Error("Deck runtime must provide at least one theme.");
  t.runtime.themes.has(i.theme.id) || n.push(
    M(
      "SCHEMA_INVALID_VALUE",
      "warning",
      `Unknown theme '${i.theme.id}'. Falling back to '${A.id}'.`,
      ["theme", "id"]
    )
  );
  const k = [];
  for (const [f, p] of i.slides.entries()) {
    const v = t.runtime.layouts.get(p.layout);
    if (!v)
      continue;
    const I = /* @__PURE__ */ new Map();
    for (const [w, P] of Object.entries(p.slots)) {
      const W = await qe(w, P, u, [
        "slides",
        String(f),
        "slots",
        w
      ]);
      I.set(w, W), n.push(
        ...W.diagnostics.map((G) => ({
          ...G,
          slideId: G.slideId ?? p.id
        }))
      );
    }
    for (const w of v.requiredSlots)
      I.has(w) || I.set(w, tt(w));
    k.push({
      id: p.id,
      index: f,
      layout: {
        name: v.name,
        definition: v
      },
      transition: nt(
        p.transition ?? i.defaults.transition,
        t,
        ["slides", String(f), "transition"],
        n
      ),
      slots: I,
      diagnostics: n.filter((w) => w.slideId === p.id)
    });
  }
  const D = {
    version: 1,
    metadata: i.metadata,
    theme: A,
    aspectRatio: i.defaults.aspectRatio,
    assets: u,
    slides: k
  };
  return n.length > 0 ? {
    status: "degraded",
    deck: D,
    diagnostics: n
  } : {
    status: "valid",
    deck: D,
    diagnostics: []
  };
}
function ee(e, t) {
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
function Qe(e) {
  return e.issues.map((t) => {
    const n = t.path.map(String), s = t.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";
    return M(
      s,
      "error",
      t.message,
      n.length > 0 ? n : void 0,
      void 0
    );
  });
}
function Ze(e, t, n) {
  const s = [], a = /* @__PURE__ */ new Set();
  e.slides.length === 0 && s.push(M("DECK_EMPTY_SLIDES", "error", "Deck must contain at least one slide.", ["slides"]));
  for (const [i, r] of e.slides.entries()) {
    a.has(r.id) && s.push(
      M(
        "SLIDE_DUPLICATE_ID",
        "error",
        `Slide id '${r.id}' is already used.`,
        ["slides", String(i), "id"],
        r.id
      )
    ), a.add(r.id);
    const h = t.runtime.layouts.get(r.layout);
    if (!h) {
      s.push(
        M(
          "SLIDE_UNKNOWN_LAYOUT",
          "error",
          `Unknown layout '${r.layout}'.`,
          ["slides", String(i), "layout"],
          r.id,
          "Register the layout in createDeckRuntime or choose a default layout."
        )
      );
      continue;
    }
    for (const u of h.requiredSlots)
      u in r.slots || s.push(
        M(
          "LAYOUT_MISSING_SLOT",
          "error",
          `Layout '${h.name}' requires slot '${u}'.`,
          ["slides", String(i), "slots"],
          r.id
        )
      );
    for (const u of Object.keys(r.slots))
      h.forbiddenSlots.includes(u) && s.push(
        M(
          "LAYOUT_FORBIDDEN_SLOT",
          "warning",
          `Layout '${h.name}' does not render slot '${u}'.`,
          ["slides", String(i), "slots", u],
          r.id
        )
      );
  }
  return n.length > 0, s;
}
async function qe(e, t, n, s) {
  const a = [], i = await et(t, n, s, a);
  return {
    name: e,
    kind: i.kind === "renderer" ? "renderer" : i.kind,
    content: i,
    diagnostics: a
  };
}
async function et(e, t, n, s) {
  if ("markdown" in e) {
    const a = He(e.markdown, n);
    return s.push(...a.diagnostics), {
      kind: "markdown",
      markdown: e.markdown,
      nodes: a.nodes
    };
  }
  if ("image" in e) {
    e.image.assetId && !t.has(e.image.assetId) && s.push(
      M(
        "ASSET_NOT_FOUND",
        "error",
        `Asset '${e.image.assetId}' was not found.`,
        n
      )
    );
    const a = e.image.assetId ? t.get(e.image.assetId) : void 0;
    return {
      kind: "image",
      assetId: e.image.assetId,
      src: (a == null ? void 0 : a.src) ?? e.image.src,
      alt: (a == null ? void 0 : a.alt) ?? e.image.alt
    };
  }
  return {
    kind: "renderer",
    rendererKind: e.renderer.kind,
    props: e.renderer.props
  };
}
function tt(e) {
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
function nt(e, t, n, s) {
  const a = t.runtime.transitions.has(e.in) ? e.in : "none", i = t.runtime.transitions.has(e.out) ? e.out : "none";
  return a !== e.in && s.push(
    M("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.in}'.`, [...n, "in"])
  ), i !== e.out && s.push(
    M("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.out}'.`, [...n, "out"])
  ), {
    in: a,
    out: i,
    durationMs: e.durationMs
  };
}
function he({ slide: e, target: t }) {
  const n = e.layout.definition.component;
  return /* @__PURE__ */ o(
    "section",
    {
      className: "deck-slide-frame",
      "data-slide-id": e.id,
      "data-layout": e.layout.name,
      "data-target": t,
      children: /* @__PURE__ */ o(n, { slide: e, target: t })
    }
  );
}
function Ft({ deck: e }) {
  return /* @__PURE__ */ o("div", { className: `deck-print-root ${e.theme.cssClassName}`, children: e.slides.map((t) => /* @__PURE__ */ o("section", { className: "deck-print-page", "data-slide-id": t.id, children: /* @__PURE__ */ o(he, { slide: t, target: "print" }) }, t.id)) });
}
const st = {
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
function ve(e, t) {
  return `${e}:v1:${t}:current`;
}
function oe(e, t) {
  return `${e}:v1:${t}:draft`;
}
function me(e, t) {
  return `${e}:v1:${t}:versions:index`;
}
function ne(e, t, n) {
  return `${e}:v1:${t}:versions:${n}`;
}
class De {
  async loadCurrent(t) {
    return se(ve(t.namespace, t.deckId));
  }
  async saveCurrent(t) {
    return H(ve(t.namespace, t.deckId), t);
  }
  async saveDraft(t) {
    return H(oe(t.namespace, t.deckId), t);
  }
  async loadDraft(t) {
    return se(oe(t.namespace, t.deckId));
  }
  async clearDraft(t) {
    var n;
    try {
      return (n = Y()) == null || n.removeItem(oe(t.namespace, t.deckId)), { status: "success" };
    } catch (s) {
      return fe(s);
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
    }, s = JSON.stringify(n), a = await H(ne(t.namespace, t.deckId, t.id), n);
    if (a.status === "failed")
      return a;
    const i = await re(t.namespace, t.deckId), r = {
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
          sizeBytes: s.length
        },
        ...i.versions.filter((u) => u.id !== t.id)
      ]
    }, h = at(r, t.limits);
    return H(me(t.namespace, t.deckId), h);
  }
  async listVersions(t) {
    return (await re(t.namespace, t.deckId)).versions;
  }
  async loadVersion(t) {
    return se(
      ne(t.namespace, t.deckId, t.versionId)
    );
  }
  async deleteVersion(t) {
    var n;
    try {
      (n = Y()) == null || n.removeItem(ne(t.namespace, t.deckId, t.versionId));
      const s = await re(t.namespace, t.deckId), a = {
        ...s,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        versions: s.versions.filter((i) => i.id !== t.versionId)
      };
      return H(me(t.namespace, t.deckId), a);
    } catch (s) {
      return fe(s);
    }
  }
}
function at(e, t) {
  var i;
  if (!t)
    return e;
  const n = [...e.versions], s = n.filter((r) => r.reason === "autosave");
  for (; n.length > t.maxVersionsPerDeck; ) {
    const r = de(n, (h) => h.reason === "autosave");
    n.splice(r >= 0 ? r : n.length - 1, 1);
  }
  for (; n.filter((r) => r.reason === "autosave").length > t.maxAutosaveVersionsPerDeck; ) {
    const r = de(n, (h) => h.reason === "autosave");
    if (r < 0)
      break;
    n.splice(r, 1);
  }
  let a = n.reduce((r, h) => r + h.sizeBytes, 0);
  for (; a > t.maxBytesPerDeck && n.length > 0; ) {
    const r = de(n, (A) => A.reason === "autosave"), h = r >= 0 ? r : n.length - 1, [u] = n.splice(h, 1);
    a -= (u == null ? void 0 : u.sizeBytes) ?? 0;
  }
  for (const r of s.filter((h) => !n.some((u) => u.id === h.id)))
    (i = Y()) == null || i.removeItem(ne(e.namespace, e.deckId, r.id));
  return {
    ...e,
    versions: n
  };
}
async function re(e, t) {
  return await se(me(e, t)) ?? {
    deckId: t,
    namespace: e,
    schemaVersion: 1,
    updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
    versions: []
  };
}
function se(e) {
  var t;
  try {
    const n = (t = Y()) == null ? void 0 : t.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function H(e, t) {
  var n;
  try {
    return (n = Y()) == null || n.setItem(e, JSON.stringify(t)), { status: "success" };
  } catch (s) {
    return fe(s);
  }
}
function fe(e) {
  return {
    status: "failed",
    diagnostics: [it(e)]
  };
}
function it(e) {
  return {
    code: "STORAGE_QUOTA_EXCEEDED",
    severity: "error",
    message: e instanceof Error ? e.message : "Unable to write deck state to storage."
  };
}
function Y() {
  if (!(typeof window > "u"))
    return window.localStorage;
}
function de(e, t) {
  for (let n = e.length - 1; n >= 0; n -= 1)
    if (t(e[n]))
      return n;
  return -1;
}
const ot = /^(javascript|data|vbscript):/i, rt = {
  async resolveImage(e) {
    const t = e.assetId ? e.assets.get(e.assetId) : void 0, n = (t == null ? void 0 : t.src) ?? e.src, s = (t == null ? void 0 : t.alt) ?? "";
    if (!n || ot.test(n.trim()))
      throw new Error("Image source is missing or unsafe.");
    return {
      src: n,
      alt: s
    };
  }
};
function O({ content: e }) {
  return e.kind === "image" ? /* @__PURE__ */ o(
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
  ] }) : /* @__PURE__ */ o("div", { className: "deck-markdown", children: e.nodes.map((t, n) => /* @__PURE__ */ o(dt, { node: t }, `${t.kind}-${n}`)) });
}
function dt({ node: e }) {
  return e.kind === "code" ? /* @__PURE__ */ o("pre", { className: "deck-code-block", children: /* @__PURE__ */ o("code", { children: e.code }) }) : e.kind === "mermaid" ? /* @__PURE__ */ o("pre", { className: "deck-mermaid-block", children: e.chart }) : /* @__PURE__ */ o(
    Ue,
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
function ct({ slide: e, target: t }) {
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-cover", "data-target": t, children: [
    /* @__PURE__ */ m("div", { className: "deck-cover-copy", children: [
      /* @__PURE__ */ o(te, { slide: e, name: "eyebrow", className: "deck-cover-eyebrow" }),
      /* @__PURE__ */ o(te, { slide: e, name: "title", className: "deck-cover-title" }),
      /* @__PURE__ */ o(te, { slide: e, name: "subtitle", className: "deck-cover-subtitle" })
    ] }),
    /* @__PURE__ */ o(te, { slide: e, name: "footer", className: "deck-slide-footer" })
  ] });
}
function te({
  slide: e,
  name: t,
  className: n
}) {
  const s = e.slots.get(t);
  return s ? /* @__PURE__ */ o("div", { className: n, "data-slot": t, children: /* @__PURE__ */ o(O, { content: s.content }) }) : null;
}
function lt({ slide: e, target: t }) {
  const n = e.slots.get("image"), s = e.slots.get("caption");
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-image-only", "data-target": t, children: [
    /* @__PURE__ */ o("main", { children: n ? /* @__PURE__ */ o(O, { content: n.content }) : null }),
    /* @__PURE__ */ o("footer", { children: s ? /* @__PURE__ */ o(O, { content: s.content }) : null })
  ] });
}
function ut({ slide: e, target: t }) {
  const n = e.slots.get("title"), s = e.slots.get("body"), a = e.slots.get("footer");
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-title-body", "data-target": t, children: [
    /* @__PURE__ */ o("header", { children: n ? /* @__PURE__ */ o(O, { content: n.content }) : null }),
    /* @__PURE__ */ o("main", { children: s ? /* @__PURE__ */ o(O, { content: s.content }) : null }),
    /* @__PURE__ */ o("footer", { children: a ? /* @__PURE__ */ o(O, { content: a.content }) : null })
  ] });
}
function mt({ slide: e, target: t }) {
  const n = e.slots.get("title"), s = e.slots.get("left"), a = e.slots.get("right"), i = e.slots.get("footer");
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-two-columns", "data-target": t, children: [
    /* @__PURE__ */ o("header", { children: n ? /* @__PURE__ */ o(O, { content: n.content }) : null }),
    /* @__PURE__ */ m("main", { className: "deck-two-columns-grid", children: [
      /* @__PURE__ */ o("section", { children: s ? /* @__PURE__ */ o(O, { content: s.content }) : null }),
      /* @__PURE__ */ o("section", { children: a ? /* @__PURE__ */ o(O, { content: a.content }) : null })
    ] }),
    /* @__PURE__ */ o("footer", { children: i ? /* @__PURE__ */ o(O, { content: i.content }) : null })
  ] });
}
const ft = [
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
    component: ct
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
    component: ut
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
    component: mt
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
    component: lt
  }
];
function ge({ node: e }) {
  return /* @__PURE__ */ o(O, { content: { kind: "markdown", markdown: "", nodes: [e] } });
}
const ht = {
  kind: "markdown",
  render: ge
}, gt = {
  kind: "code",
  render: ge
}, pt = {
  kind: "mermaid",
  render: ge
}, kt = [
  ht,
  gt,
  pt
], ce = {
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
}, wt = [
  {
    id: "default",
    displayName: "Default",
    cssClassName: "deck-theme-default",
    tokens: ce
  },
  {
    id: "fintech-light",
    displayName: "Fintech light",
    cssClassName: "deck-theme-fintech-light",
    tokens: ce
  },
  {
    id: "fintech-dark",
    displayName: "Fintech dark",
    cssClassName: "deck-theme-fintech-dark",
    tokens: {
      ...ce,
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
], yt = [
  { name: "none", displayName: "None" },
  { name: "fade", displayName: "Fade" },
  { name: "slide-left", displayName: "Slide left" },
  { name: "slide-right", displayName: "Slide right" },
  { name: "zoom", displayName: "Zoom" }
];
function St(e = {}) {
  const t = e.layouts ?? ft, n = e.renderers ?? kt, s = e.themes ?? wt, a = e.transitions ?? yt;
  return {
    layouts: new Map(t.map((i) => [i.name, i])),
    renderers: new Map(n.map((i) => [i.kind, i])),
    themes: new Map(s.map((i) => [i.id, i])),
    transitions: new Map(a.map((i) => [i.name, i])),
    assets: rt,
    storage: e.storage ?? new De(),
    pdf: e.pdf ?? st
  };
}
const vt = St();
function jt({
  deck: e,
  initialSlideId: t,
  mode: n = "viewer",
  onAction: s,
  onSlideChange: a
}) {
  const i = Math.max(
    0,
    e.slides.findIndex((f) => f.id === t)
  ), [r, h] = _(i === -1 ? 0 : i), u = e.slides[r] ?? e.slides[0], A = K(
    () => ({
      activeSlideId: u.id,
      activeSlideIndex: r
    }),
    [r, u.id]
  ), k = V(
    (f) => {
      s == null || s(f, A);
    },
    [s, A]
  ), D = V(
    (f, p) => {
      const v = Math.min(Math.max(f, 0), e.slides.length - 1), I = u.id;
      h(v);
      const w = e.slides[v];
      w && w.id !== I && (a == null || a({
        previousSlideId: I,
        activeSlideId: w.id,
        activeSlideIndex: v
      })), k({
        type: v > r ? "next-slide" : "previous-slide",
        origin: p,
        slideId: w == null ? void 0 : w.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [r, u.id, e.slides, k, a]
  );
  return $(() => {
    function f(p) {
      (p.key === "ArrowRight" || p.key === "PageDown" || p.key === " ") && (p.preventDefault(), D(r + 1, "keyboard")), (p.key === "ArrowLeft" || p.key === "PageUp") && (p.preventDefault(), D(r - 1, "keyboard"));
    }
    return window.addEventListener("keydown", f), () => window.removeEventListener("keydown", f);
  }, [r, D]), /* @__PURE__ */ m("div", { className: `deck-screen-root ${e.theme.cssClassName}`, "data-mode": n, children: [
    /* @__PURE__ */ m("div", { className: "deck-show-toolbar", "aria-label": "Deck navigation", children: [
      /* @__PURE__ */ o("button", { type: "button", onClick: () => D(r - 1, "mouse"), disabled: r === 0, children: "Previous" }),
      /* @__PURE__ */ m("span", { children: [
        r + 1,
        " / ",
        e.slides.length
      ] }),
      /* @__PURE__ */ o(
        "button",
        {
          type: "button",
          onClick: () => D(r + 1, "mouse"),
          disabled: r >= e.slides.length - 1,
          children: "Next"
        }
      )
    ] }),
    u ? /* @__PURE__ */ o(he, { slide: u, target: "screen" }) : null
  ] });
}
function T(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n += 1)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, "0");
}
const bt = {
  desktopBreakpointPx: 1024,
  slideRailWidthPx: 260,
  inspectorWidthPx: 340,
  showInspector: !0,
  showActiveSlidePreview: !0,
  showSourceModeToggle: !0,
  showVersionHistory: !0,
  showDiagnosticsPanel: !0,
  density: "comfortable"
}, It = {
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
}, le = {
  adapter: new De(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, Nt = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function z(e) {
  try {
    const t = Ie.parse(e.content);
    return B(t) ? t : null;
  } catch {
    return null;
  }
}
function ae(e, t) {
  return {
    ...e,
    content: Ie.stringify(t, { lineWidth: 0 })
  };
}
function U(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(B);
}
function Dt(e, t, n, s) {
  return pe(e, t, (a) => {
    const i = Me(a);
    i[n] = { markdown: s };
  });
}
function ue(e, t, n, s) {
  return pe(e, t, (a) => {
    const i = Me(a);
    i[n] = {
      image: Vt({
        assetId: s.assetId,
        src: s.src,
        alt: s.alt
      })
    };
  });
}
function At(e, t, n) {
  return pe(e, t, (s) => {
    s.layout = n;
  });
}
function Mt(e, t = "title-body") {
  const n = z(e);
  if (!n)
    return e;
  const s = U(n), a = xe(s, "slide");
  return s.push({
    id: a,
    layout: t,
    slots: {
      title: { markdown: "## New slide" },
      body: { markdown: "" }
    }
  }), n.slides = s, ae(e, n);
}
function xt(e, t) {
  const n = z(e);
  if (!n)
    return e;
  const s = U(n), a = s.findIndex((r) => r.id === t);
  if (a < 0)
    return e;
  const i = structuredClone(s[a]);
  return i.id = xe(s, `${t}-copy`), s.splice(a + 1, 0, i), n.slides = s, ae(e, n);
}
function Ot(e, t) {
  const n = z(e);
  if (!n)
    return e;
  const s = U(n).filter((a) => a.id !== t);
  return n.slides = s.length > 0 ? s : U(n), ae(e, n);
}
function Lt(e, t, n) {
  const s = Ae(e, t, n);
  return B(s) && typeof s.markdown == "string" ? s.markdown : "";
}
function Ct(e, t, n) {
  const s = Ae(e, t, n), a = B(s) && B(s.image) ? s.image : {};
  return {
    assetId: typeof a.assetId == "string" ? a.assetId : "",
    src: typeof a.src == "string" ? a.src : "",
    alt: typeof a.alt == "string" ? a.alt : ""
  };
}
function pe(e, t, n) {
  const s = z(e);
  if (!s)
    return e;
  const a = U(s), i = a.find((r) => r.id === t);
  return i ? (n(i), s.slides = a, ae(e, s)) : e;
}
function Ae(e, t, n) {
  var i;
  const s = z(e);
  if (!s)
    return;
  const a = U(s).find((r) => r.id === t);
  return (i = a == null ? void 0 : a.slots) == null ? void 0 : i[n];
}
function Me(e) {
  return B(e.slots) || (e.slots = {}), e.slots;
}
function xe(e, t) {
  const n = new Set(e.map((i) => i.id).filter((i) => !!i));
  let s = be(t), a = 2;
  for (; n.has(s); )
    s = `${be(t)}-${a}`, a += 1;
  return s;
}
function be(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function Vt(e) {
  return Object.fromEntries(
    Object.entries(e).filter((t) => !!t[1])
  );
}
function B(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Ht(e) {
  const {
    autosave: t,
    deckId: n,
    features: s,
    initialSelectedSlideId: a,
    layout: i,
    locale: r = "fr-FR",
    namespace: h,
    onChange: u,
    onCompile: A,
    onError: k,
    onRestoreVersion: D,
    onSave: f,
    onSelectedSlideChange: p,
    readOnly: v,
    storage: I
  } = e, w = e.runtime ?? vt, P = e.mode === "controlled", [W, G] = _(
    P ? e.value : e.initialValue
  ), S = P ? e.value : W, [g, Le] = _(null), [x, J] = _(
    a
  ), [ke, Ce] = _(!1), [Ve, Pe] = _([]), X = ye(A), Q = ye(k);
  X.current = A, Q.current = k;
  const C = K(
    () => ({ ...bt, ...i }),
    [i]
  ), R = K(
    () => ({ ...It, ...s }),
    [s]
  ), l = K(
    () => I === !1 ? void 0 : {
      ...le,
      namespace: h ?? (I == null ? void 0 : I.namespace) ?? le.namespace,
      adapter: (I == null ? void 0 : I.adapter) ?? w.storage ?? le.adapter,
      ...I
    },
    [h, w.storage, I]
  ), ie = K(
    () => t === !1 ? void 0 : { ...Nt, ...t },
    [t]
  ), b = (g == null ? void 0 : g.status) === "valid" || (g == null ? void 0 : g.status) === "degraded" ? g.deck : void 0, y = (b == null ? void 0 : b.slides.find((d) => d.id === x)) ?? (b == null ? void 0 : b.slides[0]), F = V(
    (d, N, L) => {
      const q = {
        reason: N,
        deckId: n,
        selectedSlideId: L ?? x,
        sourceHash: T(d.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      P || G(d), u == null || u(d, q);
    },
    [P, n, u, x]
  );
  $(() => {
    let d = !1;
    return Xe(S, {
      runtime: w
    }).then((N) => {
      var L;
      d || (Le(N), (L = X.current) == null || L.call(X, N));
    }).catch((N) => {
      var L;
      (L = Q.current) == null || L.call(Q, {
        message: N instanceof Error ? N.message : "Deck compilation failed.",
        cause: N
      });
    }), () => {
      d = !0;
    };
  }, [r, w, S]), $(() => {
    if (!b || x)
      return;
    const d = b.slides[0];
    d && J(d.id);
  }, [b, x]), $(() => {
    l != null && l.recoverOnMount && l.adapter.loadDraft({ deckId: n, namespace: l.namespace }).then((d) => {
      !d || d.sourceHash === T(S.content) || (J(d.selectedSlideId), F(d.source, "crash-recovery", d.selectedSlideId));
    }).catch((d) => {
      k == null || k({
        message: d instanceof Error ? d.message : "Unable to recover deck draft.",
        cause: d
      });
    });
  }, [n, k, F, S.content, l]), $(() => {
    if (!l || !ie || !l.saveDraftOnChange)
      return;
    const d = window.setTimeout(() => {
      l.adapter.saveDraft({
        deckId: n,
        namespace: l.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: Et(),
        source: S,
        sourceHash: T(S.content),
        selectedSlideId: x,
        compilerStatus: (g == null ? void 0 : g.status) ?? "invalid"
      });
    }, ie.draftDebounceMs);
    return () => window.clearTimeout(d);
  }, [ie, g, n, x, S, l]);
  const Z = V(() => {
    l && l.adapter.listVersions({ deckId: n, namespace: l.namespace }).then(Pe).catch((d) => {
      k == null || k({
        message: d instanceof Error ? d.message : "Unable to list deck versions.",
        cause: d
      });
    });
  }, [n, k, l]);
  $(() => {
    Z();
  }, [Z]);
  const j = V(
    async (d, N) => {
      var we;
      if (!l)
        return;
      const L = (g == null ? void 0 : g.diagnostics) ?? [], q = await l.adapter.createVersion({
        id: Oe(),
        deckId: n,
        namespace: l.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: N,
        reason: d,
        source: S,
        sourceHash: T(S.content),
        selectedSlideId: x,
        compilerStatus: (g == null ? void 0 : g.status) ?? "invalid",
        diagnosticsSummary: Ke(L),
        limits: {
          maxVersionsPerDeck: l.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: l.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: l.maxBytesPerDeck
        }
      });
      q.status === "failed" && (k == null || k({ message: ((we = q.diagnostics[0]) == null ? void 0 : we.message) ?? "Unable to save deck version." })), Z();
    },
    [g, n, k, Z, x, S, l]
  ), Re = V(() => {
    l && (l.adapter.saveCurrent({
      deckId: n,
      namespace: l.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: S,
      sourceHash: T(S.content),
      selectedSlideId: x
    }), l.createVersionOnManualSave && j("manual", "Manual save"), f == null || f({
      deckId: n,
      sourceHash: T(S.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [j, n, f, x, S, l]), Ee = V(
    async (d) => {
      if (!l)
        return;
      l.createVersionBeforeDestructiveAction && await j("before-version-restore", "Before restore");
      const N = await l.adapter.loadVersion({
        deckId: n,
        namespace: l.namespace,
        versionId: d
      });
      N && (J(N.selectedSlideId), F(N.source, "version-restore", N.selectedSlideId), D == null || D({
        deckId: n,
        versionId: d,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [j, n, D, F, l]
  );
  function Te(d) {
    J(d), p == null || p({ deckId: n, slideId: d });
  }
  function E(d, N) {
    F(d, N, y == null ? void 0 : y.id);
  }
  const _e = (g == null ? void 0 : g.diagnostics) ?? [];
  return /* @__PURE__ */ m("div", { className: "deck-studio-root", "data-density": C.density, children: [
    /* @__PURE__ */ m("aside", { className: "deck-studio-rail", style: { width: C.slideRailWidthPx }, children: [
      /* @__PURE__ */ m("header", { children: [
        /* @__PURE__ */ o("strong", { children: (b == null ? void 0 : b.metadata.title) ?? "Deck" }),
        R.allowAddSlide ? /* @__PURE__ */ o("button", { type: "button", onClick: () => E(Mt(S), "slide-add"), disabled: v, children: "Add" }) : null
      ] }),
      /* @__PURE__ */ o("nav", { "aria-label": "Slides", children: b == null ? void 0 : b.slides.map((d) => /* @__PURE__ */ m(
        "button",
        {
          type: "button",
          className: d.id === (y == null ? void 0 : y.id) ? "is-active" : void 0,
          onClick: () => Te(d.id),
          children: [
            /* @__PURE__ */ o("span", { children: d.index + 1 }),
            /* @__PURE__ */ o("span", { children: d.id }),
            /* @__PURE__ */ o("small", { children: d.layout.name })
          ]
        },
        d.id
      )) })
    ] }),
    /* @__PURE__ */ m("main", { className: "deck-studio-main", children: [
      /* @__PURE__ */ m("header", { className: "deck-studio-header", children: [
        /* @__PURE__ */ m("div", { children: [
          /* @__PURE__ */ o("strong", { children: (y == null ? void 0 : y.id) ?? "Source" }),
          y ? /* @__PURE__ */ o("small", { children: y.layout.definition.displayName }) : null
        ] }),
        /* @__PURE__ */ m("div", { className: "deck-studio-actions", children: [
          C.showSourceModeToggle && R.allowRawSourceEdit ? /* @__PURE__ */ o("button", { type: "button", onClick: () => Ce((d) => !d), children: ke ? "Form" : "YAML" }) : null,
          R.allowDuplicateSlide && y ? /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: () => E(xt(S, y.id), "slide-duplicate"),
              disabled: v,
              children: "Duplicate"
            }
          ) : null,
          R.allowDeleteSlide && y ? /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: () => E(Ot(S, y.id), "slide-delete"),
              disabled: v || ((b == null ? void 0 : b.slides.length) ?? 0) <= 1,
              children: "Delete"
            }
          ) : null,
          l ? /* @__PURE__ */ o("button", { type: "button", onClick: Re, disabled: v, children: "Save" }) : null
        ] })
      ] }),
      ke ? /* @__PURE__ */ o(
        "textarea",
        {
          className: "deck-source-editor",
          value: S.content,
          onChange: (d) => E({ ...S, content: d.currentTarget.value }, "raw-source-edit"),
          spellCheck: !1,
          readOnly: v
        }
      ) : y ? /* @__PURE__ */ m("div", { className: "deck-studio-editor", children: [
        /* @__PURE__ */ o(
          Pt,
          {
            source: S,
            slideId: y.id,
            fields: y.layout.definition.editor.fieldGroups.flatMap((d) => d.fields),
            readOnly: !!v,
            onUpdate: E
          }
        ),
        R.allowLayoutChange ? /* @__PURE__ */ m("label", { className: "deck-form-field", children: [
          /* @__PURE__ */ o("span", { children: "Layout" }),
          /* @__PURE__ */ o(
            "select",
            {
              value: y.layout.name,
              onChange: (d) => {
                l != null && l.createVersionBeforeDestructiveAction && j("before-layout-change", "Before layout change"), E(At(S, y.id, d.currentTarget.value), "layout-change");
              },
              disabled: v,
              children: Array.from(w.layouts.values()).map((d) => /* @__PURE__ */ o("option", { value: d.name, children: d.displayName }, d.name))
            }
          )
        ] }) : null
      ] }) : (g == null ? void 0 : g.status) === "invalid" ? /* @__PURE__ */ o(Be, { fallback: g.fallback }) : null,
      C.showActiveSlidePreview && y ? /* @__PURE__ */ o("section", { className: "deck-studio-preview", "aria-label": "Active slide preview", children: /* @__PURE__ */ o(he, { slide: y, target: "screen" }) }) : null
    ] }),
    C.showInspector ? /* @__PURE__ */ m("aside", { className: "deck-studio-inspector", style: { width: C.inspectorWidthPx }, children: [
      C.showDiagnosticsPanel ? /* @__PURE__ */ m("section", { children: [
        /* @__PURE__ */ o("h3", { children: "Diagnostics" }),
        /* @__PURE__ */ o(Ne, { diagnostics: _e })
      ] }) : null,
      C.showVersionHistory && l ? /* @__PURE__ */ m("section", { children: [
        /* @__PURE__ */ o("h3", { children: "Versions" }),
        /* @__PURE__ */ o("ul", { className: "deck-version-list", children: Ve.map((d) => /* @__PURE__ */ m("li", { children: [
          /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: () => void Ee(d.id),
              disabled: !R.allowVersionRestore || v,
              children: d.label ?? d.reason
            }
          ),
          /* @__PURE__ */ o("small", { children: new Date(d.createdAtIso).toLocaleString() })
        ] }, d.id)) })
      ] }) : null
    ] }) : null
  ] });
}
function Pt({
  source: e,
  slideId: t,
  fields: n,
  readOnly: s,
  onUpdate: a
}) {
  return /* @__PURE__ */ o("form", { className: "deck-slide-form", children: n.map((i) => /* @__PURE__ */ o(
    Rt,
    {
      source: e,
      slideId: t,
      field: i,
      readOnly: s,
      onUpdate: a
    },
    `${i.kind}-${"slotName" in i ? i.slotName : i.label}`
  )) });
}
function Rt({
  source: e,
  slideId: t,
  field: n,
  readOnly: s,
  onUpdate: a
}) {
  if (n.kind === "markdown")
    return /* @__PURE__ */ m("label", { className: "deck-form-field", children: [
      /* @__PURE__ */ o("span", { children: n.label }),
      /* @__PURE__ */ o(
        "textarea",
        {
          rows: n.minRows ?? 4,
          value: Lt(e, t, n.slotName),
          onChange: (i) => a(Dt(e, t, n.slotName, i.currentTarget.value), "slide-field-edit"),
          readOnly: s
        }
      )
    ] });
  if (n.kind === "image") {
    const i = Ct(e, t, n.slotName);
    return /* @__PURE__ */ m("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ o("legend", { children: n.label }),
      /* @__PURE__ */ m("label", { children: [
        /* @__PURE__ */ o("span", { children: "Asset id" }),
        /* @__PURE__ */ o(
          "input",
          {
            value: i.assetId,
            onChange: (r) => a(
              ue(e, t, n.slotName, {
                ...i,
                assetId: r.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: s
          }
        )
      ] }),
      /* @__PURE__ */ m("label", { children: [
        /* @__PURE__ */ o("span", { children: "Source" }),
        /* @__PURE__ */ o(
          "input",
          {
            value: i.src,
            onChange: (r) => a(
              ue(e, t, n.slotName, {
                ...i,
                src: r.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: s
          }
        )
      ] }),
      /* @__PURE__ */ m("label", { children: [
        /* @__PURE__ */ o("span", { children: "Alt" }),
        /* @__PURE__ */ o(
          "input",
          {
            value: i.alt,
            onChange: (r) => a(
              ue(e, t, n.slotName, {
                ...i,
                alt: r.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: s
          }
        )
      ] })
    ] });
  }
  return null;
}
function Et() {
  const e = "deck-runtime-session-id", t = window.sessionStorage.getItem(e);
  if (t)
    return t;
  const n = Oe();
  return window.sessionStorage.setItem(e, n), n;
}
function Oe() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
export {
  Be as DebugDeckFallback,
  jt as DeckShow,
  Ht as DeckStudio,
  Ft as PrintDeck,
  Xe as compileDeck,
  St as createDeckRuntime,
  vt as defaultDeckRuntime
};
