import { b as E } from "./browserPrintPdfAdapter-DwN_ogHX.js";
import { jsx as i, jsxs as f } from "react/jsx-runtime";
import { C as d, b as D } from "./ContentRenderer-D7lDas0N.js";
function x(t, e) {
  return `${t}:v1:${e}:current`;
}
function b(t, e) {
  return `${t}:v1:${e}:draft`;
}
function I(t, e) {
  return `${t}:v1:${e}:versions:index`;
}
function y(t, e, o) {
  return `${t}:v1:${e}:versions:${o}`;
}
class T {
  async loadCurrent(e) {
    return p(x(e.namespace, e.deckId));
  }
  async saveCurrent(e) {
    return u(x(e.namespace, e.deckId), e);
  }
  async saveDraft(e) {
    return u(b(e.namespace, e.deckId), e);
  }
  async loadDraft(e) {
    return p(b(e.namespace, e.deckId));
  }
  async clearDraft(e) {
    try {
      const o = g();
      return o ? (o.removeItem(b(e.namespace, e.deckId)), { status: "success" }) : N();
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
    }, r = JSON.stringify(o), a = await u(y(e.namespace, e.deckId, e.id), o);
    if (a.status !== "success")
      return a;
    const s = await h(e.namespace, e.deckId), n = {
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
        ...s.versions.filter((m) => m.id !== e.id)
      ]
    }, l = O(n, e.limits);
    return u(I(e.namespace, e.deckId), l);
  }
  async listVersions(e) {
    return (await h(e.namespace, e.deckId)).versions;
  }
  async loadVersion(e) {
    return p(
      y(e.namespace, e.deckId, e.versionId)
    );
  }
  async deleteVersion(e) {
    try {
      const o = g();
      if (!o)
        return N();
      o.removeItem(y(e.namespace, e.deckId, e.versionId));
      const r = await h(e.namespace, e.deckId), a = {
        ...r,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        versions: r.versions.filter((s) => s.id !== e.versionId)
      };
      return u(I(e.namespace, e.deckId), a);
    } catch (o) {
      return S(o);
    }
  }
}
function O(t, e) {
  var s;
  if (!e)
    return t;
  const o = [...t.versions], r = [...o];
  for (; o.length > e.maxVersionsPerDeck; ) {
    const n = v(o, (l) => l.reason === "autosave");
    o.splice(n >= 0 ? n : o.length - 1, 1);
  }
  for (; o.filter((n) => n.reason === "autosave").length > e.maxAutosaveVersionsPerDeck; ) {
    const n = v(o, (l) => l.reason === "autosave");
    if (n < 0)
      break;
    o.splice(n, 1);
  }
  let a = o.reduce((n, l) => n + l.sizeBytes, 0);
  for (; a > e.maxBytesPerDeck && o.length > 0; ) {
    const n = v(o, (A) => A.reason === "autosave"), l = n >= 0 ? n : o.length - 1, [m] = o.splice(l, 1);
    a -= (m == null ? void 0 : m.sizeBytes) ?? 0;
  }
  for (const n of r.filter((l) => !o.some((m) => m.id === l.id)))
    (s = g()) == null || s.removeItem(y(t.namespace, t.deckId, n.id));
  return {
    ...t,
    versions: o
  };
}
async function h(t, e) {
  return await p(I(t, e)) ?? {
    deckId: e,
    namespace: t,
    schemaVersion: 1,
    updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
    versions: []
  };
}
function p(t) {
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
function u(t, e) {
  try {
    const o = g();
    return o ? (o.setItem(t, JSON.stringify(e)), { status: "success" }) : N();
  } catch (o) {
    return F(o) ? V(o) : S(o);
  }
}
function N() {
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
function V(t) {
  return {
    status: "quota-exceeded",
    diagnostics: [C(t)]
  };
}
function S(t) {
  return {
    status: "failed",
    diagnostics: [C(t)]
  };
}
function F(t) {
  return t instanceof DOMException && (t.name === "QuotaExceededError" || t.name === "NS_ERROR_DOM_QUOTA_REACHED");
}
function C(t) {
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
function v(t, e) {
  for (let o = t.length - 1; o >= 0; o -= 1)
    if (e(t[o]))
      return o;
  return -1;
}
const K = /^(javascript|data|vbscript):/i, L = {
  async resolveImage(t) {
    const e = t.assetId ? t.assets.get(t.assetId) : void 0, o = (e == null ? void 0 : e.src) ?? t.src, r = (e == null ? void 0 : e.alt) ?? "";
    if (!o || K.test(o.trim()))
      throw new Error("Image source is missing or unsafe.");
    return {
      src: o,
      alt: r
    };
  }
};
function R({
  slide: t,
  renderers: e,
  name: o = "title",
  className: r,
  variant: a = "section"
}) {
  const s = t.slots.get(o);
  if (!s)
    return null;
  const n = $(P(s.content).length);
  return /* @__PURE__ */ i(
    "div",
    {
      className: ["deck-title-slot", r].filter(Boolean).join(" "),
      "data-slot": o,
      "data-title-variant": a,
      "data-title-size": n,
      children: /* @__PURE__ */ i(d, { content: s.content, renderers: e })
    }
  );
}
function $(t) {
  return t > 72 ? "xlong" : t > 48 ? "long" : t > 30 ? "medium" : "short";
}
function P(t) {
  return t.kind !== "markdown" ? "" : t.markdown.replace(/^#{1,6}\s+/gm, "").replace(/[*_`~[\]()>#-]/g, "").replace(/\s+/g, " ").trim();
}
function B({ slide: t, target: e, renderers: o }) {
  return /* @__PURE__ */ f("article", { className: "deck-layout deck-layout-cover", "data-target": e, children: [
    /* @__PURE__ */ f("div", { className: "deck-cover-copy", children: [
      /* @__PURE__ */ i(w, { slide: t, name: "eyebrow", className: "deck-cover-eyebrow", renderers: o }),
      /* @__PURE__ */ i(R, { slide: t, className: "deck-cover-title", variant: "cover", renderers: o }),
      /* @__PURE__ */ i(w, { slide: t, name: "subtitle", className: "deck-cover-subtitle", renderers: o })
    ] }),
    /* @__PURE__ */ i(w, { slide: t, name: "footer", className: "deck-slide-footer", renderers: o })
  ] });
}
function w({
  slide: t,
  name: e,
  className: o,
  renderers: r
}) {
  const a = t.slots.get(e);
  return a ? /* @__PURE__ */ i("div", { className: o, "data-slot": e, children: /* @__PURE__ */ i(d, { content: a.content, renderers: r }) }) : null;
}
function _({ slide: t, target: e, renderers: o }) {
  const r = t.slots.get("image"), a = t.slots.get("caption");
  return /* @__PURE__ */ f("article", { className: "deck-layout deck-layout-image-only", "data-target": e, children: [
    /* @__PURE__ */ i("main", { children: r ? /* @__PURE__ */ i(d, { content: r.content, renderers: o }) : null }),
    /* @__PURE__ */ i("footer", { children: a ? /* @__PURE__ */ i(d, { content: a.content, renderers: o }) : null })
  ] });
}
function z({ slide: t, target: e, renderers: o }) {
  const r = t.slots.get("body"), a = t.slots.get("footer");
  return /* @__PURE__ */ f("article", { className: "deck-layout deck-layout-title-body", "data-target": e, children: [
    /* @__PURE__ */ i("header", { children: /* @__PURE__ */ i(R, { slide: t, renderers: o }) }),
    /* @__PURE__ */ i("main", { children: r ? /* @__PURE__ */ i(d, { content: r.content, renderers: o }) : null }),
    /* @__PURE__ */ i("footer", { children: a ? /* @__PURE__ */ i(d, { content: a.content, renderers: o }) : null })
  ] });
}
function G({ slide: t, target: e, renderers: o }) {
  const r = t.slots.get("left"), a = t.slots.get("right"), s = t.slots.get("footer");
  return /* @__PURE__ */ f("article", { className: "deck-layout deck-layout-two-columns", "data-target": e, children: [
    /* @__PURE__ */ i("header", { children: /* @__PURE__ */ i(R, { slide: t, renderers: o }) }),
    /* @__PURE__ */ f("main", { className: "deck-two-columns-grid", children: [
      /* @__PURE__ */ i("section", { children: r ? /* @__PURE__ */ i(d, { content: r.content, renderers: o }) : null }),
      /* @__PURE__ */ i("section", { children: a ? /* @__PURE__ */ i(d, { content: a.content, renderers: o }) : null })
    ] }),
    /* @__PURE__ */ i("footer", { children: s ? /* @__PURE__ */ i(d, { content: s.content, renderers: o }) : null })
  ] });
}
const J = [
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
    component: B
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
    component: z
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
    component: G
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
    component: _
  }
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
}, M = [
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
], H = [
  { name: "none", displayName: "None" },
  { name: "fade", displayName: "Fade" },
  { name: "slide-left", displayName: "Slide left" },
  { name: "slide-right", displayName: "Slide right" },
  { name: "zoom", displayName: "Zoom" }
];
function Q(t = {}) {
  const e = t.layouts ?? J, o = t.renderers ?? D, r = t.themes ?? M, a = t.transitions ?? H, s = t.registryCollisionStrategy ?? "override";
  return {
    layouts: k(e, (n) => n.name, s, "layout"),
    renderers: k(o, (n) => n.kind, s, "renderer"),
    themes: k(r, (n) => n.id, s, "theme"),
    transitions: k(a, (n) => n.name, s, "transition"),
    assets: L,
    storage: t.storage ?? new T(),
    pdf: t.pdf ?? E
  };
}
function k(t, e, o, r) {
  const a = /* @__PURE__ */ new Map();
  for (const s of t) {
    const n = e(s);
    if (a.has(n)) {
      if (o === "throw")
        throw new Error(`Duplicate ${r} id '${n}'.`);
      if (o === "keep-first")
        continue;
    }
    a.set(n, s);
  }
  return a;
}
const Z = Q();
export {
  T as L,
  Q as c,
  Z as d
};
