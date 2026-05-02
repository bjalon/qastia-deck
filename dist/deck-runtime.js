import { jsxs as h, jsx as i } from "react/jsx-runtime";
import Pe, { parseDocument as $e } from "yaml";
import { z as u } from "zod";
import Ue from "react-markdown";
import { useRef as le, useState as F, useCallback as E, useEffect as _, useMemo as Z } from "react";
function Be({ fallback: e }) {
  return /* @__PURE__ */ h("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ i("header", { children: /* @__PURE__ */ i("h2", { children: e.title }) }),
    /* @__PURE__ */ i(Ce, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ i("pre", { children: e.source.content })
  ] });
}
function Ce({
  diagnostics: e
}) {
  return /* @__PURE__ */ i("ul", { className: "deck-diagnostics-list", children: e.map((t, n) => /* @__PURE__ */ h("li", { "data-severity": t.severity, children: [
    /* @__PURE__ */ i("strong", { children: t.code }),
    /* @__PURE__ */ i("span", { children: t.message }),
    t.hint ? /* @__PURE__ */ i("small", { children: t.hint }) : null
  ] }, `${t.code}-${n}`)) });
}
const Fe = /```(\w+)?\n([\s\S]*?)```/g, He = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;
function je(e, t) {
  const n = [];
  He.test(e) && n.push({
    code: "MARKDOWN_UNSUPPORTED_HTML",
    severity: "warning",
    message: "Raw HTML is ignored by the default markdown renderer.",
    path: t,
    hint: "Use Markdown syntax or a custom renderer instead."
  });
  const a = [];
  let s = 0;
  for (const r of e.matchAll(Fe)) {
    const [g, c, D] = r, k = r.index ?? 0, N = e.slice(s, k);
    N.trim().length > 0 && a.push({ kind: "markdown", markdown: N }), (c == null ? void 0 : c.toLowerCase()) === "mermaid" ? a.push({ kind: "mermaid", chart: D.trim() }) : a.push({ kind: "code", language: c, code: D.replace(/\n$/, "") }), s = k + g.length;
  }
  const o = e.slice(s);
  return (o.trim().length > 0 || a.length === 0) && a.push({ kind: "markdown", markdown: o }), { nodes: a, diagnostics: n };
}
function R(e, t, n, a, s, o) {
  return {
    code: e,
    severity: t,
    message: n,
    path: a,
    slideId: s,
    hint: o
  };
}
function Ke(e) {
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
const Ne = u.object({
  in: u.string().default("none"),
  out: u.string().default("none"),
  durationMs: u.number().int().nonnegative().default(0)
}).strict(), Ye = u.object({
  markdown: u.string()
}).strict(), ze = u.object({
  image: u.object({
    assetId: u.string().optional(),
    src: u.string().optional(),
    alt: u.string().optional()
  }).strict()
}).strict(), We = u.object({
  renderer: u.object({
    kind: u.string(),
    props: u.record(u.unknown()).default({})
  }).strict()
}).strict(), Ge = u.union([Ye, ze, We]), Je = u.object({
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
    transition: Ne.default({ in: "none", out: "none", durationMs: 0 })
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
      slots: u.record(Ge).default({}),
      transition: Ne.optional()
    }).strict()
  ).min(1)
}).strict();
async function Xe(e, t) {
  const n = [];
  let a;
  try {
    const w = $e(e.content, {
      prettyErrors: !1,
      strict: !0,
      uniqueKeys: !0
    });
    for (const P of w.errors)
      n.push(
        R("YAML_SYNTAX_ERROR", "error", P.message, void 0, void 0)
      );
    for (const P of w.warnings)
      n.push(
        R("YAML_PARSE_WARNING", "warning", P.message, void 0, void 0)
      );
    if (w.errors.length > 0)
      return ie(e, n);
    a = w.toJSON();
  } catch (w) {
    return n.push(
      R(
        "YAML_SYNTAX_ERROR",
        "error",
        w instanceof Error ? w.message : "Unable to parse YAML source."
      )
    ), ie(e, n);
  }
  const s = Je.safeParse(a);
  if (!s.success)
    return n.push(...Qe(s.error)), ie(e, n);
  const o = s.data, r = Ze(o, t, n);
  if (n.push(...r), r.some((w) => w.code === "SLIDE_UNKNOWN_LAYOUT"))
    return ie(e, n);
  const c = new Map(Object.entries(o.assets)), D = t.runtime.themes.get(o.theme.id) ?? t.runtime.themes.get("default");
  if (!D)
    throw new Error("Deck runtime must provide at least one theme.");
  t.runtime.themes.has(o.theme.id) || n.push(
    R(
      "SCHEMA_INVALID_VALUE",
      "warning",
      `Unknown theme '${o.theme.id}'. Falling back to '${D.id}'.`,
      ["theme", "id"]
    )
  );
  const k = [];
  for (const [w, P] of o.slides.entries()) {
    const y = t.runtime.layouts.get(P.layout);
    if (!y)
      continue;
    const l = /* @__PURE__ */ new Map();
    for (const [v, C] of Object.entries(P.slots)) {
      const V = await qe(v, C, c, [
        "slides",
        String(w),
        "slots",
        v
      ]);
      l.set(v, V), n.push(
        ...V.diagnostics.map(($) => ({
          ...$,
          slideId: $.slideId ?? P.id
        }))
      );
    }
    for (const v of y.requiredSlots)
      l.has(v) || l.set(v, tt(v));
    k.push({
      id: P.id,
      index: w,
      layout: {
        name: y.name,
        definition: y
      },
      transition: nt(
        P.transition ?? o.defaults.transition,
        t,
        ["slides", String(w), "transition"],
        n
      ),
      slots: l,
      diagnostics: n.filter((v) => v.slideId === P.id)
    });
  }
  const N = {
    version: 1,
    metadata: o.metadata,
    theme: D,
    aspectRatio: o.defaults.aspectRatio,
    assets: c,
    slides: k
  };
  return n.length > 0 ? {
    status: "degraded",
    deck: N,
    diagnostics: n
  } : {
    status: "valid",
    deck: N,
    diagnostics: []
  };
}
function ie(e, t) {
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
    const n = t.path.map(String), a = t.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";
    return R(
      a,
      "error",
      t.message,
      n.length > 0 ? n : void 0,
      void 0
    );
  });
}
function Ze(e, t, n) {
  const a = [], s = /* @__PURE__ */ new Set();
  e.slides.length === 0 && a.push(R("DECK_EMPTY_SLIDES", "error", "Deck must contain at least one slide.", ["slides"]));
  for (const [o, r] of e.slides.entries()) {
    s.has(r.id) && a.push(
      R(
        "SLIDE_DUPLICATE_ID",
        "error",
        `Slide id '${r.id}' is already used.`,
        ["slides", String(o), "id"],
        r.id
      )
    ), s.add(r.id);
    const g = t.runtime.layouts.get(r.layout);
    if (!g) {
      a.push(
        R(
          "SLIDE_UNKNOWN_LAYOUT",
          "error",
          `Unknown layout '${r.layout}'.`,
          ["slides", String(o), "layout"],
          r.id,
          "Register the layout in createDeckRuntime or choose a default layout."
        )
      );
      continue;
    }
    for (const c of g.requiredSlots)
      c in r.slots || a.push(
        R(
          "LAYOUT_MISSING_SLOT",
          "error",
          `Layout '${g.name}' requires slot '${c}'.`,
          ["slides", String(o), "slots"],
          r.id
        )
      );
    for (const c of Object.keys(r.slots))
      g.forbiddenSlots.includes(c) && a.push(
        R(
          "LAYOUT_FORBIDDEN_SLOT",
          "warning",
          `Layout '${g.name}' does not render slot '${c}'.`,
          ["slides", String(o), "slots", c],
          r.id
        )
      );
  }
  return n.length > 0, a;
}
async function qe(e, t, n, a) {
  const s = [], o = await et(t, n, a, s);
  return {
    name: e,
    kind: o.kind === "renderer" ? "renderer" : o.kind,
    content: o,
    diagnostics: s
  };
}
async function et(e, t, n, a) {
  if ("markdown" in e) {
    const s = je(e.markdown, n);
    return a.push(...s.diagnostics), {
      kind: "markdown",
      markdown: e.markdown,
      nodes: s.nodes
    };
  }
  if ("image" in e) {
    e.image.assetId && !t.has(e.image.assetId) && a.push(
      R(
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
function nt(e, t, n, a) {
  const s = t.runtime.transitions.has(e.in) ? e.in : "none", o = t.runtime.transitions.has(e.out) ? e.out : "none";
  return s !== e.in && a.push(
    R("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.in}'.`, [...n, "in"])
  ), o !== e.out && a.push(
    R("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.out}'.`, [...n, "out"])
  ), {
    in: s,
    out: o,
    durationMs: e.durationMs
  };
}
function ce({ slide: e, target: t }) {
  const n = e.layout.definition.component;
  return /* @__PURE__ */ i(
    "section",
    {
      className: "deck-slide-frame",
      "data-slide-id": e.id,
      "data-layout": e.layout.name,
      "data-target": t,
      children: /* @__PURE__ */ i(n, { slide: e, target: t })
    }
  );
}
function jt({ deck: e }) {
  return /* @__PURE__ */ i("div", { className: `deck-print-root ${e.theme.cssClassName}`, children: e.slides.map((t) => /* @__PURE__ */ i("section", { className: "deck-print-page", "data-slide-id": t.id, children: /* @__PURE__ */ i(ce, { slide: t, target: "print" }) }, t.id)) });
}
const at = {
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
function De(e, t) {
  return `${e}:v1:${t}:current`;
}
function fe(e, t) {
  return `${e}:v1:${t}:draft`;
}
function ye(e, t) {
  return `${e}:v1:${t}:versions:index`;
}
function re(e, t, n) {
  return `${e}:v1:${t}:versions:${n}`;
}
class Me {
  async loadCurrent(t) {
    return de(De(t.namespace, t.deckId));
  }
  async saveCurrent(t) {
    return Q(De(t.namespace, t.deckId), t);
  }
  async saveDraft(t) {
    return Q(fe(t.namespace, t.deckId), t);
  }
  async loadDraft(t) {
    return de(fe(t.namespace, t.deckId));
  }
  async clearDraft(t) {
    var n;
    try {
      return (n = q()) == null || n.removeItem(fe(t.namespace, t.deckId)), { status: "success" };
    } catch (a) {
      return be(a);
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
    }, a = JSON.stringify(n), s = await Q(re(t.namespace, t.deckId, t.id), n);
    if (s.status === "failed")
      return s;
    const o = await he(t.namespace, t.deckId), r = {
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
        ...o.versions.filter((c) => c.id !== t.id)
      ]
    }, g = st(r, t.limits);
    return Q(ye(t.namespace, t.deckId), g);
  }
  async listVersions(t) {
    return (await he(t.namespace, t.deckId)).versions;
  }
  async loadVersion(t) {
    return de(
      re(t.namespace, t.deckId, t.versionId)
    );
  }
  async deleteVersion(t) {
    var n;
    try {
      (n = q()) == null || n.removeItem(re(t.namespace, t.deckId, t.versionId));
      const a = await he(t.namespace, t.deckId), s = {
        ...a,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        versions: a.versions.filter((o) => o.id !== t.versionId)
      };
      return Q(ye(t.namespace, t.deckId), s);
    } catch (a) {
      return be(a);
    }
  }
}
function st(e, t) {
  var o;
  if (!t)
    return e;
  const n = [...e.versions], a = n.filter((r) => r.reason === "autosave");
  for (; n.length > t.maxVersionsPerDeck; ) {
    const r = ge(n, (g) => g.reason === "autosave");
    n.splice(r >= 0 ? r : n.length - 1, 1);
  }
  for (; n.filter((r) => r.reason === "autosave").length > t.maxAutosaveVersionsPerDeck; ) {
    const r = ge(n, (g) => g.reason === "autosave");
    if (r < 0)
      break;
    n.splice(r, 1);
  }
  let s = n.reduce((r, g) => r + g.sizeBytes, 0);
  for (; s > t.maxBytesPerDeck && n.length > 0; ) {
    const r = ge(n, (D) => D.reason === "autosave"), g = r >= 0 ? r : n.length - 1, [c] = n.splice(g, 1);
    s -= (c == null ? void 0 : c.sizeBytes) ?? 0;
  }
  for (const r of a.filter((g) => !n.some((c) => c.id === g.id)))
    (o = q()) == null || o.removeItem(re(e.namespace, e.deckId, r.id));
  return {
    ...e,
    versions: n
  };
}
async function he(e, t) {
  return await de(ye(e, t)) ?? {
    deckId: t,
    namespace: e,
    schemaVersion: 1,
    updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
    versions: []
  };
}
function de(e) {
  var t;
  try {
    const n = (t = q()) == null ? void 0 : t.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function Q(e, t) {
  var n;
  try {
    return (n = q()) == null || n.setItem(e, JSON.stringify(t)), { status: "success" };
  } catch (a) {
    return be(a);
  }
}
function be(e) {
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
function q() {
  if (!(typeof window > "u"))
    return window.localStorage;
}
function ge(e, t) {
  for (let n = e.length - 1; n >= 0; n -= 1)
    if (t(e[n]))
      return n;
  return -1;
}
const ot = /^(javascript|data|vbscript):/i, rt = {
  async resolveImage(e) {
    const t = e.assetId ? e.assets.get(e.assetId) : void 0, n = (t == null ? void 0 : t.src) ?? e.src, a = (t == null ? void 0 : t.alt) ?? "";
    if (!n || ot.test(n.trim()))
      throw new Error("Image source is missing or unsafe.");
    return {
      src: n,
      alt: a
    };
  }
};
function O({ content: e }) {
  return e.kind === "image" ? /* @__PURE__ */ i(
    "img",
    {
      className: "deck-slot-image",
      src: e.src ?? "",
      alt: e.alt ?? "",
      loading: "lazy"
    }
  ) : e.kind === "renderer" ? /* @__PURE__ */ h("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    e.rendererKind
  ] }) : /* @__PURE__ */ i("div", { className: "deck-markdown", children: e.nodes.map((t, n) => /* @__PURE__ */ i(dt, { node: t }, `${t.kind}-${n}`)) });
}
function dt({ node: e }) {
  return e.kind === "code" ? /* @__PURE__ */ i("pre", { className: "deck-code-block", children: /* @__PURE__ */ i("code", { children: e.code }) }) : e.kind === "mermaid" ? /* @__PURE__ */ i("pre", { className: "deck-mermaid-block", children: e.chart }) : /* @__PURE__ */ i(
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
function lt({ slide: e, target: t }) {
  return /* @__PURE__ */ h("article", { className: "deck-layout deck-layout-cover", "data-target": t, children: [
    /* @__PURE__ */ h("div", { className: "deck-cover-copy", children: [
      /* @__PURE__ */ i(oe, { slide: e, name: "eyebrow", className: "deck-cover-eyebrow" }),
      /* @__PURE__ */ i(oe, { slide: e, name: "title", className: "deck-cover-title" }),
      /* @__PURE__ */ i(oe, { slide: e, name: "subtitle", className: "deck-cover-subtitle" })
    ] }),
    /* @__PURE__ */ i(oe, { slide: e, name: "footer", className: "deck-slide-footer" })
  ] });
}
function oe({
  slide: e,
  name: t,
  className: n
}) {
  const a = e.slots.get(t);
  return a ? /* @__PURE__ */ i("div", { className: n, "data-slot": t, children: /* @__PURE__ */ i(O, { content: a.content }) }) : null;
}
function ct({ slide: e, target: t }) {
  const n = e.slots.get("image"), a = e.slots.get("caption");
  return /* @__PURE__ */ h("article", { className: "deck-layout deck-layout-image-only", "data-target": t, children: [
    /* @__PURE__ */ i("main", { children: n ? /* @__PURE__ */ i(O, { content: n.content }) : null }),
    /* @__PURE__ */ i("footer", { children: a ? /* @__PURE__ */ i(O, { content: a.content }) : null })
  ] });
}
function ut({ slide: e, target: t }) {
  const n = e.slots.get("title"), a = e.slots.get("body"), s = e.slots.get("footer");
  return /* @__PURE__ */ h("article", { className: "deck-layout deck-layout-title-body", "data-target": t, children: [
    /* @__PURE__ */ i("header", { children: n ? /* @__PURE__ */ i(O, { content: n.content }) : null }),
    /* @__PURE__ */ i("main", { children: a ? /* @__PURE__ */ i(O, { content: a.content }) : null }),
    /* @__PURE__ */ i("footer", { children: s ? /* @__PURE__ */ i(O, { content: s.content }) : null })
  ] });
}
function mt({ slide: e, target: t }) {
  const n = e.slots.get("title"), a = e.slots.get("left"), s = e.slots.get("right"), o = e.slots.get("footer");
  return /* @__PURE__ */ h("article", { className: "deck-layout deck-layout-two-columns", "data-target": t, children: [
    /* @__PURE__ */ i("header", { children: n ? /* @__PURE__ */ i(O, { content: n.content }) : null }),
    /* @__PURE__ */ h("main", { className: "deck-two-columns-grid", children: [
      /* @__PURE__ */ i("section", { children: a ? /* @__PURE__ */ i(O, { content: a.content }) : null }),
      /* @__PURE__ */ i("section", { children: s ? /* @__PURE__ */ i(O, { content: s.content }) : null })
    ] }),
    /* @__PURE__ */ i("footer", { children: o ? /* @__PURE__ */ i(O, { content: o.content }) : null })
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
    component: lt
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
    component: ct
  }
];
function ve({ node: e }) {
  return /* @__PURE__ */ i(O, { content: { kind: "markdown", markdown: "", nodes: [e] } });
}
const ht = {
  kind: "markdown",
  render: ve
}, gt = {
  kind: "code",
  render: ve
}, pt = {
  kind: "mermaid",
  render: ve
}, kt = [
  ht,
  gt,
  pt
], pe = {
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
    tokens: pe
  },
  {
    id: "fintech-light",
    displayName: "Fintech light",
    cssClassName: "deck-theme-fintech-light",
    tokens: pe
  },
  {
    id: "fintech-dark",
    displayName: "Fintech dark",
    cssClassName: "deck-theme-fintech-dark",
    tokens: {
      ...pe,
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
function bt(e = {}) {
  const t = e.layouts ?? ft, n = e.renderers ?? kt, a = e.themes ?? wt, s = e.transitions ?? yt;
  return {
    layouts: new Map(t.map((o) => [o.name, o])),
    renderers: new Map(n.map((o) => [o.kind, o])),
    themes: new Map(a.map((o) => [o.id, o])),
    transitions: new Map(s.map((o) => [o.name, o])),
    assets: rt,
    storage: e.storage ?? new Me(),
    pdf: e.pdf ?? at
  };
}
const vt = bt();
function St({
  activeIndex: e,
  canOpenPresentation: t,
  onNext: n,
  onOpenPresentation: a,
  onPresentationControlsModeChange: s,
  onPrevious: o,
  presentationButtonLabel: r,
  presentationControlsMode: g,
  presentationUnavailableLabel: c,
  showPresentationButton: D,
  showPresentationControlsModeSelect: k,
  slideCount: N
}) {
  return /* @__PURE__ */ h("div", { className: "deck-show-toolbar", "aria-label": "Deck navigation", children: [
    D ? /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        onClick: a,
        disabled: !t,
        title: t ? r : c,
        children: r
      }
    ) : null,
    D && k ? /* @__PURE__ */ h("label", { className: "deck-presentation-mode-select", children: [
      /* @__PURE__ */ i("span", { children: "Presentation controls" }),
      /* @__PURE__ */ h(
        "select",
        {
          value: g,
          onChange: (w) => s(w.currentTarget.value),
          children: [
            /* @__PURE__ */ i("option", { value: "visible", children: "Boutons visibles" }),
            /* @__PURE__ */ i("option", { value: "hidden", children: "Boutons hidden" }),
            /* @__PURE__ */ i("option", { value: "auto", children: "Auto" })
          ]
        }
      )
    ] }) : null,
    /* @__PURE__ */ i("button", { type: "button", onClick: o, disabled: e === 0, children: "Previous" }),
    /* @__PURE__ */ h("span", { children: [
      e + 1,
      " / ",
      N
    ] }),
    /* @__PURE__ */ i("button", { type: "button", onClick: n, disabled: e >= N - 1, children: "Next" })
  ] });
}
function It({
  activeIndex: e,
  autoHideDelayMs: t,
  closeOnEscape: n,
  controlsMode: a,
  deck: s,
  hintText: o,
  onClose: r,
  onNext: g,
  onPrevious: c,
  requestBrowserFullscreen: D,
  showHintWhenControlsHidden: k
}) {
  const N = le(null), w = le(void 0), [P, y] = F(!0), l = s.slides[e] ?? s.slides[0], v = E(() => {
    const f = N.current;
    document.fullscreenElement === f && document.exitFullscreen().catch(() => {
    }), r();
  }, [r]), C = E(() => {
    w.current !== void 0 && (window.clearTimeout(w.current), w.current = void 0);
  }, []), V = E(() => {
    a === "auto" && (y(!0), C(), w.current = window.setTimeout(() => {
      y(!1), w.current = void 0;
    }, t));
  }, [t, C, a]);
  if (_(() => {
    if (a === "auto")
      return V(), C;
    y(a === "visible"), C();
  }, [C, a, V]), _(() => {
    const f = N.current;
    D && (f != null && f.requestFullscreen) && f.requestFullscreen().catch(() => {
    });
    function I() {
      D && document.fullscreenElement === null && r();
    }
    return document.addEventListener("fullscreenchange", I), () => {
      document.removeEventListener("fullscreenchange", I), document.fullscreenElement === f && document.exitFullscreen().catch(() => {
      });
    };
  }, [r, D]), _(() => {
    function f(I) {
      (I.key === "Escape" || I.key === "ArrowRight" || I.key === "PageDown" || I.key === " " || I.key === "ArrowLeft" || I.key === "PageUp") && (I.preventDefault(), I.stopImmediatePropagation()), I.key === "Escape" && n && v(), (I.key === "ArrowRight" || I.key === "PageDown" || I.key === " ") && g(), (I.key === "ArrowLeft" || I.key === "PageUp") && c();
    }
    return window.addEventListener("keydown", f, !0), () => window.removeEventListener("keydown", f, !0);
  }, [n, v, g, c]), !l)
    return null;
  const $ = a === "visible" || a === "auto" && P, S = k && !$;
  return /* @__PURE__ */ h(
    "section",
    {
      ref: N,
      className: `deck-presentation-overlay ${s.theme.cssClassName}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Presentation plein ecran",
      onMouseMove: V,
      onPointerMove: V,
      children: [
        /* @__PURE__ */ i("div", { className: "deck-presentation-stage", children: /* @__PURE__ */ i(ce, { slide: l, target: "screen" }) }),
        $ ? /* @__PURE__ */ h("div", { className: "deck-presentation-controls", "aria-label": "Navigation presentation", children: [
          /* @__PURE__ */ i("button", { type: "button", onClick: c, disabled: e === 0, "aria-label": "Slide precedente", children: "Previous" }),
          /* @__PURE__ */ h("span", { children: [
            e + 1,
            " / ",
            s.slides.length
          ] }),
          /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              onClick: g,
              disabled: e >= s.slides.length - 1,
              "aria-label": "Slide suivante",
              children: "Next"
            }
          ),
          /* @__PURE__ */ i("button", { type: "button", onClick: v, children: "Quitter" })
        ] }) : null,
        S ? /* @__PURE__ */ i("p", { className: "deck-presentation-hint", children: o }) : null
      ]
    }
  );
}
function Kt({
  controls: e,
  deck: t,
  initialSlideId: n,
  mode: a = "viewer",
  onAction: s,
  onSlideChange: o,
  presentation: r
}) {
  var ne, ae, j, K, x, U, m;
  const g = Math.max(
    0,
    t.slides.findIndex((L) => L.id === n)
  ), [c, D] = F(g === -1 ? 0 : g), [k, N] = F(!1), [w, P] = F(
    r !== !1 ? (r == null ? void 0 : r.controlsMode) ?? ((ne = r == null ? void 0 : r.controls) == null ? void 0 : ne.mode) ?? "auto" : "auto"
  ), y = t.slides[c] ?? t.slides[0], l = r === !1 ? void 0 : r, v = r !== !1 && (l == null ? void 0 : l.enabled) !== !1, C = (l == null ? void 0 : l.canOpen) ?? !0, V = (e == null ? void 0 : e.visible) !== !1, $ = !!(e != null && e.showPresentationButton && v), S = (l == null ? void 0 : l.controlsMode) ?? ((ae = l == null ? void 0 : l.controls) == null ? void 0 : ae.mode) ?? w, f = Z(
    () => ({
      activeSlideId: y.id,
      activeSlideIndex: c
    }),
    [c, y.id]
  ), I = E(
    (L) => {
      s == null || s(L, f);
    },
    [s, f]
  ), A = E(
    (L, p) => {
      const b = Math.min(Math.max(L, 0), t.slides.length - 1), H = y.id;
      D(b);
      const T = t.slides[b];
      T && T.id !== H && (o == null || o({
        previousSlideId: H,
        activeSlideId: T.id,
        activeSlideIndex: b
      })), I({
        type: b > c ? "next-slide" : "previous-slide",
        origin: p,
        slideId: T == null ? void 0 : T.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [c, y.id, t.slides, I, o]
  ), Y = E(() => {
    !v || !C || (N(!0), I({
      type: "toggle-fullscreen",
      origin: "mouse",
      slideId: y.id,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [y.id, I, C, v]), te = E(() => {
    N(!1), I({
      type: "toggle-fullscreen",
      origin: "mouse",
      slideId: y.id,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    });
  }, [y.id, I]), me = E(
    (L) => {
      var p;
      P(L), (p = l == null ? void 0 : l.onControlsModeChange) == null || p.call(l, L);
    },
    [l]
  );
  return _(() => {
    function L(p) {
      k || ((p.key === "ArrowRight" || p.key === "PageDown" || p.key === " ") && (p.preventDefault(), A(c + 1, "keyboard")), (p.key === "ArrowLeft" || p.key === "PageUp") && (p.preventDefault(), A(c - 1, "keyboard")));
    }
    return window.addEventListener("keydown", L), () => window.removeEventListener("keydown", L);
  }, [c, A, k]), _(() => {
    k && (!v || !C) && N(!1);
  }, [C, v, k]), /* @__PURE__ */ h("div", { className: `deck-screen-root ${t.theme.cssClassName}`, "data-mode": a, children: [
    V ? /* @__PURE__ */ i(
      St,
      {
        activeIndex: c,
        slideCount: t.slides.length,
        showPresentationButton: $,
        canOpenPresentation: C,
        showPresentationControlsModeSelect: !!(e != null && e.showPresentationControlsModeSelect),
        presentationControlsMode: S,
        presentationButtonLabel: (e == null ? void 0 : e.presentationButtonLabel) ?? "Presentation",
        presentationUnavailableLabel: (e == null ? void 0 : e.presentationUnavailableLabel) ?? "Presentation is unavailable",
        onOpenPresentation: Y,
        onPresentationControlsModeChange: me,
        onPrevious: () => A(c - 1, "mouse"),
        onNext: () => A(c + 1, "mouse")
      }
    ) : null,
    y ? /* @__PURE__ */ i(ce, { slide: y, target: "screen" }) : null,
    k && v ? /* @__PURE__ */ i(
      It,
      {
        deck: t,
        activeIndex: c,
        controlsMode: S,
        autoHideDelayMs: ((j = l == null ? void 0 : l.controls) == null ? void 0 : j.autoHideDelayMs) ?? 1800,
        requestBrowserFullscreen: ((K = l == null ? void 0 : l.fullscreen) == null ? void 0 : K.requestBrowserFullscreen) ?? !0,
        closeOnEscape: ((x = l == null ? void 0 : l.fullscreen) == null ? void 0 : x.closeOnEscape) ?? !0,
        hintText: ((U = l == null ? void 0 : l.hint) == null ? void 0 : U.text) ?? "Fleches gauche/droite: precedent/suivant. Escape: quitter.",
        showHintWhenControlsHidden: ((m = l == null ? void 0 : l.hint) == null ? void 0 : m.showWhenControlsHidden) ?? !0,
        onClose: te,
        onPrevious: () => A(c - 1, "keyboard"),
        onNext: () => A(c + 1, "keyboard")
      }
    ) : null
  ] });
}
function W(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n += 1)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, "0");
}
const Nt = {
  desktopBreakpointPx: 1024,
  slideRailWidthPx: 260,
  inspectorWidthPx: 340,
  showInspector: !0,
  showActiveSlidePreview: !0,
  showSourceModeToggle: !0,
  showVersionHistory: !0,
  showDiagnosticsPanel: !0,
  density: "comfortable"
}, Dt = {
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
}, ke = {
  adapter: new Me(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, At = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function ee(e) {
  try {
    const t = Pe.parse(e.content);
    return J(t) ? t : null;
  } catch {
    return null;
  }
}
function ue(e, t) {
  return {
    ...e,
    content: Pe.stringify(t, { lineWidth: 0 })
  };
}
function G(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(J);
}
function Pt(e, t, n, a) {
  return Se(e, t, (s) => {
    const o = Ee(s);
    o[n] = { markdown: a };
  });
}
function we(e, t, n, a) {
  return Se(e, t, (s) => {
    const o = Ee(s);
    o[n] = {
      image: xt({
        assetId: a.assetId,
        src: a.src,
        alt: a.alt
      })
    };
  });
}
function Ct(e, t, n) {
  return Se(e, t, (a) => {
    a.layout = n;
  });
}
function Mt(e, t = "title-body") {
  const n = ee(e);
  if (!n)
    return e;
  const a = G(n), s = Re(a, "slide");
  return a.push({
    id: s,
    layout: t,
    slots: {
      title: { markdown: "## New slide" },
      body: { markdown: "" }
    }
  }), n.slides = a, ue(e, n);
}
function Lt(e, t) {
  const n = ee(e);
  if (!n)
    return e;
  const a = G(n), s = a.findIndex((r) => r.id === t);
  if (s < 0)
    return e;
  const o = structuredClone(a[s]);
  return o.id = Re(a, `${t}-copy`), a.splice(s + 1, 0, o), n.slides = a, ue(e, n);
}
function Et(e, t) {
  const n = ee(e);
  if (!n)
    return e;
  const a = G(n).filter((s) => s.id !== t);
  return n.slides = a.length > 0 ? a : G(n), ue(e, n);
}
function Rt(e, t, n) {
  const a = Le(e, t, n);
  return J(a) && typeof a.markdown == "string" ? a.markdown : "";
}
function Vt(e, t, n) {
  const a = Le(e, t, n), s = J(a) && J(a.image) ? a.image : {};
  return {
    assetId: typeof s.assetId == "string" ? s.assetId : "",
    src: typeof s.src == "string" ? s.src : "",
    alt: typeof s.alt == "string" ? s.alt : ""
  };
}
function Se(e, t, n) {
  const a = ee(e);
  if (!a)
    return e;
  const s = G(a), o = s.find((r) => r.id === t);
  return o ? (n(o), a.slides = s, ue(e, a)) : e;
}
function Le(e, t, n) {
  var o;
  const a = ee(e);
  if (!a)
    return;
  const s = G(a).find((r) => r.id === t);
  return (o = s == null ? void 0 : s.slots) == null ? void 0 : o[n];
}
function Ee(e) {
  return J(e.slots) || (e.slots = {}), e.slots;
}
function Re(e, t) {
  const n = new Set(e.map((o) => o.id).filter((o) => !!o));
  let a = Ae(t), s = 2;
  for (; n.has(a); )
    a = `${Ae(t)}-${s}`, s += 1;
  return a;
}
function Ae(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function xt(e) {
  return Object.fromEntries(
    Object.entries(e).filter((t) => !!t[1])
  );
}
function J(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Yt(e) {
  const {
    autosave: t,
    deckId: n,
    features: a,
    initialSelectedSlideId: s,
    layout: o,
    locale: r = "fr-FR",
    namespace: g,
    onChange: c,
    onCompile: D,
    onError: k,
    onRestoreVersion: N,
    onSave: w,
    onSelectedSlideChange: P,
    readOnly: y,
    storage: l
  } = e, v = e.runtime ?? vt, C = e.mode === "controlled", [V, $] = F(
    C ? e.value : e.initialValue
  ), S = C ? e.value : V, [f, I] = F(null), [A, Y] = F(
    s
  ), [te, me] = F(!1), [ne, ae] = F([]), j = le(D), K = le(k);
  j.current = D, K.current = k;
  const x = Z(
    () => ({ ...Nt, ...o }),
    [o]
  ), U = Z(
    () => ({ ...Dt, ...a }),
    [a]
  ), m = Z(
    () => l === !1 ? void 0 : {
      ...ke,
      namespace: g ?? (l == null ? void 0 : l.namespace) ?? ke.namespace,
      adapter: (l == null ? void 0 : l.adapter) ?? v.storage ?? ke.adapter,
      ...l
    },
    [g, v.storage, l]
  ), L = Z(
    () => t === !1 ? void 0 : { ...At, ...t },
    [t]
  ), p = (f == null ? void 0 : f.status) === "valid" || (f == null ? void 0 : f.status) === "degraded" ? f.deck : void 0, b = (p == null ? void 0 : p.slides.find((d) => d.id === A)) ?? (p == null ? void 0 : p.slides[0]), H = E(
    (d, M, B) => {
      const se = {
        reason: M,
        deckId: n,
        selectedSlideId: B ?? A,
        sourceHash: W(d.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      C || $(d), c == null || c(d, se);
    },
    [C, n, c, A]
  );
  _(() => {
    let d = !1;
    return Xe(S, {
      runtime: v
    }).then((M) => {
      var B;
      d || (I(M), (B = j.current) == null || B.call(j, M));
    }).catch((M) => {
      var B;
      (B = K.current) == null || B.call(K, {
        message: M instanceof Error ? M.message : "Deck compilation failed.",
        cause: M
      });
    }), () => {
      d = !0;
    };
  }, [r, v, S]), _(() => {
    if (!p || A)
      return;
    const d = p.slides[0];
    d && Y(d.id);
  }, [p, A]), _(() => {
    m != null && m.recoverOnMount && m.adapter.loadDraft({ deckId: n, namespace: m.namespace }).then((d) => {
      !d || d.sourceHash === W(S.content) || (Y(d.selectedSlideId), H(d.source, "crash-recovery", d.selectedSlideId));
    }).catch((d) => {
      k == null || k({
        message: d instanceof Error ? d.message : "Unable to recover deck draft.",
        cause: d
      });
    });
  }, [n, k, H, S.content, m]), _(() => {
    if (!m || !L || !m.saveDraftOnChange)
      return;
    const d = window.setTimeout(() => {
      m.adapter.saveDraft({
        deckId: n,
        namespace: m.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: _t(),
        source: S,
        sourceHash: W(S.content),
        selectedSlideId: A,
        compilerStatus: (f == null ? void 0 : f.status) ?? "invalid"
      });
    }, L.draftDebounceMs);
    return () => window.clearTimeout(d);
  }, [L, f, n, A, S, m]);
  const T = E(() => {
    m && m.adapter.listVersions({ deckId: n, namespace: m.namespace }).then(ae).catch((d) => {
      k == null || k({
        message: d instanceof Error ? d.message : "Unable to list deck versions.",
        cause: d
      });
    });
  }, [n, k, m]);
  _(() => {
    T();
  }, [T]);
  const X = E(
    async (d, M) => {
      var Ie;
      if (!m)
        return;
      const B = (f == null ? void 0 : f.diagnostics) ?? [], se = await m.adapter.createVersion({
        id: Ve(),
        deckId: n,
        namespace: m.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: M,
        reason: d,
        source: S,
        sourceHash: W(S.content),
        selectedSlideId: A,
        compilerStatus: (f == null ? void 0 : f.status) ?? "invalid",
        diagnosticsSummary: Ke(B),
        limits: {
          maxVersionsPerDeck: m.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: m.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: m.maxBytesPerDeck
        }
      });
      se.status === "failed" && (k == null || k({ message: ((Ie = se.diagnostics[0]) == null ? void 0 : Ie.message) ?? "Unable to save deck version." })), T();
    },
    [f, n, k, T, A, S, m]
  ), xe = E(() => {
    m && (m.adapter.saveCurrent({
      deckId: n,
      namespace: m.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: S,
      sourceHash: W(S.content),
      selectedSlideId: A
    }), m.createVersionOnManualSave && X("manual", "Manual save"), w == null || w({
      deckId: n,
      sourceHash: W(S.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [X, n, w, A, S, m]), Te = E(
    async (d) => {
      if (!m)
        return;
      m.createVersionBeforeDestructiveAction && await X("before-version-restore", "Before restore");
      const M = await m.adapter.loadVersion({
        deckId: n,
        namespace: m.namespace,
        versionId: d
      });
      M && (Y(M.selectedSlideId), H(M.source, "version-restore", M.selectedSlideId), N == null || N({
        deckId: n,
        versionId: d,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [X, n, N, H, m]
  );
  function Oe(d) {
    Y(d), P == null || P({ deckId: n, slideId: d });
  }
  function z(d, M) {
    H(d, M, b == null ? void 0 : b.id);
  }
  const _e = (f == null ? void 0 : f.diagnostics) ?? [];
  return /* @__PURE__ */ h("div", { className: "deck-studio-root", "data-density": x.density, children: [
    /* @__PURE__ */ h("aside", { className: "deck-studio-rail", style: { width: x.slideRailWidthPx }, children: [
      /* @__PURE__ */ h("header", { children: [
        /* @__PURE__ */ i("strong", { children: (p == null ? void 0 : p.metadata.title) ?? "Deck" }),
        U.allowAddSlide ? /* @__PURE__ */ i("button", { type: "button", onClick: () => z(Mt(S), "slide-add"), disabled: y, children: "Add" }) : null
      ] }),
      /* @__PURE__ */ i("nav", { "aria-label": "Slides", children: p == null ? void 0 : p.slides.map((d) => /* @__PURE__ */ h(
        "button",
        {
          type: "button",
          className: d.id === (b == null ? void 0 : b.id) ? "is-active" : void 0,
          onClick: () => Oe(d.id),
          children: [
            /* @__PURE__ */ i("span", { children: d.index + 1 }),
            /* @__PURE__ */ i("span", { children: d.id }),
            /* @__PURE__ */ i("small", { children: d.layout.name })
          ]
        },
        d.id
      )) })
    ] }),
    /* @__PURE__ */ h("main", { className: "deck-studio-main", children: [
      /* @__PURE__ */ h("header", { className: "deck-studio-header", children: [
        /* @__PURE__ */ h("div", { children: [
          /* @__PURE__ */ i("strong", { children: (b == null ? void 0 : b.id) ?? "Source" }),
          b ? /* @__PURE__ */ i("small", { children: b.layout.definition.displayName }) : null
        ] }),
        /* @__PURE__ */ h("div", { className: "deck-studio-actions", children: [
          x.showSourceModeToggle && U.allowRawSourceEdit ? /* @__PURE__ */ i("button", { type: "button", onClick: () => me((d) => !d), children: te ? "Form" : "YAML" }) : null,
          U.allowDuplicateSlide && b ? /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              onClick: () => z(Lt(S, b.id), "slide-duplicate"),
              disabled: y,
              children: "Duplicate"
            }
          ) : null,
          U.allowDeleteSlide && b ? /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              onClick: () => z(Et(S, b.id), "slide-delete"),
              disabled: y || ((p == null ? void 0 : p.slides.length) ?? 0) <= 1,
              children: "Delete"
            }
          ) : null,
          m ? /* @__PURE__ */ i("button", { type: "button", onClick: xe, disabled: y, children: "Save" }) : null
        ] })
      ] }),
      te ? /* @__PURE__ */ i(
        "textarea",
        {
          className: "deck-source-editor",
          value: S.content,
          onChange: (d) => z({ ...S, content: d.currentTarget.value }, "raw-source-edit"),
          spellCheck: !1,
          readOnly: y
        }
      ) : b ? /* @__PURE__ */ h("div", { className: "deck-studio-editor", children: [
        /* @__PURE__ */ i(
          Tt,
          {
            source: S,
            slideId: b.id,
            fields: b.layout.definition.editor.fieldGroups.flatMap((d) => d.fields),
            readOnly: !!y,
            onUpdate: z
          }
        ),
        U.allowLayoutChange ? /* @__PURE__ */ h("label", { className: "deck-form-field", children: [
          /* @__PURE__ */ i("span", { children: "Layout" }),
          /* @__PURE__ */ i(
            "select",
            {
              value: b.layout.name,
              onChange: (d) => {
                m != null && m.createVersionBeforeDestructiveAction && X("before-layout-change", "Before layout change"), z(Ct(S, b.id, d.currentTarget.value), "layout-change");
              },
              disabled: y,
              children: Array.from(v.layouts.values()).map((d) => /* @__PURE__ */ i("option", { value: d.name, children: d.displayName }, d.name))
            }
          )
        ] }) : null
      ] }) : (f == null ? void 0 : f.status) === "invalid" ? /* @__PURE__ */ i(Be, { fallback: f.fallback }) : null,
      x.showActiveSlidePreview && b ? /* @__PURE__ */ i("section", { className: "deck-studio-preview", "aria-label": "Active slide preview", children: /* @__PURE__ */ i(ce, { slide: b, target: "screen" }) }) : null
    ] }),
    x.showInspector ? /* @__PURE__ */ h("aside", { className: "deck-studio-inspector", style: { width: x.inspectorWidthPx }, children: [
      x.showDiagnosticsPanel ? /* @__PURE__ */ h("section", { children: [
        /* @__PURE__ */ i("h3", { children: "Diagnostics" }),
        /* @__PURE__ */ i(Ce, { diagnostics: _e })
      ] }) : null,
      x.showVersionHistory && m ? /* @__PURE__ */ h("section", { children: [
        /* @__PURE__ */ i("h3", { children: "Versions" }),
        /* @__PURE__ */ i("ul", { className: "deck-version-list", children: ne.map((d) => /* @__PURE__ */ h("li", { children: [
          /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              onClick: () => void Te(d.id),
              disabled: !U.allowVersionRestore || y,
              children: d.label ?? d.reason
            }
          ),
          /* @__PURE__ */ i("small", { children: new Date(d.createdAtIso).toLocaleString() })
        ] }, d.id)) })
      ] }) : null
    ] }) : null
  ] });
}
function Tt({
  source: e,
  slideId: t,
  fields: n,
  readOnly: a,
  onUpdate: s
}) {
  return /* @__PURE__ */ i("form", { className: "deck-slide-form", children: n.map((o) => /* @__PURE__ */ i(
    Ot,
    {
      source: e,
      slideId: t,
      field: o,
      readOnly: a,
      onUpdate: s
    },
    `${o.kind}-${"slotName" in o ? o.slotName : o.label}`
  )) });
}
function Ot({
  source: e,
  slideId: t,
  field: n,
  readOnly: a,
  onUpdate: s
}) {
  if (n.kind === "markdown")
    return /* @__PURE__ */ h("label", { className: "deck-form-field", children: [
      /* @__PURE__ */ i("span", { children: n.label }),
      /* @__PURE__ */ i(
        "textarea",
        {
          rows: n.minRows ?? 4,
          value: Rt(e, t, n.slotName),
          onChange: (o) => s(Pt(e, t, n.slotName, o.currentTarget.value), "slide-field-edit"),
          readOnly: a
        }
      )
    ] });
  if (n.kind === "image") {
    const o = Vt(e, t, n.slotName);
    return /* @__PURE__ */ h("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ i("legend", { children: n.label }),
      /* @__PURE__ */ h("label", { children: [
        /* @__PURE__ */ i("span", { children: "Asset id" }),
        /* @__PURE__ */ i(
          "input",
          {
            value: o.assetId,
            onChange: (r) => s(
              we(e, t, n.slotName, {
                ...o,
                assetId: r.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: a
          }
        )
      ] }),
      /* @__PURE__ */ h("label", { children: [
        /* @__PURE__ */ i("span", { children: "Source" }),
        /* @__PURE__ */ i(
          "input",
          {
            value: o.src,
            onChange: (r) => s(
              we(e, t, n.slotName, {
                ...o,
                src: r.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: a
          }
        )
      ] }),
      /* @__PURE__ */ h("label", { children: [
        /* @__PURE__ */ i("span", { children: "Alt" }),
        /* @__PURE__ */ i(
          "input",
          {
            value: o.alt,
            onChange: (r) => s(
              we(e, t, n.slotName, {
                ...o,
                alt: r.currentTarget.value
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
function _t() {
  const e = "deck-runtime-session-id", t = window.sessionStorage.getItem(e);
  if (t)
    return t;
  const n = Ve();
  return window.sessionStorage.setItem(e, n), n;
}
function Ve() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
export {
  Be as DebugDeckFallback,
  Kt as DeckShow,
  Yt as DeckStudio,
  jt as PrintDeck,
  Xe as compileDeck,
  bt as createDeckRuntime,
  vt as defaultDeckRuntime
};
