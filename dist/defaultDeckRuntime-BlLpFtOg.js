import { b as D } from "./browserPrintPdfAdapter-DwN_ogHX.js";
import { jsx as n, jsxs as m } from "react/jsx-runtime";
import E from "react-markdown";
function C(t, e) {
  return `${t}:v1:${e}:current`;
}
function y(t, e) {
  return `${t}:v1:${e}:draft`;
}
function N(t, e) {
  return `${t}:v1:${e}:versions:index`;
}
function p(t, e, o) {
  return `${t}:v1:${e}:versions:${o}`;
}
class O {
  async loadCurrent(e) {
    return h(C(e.namespace, e.deckId));
  }
  async saveCurrent(e) {
    return f(C(e.namespace, e.deckId), e);
  }
  async saveDraft(e) {
    return f(y(e.namespace, e.deckId), e);
  }
  async loadDraft(e) {
    return h(y(e.namespace, e.deckId));
  }
  async clearDraft(e) {
    try {
      const o = g();
      return o ? (o.removeItem(y(e.namespace, e.deckId)), { status: "success" }) : I();
    } catch (o) {
      return S(o);
    }
  }
  async createVersion(e) {
    const o = {
      id: e.id,
      deckId: e.deckId,
      namespace: e.namespace,
      schemaVersion: 1,
      createdAtIso: e.createdAtIso,
      label: e.label,
      reason: e.reason,
      source: e.source,
      sourceHash: e.sourceHash,
      selectedSlideId: e.selectedSlideId,
      compilerStatus: e.compilerStatus,
      diagnosticsSummary: e.diagnosticsSummary
    }, r = JSON.stringify(o), i = await f(p(e.namespace, e.deckId, e.id), o);
    if (i.status !== "success")
      return i;
    const s = await b(e.namespace, e.deckId), a = {
      deckId: e.deckId,
      namespace: e.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      versions: [
        {
          id: e.id,
          deckId: e.deckId,
          namespace: e.namespace,
          schemaVersion: 1,
          createdAtIso: e.createdAtIso,
          label: e.label,
          reason: e.reason,
          sourceHash: e.sourceHash,
          selectedSlideId: e.selectedSlideId,
          compilerStatus: e.compilerStatus,
          sizeBytes: r.length
        },
        ...s.versions.filter((u) => u.id !== e.id)
      ]
    }, d = P(a, e.limits);
    return f(N(e.namespace, e.deckId), d);
  }
  async listVersions(e) {
    return (await b(e.namespace, e.deckId)).versions;
  }
  async loadVersion(e) {
    return h(
      p(e.namespace, e.deckId, e.versionId)
    );
  }
  async deleteVersion(e) {
    try {
      const o = g();
      if (!o)
        return I();
      o.removeItem(p(e.namespace, e.deckId, e.versionId));
      const r = await b(e.namespace, e.deckId), i = {
        ...r,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        versions: r.versions.filter((s) => s.id !== e.versionId)
      };
      return f(N(e.namespace, e.deckId), i);
    } catch (o) {
      return S(o);
    }
  }
}
function P(t, e) {
  var s;
  if (!e)
    return t;
  const o = [...t.versions], r = o.filter((a) => a.reason === "autosave");
  for (; o.length > e.maxVersionsPerDeck; ) {
    const a = w(o, (d) => d.reason === "autosave");
    o.splice(a >= 0 ? a : o.length - 1, 1);
  }
  for (; o.filter((a) => a.reason === "autosave").length > e.maxAutosaveVersionsPerDeck; ) {
    const a = w(o, (d) => d.reason === "autosave");
    if (a < 0)
      break;
    o.splice(a, 1);
  }
  let i = o.reduce((a, d) => a + d.sizeBytes, 0);
  for (; i > e.maxBytesPerDeck && o.length > 0; ) {
    const a = w(o, (T) => T.reason === "autosave"), d = a >= 0 ? a : o.length - 1, [u] = o.splice(d, 1);
    i -= (u == null ? void 0 : u.sizeBytes) ?? 0;
  }
  for (const a of r.filter((d) => !o.some((u) => u.id === d.id)))
    (s = g()) == null || s.removeItem(p(t.namespace, t.deckId, a.id));
  return {
    ...t,
    versions: o
  };
}
async function b(t, e) {
  return await h(N(t, e)) ?? {
    deckId: e,
    namespace: t,
    schemaVersion: 1,
    updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
    versions: []
  };
}
function h(t) {
  try {
    const e = g();
    if (!e)
      return null;
    const o = e.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch {
    return null;
  }
}
function f(t, e) {
  try {
    const o = g();
    return o ? (o.setItem(t, JSON.stringify(e)), { status: "success" }) : I();
  } catch (o) {
    return $(o) ? K(o) : S(o);
  }
}
function I() {
  return {
    status: "unavailable",
    diagnostics: [
      {
        code: "STORAGE_VERSION_CORRUPTED",
        severity: "warning",
        message: "Local storage is unavailable in this environment."
      }
    ]
  };
}
function K(t) {
  return {
    status: "quota-exceeded",
    diagnostics: [A(t)]
  };
}
function S(t) {
  return {
    status: "failed",
    diagnostics: [A(t)]
  };
}
function $(t) {
  return t instanceof DOMException && (t.name === "QuotaExceededError" || t.name === "NS_ERROR_DOM_QUOTA_REACHED");
}
function A(t) {
  return {
    code: "STORAGE_QUOTA_EXCEEDED",
    severity: "error",
    message: t instanceof Error ? t.message : "Unable to write deck state to storage."
  };
}
function g() {
  if (!(typeof window > "u"))
    return window.localStorage;
}
function w(t, e) {
  for (let o = t.length - 1; o >= 0; o -= 1)
    if (e(t[o]))
      return o;
  return -1;
}
const F = /^(javascript|data|vbscript):/i, V = {
  async resolveImage(t) {
    const e = t.assetId ? t.assets.get(t.assetId) : void 0, o = (e == null ? void 0 : e.src) ?? t.src, r = (e == null ? void 0 : e.alt) ?? "";
    if (!o || F.test(o.trim()))
      throw new Error("Image source is missing or unsafe.");
    return {
      src: o,
      alt: r
    };
  }
};
function l({ content: t, renderers: e }) {
  return t.kind === "image" ? /* @__PURE__ */ n(
    "img",
    {
      className: "deck-slot-image",
      src: t.src ?? "",
      alt: t.alt ?? "",
      loading: "lazy"
    }
  ) : t.kind === "renderer" ? /* @__PURE__ */ m("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    t.rendererKind
  ] }) : /* @__PURE__ */ n("div", { className: "deck-markdown", children: t.nodes.map((o, r) => /* @__PURE__ */ n(L, { node: o, renderers: e }, `${o.kind}-${r}`)) });
}
function L({
  node: t,
  renderers: e
}) {
  var r;
  const o = (r = e == null ? void 0 : e.get(t.kind)) == null ? void 0 : r.render;
  return o ? /* @__PURE__ */ n(o, { node: t }) : t.kind === "code" ? /* @__PURE__ */ n("pre", { className: "deck-code-block", children: /* @__PURE__ */ n("code", { children: t.code }) }) : t.kind === "mermaid" ? /* @__PURE__ */ n("pre", { className: "deck-mermaid-block", children: t.chart }) : /* @__PURE__ */ n(
    E,
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
      urlTransform: (i) => /^(https?:|mailto:|\/|#)/i.test(i) ? i : "",
      children: t.markdown
    }
  );
}
function R({
  slide: t,
  name: e = "title",
  className: o,
  variant: r = "section"
}) {
  const i = t.slots.get(e);
  if (!i)
    return null;
  const s = B(M(i.content).length);
  return /* @__PURE__ */ n(
    "div",
    {
      className: ["deck-title-slot", o].filter(Boolean).join(" "),
      "data-slot": e,
      "data-title-variant": r,
      "data-title-size": s,
      children: /* @__PURE__ */ n(l, { content: i.content })
    }
  );
}
function B(t) {
  return t > 72 ? "xlong" : t > 48 ? "long" : t > 30 ? "medium" : "short";
}
function M(t) {
  return t.kind !== "markdown" ? "" : t.markdown.replace(/^#{1,6}\s+/gm, "").replace(/[*_`~[\]()>#-]/g, "").replace(/\s+/g, " ").trim();
}
function _({ slide: t, target: e }) {
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-cover", "data-target": e, children: [
    /* @__PURE__ */ m("div", { className: "deck-cover-copy", children: [
      /* @__PURE__ */ n(v, { slide: t, name: "eyebrow", className: "deck-cover-eyebrow" }),
      /* @__PURE__ */ n(R, { slide: t, className: "deck-cover-title", variant: "cover" }),
      /* @__PURE__ */ n(v, { slide: t, name: "subtitle", className: "deck-cover-subtitle" })
    ] }),
    /* @__PURE__ */ n(v, { slide: t, name: "footer", className: "deck-slide-footer" })
  ] });
}
function v({
  slide: t,
  name: e,
  className: o
}) {
  const r = t.slots.get(e);
  return r ? /* @__PURE__ */ n("div", { className: o, "data-slot": e, children: /* @__PURE__ */ n(l, { content: r.content }) }) : null;
}
function z({ slide: t, target: e }) {
  const o = t.slots.get("image"), r = t.slots.get("caption");
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-image-only", "data-target": e, children: [
    /* @__PURE__ */ n("main", { children: o ? /* @__PURE__ */ n(l, { content: o.content }) : null }),
    /* @__PURE__ */ n("footer", { children: r ? /* @__PURE__ */ n(l, { content: r.content }) : null })
  ] });
}
function G({ slide: t, target: e }) {
  const o = t.slots.get("body"), r = t.slots.get("footer");
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-title-body", "data-target": e, children: [
    /* @__PURE__ */ n("header", { children: /* @__PURE__ */ n(R, { slide: t }) }),
    /* @__PURE__ */ n("main", { children: o ? /* @__PURE__ */ n(l, { content: o.content }) : null }),
    /* @__PURE__ */ n("footer", { children: r ? /* @__PURE__ */ n(l, { content: r.content }) : null })
  ] });
}
function J({ slide: t, target: e }) {
  const o = t.slots.get("left"), r = t.slots.get("right"), i = t.slots.get("footer");
  return /* @__PURE__ */ m("article", { className: "deck-layout deck-layout-two-columns", "data-target": e, children: [
    /* @__PURE__ */ n("header", { children: /* @__PURE__ */ n(R, { slide: t }) }),
    /* @__PURE__ */ m("main", { className: "deck-two-columns-grid", children: [
      /* @__PURE__ */ n("section", { children: o ? /* @__PURE__ */ n(l, { content: o.content }) : null }),
      /* @__PURE__ */ n("section", { children: r ? /* @__PURE__ */ n(l, { content: r.content }) : null })
    ] }),
    /* @__PURE__ */ n("footer", { children: i ? /* @__PURE__ */ n(l, { content: i.content }) : null })
  ] });
}
const H = [
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
            { kind: "markdown", slotName: "title", label: "Title", required: !0, minRows: 1, blockKind: "heading" },
            { kind: "markdown", slotName: "subtitle", label: "Subtitle", minRows: 1, blockKind: "plain" },
            { kind: "markdown", slotName: "footer", label: "Footer", minRows: 1, blockKind: "plain" }
          ]
        }
      ]
    },
    migrateFrom: {
      "title-body": {
        from: "title-body",
        to: "cover",
        operations: [
          { kind: "move-slot", from: "title", to: "title" },
          { kind: "move-slot", from: "body", to: "subtitle" },
          { kind: "move-slot", from: "footer", to: "footer" }
        ],
        diagnostics: []
      },
      "two-columns": {
        from: "two-columns",
        to: "cover",
        operations: [
          { kind: "move-slot", from: "title", to: "title" },
          { kind: "move-slot", from: "left", to: "subtitle" },
          { kind: "move-slot", from: "footer", to: "footer" },
          { kind: "drop-slot", slotName: "right", reason: "Cover layout has no second column." }
        ],
        diagnostics: []
      }
    },
    component: _
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
            { kind: "markdown", slotName: "title", label: "Title", required: !0, minRows: 1, blockKind: "heading" },
            { kind: "markdown", slotName: "body", label: "Body", required: !0, minRows: 10 },
            { kind: "markdown", slotName: "footer", label: "Footer", minRows: 1, blockKind: "plain" }
          ]
        }
      ]
    },
    migrateFrom: {
      cover: {
        from: "cover",
        to: "title-body",
        operations: [
          { kind: "move-slot", from: "title", to: "title" },
          { kind: "move-slot", from: "subtitle", to: "body" },
          { kind: "move-slot", from: "footer", to: "footer" }
        ],
        diagnostics: []
      },
      "two-columns": {
        from: "two-columns",
        to: "title-body",
        operations: [
          { kind: "move-slot", from: "title", to: "title" },
          { kind: "move-slot", from: "left", to: "body" },
          { kind: "move-slot", from: "footer", to: "footer" },
          { kind: "drop-slot", slotName: "right", reason: "Title/body layout has one body slot." }
        ],
        diagnostics: []
      }
    },
    component: G
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
            { kind: "markdown", slotName: "title", label: "Title", required: !0, minRows: 1, blockKind: "heading" },
            { kind: "markdown", slotName: "left", label: "Left column", required: !0, minRows: 8 },
            { kind: "markdown", slotName: "right", label: "Right column", required: !0, minRows: 8 },
            { kind: "markdown", slotName: "footer", label: "Footer", minRows: 1, blockKind: "plain" }
          ]
        }
      ]
    },
    migrateFrom: {
      cover: {
        from: "cover",
        to: "two-columns",
        operations: [
          { kind: "move-slot", from: "title", to: "title" },
          { kind: "move-slot", from: "subtitle", to: "left" },
          { kind: "move-slot", from: "footer", to: "footer" }
        ],
        diagnostics: []
      },
      "title-body": {
        from: "title-body",
        to: "two-columns",
        operations: [
          { kind: "move-slot", from: "title", to: "title" },
          { kind: "move-slot", from: "body", to: "left" },
          { kind: "move-slot", from: "footer", to: "footer" }
        ],
        diagnostics: []
      }
    },
    component: J
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
    component: z
  }
];
function Q({ node: t }) {
  return t.kind !== "markdown" ? /* @__PURE__ */ n(x, { node: t }) : /* @__PURE__ */ n(
    E,
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
      urlTransform: (e) => /^(https?:|mailto:|\/|#)/i.test(e) ? e : "",
      children: t.markdown
    }
  );
}
function U({ node: t }) {
  return t.kind !== "code" ? /* @__PURE__ */ n(x, { node: t }) : /* @__PURE__ */ n("pre", { className: "deck-code-block", children: /* @__PURE__ */ n("code", { children: t.code }) });
}
function j({ node: t }) {
  return t.kind !== "mermaid" ? /* @__PURE__ */ n(x, { node: t }) : /* @__PURE__ */ n("pre", { className: "deck-mermaid-block", children: t.chart });
}
function x({ node: t }) {
  return /* @__PURE__ */ m("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    t.kind
  ] });
}
const X = {
  kind: "markdown",
  render: Q
}, Z = {
  kind: "code",
  render: U
}, W = {
  kind: "mermaid",
  render: j
}, Y = [
  X,
  Z,
  W
], c = {
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
}, q = [
  {
    id: "default",
    displayName: "Standard",
    cssClassName: "deck-theme-default",
    tokens: c
  },
  {
    id: "fintech-light",
    displayName: "Standard actuel",
    cssClassName: "deck-theme-fintech-light",
    tokens: c
  },
  {
    id: "qastia-coaching",
    displayName: "Qastia coaching",
    cssClassName: "deck-theme-qastia-coaching",
    tokens: {
      ...c,
      color: {
        background: "#fbf9f6",
        foreground: "#171717",
        primary: "#9c7a4d",
        muted: "#7f7467",
        danger: "#9d4037",
        warning: "#a66f2b"
      },
      font: {
        heading: "Fraunces, Georgia, serif",
        body: "Manrope, Inter, system-ui, sans-serif",
        mono: c.font.mono
      }
    }
  },
  {
    id: "editorial-indigo",
    displayName: "Editorial indigo",
    cssClassName: "deck-theme-editorial-indigo",
    tokens: {
      ...c,
      color: {
        background: "#f7f5ff",
        foreground: "#17122f",
        primary: "#5b45d6",
        muted: "#6f6a86",
        danger: "#b42318",
        warning: "#b54708"
      }
    }
  },
  {
    id: "sage-coral",
    displayName: "Sage coral",
    cssClassName: "deck-theme-sage-coral",
    tokens: {
      ...c,
      color: {
        background: "#f7fbf8",
        foreground: "#13251d",
        primary: "#d75f45",
        muted: "#5d7468",
        danger: "#b42318",
        warning: "#a15c07"
      }
    }
  },
  {
    id: "midnight-gold",
    displayName: "Midnight gold",
    cssClassName: "deck-theme-midnight-gold",
    tokens: {
      ...c,
      color: {
        background: "#101624",
        foreground: "#f8f4e9",
        primary: "#d6a84f",
        muted: "#b7c0ce",
        danger: "#ff8a7a",
        warning: "#f4bf64"
      }
    }
  },
  {
    id: "fintech-dark",
    displayName: "Fintech dark",
    cssClassName: "deck-theme-fintech-dark",
    tokens: {
      ...c,
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
], ee = [
  { name: "none", displayName: "None" },
  { name: "fade", displayName: "Fade" },
  { name: "slide-left", displayName: "Slide left" },
  { name: "slide-right", displayName: "Slide right" },
  { name: "zoom", displayName: "Zoom" }
];
function te(t = {}) {
  const e = t.layouts ?? H, o = t.renderers ?? Y, r = t.themes ?? q, i = t.transitions ?? ee, s = t.registryCollisionStrategy ?? "override";
  return {
    layouts: k(e, (a) => a.name, s, "layout"),
    renderers: k(o, (a) => a.kind, s, "renderer"),
    themes: k(r, (a) => a.id, s, "theme"),
    transitions: k(i, (a) => a.name, s, "transition"),
    assets: V,
    storage: t.storage ?? new O(),
    pdf: t.pdf ?? D
  };
}
function k(t, e, o, r) {
  const i = /* @__PURE__ */ new Map();
  for (const s of t) {
    const a = e(s);
    if (i.has(a)) {
      if (o === "throw")
        throw new Error(`Duplicate ${r} id '${a}'.`);
      if (o === "keep-first")
        continue;
    }
    i.set(a, s);
  }
  return i;
}
const ae = te();
export {
  O as L,
  te as c,
  ae as d
};
