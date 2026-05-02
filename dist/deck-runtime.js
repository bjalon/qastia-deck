import { jsxs as p, jsx as i } from "react/jsx-runtime";
import _e, { parseDocument as Ye } from "yaml";
import { z as h } from "zod";
import { useState as G, useMemo as le, useCallback as _, useRef as ne, useEffect as U } from "react";
import Ge from "react-markdown";
function Je({ fallback: e }) {
  return /* @__PURE__ */ p("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ i("header", { children: /* @__PURE__ */ i("h2", { children: e.title }) }),
    /* @__PURE__ */ i(He, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ i("pre", { children: e.source.content })
  ] });
}
function He({
  diagnostics: e
}) {
  return e.length === 0 ? /* @__PURE__ */ i("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ i("ul", { className: "deck-diagnostics-list", children: e.map((t, n) => /* @__PURE__ */ p("li", { "data-severity": t.severity, children: [
    /* @__PURE__ */ i("strong", { children: t.code }),
    /* @__PURE__ */ i("span", { children: t.message }),
    t.hint ? /* @__PURE__ */ i("small", { children: t.hint }) : null
  ] }, `${t.code}-${n}`)) });
}
const Qe = /```(\w+)?\n([\s\S]*?)```/g, Xe = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;
function Ze(e, t) {
  const n = [];
  Xe.test(e) && n.push({
    code: "MARKDOWN_UNSUPPORTED_HTML",
    severity: "warning",
    message: "Raw HTML is ignored by the default markdown renderer.",
    path: t,
    hint: "Use Markdown syntax or a custom renderer instead."
  });
  const a = [];
  let r = 0;
  for (const l of e.matchAll(Qe)) {
    const [d, w, N] = l, f = l.index ?? 0, g = e.slice(r, f);
    g.trim().length > 0 && a.push({ kind: "markdown", markdown: g }), (w == null ? void 0 : w.toLowerCase()) === "mermaid" ? a.push({ kind: "mermaid", chart: N.trim() }) : a.push({ kind: "code", language: w, code: N.replace(/\n$/, "") }), r = f + d.length;
  }
  const o = e.slice(r);
  return (o.trim().length > 0 || a.length === 0) && a.push({ kind: "markdown", markdown: o }), { nodes: a, diagnostics: n };
}
function H(e, t, n, a, r, o) {
  return {
    code: e,
    severity: t,
    message: n,
    path: a,
    slideId: r,
    hint: o
  };
}
function qe(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const a = `${n.code}:${n.severity}`, r = t.get(a);
    t.set(a, {
      code: n.code,
      severity: n.severity,
      message: String(r ? Number(r.message) + 1 : 1)
    });
  }
  return Array.from(t.values()).map((n) => ({
    code: n.code,
    severity: n.severity,
    count: Number(n.message)
  }));
}
const Le = h.object({
  in: h.string().default("none"),
  out: h.string().default("none"),
  durationMs: h.number().int().nonnegative().default(0)
}).strict(), et = h.object({
  markdown: h.string()
}).strict(), tt = h.object({
  image: h.object({
    assetId: h.string().optional(),
    src: h.string().optional(),
    alt: h.string().optional()
  }).strict()
}).strict(), nt = h.object({
  renderer: h.object({
    kind: h.string(),
    props: h.record(h.unknown()).default({})
  }).strict()
}).strict(), at = h.union([et, tt, nt]), it = h.object({
  version: h.literal(1),
  kind: h.literal("deck"),
  metadata: h.object({
    title: h.string().min(1),
    description: h.string().optional(),
    author: h.string().optional(),
    locale: h.string().optional()
  }).strict(),
  theme: h.object({
    id: h.string().default("default")
  }).strict().default({ id: "default" }),
  defaults: h.object({
    aspectRatio: h.union([h.literal("16:9"), h.literal("4:3")]).default("16:9"),
    transition: Le.default({ in: "none", out: "none", durationMs: 0 })
  }).strict().default({ aspectRatio: "16:9", transition: { in: "none", out: "none", durationMs: 0 } }),
  assets: h.record(
    h.object({
      type: h.literal("image"),
      src: h.string().min(1),
      alt: h.string().min(1)
    }).strict()
  ).default({}),
  slides: h.array(
    h.object({
      id: h.string().min(1),
      layout: h.string().min(1),
      slots: h.record(at).default({}),
      transition: Le.optional()
    }).strict()
  ).min(1)
}).strict();
async function rt(e, t) {
  const n = [];
  let a;
  try {
    const v = Ye(e.content, {
      prettyErrors: !1,
      strict: !0,
      uniqueKeys: !0
    });
    for (const S of v.errors)
      n.push(
        H("YAML_SYNTAX_ERROR", "error", S.message, void 0, void 0)
      );
    for (const S of v.warnings)
      n.push(
        H("YAML_PARSE_WARNING", "warning", S.message, void 0, void 0)
      );
    if (v.errors.length > 0)
      return me(e, n);
    a = v.toJSON();
  } catch (v) {
    return n.push(
      H(
        "YAML_SYNTAX_ERROR",
        "error",
        v instanceof Error ? v.message : "Unable to parse YAML source."
      )
    ), me(e, n);
  }
  const r = it.safeParse(a);
  if (!r.success)
    return n.push(...ot(r.error)), me(e, n);
  const o = r.data, l = st(o, t, n);
  if (n.push(...l), l.some((v) => v.code === "SLIDE_UNKNOWN_LAYOUT"))
    return me(e, n);
  const w = new Map(Object.entries(o.assets)), N = t.runtime.themes.get(o.theme.id) ?? t.runtime.themes.get("default");
  if (!N)
    throw new Error("Deck runtime must provide at least one theme.");
  t.runtime.themes.has(o.theme.id) || n.push(
    H(
      "SCHEMA_INVALID_VALUE",
      "warning",
      `Unknown theme '${o.theme.id}'. Falling back to '${N.id}'.`,
      ["theme", "id"]
    )
  );
  const f = [];
  for (const [v, S] of o.slides.entries()) {
    const c = t.runtime.layouts.get(S.layout);
    if (!c)
      continue;
    const D = /* @__PURE__ */ new Map();
    for (const [u, C] of Object.entries(S.slots)) {
      const R = await lt(u, C, w, [
        "slides",
        String(v),
        "slots",
        u
      ]);
      D.set(u, R), n.push(
        ...R.diagnostics.map((L) => ({
          ...L,
          slideId: L.slideId ?? S.id
        }))
      );
    }
    for (const u of c.requiredSlots)
      D.has(u) || D.set(u, ct(u));
    f.push({
      id: S.id,
      index: v,
      layout: {
        name: c.name,
        definition: c
      },
      transition: ut(
        S.transition ?? o.defaults.transition,
        t,
        ["slides", String(v), "transition"],
        n
      ),
      slots: D,
      diagnostics: n.filter((u) => u.slideId === S.id)
    });
  }
  const g = {
    version: 1,
    metadata: o.metadata,
    theme: N,
    aspectRatio: o.defaults.aspectRatio,
    assets: w,
    slides: f
  };
  return n.length > 0 ? {
    status: "degraded",
    deck: g,
    diagnostics: n
  } : {
    status: "valid",
    deck: g,
    diagnostics: []
  };
}
function me(e, t) {
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
function ot(e) {
  return e.issues.map((t) => {
    const n = t.path.map(String), a = t.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";
    return H(
      a,
      "error",
      t.message,
      n.length > 0 ? n : void 0,
      void 0
    );
  });
}
function st(e, t, n) {
  const a = [], r = /* @__PURE__ */ new Set();
  e.slides.length === 0 && a.push(H("DECK_EMPTY_SLIDES", "error", "Deck must contain at least one slide.", ["slides"]));
  for (const [o, l] of e.slides.entries()) {
    r.has(l.id) && a.push(
      H(
        "SLIDE_DUPLICATE_ID",
        "error",
        `Slide id '${l.id}' is already used.`,
        ["slides", String(o), "id"],
        l.id
      )
    ), r.add(l.id);
    const d = t.runtime.layouts.get(l.layout);
    if (!d) {
      a.push(
        H(
          "SLIDE_UNKNOWN_LAYOUT",
          "error",
          `Unknown layout '${l.layout}'.`,
          ["slides", String(o), "layout"],
          l.id,
          "Register the layout in createDeckRuntime or choose a default layout."
        )
      );
      continue;
    }
    for (const w of d.requiredSlots)
      w in l.slots || a.push(
        H(
          "LAYOUT_MISSING_SLOT",
          "error",
          `Layout '${d.name}' requires slot '${w}'.`,
          ["slides", String(o), "slots"],
          l.id
        )
      );
    for (const w of Object.keys(l.slots))
      d.forbiddenSlots.includes(w) && a.push(
        H(
          "LAYOUT_FORBIDDEN_SLOT",
          "warning",
          `Layout '${d.name}' does not render slot '${w}'.`,
          ["slides", String(o), "slots", w],
          l.id
        )
      );
  }
  return n.length > 0, a;
}
async function lt(e, t, n, a) {
  const r = [], o = await dt(t, n, a, r);
  return {
    name: e,
    kind: o.kind === "renderer" ? "renderer" : o.kind,
    content: o,
    diagnostics: r
  };
}
async function dt(e, t, n, a) {
  if ("markdown" in e) {
    const r = Ze(e.markdown, n);
    return a.push(...r.diagnostics), {
      kind: "markdown",
      markdown: e.markdown,
      nodes: r.nodes
    };
  }
  if ("image" in e) {
    e.image.assetId && !t.has(e.image.assetId) && a.push(
      H(
        "ASSET_NOT_FOUND",
        "error",
        `Asset '${e.image.assetId}' was not found.`,
        n
      )
    );
    const r = e.image.assetId ? t.get(e.image.assetId) : void 0;
    return {
      kind: "image",
      assetId: e.image.assetId,
      src: (r == null ? void 0 : r.src) ?? e.image.src,
      alt: (r == null ? void 0 : r.alt) ?? e.image.alt
    };
  }
  return {
    kind: "renderer",
    rendererKind: e.renderer.kind,
    props: e.renderer.props
  };
}
function ct(e) {
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
function ut(e, t, n, a) {
  const r = t.runtime.transitions.has(e.in) ? e.in : "none", o = t.runtime.transitions.has(e.out) ? e.out : "none";
  return r !== e.in && a.push(
    H("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.in}'.`, [...n, "in"])
  ), o !== e.out && a.push(
    H("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.out}'.`, [...n, "out"])
  ), {
    in: r,
    out: o,
    durationMs: e.durationMs
  };
}
function ge({ slide: e, target: t }) {
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
function Fe({
  activeIndex: e,
  deck: t,
  target: n = "screen"
}) {
  const a = t.slides[e] ?? t.slides[0];
  return a ? /* @__PURE__ */ i(ge, { slide: a, target: n }) : null;
}
function Ee(e, t) {
  if (!t)
    return 0;
  const n = e.slides.findIndex((a) => a.id === t);
  return n === -1 ? 0 : n;
}
function Be({
  deck: e,
  defaultSelectedSlideId: t,
  initialSlideId: n,
  onAction: a,
  onSlideChange: r,
  selectedSlideId: o
}) {
  const l = Ee(e, t ?? n), d = o ? e.slides.findIndex((u) => u.id === o) : -1, [w, N] = G(l), f = d >= 0 ? d : w, g = e.slides[f] ?? e.slides[0], v = le(
    () => ({
      activeSlideId: (g == null ? void 0 : g.id) ?? "",
      activeSlideIndex: f
    }),
    [f, g == null ? void 0 : g.id]
  ), S = _(
    (u) => {
      a == null || a(u, v);
    },
    [a, v]
  ), c = _(
    (u, C) => {
      const R = Math.min(Math.max(u, 0), e.slides.length - 1), L = g == null ? void 0 : g.id;
      d < 0 && N(R);
      const E = e.slides[R];
      E && E.id !== L && (r == null || r({
        previousSlideId: L,
        activeSlideId: E.id,
        activeSlideIndex: R
      })), S({
        type: R > f ? "next-slide" : "previous-slide",
        origin: C,
        slideId: E == null ? void 0 : E.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [f, g == null ? void 0 : g.id, d, e.slides, S, r]
  ), D = _(
    (u) => {
      d >= 0 || N(Ee(e, u));
    },
    [d, e]
  );
  return {
    activeIndex: f,
    activeSlide: g,
    emitAction: S,
    goTo: c,
    resetToSlideId: D,
    state: v
  };
}
function mt({
  activeIndex: e,
  onClose: t,
  onNext: n,
  onPrevious: a,
  slideCount: r
}) {
  return /* @__PURE__ */ p("div", { className: "deck-presentation-controls", "aria-label": "Navigation presentation", children: [
    /* @__PURE__ */ i("button", { type: "button", onClick: a, disabled: e === 0, "aria-label": "Slide precedente", children: "Previous" }),
    /* @__PURE__ */ p("span", { children: [
      e + 1,
      " / ",
      r
    ] }),
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        onClick: n,
        disabled: e >= r - 1,
        "aria-label": "Slide suivante",
        children: "Next"
      }
    ),
    /* @__PURE__ */ i("button", { type: "button", onClick: t, children: "Quitter" })
  ] });
}
function nn({
  deck: e,
  defaultOpen: t = !1,
  initialSlideId: n,
  onAction: a,
  onOpenChange: r,
  onSlideChange: o,
  open: l,
  options: d,
  selectedSlideId: w
}) {
  var q, P, I, W, Q, z, ue;
  const N = ne(null), f = ne(void 0), g = ne(void 0), [v, S] = G(t), [c, D] = G(!0), { activeIndex: u, activeSlide: C, emitAction: R, goTo: L, resetToSlideId: E } = Be({
    deck: e,
    initialSlideId: n,
    onAction: a,
    onSlideChange: o,
    selectedSlideId: w
  }), y = l ?? v, b = ((q = d == null ? void 0 : d.fullscreen) == null ? void 0 : q.strategy) ?? "browser-fullscreen", J = ((P = d == null ? void 0 : d.fullscreen) == null ? void 0 : P.closeOnEscape) ?? !0, A = ((I = d == null ? void 0 : d.controls) == null ? void 0 : I.visibility) ?? "auto", x = ((W = d == null ? void 0 : d.controls) == null ? void 0 : W.visibility) === "auto" ? d.controls.autoHideDelayMs ?? 1800 : 1800, j = ((Q = d == null ? void 0 : d.hint) == null ? void 0 : Q.showWhenControlsHidden) ?? !0, ke = ((z = d == null ? void 0 : d.hint) == null ? void 0 : z.text) ?? "Fleches gauche/droite: precedent/suivant. Escape: quitter.", pe = ((ue = d == null ? void 0 : d.hint) == null ? void 0 : ue.position) ?? "bottom-right";
  g.current = C == null ? void 0 : C.id;
  const Z = _(
    (V, M) => {
      l === void 0 && S(V), r == null || r({
        open: V,
        origin: M,
        slideId: g.current,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [r, l]
  ), O = _(
    (V = "mouse") => {
      const M = N.current;
      document.fullscreenElement === M && document.exitFullscreen().catch(() => {
      }), Z(!1, V), R({
        type: "toggle-fullscreen",
        origin: V,
        slideId: C == null ? void 0 : C.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [C == null ? void 0 : C.id, R, Z]
  ), F = _(() => {
    f.current !== void 0 && (window.clearTimeout(f.current), f.current = void 0);
  }, []), T = _(() => {
    A === "auto" && (D(!0), F(), f.current = window.setTimeout(() => {
      D(!1), f.current = void 0;
    }, x));
  }, [x, F, A]);
  if (U(() => {
    y && E(n);
  }, [n, y, E]), U(() => {
    if (y) {
      if (A === "auto")
        return T(), F;
      D(A === "visible"), F();
    }
  }, [F, A, y, T]), U(() => {
    if (!y)
      return;
    const V = N.current;
    b === "browser-fullscreen" && (V != null && V.requestFullscreen) && V.requestFullscreen().catch(() => {
    });
    function M() {
      b === "browser-fullscreen" && document.fullscreenElement === null && Z(!1, "keyboard");
    }
    return document.addEventListener("fullscreenchange", M), () => {
      document.removeEventListener("fullscreenchange", M), document.fullscreenElement === V && document.exitFullscreen().catch(() => {
      });
    };
  }, [b, y, Z]), U(() => {
    if (!y)
      return;
    function V(M) {
      (M.key === "Escape" || M.key === "ArrowRight" || M.key === "PageDown" || M.key === " " || M.key === "ArrowLeft" || M.key === "PageUp") && (M.preventDefault(), M.stopImmediatePropagation()), M.key === "Escape" && J && O("keyboard"), (M.key === "ArrowRight" || M.key === "PageDown" || M.key === " ") && L(u + 1, "keyboard"), (M.key === "ArrowLeft" || M.key === "PageUp") && L(u - 1, "keyboard");
    }
    return window.addEventListener("keydown", V, !0), () => window.removeEventListener("keydown", V, !0);
  }, [u, J, O, L, y]), !y || !C)
    return null;
  const B = A === "visible" || A === "auto" && c, k = j && !B;
  return /* @__PURE__ */ p(
    "section",
    {
      ref: N,
      className: `deck-presentation-overlay ${e.theme.cssClassName}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Presentation plein ecran",
      onMouseMove: T,
      onPointerMove: T,
      children: [
        /* @__PURE__ */ i("div", { className: "deck-presentation-stage", children: /* @__PURE__ */ i(Fe, { deck: e, activeIndex: u }) }),
        B ? /* @__PURE__ */ i(
          mt,
          {
            activeIndex: u,
            slideCount: e.slides.length,
            onPrevious: () => L(u - 1, "mouse"),
            onNext: () => L(u + 1, "mouse"),
            onClose: () => O("mouse")
          }
        ) : null,
        k ? /* @__PURE__ */ i("p", { className: "deck-presentation-hint", "data-position": pe, children: ke }) : null
      ]
    }
  );
}
function an({ deck: e }) {
  return /* @__PURE__ */ i("div", { className: `deck-print-root ${e.theme.cssClassName}`, children: e.slides.map((t) => /* @__PURE__ */ i("section", { className: "deck-print-page", "data-slide-id": t.id, children: /* @__PURE__ */ i(ge, { slide: t, target: "print" }) }, t.id)) });
}
const ft = {
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
function Te(e, t) {
  return `${e}:v1:${t}:current`;
}
function ye(e, t) {
  return `${e}:v1:${t}:draft`;
}
function De(e, t) {
  return `${e}:v1:${t}:versions:index`;
}
function fe(e, t, n) {
  return `${e}:v1:${t}:versions:${n}`;
}
class Ue {
  async loadCurrent(t) {
    return he(Te(t.namespace, t.deckId));
  }
  async saveCurrent(t) {
    return se(Te(t.namespace, t.deckId), t);
  }
  async saveDraft(t) {
    return se(ye(t.namespace, t.deckId), t);
  }
  async loadDraft(t) {
    return he(ye(t.namespace, t.deckId));
  }
  async clearDraft(t) {
    var n;
    try {
      return (n = de()) == null || n.removeItem(ye(t.namespace, t.deckId)), { status: "success" };
    } catch (a) {
      return Ae(a);
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
    }, a = JSON.stringify(n), r = await se(fe(t.namespace, t.deckId, t.id), n);
    if (r.status === "failed")
      return r;
    const o = await be(t.namespace, t.deckId), l = {
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
        ...o.versions.filter((w) => w.id !== t.id)
      ]
    }, d = ht(l, t.limits);
    return se(De(t.namespace, t.deckId), d);
  }
  async listVersions(t) {
    return (await be(t.namespace, t.deckId)).versions;
  }
  async loadVersion(t) {
    return he(
      fe(t.namespace, t.deckId, t.versionId)
    );
  }
  async deleteVersion(t) {
    var n;
    try {
      (n = de()) == null || n.removeItem(fe(t.namespace, t.deckId, t.versionId));
      const a = await be(t.namespace, t.deckId), r = {
        ...a,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        versions: a.versions.filter((o) => o.id !== t.versionId)
      };
      return se(De(t.namespace, t.deckId), r);
    } catch (a) {
      return Ae(a);
    }
  }
}
function ht(e, t) {
  var o;
  if (!t)
    return e;
  const n = [...e.versions], a = n.filter((l) => l.reason === "autosave");
  for (; n.length > t.maxVersionsPerDeck; ) {
    const l = ve(n, (d) => d.reason === "autosave");
    n.splice(l >= 0 ? l : n.length - 1, 1);
  }
  for (; n.filter((l) => l.reason === "autosave").length > t.maxAutosaveVersionsPerDeck; ) {
    const l = ve(n, (d) => d.reason === "autosave");
    if (l < 0)
      break;
    n.splice(l, 1);
  }
  let r = n.reduce((l, d) => l + d.sizeBytes, 0);
  for (; r > t.maxBytesPerDeck && n.length > 0; ) {
    const l = ve(n, (N) => N.reason === "autosave"), d = l >= 0 ? l : n.length - 1, [w] = n.splice(d, 1);
    r -= (w == null ? void 0 : w.sizeBytes) ?? 0;
  }
  for (const l of a.filter((d) => !n.some((w) => w.id === d.id)))
    (o = de()) == null || o.removeItem(fe(e.namespace, e.deckId, l.id));
  return {
    ...e,
    versions: n
  };
}
async function be(e, t) {
  return await he(De(e, t)) ?? {
    deckId: t,
    namespace: e,
    schemaVersion: 1,
    updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
    versions: []
  };
}
function he(e) {
  var t;
  try {
    const n = (t = de()) == null ? void 0 : t.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function se(e, t) {
  var n;
  try {
    return (n = de()) == null || n.setItem(e, JSON.stringify(t)), { status: "success" };
  } catch (a) {
    return Ae(a);
  }
}
function Ae(e) {
  return {
    status: "failed",
    diagnostics: [gt(e)]
  };
}
function gt(e) {
  return {
    code: "STORAGE_QUOTA_EXCEEDED",
    severity: "error",
    message: e instanceof Error ? e.message : "Unable to write deck state to storage."
  };
}
function de() {
  if (!(typeof window > "u"))
    return window.localStorage;
}
function ve(e, t) {
  for (let n = e.length - 1; n >= 0; n -= 1)
    if (t(e[n]))
      return n;
  return -1;
}
const wt = /^(javascript|data|vbscript):/i, kt = {
  async resolveImage(e) {
    const t = e.assetId ? e.assets.get(e.assetId) : void 0, n = (t == null ? void 0 : t.src) ?? e.src, a = (t == null ? void 0 : t.alt) ?? "";
    if (!n || wt.test(n.trim()))
      throw new Error("Image source is missing or unsafe.");
    return {
      src: n,
      alt: a
    };
  }
};
function K({ content: e }) {
  return e.kind === "image" ? /* @__PURE__ */ i(
    "img",
    {
      className: "deck-slot-image",
      src: e.src ?? "",
      alt: e.alt ?? "",
      loading: "lazy"
    }
  ) : e.kind === "renderer" ? /* @__PURE__ */ p("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    e.rendererKind
  ] }) : /* @__PURE__ */ i("div", { className: "deck-markdown", children: e.nodes.map((t, n) => /* @__PURE__ */ i(pt, { node: t }, `${t.kind}-${n}`)) });
}
function pt({ node: e }) {
  return e.kind === "code" ? /* @__PURE__ */ i("pre", { className: "deck-code-block", children: /* @__PURE__ */ i("code", { children: e.code }) }) : e.kind === "mermaid" ? /* @__PURE__ */ i("pre", { className: "deck-mermaid-block", children: e.chart }) : /* @__PURE__ */ i(
    Ge,
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
function Pe({
  slide: e,
  name: t = "title",
  className: n,
  variant: a = "section"
}) {
  const r = e.slots.get(t);
  if (!r)
    return null;
  const o = yt(bt(r.content).length);
  return /* @__PURE__ */ i(
    "div",
    {
      className: ["deck-title-slot", n].filter(Boolean).join(" "),
      "data-slot": t,
      "data-title-variant": a,
      "data-title-size": o,
      children: /* @__PURE__ */ i(K, { content: r.content })
    }
  );
}
function yt(e) {
  return e > 72 ? "xlong" : e > 48 ? "long" : e > 30 ? "medium" : "short";
}
function bt(e) {
  return e.kind !== "markdown" ? "" : e.markdown.replace(/^#{1,6}\s+/gm, "").replace(/[*_`~[\]()>#-]/g, "").replace(/\s+/g, " ").trim();
}
function vt({ slide: e, target: t }) {
  return /* @__PURE__ */ p("article", { className: "deck-layout deck-layout-cover", "data-target": t, children: [
    /* @__PURE__ */ p("div", { className: "deck-cover-copy", children: [
      /* @__PURE__ */ i(Se, { slide: e, name: "eyebrow", className: "deck-cover-eyebrow" }),
      /* @__PURE__ */ i(Pe, { slide: e, className: "deck-cover-title", variant: "cover" }),
      /* @__PURE__ */ i(Se, { slide: e, name: "subtitle", className: "deck-cover-subtitle" })
    ] }),
    /* @__PURE__ */ i(Se, { slide: e, name: "footer", className: "deck-slide-footer" })
  ] });
}
function Se({
  slide: e,
  name: t,
  className: n
}) {
  const a = e.slots.get(t);
  return a ? /* @__PURE__ */ i("div", { className: n, "data-slot": t, children: /* @__PURE__ */ i(K, { content: a.content }) }) : null;
}
function St({ slide: e, target: t }) {
  const n = e.slots.get("image"), a = e.slots.get("caption");
  return /* @__PURE__ */ p("article", { className: "deck-layout deck-layout-image-only", "data-target": t, children: [
    /* @__PURE__ */ i("main", { children: n ? /* @__PURE__ */ i(K, { content: n.content }) : null }),
    /* @__PURE__ */ i("footer", { children: a ? /* @__PURE__ */ i(K, { content: a.content }) : null })
  ] });
}
function It({ slide: e, target: t }) {
  const n = e.slots.get("body"), a = e.slots.get("footer");
  return /* @__PURE__ */ p("article", { className: "deck-layout deck-layout-title-body", "data-target": t, children: [
    /* @__PURE__ */ i("header", { children: /* @__PURE__ */ i(Pe, { slide: e }) }),
    /* @__PURE__ */ i("main", { children: n ? /* @__PURE__ */ i(K, { content: n.content }) : null }),
    /* @__PURE__ */ i("footer", { children: a ? /* @__PURE__ */ i(K, { content: a.content }) : null })
  ] });
}
function Nt({ slide: e, target: t }) {
  const n = e.slots.get("left"), a = e.slots.get("right"), r = e.slots.get("footer");
  return /* @__PURE__ */ p("article", { className: "deck-layout deck-layout-two-columns", "data-target": t, children: [
    /* @__PURE__ */ i("header", { children: /* @__PURE__ */ i(Pe, { slide: e }) }),
    /* @__PURE__ */ p("main", { className: "deck-two-columns-grid", children: [
      /* @__PURE__ */ i("section", { children: n ? /* @__PURE__ */ i(K, { content: n.content }) : null }),
      /* @__PURE__ */ i("section", { children: a ? /* @__PURE__ */ i(K, { content: a.content }) : null })
    ] }),
    /* @__PURE__ */ i("footer", { children: r ? /* @__PURE__ */ i(K, { content: r.content }) : null })
  ] });
}
const Dt = [
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
    component: vt
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
    component: It
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
    component: Nt
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
    component: St
  }
];
function Me({ node: e }) {
  return /* @__PURE__ */ i(K, { content: { kind: "markdown", markdown: "", nodes: [e] } });
}
const At = {
  kind: "markdown",
  render: Me
}, Pt = {
  kind: "code",
  render: Me
}, Mt = {
  kind: "mermaid",
  render: Me
}, Ct = [
  At,
  Pt,
  Mt
], Y = {
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
}, xt = [
  {
    id: "default",
    displayName: "Standard",
    cssClassName: "deck-theme-default",
    tokens: Y
  },
  {
    id: "fintech-light",
    displayName: "Standard actuel",
    cssClassName: "deck-theme-fintech-light",
    tokens: Y
  },
  {
    id: "qastia-coaching",
    displayName: "Qastia coaching",
    cssClassName: "deck-theme-qastia-coaching",
    tokens: {
      ...Y,
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
        mono: Y.font.mono
      }
    }
  },
  {
    id: "editorial-indigo",
    displayName: "Editorial indigo",
    cssClassName: "deck-theme-editorial-indigo",
    tokens: {
      ...Y,
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
      ...Y,
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
      ...Y,
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
      ...Y,
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
], Rt = [
  { name: "none", displayName: "None" },
  { name: "fade", displayName: "Fade" },
  { name: "slide-left", displayName: "Slide left" },
  { name: "slide-right", displayName: "Slide right" },
  { name: "zoom", displayName: "Zoom" }
];
function Lt(e = {}) {
  const t = e.layouts ?? Dt, n = e.renderers ?? Ct, a = e.themes ?? xt, r = e.transitions ?? Rt;
  return {
    layouts: new Map(t.map((o) => [o.name, o])),
    renderers: new Map(n.map((o) => [o.kind, o])),
    themes: new Map(a.map((o) => [o.id, o])),
    transitions: new Map(r.map((o) => [o.name, o])),
    assets: kt,
    storage: e.storage ?? new Ue(),
    pdf: e.pdf ?? ft
  };
}
const Et = Lt();
function Tt({
  activeIndex: e,
  onNext: t,
  onOpenPresentation: n,
  onPresentationControlsModeChange: a,
  onPrevious: r,
  placement: o,
  presentationButtonLabel: l,
  presentationControlsMode: d,
  presentationDisabled: w,
  presentationUnavailableLabel: N,
  showCounter: f,
  showPresentationButton: g,
  showPresentationControlsModeSelect: v,
  showPreviousNext: S,
  slideCount: c
}) {
  return /* @__PURE__ */ p("div", { className: "deck-show-toolbar", "data-placement": o, "aria-label": "Deck navigation", children: [
    g ? /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        onClick: n,
        disabled: w,
        title: w ? N : l,
        children: l
      }
    ) : null,
    g && v ? /* @__PURE__ */ p("label", { className: "deck-presentation-mode-select", children: [
      /* @__PURE__ */ i("span", { children: "Presentation controls" }),
      /* @__PURE__ */ p(
        "select",
        {
          value: d,
          onChange: (D) => a(D.currentTarget.value),
          children: [
            /* @__PURE__ */ i("option", { value: "visible", children: "Boutons visibles" }),
            /* @__PURE__ */ i("option", { value: "hidden", children: "Boutons hidden" }),
            /* @__PURE__ */ i("option", { value: "auto", children: "Auto" })
          ]
        }
      )
    ] }) : null,
    S ? /* @__PURE__ */ i("button", { type: "button", onClick: r, disabled: e === 0, children: "Previous" }) : null,
    f ? /* @__PURE__ */ p("span", { children: [
      e + 1,
      " / ",
      c
    ] }) : null,
    S ? /* @__PURE__ */ i("button", { type: "button", onClick: t, disabled: e >= c - 1, children: "Next" }) : null
  ] });
}
function rn({
  controls: e,
  deck: t,
  defaultSelectedSlideId: n,
  initialSlideId: a,
  keyboardNavigation: r,
  mode: o = "viewer",
  onAction: l,
  onRequestPresentation: d,
  onSlideChange: w,
  selectedSlideId: N
}) {
  const { activeIndex: f, activeSlide: g, emitAction: v, goTo: S } = Be({
    deck: t,
    defaultSelectedSlideId: n,
    initialSlideId: a,
    onAction: l,
    onSlideChange: w,
    selectedSlideId: N
  }), c = e === !1 ? void 0 : e, D = e !== !1, u = (c == null ? void 0 : c.showPreviousNext) ?? !0, C = (c == null ? void 0 : c.showCounter) ?? !0, R = !!(c != null && c.showPresentationButton), L = ne(null), E = r ?? (o === "embedded" ? "focus-within" : "global"), y = _(() => {
    c != null && c.presentationDisabled || (d == null || d({
      type: "presentation-requested",
      slideId: g == null ? void 0 : g.id,
      activeSlideIndex: f,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }), v({
      type: "toggle-fullscreen",
      origin: "mouse",
      slideId: g == null ? void 0 : g.id,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [f, g == null ? void 0 : g.id, c == null ? void 0 : c.presentationDisabled, v, d]);
  U(() => {
    if (E === !1)
      return;
    function A(x) {
      var j;
      Vt(x.target) || E === "focus-within" && (!(x.target instanceof Node) || !((j = L.current) != null && j.contains(x.target))) || ((x.key === "ArrowRight" || x.key === "PageDown" || x.key === " ") && (x.preventDefault(), S(f + 1, "keyboard")), (x.key === "ArrowLeft" || x.key === "PageUp") && (x.preventDefault(), S(f - 1, "keyboard")));
    }
    return window.addEventListener("keydown", A), () => window.removeEventListener("keydown", A);
  }, [f, S, E]);
  const b = (c == null ? void 0 : c.placement) ?? "top", J = D ? /* @__PURE__ */ i(
    Tt,
    {
      activeIndex: f,
      slideCount: t.slides.length,
      placement: b,
      showPreviousNext: u,
      showCounter: C,
      showPresentationButton: R,
      presentationDisabled: !!(c != null && c.presentationDisabled),
      showPresentationControlsModeSelect: !!(c != null && c.showPresentationControlsModeSelect),
      presentationControlsMode: (c == null ? void 0 : c.presentationControlsMode) ?? "auto",
      presentationButtonLabel: (c == null ? void 0 : c.presentationButtonLabel) ?? "Presentation",
      presentationUnavailableLabel: (c == null ? void 0 : c.presentationUnavailableLabel) ?? "Presentation is unavailable",
      onOpenPresentation: y,
      onPresentationControlsModeChange: (A) => {
        var x;
        return (x = c == null ? void 0 : c.onPresentationControlsModeChange) == null ? void 0 : x.call(c, A);
      },
      onPrevious: () => S(f - 1, "mouse"),
      onNext: () => S(f + 1, "mouse")
    }
  ) : null;
  return /* @__PURE__ */ p(
    "div",
    {
      ref: L,
      className: `deck-screen-root ${t.theme.cssClassName}`,
      "data-mode": o,
      tabIndex: E === "focus-within" ? 0 : void 0,
      children: [
        b === "top" ? J : null,
        /* @__PURE__ */ i(Fe, { deck: t, activeIndex: f }),
        b === "bottom" ? J : null
      ]
    }
  );
}
function Vt(e) {
  return e instanceof HTMLElement ? !!e.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']") : !1;
}
function te(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n += 1)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, "0");
}
const $t = {
  desktopBreakpointPx: 1024,
  slideRailWidthPx: 260,
  inspectorWidthPx: 340,
  showSlideRail: !0,
  showInspector: !0,
  showActiveSlidePreview: !0,
  showSourceModeToggle: !0,
  showVersionHistory: !0,
  showDiagnosticsPanel: !0,
  density: "comfortable"
}, _t = {
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
}, Ie = {
  adapter: new Ue(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, Ht = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function ce(e) {
  try {
    const t = _e.parse(e.content);
    return ie(t) ? t : null;
  } catch {
    return null;
  }
}
function we(e, t) {
  return {
    ...e,
    content: _e.stringify(t, { lineWidth: 0 })
  };
}
function ae(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(ie);
}
function Ve(e, t, n, a) {
  return Ce(e, t, (r) => {
    const o = je(r);
    o[n] = { markdown: a };
  });
}
function Ne(e, t, n, a) {
  return Ce(e, t, (r) => {
    const o = je(r);
    o[n] = {
      image: Wt({
        assetId: a.assetId,
        src: a.src,
        alt: a.alt
      })
    };
  });
}
function Ft(e, t, n) {
  return Ce(e, t, (a) => {
    a.layout = n;
  });
}
function Bt(e, t = "title-body") {
  const n = ce(e);
  if (!n)
    return e;
  const a = ae(n), r = Oe(a, "slide");
  return a.push({
    id: r,
    layout: t,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }), n.slides = a, we(e, n);
}
function Ut(e, t) {
  const n = ce(e);
  if (!n)
    return e;
  const a = ae(n), r = a.findIndex((l) => l.id === t);
  if (r < 0)
    return e;
  const o = structuredClone(a[r]);
  return o.id = Oe(a, `${t}-copy`), a.splice(r + 1, 0, o), n.slides = a, we(e, n);
}
function Kt(e, t) {
  const n = ce(e);
  if (!n)
    return e;
  const a = ae(n).filter((r) => r.id !== t);
  return n.slides = a.length > 0 ? a : ae(n), we(e, n);
}
function jt(e, t, n) {
  const a = Ke(e, t, n);
  return ie(a) && typeof a.markdown == "string" ? a.markdown : "";
}
function Ot(e, t, n) {
  const a = Ke(e, t, n), r = ie(a) && ie(a.image) ? a.image : {};
  return {
    assetId: typeof r.assetId == "string" ? r.assetId : "",
    src: typeof r.src == "string" ? r.src : "",
    alt: typeof r.alt == "string" ? r.alt : ""
  };
}
function Ce(e, t, n) {
  const a = ce(e);
  if (!a)
    return e;
  const r = ae(a), o = r.find((l) => l.id === t);
  return o ? (n(o), a.slides = r, we(e, a)) : e;
}
function Ke(e, t, n) {
  var o;
  const a = ce(e);
  if (!a)
    return;
  const r = ae(a).find((l) => l.id === t);
  return (o = r == null ? void 0 : r.slots) == null ? void 0 : o[n];
}
function je(e) {
  return ie(e.slots) || (e.slots = {}), e.slots;
}
function Oe(e, t) {
  const n = new Set(e.map((o) => o.id).filter((o) => !!o));
  let a = $e(t), r = 2;
  for (; n.has(a); )
    a = `${$e(t)}-${r}`, r += 1;
  return a;
}
function $e(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function Wt(e) {
  return Object.fromEntries(
    Object.entries(e).filter((t) => !!t[1])
  );
}
function ie(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function on(e) {
  var Re;
  const {
    autosave: t,
    deckId: n,
    features: a,
    initialSelectedSlideId: r,
    layout: o,
    locale: l = "fr-FR",
    namespace: d,
    onChange: w,
    onCompile: N,
    onError: f,
    onRestoreVersion: g,
    onSave: v,
    onSelectedSlideChange: S,
    readOnly: c,
    storage: D
  } = e, u = e.options, C = e.runtime ?? Et, R = e.mode === "controlled", [L, E] = G(
    R ? e.value : e.initialValue
  ), y = R ? e.value : L, [b, J] = G(null), [A, x] = G(
    r
  ), [j, ke] = G(
    ((Re = u == null ? void 0 : u.editing) == null ? void 0 : Re.defaultMode) === "source" ? "source" : "form"
  ), [pe, Z] = G([]), O = ne(N), F = ne(f);
  O.current = N, F.current = f;
  const T = le(() => {
    var $;
    const s = { ...$t, ...o }, m = u == null ? void 0 : u.panels;
    return (m == null ? void 0 : m.slideRail) === !1 ? s.showSlideRail = !1 : m != null && m.slideRail && (s.showSlideRail = m.slideRail.visibleDefault ?? s.showSlideRail, s.slideRailWidthPx = m.slideRail.widthPx ?? s.slideRailWidthPx), (m == null ? void 0 : m.inspector) === !1 ? s.showInspector = !1 : m != null && m.inspector && (s.showInspector = m.inspector.visibleDefault ?? s.showInspector, s.inspectorWidthPx = m.inspector.widthPx ?? s.inspectorWidthPx), (m == null ? void 0 : m.diagnostics) === !1 ? s.showDiagnosticsPanel = !1 : m != null && m.diagnostics && (s.showDiagnosticsPanel = m.diagnostics.visibleDefault ?? s.showDiagnosticsPanel), (m == null ? void 0 : m.activeSlidePreview) === !1 ? s.showActiveSlidePreview = !1 : m != null && m.activeSlidePreview && (s.showActiveSlidePreview = m.activeSlidePreview.visibleDefault ?? s.showActiveSlidePreview), (m == null ? void 0 : m.versionHistory) === !1 ? s.showVersionHistory = !1 : m != null && m.versionHistory && (s.showVersionHistory = m.versionHistory.visibleDefault ?? s.showVersionHistory), (($ = u == null ? void 0 : u.editing) == null ? void 0 : $.allowSourceMode) === !1 && (s.showSourceModeToggle = !1), s;
  }, [o, u]), B = le(() => {
    var m, $, X, oe;
    const s = { ..._t, ...a };
    return ((m = u == null ? void 0 : u.editing) == null ? void 0 : m.allowSourceMode) !== void 0 && (s.allowRawSourceEdit = u.editing.allowSourceMode), (($ = u == null ? void 0 : u.editing) == null ? void 0 : $.allowLayoutChange) !== void 0 && (s.allowLayoutChange = u.editing.allowLayoutChange), ((X = u == null ? void 0 : u.layoutSelector) == null ? void 0 : X.enabled) !== void 0 && (s.allowLayoutChange = u.layoutSelector.enabled), (oe = u == null ? void 0 : u.panels) != null && oe.slideRail && (u.panels.slideRail.allowReorder !== void 0 && (s.allowReorderSlides = u.panels.slideRail.allowReorder), u.panels.slideRail.allowAddDelete !== void 0 && (s.allowAddSlide = u.panels.slideRail.allowAddDelete, s.allowDeleteSlide = u.panels.slideRail.allowAddDelete)), s;
  }, [a, u]), k = le(
    () => D === !1 ? void 0 : {
      ...Ie,
      namespace: d ?? (D == null ? void 0 : D.namespace) ?? Ie.namespace,
      adapter: (D == null ? void 0 : D.adapter) ?? C.storage ?? Ie.adapter,
      ...D
    },
    [d, C.storage, D]
  ), q = le(
    () => t === !1 ? void 0 : { ...Ht, ...t },
    [t]
  ), P = (b == null ? void 0 : b.status) === "valid" || (b == null ? void 0 : b.status) === "degraded" ? b.deck : void 0, I = (P == null ? void 0 : P.slides.find((s) => s.id === A)) ?? (P == null ? void 0 : P.slides[0]), W = _(
    (s, m, $) => {
      const X = {
        reason: m,
        deckId: n,
        selectedSlideId: $ ?? A,
        sourceHash: te(s.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      R || E(s), w == null || w(s, X);
    },
    [R, n, w, A]
  );
  U(() => {
    let s = !1;
    return rt(y, {
      runtime: C
    }).then((m) => {
      var $;
      s || (J(m), ($ = O.current) == null || $.call(O, m));
    }).catch((m) => {
      var $;
      ($ = F.current) == null || $.call(F, {
        message: m instanceof Error ? m.message : "Deck compilation failed.",
        cause: m
      });
    }), () => {
      s = !0;
    };
  }, [l, C, y]), U(() => {
    if (!P || A)
      return;
    const s = P.slides[0];
    s && x(s.id);
  }, [P, A]), U(() => {
    k != null && k.recoverOnMount && k.adapter.loadDraft({ deckId: n, namespace: k.namespace }).then((s) => {
      !s || s.sourceHash === te(y.content) || (x(s.selectedSlideId), W(s.source, "crash-recovery", s.selectedSlideId));
    }).catch((s) => {
      f == null || f({
        message: s instanceof Error ? s.message : "Unable to recover deck draft.",
        cause: s
      });
    });
  }, [n, f, W, y.content, k]), U(() => {
    if (!k || !q || !k.saveDraftOnChange)
      return;
    const s = window.setTimeout(() => {
      k.adapter.saveDraft({
        deckId: n,
        namespace: k.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: Qt(),
        source: y,
        sourceHash: te(y.content),
        selectedSlideId: A,
        compilerStatus: (b == null ? void 0 : b.status) ?? "invalid"
      });
    }, q.draftDebounceMs);
    return () => window.clearTimeout(s);
  }, [q, b, n, A, y, k]);
  const Q = _(() => {
    k && k.adapter.listVersions({ deckId: n, namespace: k.namespace }).then(Z).catch((s) => {
      f == null || f({
        message: s instanceof Error ? s.message : "Unable to list deck versions.",
        cause: s
      });
    });
  }, [n, f, k]);
  U(() => {
    Q();
  }, [Q]);
  const z = _(
    async (s, m) => {
      var oe;
      if (!k)
        return;
      const $ = (b == null ? void 0 : b.diagnostics) ?? [], X = await k.adapter.createVersion({
        id: We(),
        deckId: n,
        namespace: k.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: m,
        reason: s,
        source: y,
        sourceHash: te(y.content),
        selectedSlideId: A,
        compilerStatus: (b == null ? void 0 : b.status) ?? "invalid",
        diagnosticsSummary: qe($),
        limits: {
          maxVersionsPerDeck: k.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: k.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: k.maxBytesPerDeck
        }
      });
      X.status === "failed" && (f == null || f({ message: ((oe = X.diagnostics[0]) == null ? void 0 : oe.message) ?? "Unable to save deck version." })), Q();
    },
    [b, n, f, Q, A, y, k]
  ), ue = _(() => {
    k && (k.adapter.saveCurrent({
      deckId: n,
      namespace: k.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: y,
      sourceHash: te(y.content),
      selectedSlideId: A
    }), k.createVersionOnManualSave && z("manual", "Manual save"), v == null || v({
      deckId: n,
      sourceHash: te(y.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [z, n, v, A, y, k]), V = _(
    async (s) => {
      if (!k)
        return;
      k.createVersionBeforeDestructiveAction && await z("before-version-restore", "Before restore");
      const m = await k.adapter.loadVersion({
        deckId: n,
        namespace: k.namespace,
        versionId: s
      });
      m && (x(m.selectedSlideId), W(m.source, "version-restore", m.selectedSlideId), g == null || g({
        deckId: n,
        versionId: s,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [z, n, g, W, k]
  );
  function M(s) {
    x(s), S == null || S({ deckId: n, slideId: s });
  }
  function ee(s, m) {
    W(s, m, I == null ? void 0 : I.id);
  }
  const ze = (b == null ? void 0 : b.diagnostics) ?? [], re = j === "source" && !B.allowRawSourceEdit ? "form" : j, xe = (P == null ? void 0 : P.theme.cssClassName) ?? "";
  return /* @__PURE__ */ p(
    "div",
    {
      className: "deck-studio-root",
      "data-density": T.density,
      "data-slide-rail": T.showSlideRail ? "visible" : "hidden",
      "data-inspector": T.showInspector ? "visible" : "hidden",
      children: [
        T.showSlideRail ? /* @__PURE__ */ p("aside", { className: "deck-studio-rail", style: { width: T.slideRailWidthPx }, children: [
          /* @__PURE__ */ p("header", { children: [
            /* @__PURE__ */ i("strong", { children: (P == null ? void 0 : P.metadata.title) ?? "Deck" }),
            B.allowAddSlide ? /* @__PURE__ */ i("button", { type: "button", onClick: () => ee(Bt(y), "slide-add"), disabled: c, children: "Add" }) : null
          ] }),
          /* @__PURE__ */ i("nav", { "aria-label": "Slides", children: P == null ? void 0 : P.slides.map((s) => /* @__PURE__ */ p(
            "button",
            {
              type: "button",
              className: s.id === (I == null ? void 0 : I.id) ? "is-active" : void 0,
              onClick: () => M(s.id),
              children: [
                /* @__PURE__ */ i("span", { children: s.index + 1 }),
                /* @__PURE__ */ i("span", { children: s.id }),
                /* @__PURE__ */ i("small", { children: s.layout.name })
              ]
            },
            s.id
          )) })
        ] }) : null,
        /* @__PURE__ */ p("main", { className: "deck-studio-main", children: [
          /* @__PURE__ */ p("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ p("div", { className: "deck-studio-slide-heading", children: [
              /* @__PURE__ */ i("strong", { children: re === "source" ? "Source" : (I == null ? void 0 : I.id) ?? "Source" }),
              re !== "source" && I ? /* @__PURE__ */ i("small", { children: I.layout.definition.displayName }) : null
            ] }),
            /* @__PURE__ */ p("div", { className: "deck-studio-actions", children: [
              T.showSourceModeToggle ? /* @__PURE__ */ p("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ i("span", { children: "Editor view" }),
                /* @__PURE__ */ p(
                  "select",
                  {
                    value: j,
                    onChange: (s) => ke(s.currentTarget.value),
                    children: [
                      /* @__PURE__ */ i("option", { value: "form", children: "Form" }),
                      B.allowRawSourceEdit ? /* @__PURE__ */ i("option", { value: "source", children: "YAML" }) : null,
                      /* @__PURE__ */ i("option", { value: "preview", children: "Preview" })
                    ]
                  }
                )
              ] }) : null,
              B.allowDuplicateSlide && I ? /* @__PURE__ */ i(
                "button",
                {
                  type: "button",
                  onClick: () => ee(Ut(y, I.id), "slide-duplicate"),
                  disabled: c,
                  children: "Duplicate"
                }
              ) : null,
              B.allowDeleteSlide && I ? /* @__PURE__ */ i(
                "button",
                {
                  type: "button",
                  onClick: () => ee(Kt(y, I.id), "slide-delete"),
                  disabled: c || ((P == null ? void 0 : P.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              k ? /* @__PURE__ */ i("button", { type: "button", onClick: ue, disabled: c, children: "Save" }) : null
            ] })
          ] }),
          re === "source" ? /* @__PURE__ */ i(
            "textarea",
            {
              className: "deck-source-editor",
              value: y.content,
              onChange: (s) => ee({ ...y, content: s.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: c
            }
          ) : re === "preview" && I ? /* @__PURE__ */ i(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${xe}`,
              "aria-label": "Slide preview",
              children: /* @__PURE__ */ i(ge, { slide: I, target: "screen" })
            }
          ) : I ? /* @__PURE__ */ p("div", { className: "deck-studio-editor", children: [
            /* @__PURE__ */ i(
              zt,
              {
                source: y,
                slideId: I.id,
                fields: I.layout.definition.editor.fieldGroups.flatMap((s) => s.fields),
                readOnly: !!c,
                onUpdate: ee
              }
            ),
            B.allowLayoutChange ? /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
              /* @__PURE__ */ i("span", { children: "Layout" }),
              /* @__PURE__ */ i(
                "select",
                {
                  value: I.layout.name,
                  onChange: (s) => {
                    k != null && k.createVersionBeforeDestructiveAction && z("before-layout-change", "Before layout change"), ee(Ft(y, I.id, s.currentTarget.value), "layout-change");
                  },
                  disabled: c,
                  children: Array.from(C.layouts.values()).map((s) => /* @__PURE__ */ i("option", { value: s.name, children: s.displayName }, s.name))
                }
              )
            ] }) : null
          ] }) : (b == null ? void 0 : b.status) === "invalid" ? /* @__PURE__ */ i(Je, { fallback: b.fallback }) : null,
          T.showActiveSlidePreview && re !== "preview" && I ? /* @__PURE__ */ i(
            "section",
            {
              className: `deck-studio-preview ${xe}`,
              "aria-label": "Active slide preview",
              children: /* @__PURE__ */ i(ge, { slide: I, target: "screen" })
            }
          ) : null
        ] }),
        T.showInspector ? /* @__PURE__ */ p("aside", { className: "deck-studio-inspector", style: { width: T.inspectorWidthPx }, children: [
          T.showDiagnosticsPanel ? /* @__PURE__ */ p("section", { children: [
            /* @__PURE__ */ i("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ i(He, { diagnostics: ze })
          ] }) : null,
          T.showVersionHistory && k ? /* @__PURE__ */ p("section", { children: [
            /* @__PURE__ */ i("h3", { children: "Versions" }),
            /* @__PURE__ */ i("ul", { className: "deck-version-list", children: pe.map((s) => /* @__PURE__ */ p("li", { children: [
              /* @__PURE__ */ i(
                "button",
                {
                  type: "button",
                  onClick: () => void V(s.id),
                  disabled: !B.allowVersionRestore || c,
                  children: s.label ?? s.reason
                }
              ),
              /* @__PURE__ */ i("small", { children: new Date(s.createdAtIso).toLocaleString() })
            ] }, s.id)) })
          ] }) : null
        ] }) : null
      ]
    }
  );
}
function zt({
  source: e,
  slideId: t,
  fields: n,
  readOnly: a,
  onUpdate: r
}) {
  return /* @__PURE__ */ i("form", { className: "deck-slide-form", children: n.map((o) => /* @__PURE__ */ i(
    Yt,
    {
      source: e,
      slideId: t,
      field: o,
      readOnly: a,
      onUpdate: r
    },
    `${o.kind}-${"slotName" in o ? o.slotName : o.label}`
  )) });
}
function Yt({
  source: e,
  slideId: t,
  field: n,
  readOnly: a,
  onUpdate: r
}) {
  if (n.kind === "markdown") {
    const o = n.blockKind === "heading" || n.slotName === "title", l = jt(e, t, n.slotName), d = o || Gt(n), w = d ? Jt(l, o) : l;
    return /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
      /* @__PURE__ */ i("span", { children: n.label }),
      d ? /* @__PURE__ */ i(
        "input",
        {
          className: "deck-form-input",
          placeholder: " ",
          value: w,
          onChange: (N) => r(
            Ve(e, t, n.slotName, N.currentTarget.value),
            "slide-field-edit"
          ),
          readOnly: a
        }
      ) : /* @__PURE__ */ i(
        "textarea",
        {
          className: "deck-form-textarea",
          placeholder: " ",
          rows: n.minRows ?? 4,
          value: w,
          onChange: (N) => r(
            Ve(e, t, n.slotName, N.currentTarget.value),
            "slide-field-edit"
          ),
          readOnly: a
        }
      )
    ] });
  }
  if (n.kind === "image") {
    const o = Ot(e, t, n.slotName);
    return /* @__PURE__ */ p("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ i("legend", { children: n.label }),
      /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ i("span", { children: "Asset id" }),
        /* @__PURE__ */ i(
          "input",
          {
            placeholder: " ",
            value: o.assetId,
            onChange: (l) => r(
              Ne(e, t, n.slotName, {
                ...o,
                assetId: l.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: a
          }
        )
      ] }),
      /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ i("span", { children: "Source" }),
        /* @__PURE__ */ i(
          "input",
          {
            placeholder: " ",
            value: o.src,
            onChange: (l) => r(
              Ne(e, t, n.slotName, {
                ...o,
                src: l.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: a
          }
        )
      ] }),
      /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ i("span", { children: "Alt" }),
        /* @__PURE__ */ i(
          "input",
          {
            placeholder: " ",
            value: o.alt,
            onChange: (l) => r(
              Ne(e, t, n.slotName, {
                ...o,
                alt: l.currentTarget.value
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
function Gt(e) {
  return e.kind !== "markdown" ? !1 : e.minRows === 1 || e.slotName === "eyebrow" || e.slotName === "subtitle" || e.slotName === "footer";
}
function Jt(e, t) {
  return (t ? e.replace(/^(\s*)#{1,6}\s+/u, "$1") : e).replace(/\s*\n\s*/gu, " ").trim();
}
function Qt() {
  const e = "deck-runtime-session-id", t = window.sessionStorage.getItem(e);
  if (t)
    return t;
  const n = We();
  return window.sessionStorage.setItem(e, n), n;
}
function We() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
export {
  Je as DebugDeckFallback,
  nn as DeckPresentationOverlay,
  rn as DeckShow,
  on as DeckStudio,
  an as PrintDeck,
  rt as compileDeck,
  Lt as createDeckRuntime,
  Et as defaultDeckRuntime
};
