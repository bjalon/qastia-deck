import { jsxs as p, jsx as a } from "react/jsx-runtime";
import _e, { parseDocument as ze } from "yaml";
import { z as h } from "zod";
import { useState as Y, useMemo as se, useCallback as $, useRef as te, useEffect as U } from "react";
import Ye from "react-markdown";
function Ge({ fallback: e }) {
  return /* @__PURE__ */ p("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ a("header", { children: /* @__PURE__ */ a("h2", { children: e.title }) }),
    /* @__PURE__ */ a($e, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ a("pre", { children: e.source.content })
  ] });
}
function $e({
  diagnostics: e
}) {
  return e.length === 0 ? /* @__PURE__ */ a("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ a("ul", { className: "deck-diagnostics-list", children: e.map((t, n) => /* @__PURE__ */ p("li", { "data-severity": t.severity, children: [
    /* @__PURE__ */ a("strong", { children: t.code }),
    /* @__PURE__ */ a("span", { children: t.message }),
    t.hint ? /* @__PURE__ */ a("small", { children: t.hint }) : null
  ] }, `${t.code}-${n}`)) });
}
const Je = /```(\w+)?\n([\s\S]*?)```/g, Xe = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;
function Qe(e, t) {
  const n = [];
  Xe.test(e) && n.push({
    code: "MARKDOWN_UNSUPPORTED_HTML",
    severity: "warning",
    message: "Raw HTML is ignored by the default markdown renderer.",
    path: t,
    hint: "Use Markdown syntax or a custom renderer instead."
  });
  const i = [];
  let r = 0;
  for (const l of e.matchAll(Je)) {
    const [d, w, N] = l, f = l.index ?? 0, g = e.slice(r, f);
    g.trim().length > 0 && i.push({ kind: "markdown", markdown: g }), (w == null ? void 0 : w.toLowerCase()) === "mermaid" ? i.push({ kind: "mermaid", chart: N.trim() }) : i.push({ kind: "code", language: w, code: N.replace(/\n$/, "") }), r = f + d.length;
  }
  const o = e.slice(r);
  return (o.trim().length > 0 || i.length === 0) && i.push({ kind: "markdown", markdown: o }), { nodes: i, diagnostics: n };
}
function H(e, t, n, i, r, o) {
  return {
    code: e,
    severity: t,
    message: n,
    path: i,
    slideId: r,
    hint: o
  };
}
function Ze(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const i = `${n.code}:${n.severity}`, r = t.get(i);
    t.set(i, {
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
const Re = h.object({
  in: h.string().default("none"),
  out: h.string().default("none"),
  durationMs: h.number().int().nonnegative().default(0)
}).strict(), qe = h.object({
  markdown: h.string()
}).strict(), et = h.object({
  image: h.object({
    assetId: h.string().optional(),
    src: h.string().optional(),
    alt: h.string().optional()
  }).strict()
}).strict(), tt = h.object({
  renderer: h.object({
    kind: h.string(),
    props: h.record(h.unknown()).default({})
  }).strict()
}).strict(), nt = h.union([qe, et, tt]), it = h.object({
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
    transition: Re.default({ in: "none", out: "none", durationMs: 0 })
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
      slots: h.record(nt).default({}),
      transition: Re.optional()
    }).strict()
  ).min(1)
}).strict();
async function at(e, t) {
  const n = [];
  let i;
  try {
    const b = ze(e.content, {
      prettyErrors: !1,
      strict: !0,
      uniqueKeys: !0
    });
    for (const S of b.errors)
      n.push(
        H("YAML_SYNTAX_ERROR", "error", S.message, void 0, void 0)
      );
    for (const S of b.warnings)
      n.push(
        H("YAML_PARSE_WARNING", "warning", S.message, void 0, void 0)
      );
    if (b.errors.length > 0)
      return ue(e, n);
    i = b.toJSON();
  } catch (b) {
    return n.push(
      H(
        "YAML_SYNTAX_ERROR",
        "error",
        b instanceof Error ? b.message : "Unable to parse YAML source."
      )
    ), ue(e, n);
  }
  const r = it.safeParse(i);
  if (!r.success)
    return n.push(...rt(r.error)), ue(e, n);
  const o = r.data, l = ot(o, t, n);
  if (n.push(...l), l.some((b) => b.code === "SLIDE_UNKNOWN_LAYOUT"))
    return ue(e, n);
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
  for (const [b, S] of o.slides.entries()) {
    const c = t.runtime.layouts.get(S.layout);
    if (!c)
      continue;
    const D = /* @__PURE__ */ new Map();
    for (const [u, M] of Object.entries(S.slots)) {
      const R = await st(u, M, w, [
        "slides",
        String(b),
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
      D.has(u) || D.set(u, dt(u));
    f.push({
      id: S.id,
      index: b,
      layout: {
        name: c.name,
        definition: c
      },
      transition: ct(
        S.transition ?? o.defaults.transition,
        t,
        ["slides", String(b), "transition"],
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
function ue(e, t) {
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
function rt(e) {
  return e.issues.map((t) => {
    const n = t.path.map(String), i = t.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";
    return H(
      i,
      "error",
      t.message,
      n.length > 0 ? n : void 0,
      void 0
    );
  });
}
function ot(e, t, n) {
  const i = [], r = /* @__PURE__ */ new Set();
  e.slides.length === 0 && i.push(H("DECK_EMPTY_SLIDES", "error", "Deck must contain at least one slide.", ["slides"]));
  for (const [o, l] of e.slides.entries()) {
    r.has(l.id) && i.push(
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
      i.push(
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
      w in l.slots || i.push(
        H(
          "LAYOUT_MISSING_SLOT",
          "error",
          `Layout '${d.name}' requires slot '${w}'.`,
          ["slides", String(o), "slots"],
          l.id
        )
      );
    for (const w of Object.keys(l.slots))
      d.forbiddenSlots.includes(w) && i.push(
        H(
          "LAYOUT_FORBIDDEN_SLOT",
          "warning",
          `Layout '${d.name}' does not render slot '${w}'.`,
          ["slides", String(o), "slots", w],
          l.id
        )
      );
  }
  return n.length > 0, i;
}
async function st(e, t, n, i) {
  const r = [], o = await lt(t, n, i, r);
  return {
    name: e,
    kind: o.kind === "renderer" ? "renderer" : o.kind,
    content: o,
    diagnostics: r
  };
}
async function lt(e, t, n, i) {
  if ("markdown" in e) {
    const r = Qe(e.markdown, n);
    return i.push(...r.diagnostics), {
      kind: "markdown",
      markdown: e.markdown,
      nodes: r.nodes
    };
  }
  if ("image" in e) {
    e.image.assetId && !t.has(e.image.assetId) && i.push(
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
function dt(e) {
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
function ct(e, t, n, i) {
  const r = t.runtime.transitions.has(e.in) ? e.in : "none", o = t.runtime.transitions.has(e.out) ? e.out : "none";
  return r !== e.in && i.push(
    H("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.in}'.`, [...n, "in"])
  ), o !== e.out && i.push(
    H("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.out}'.`, [...n, "out"])
  ), {
    in: r,
    out: o,
    durationMs: e.durationMs
  };
}
function he({ slide: e, target: t }) {
  const n = e.layout.definition.component;
  return /* @__PURE__ */ a(
    "section",
    {
      className: "deck-slide-frame",
      "data-slide-id": e.id,
      "data-layout": e.layout.name,
      "data-target": t,
      children: /* @__PURE__ */ a(n, { slide: e, target: t })
    }
  );
}
function He({
  activeIndex: e,
  deck: t,
  target: n = "screen"
}) {
  const i = t.slides[e] ?? t.slides[0];
  return i ? /* @__PURE__ */ a(he, { slide: i, target: n }) : null;
}
function Le(e, t) {
  if (!t)
    return 0;
  const n = e.slides.findIndex((i) => i.id === t);
  return n === -1 ? 0 : n;
}
function Fe({
  deck: e,
  defaultSelectedSlideId: t,
  initialSlideId: n,
  onAction: i,
  onSlideChange: r,
  selectedSlideId: o
}) {
  const l = Le(e, t ?? n), d = o ? e.slides.findIndex((u) => u.id === o) : -1, [w, N] = Y(l), f = d >= 0 ? d : w, g = e.slides[f] ?? e.slides[0], b = se(
    () => ({
      activeSlideId: (g == null ? void 0 : g.id) ?? "",
      activeSlideIndex: f
    }),
    [f, g == null ? void 0 : g.id]
  ), S = $(
    (u) => {
      i == null || i(u, b);
    },
    [i, b]
  ), c = $(
    (u, M) => {
      const R = Math.min(Math.max(u, 0), e.slides.length - 1), L = g == null ? void 0 : g.id;
      d < 0 && N(R);
      const E = e.slides[R];
      E && E.id !== L && (r == null || r({
        previousSlideId: L,
        activeSlideId: E.id,
        activeSlideIndex: R
      })), S({
        type: R > f ? "next-slide" : "previous-slide",
        origin: M,
        slideId: E == null ? void 0 : E.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [f, g == null ? void 0 : g.id, d, e.slides, S, r]
  ), D = $(
    (u) => {
      d >= 0 || N(Le(e, u));
    },
    [d, e]
  );
  return {
    activeIndex: f,
    activeSlide: g,
    emitAction: S,
    goTo: c,
    resetToSlideId: D,
    state: b
  };
}
function ut({
  activeIndex: e,
  onClose: t,
  onNext: n,
  onPrevious: i,
  slideCount: r
}) {
  return /* @__PURE__ */ p("div", { className: "deck-presentation-controls", "aria-label": "Navigation presentation", children: [
    /* @__PURE__ */ a("button", { type: "button", onClick: i, disabled: e === 0, "aria-label": "Slide precedente", children: "Previous" }),
    /* @__PURE__ */ p("span", { children: [
      e + 1,
      " / ",
      r
    ] }),
    /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: n,
        disabled: e >= r - 1,
        "aria-label": "Slide suivante",
        children: "Next"
      }
    ),
    /* @__PURE__ */ a("button", { type: "button", onClick: t, children: "Quitter" })
  ] });
}
function tn({
  deck: e,
  defaultOpen: t = !1,
  initialSlideId: n,
  onAction: i,
  onOpenChange: r,
  onSlideChange: o,
  open: l,
  options: d,
  selectedSlideId: w
}) {
  var Z, C, I, W, J, z, ce;
  const N = te(null), f = te(void 0), g = te(void 0), [b, S] = Y(t), [c, D] = Y(!0), { activeIndex: u, activeSlide: M, emitAction: R, goTo: L, resetToSlideId: E } = Fe({
    deck: e,
    initialSlideId: n,
    onAction: i,
    onSlideChange: o,
    selectedSlideId: w
  }), y = l ?? b, v = ((Z = d == null ? void 0 : d.fullscreen) == null ? void 0 : Z.strategy) ?? "browser-fullscreen", G = ((C = d == null ? void 0 : d.fullscreen) == null ? void 0 : C.closeOnEscape) ?? !0, A = ((I = d == null ? void 0 : d.controls) == null ? void 0 : I.visibility) ?? "auto", x = ((W = d == null ? void 0 : d.controls) == null ? void 0 : W.visibility) === "auto" ? d.controls.autoHideDelayMs ?? 1800 : 1800, j = ((J = d == null ? void 0 : d.hint) == null ? void 0 : J.showWhenControlsHidden) ?? !0, we = ((z = d == null ? void 0 : d.hint) == null ? void 0 : z.text) ?? "Fleches gauche/droite: precedent/suivant. Escape: quitter.", ke = ((ce = d == null ? void 0 : d.hint) == null ? void 0 : ce.position) ?? "bottom-right";
  g.current = M == null ? void 0 : M.id;
  const Q = $(
    (V, P) => {
      l === void 0 && S(V), r == null || r({
        open: V,
        origin: P,
        slideId: g.current,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [r, l]
  ), O = $(
    (V = "mouse") => {
      const P = N.current;
      document.fullscreenElement === P && document.exitFullscreen().catch(() => {
      }), Q(!1, V), R({
        type: "toggle-fullscreen",
        origin: V,
        slideId: M == null ? void 0 : M.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [M == null ? void 0 : M.id, R, Q]
  ), F = $(() => {
    f.current !== void 0 && (window.clearTimeout(f.current), f.current = void 0);
  }, []), T = $(() => {
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
    v === "browser-fullscreen" && (V != null && V.requestFullscreen) && V.requestFullscreen().catch(() => {
    });
    function P() {
      v === "browser-fullscreen" && document.fullscreenElement === null && Q(!1, "keyboard");
    }
    return document.addEventListener("fullscreenchange", P), () => {
      document.removeEventListener("fullscreenchange", P), document.fullscreenElement === V && document.exitFullscreen().catch(() => {
      });
    };
  }, [v, y, Q]), U(() => {
    if (!y)
      return;
    function V(P) {
      (P.key === "Escape" || P.key === "ArrowRight" || P.key === "PageDown" || P.key === " " || P.key === "ArrowLeft" || P.key === "PageUp") && (P.preventDefault(), P.stopImmediatePropagation()), P.key === "Escape" && G && O("keyboard"), (P.key === "ArrowRight" || P.key === "PageDown" || P.key === " ") && L(u + 1, "keyboard"), (P.key === "ArrowLeft" || P.key === "PageUp") && L(u - 1, "keyboard");
    }
    return window.addEventListener("keydown", V, !0), () => window.removeEventListener("keydown", V, !0);
  }, [u, G, O, L, y]), !y || !M)
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
        /* @__PURE__ */ a("div", { className: "deck-presentation-stage", children: /* @__PURE__ */ a(He, { deck: e, activeIndex: u }) }),
        B ? /* @__PURE__ */ a(
          ut,
          {
            activeIndex: u,
            slideCount: e.slides.length,
            onPrevious: () => L(u - 1, "mouse"),
            onNext: () => L(u + 1, "mouse"),
            onClose: () => O("mouse")
          }
        ) : null,
        k ? /* @__PURE__ */ a("p", { className: "deck-presentation-hint", "data-position": ke, children: we }) : null
      ]
    }
  );
}
function nn({ deck: e }) {
  return /* @__PURE__ */ a("div", { className: `deck-print-root ${e.theme.cssClassName}`, children: e.slides.map((t) => /* @__PURE__ */ a("section", { className: "deck-print-page", "data-slide-id": t.id, children: /* @__PURE__ */ a(he, { slide: t, target: "print" }) }, t.id)) });
}
const mt = {
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
function Ee(e, t) {
  return `${e}:v1:${t}:current`;
}
function pe(e, t) {
  return `${e}:v1:${t}:draft`;
}
function De(e, t) {
  return `${e}:v1:${t}:versions:index`;
}
function me(e, t, n) {
  return `${e}:v1:${t}:versions:${n}`;
}
class Be {
  async loadCurrent(t) {
    return fe(Ee(t.namespace, t.deckId));
  }
  async saveCurrent(t) {
    return oe(Ee(t.namespace, t.deckId), t);
  }
  async saveDraft(t) {
    return oe(pe(t.namespace, t.deckId), t);
  }
  async loadDraft(t) {
    return fe(pe(t.namespace, t.deckId));
  }
  async clearDraft(t) {
    var n;
    try {
      return (n = le()) == null || n.removeItem(pe(t.namespace, t.deckId)), { status: "success" };
    } catch (i) {
      return Ae(i);
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
    }, i = JSON.stringify(n), r = await oe(me(t.namespace, t.deckId, t.id), n);
    if (r.status === "failed")
      return r;
    const o = await ye(t.namespace, t.deckId), l = {
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
          sizeBytes: i.length
        },
        ...o.versions.filter((w) => w.id !== t.id)
      ]
    }, d = ft(l, t.limits);
    return oe(De(t.namespace, t.deckId), d);
  }
  async listVersions(t) {
    return (await ye(t.namespace, t.deckId)).versions;
  }
  async loadVersion(t) {
    return fe(
      me(t.namespace, t.deckId, t.versionId)
    );
  }
  async deleteVersion(t) {
    var n;
    try {
      (n = le()) == null || n.removeItem(me(t.namespace, t.deckId, t.versionId));
      const i = await ye(t.namespace, t.deckId), r = {
        ...i,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        versions: i.versions.filter((o) => o.id !== t.versionId)
      };
      return oe(De(t.namespace, t.deckId), r);
    } catch (i) {
      return Ae(i);
    }
  }
}
function ft(e, t) {
  var o;
  if (!t)
    return e;
  const n = [...e.versions], i = n.filter((l) => l.reason === "autosave");
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
  for (const l of i.filter((d) => !n.some((w) => w.id === d.id)))
    (o = le()) == null || o.removeItem(me(e.namespace, e.deckId, l.id));
  return {
    ...e,
    versions: n
  };
}
async function ye(e, t) {
  return await fe(De(e, t)) ?? {
    deckId: t,
    namespace: e,
    schemaVersion: 1,
    updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
    versions: []
  };
}
function fe(e) {
  var t;
  try {
    const n = (t = le()) == null ? void 0 : t.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function oe(e, t) {
  var n;
  try {
    return (n = le()) == null || n.setItem(e, JSON.stringify(t)), { status: "success" };
  } catch (i) {
    return Ae(i);
  }
}
function Ae(e) {
  return {
    status: "failed",
    diagnostics: [ht(e)]
  };
}
function ht(e) {
  return {
    code: "STORAGE_QUOTA_EXCEEDED",
    severity: "error",
    message: e instanceof Error ? e.message : "Unable to write deck state to storage."
  };
}
function le() {
  if (!(typeof window > "u"))
    return window.localStorage;
}
function ve(e, t) {
  for (let n = e.length - 1; n >= 0; n -= 1)
    if (t(e[n]))
      return n;
  return -1;
}
const gt = /^(javascript|data|vbscript):/i, wt = {
  async resolveImage(e) {
    const t = e.assetId ? e.assets.get(e.assetId) : void 0, n = (t == null ? void 0 : t.src) ?? e.src, i = (t == null ? void 0 : t.alt) ?? "";
    if (!n || gt.test(n.trim()))
      throw new Error("Image source is missing or unsafe.");
    return {
      src: n,
      alt: i
    };
  }
};
function K({ content: e }) {
  return e.kind === "image" ? /* @__PURE__ */ a(
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
  ] }) : /* @__PURE__ */ a("div", { className: "deck-markdown", children: e.nodes.map((t, n) => /* @__PURE__ */ a(kt, { node: t }, `${t.kind}-${n}`)) });
}
function kt({ node: e }) {
  return e.kind === "code" ? /* @__PURE__ */ a("pre", { className: "deck-code-block", children: /* @__PURE__ */ a("code", { children: e.code }) }) : e.kind === "mermaid" ? /* @__PURE__ */ a("pre", { className: "deck-mermaid-block", children: e.chart }) : /* @__PURE__ */ a(
    Ye,
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
  variant: i = "section"
}) {
  const r = e.slots.get(t);
  if (!r)
    return null;
  const o = pt(yt(r.content).length);
  return /* @__PURE__ */ a(
    "div",
    {
      className: ["deck-title-slot", n].filter(Boolean).join(" "),
      "data-slot": t,
      "data-title-variant": i,
      "data-title-size": o,
      children: /* @__PURE__ */ a(K, { content: r.content })
    }
  );
}
function pt(e) {
  return e > 72 ? "xlong" : e > 48 ? "long" : e > 30 ? "medium" : "short";
}
function yt(e) {
  return e.kind !== "markdown" ? "" : e.markdown.replace(/^#{1,6}\s+/gm, "").replace(/[*_`~[\]()>#-]/g, "").replace(/\s+/g, " ").trim();
}
function vt({ slide: e, target: t }) {
  return /* @__PURE__ */ p("article", { className: "deck-layout deck-layout-cover", "data-target": t, children: [
    /* @__PURE__ */ p("div", { className: "deck-cover-copy", children: [
      /* @__PURE__ */ a(be, { slide: e, name: "eyebrow", className: "deck-cover-eyebrow" }),
      /* @__PURE__ */ a(Pe, { slide: e, className: "deck-cover-title", variant: "cover" }),
      /* @__PURE__ */ a(be, { slide: e, name: "subtitle", className: "deck-cover-subtitle" })
    ] }),
    /* @__PURE__ */ a(be, { slide: e, name: "footer", className: "deck-slide-footer" })
  ] });
}
function be({
  slide: e,
  name: t,
  className: n
}) {
  const i = e.slots.get(t);
  return i ? /* @__PURE__ */ a("div", { className: n, "data-slot": t, children: /* @__PURE__ */ a(K, { content: i.content }) }) : null;
}
function bt({ slide: e, target: t }) {
  const n = e.slots.get("image"), i = e.slots.get("caption");
  return /* @__PURE__ */ p("article", { className: "deck-layout deck-layout-image-only", "data-target": t, children: [
    /* @__PURE__ */ a("main", { children: n ? /* @__PURE__ */ a(K, { content: n.content }) : null }),
    /* @__PURE__ */ a("footer", { children: i ? /* @__PURE__ */ a(K, { content: i.content }) : null })
  ] });
}
function St({ slide: e, target: t }) {
  const n = e.slots.get("body"), i = e.slots.get("footer");
  return /* @__PURE__ */ p("article", { className: "deck-layout deck-layout-title-body", "data-target": t, children: [
    /* @__PURE__ */ a("header", { children: /* @__PURE__ */ a(Pe, { slide: e }) }),
    /* @__PURE__ */ a("main", { children: n ? /* @__PURE__ */ a(K, { content: n.content }) : null }),
    /* @__PURE__ */ a("footer", { children: i ? /* @__PURE__ */ a(K, { content: i.content }) : null })
  ] });
}
function It({ slide: e, target: t }) {
  const n = e.slots.get("left"), i = e.slots.get("right"), r = e.slots.get("footer");
  return /* @__PURE__ */ p("article", { className: "deck-layout deck-layout-two-columns", "data-target": t, children: [
    /* @__PURE__ */ a("header", { children: /* @__PURE__ */ a(Pe, { slide: e }) }),
    /* @__PURE__ */ p("main", { className: "deck-two-columns-grid", children: [
      /* @__PURE__ */ a("section", { children: n ? /* @__PURE__ */ a(K, { content: n.content }) : null }),
      /* @__PURE__ */ a("section", { children: i ? /* @__PURE__ */ a(K, { content: i.content }) : null })
    ] }),
    /* @__PURE__ */ a("footer", { children: r ? /* @__PURE__ */ a(K, { content: r.content }) : null })
  ] });
}
const Nt = [
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
    component: St
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
    component: It
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
    component: bt
  }
];
function Me({ node: e }) {
  return /* @__PURE__ */ a(K, { content: { kind: "markdown", markdown: "", nodes: [e] } });
}
const Dt = {
  kind: "markdown",
  render: Me
}, At = {
  kind: "code",
  render: Me
}, Pt = {
  kind: "mermaid",
  render: Me
}, Mt = [
  Dt,
  At,
  Pt
], Se = {
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
    displayName: "Default",
    cssClassName: "deck-theme-default",
    tokens: Se
  },
  {
    id: "fintech-light",
    displayName: "Fintech light",
    cssClassName: "deck-theme-fintech-light",
    tokens: Se
  },
  {
    id: "fintech-dark",
    displayName: "Fintech dark",
    cssClassName: "deck-theme-fintech-dark",
    tokens: {
      ...Se,
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
], Ct = [
  { name: "none", displayName: "None" },
  { name: "fade", displayName: "Fade" },
  { name: "slide-left", displayName: "Slide left" },
  { name: "slide-right", displayName: "Slide right" },
  { name: "zoom", displayName: "Zoom" }
];
function Rt(e = {}) {
  const t = e.layouts ?? Nt, n = e.renderers ?? Mt, i = e.themes ?? xt, r = e.transitions ?? Ct;
  return {
    layouts: new Map(t.map((o) => [o.name, o])),
    renderers: new Map(n.map((o) => [o.kind, o])),
    themes: new Map(i.map((o) => [o.id, o])),
    transitions: new Map(r.map((o) => [o.name, o])),
    assets: wt,
    storage: e.storage ?? new Be(),
    pdf: e.pdf ?? mt
  };
}
const Lt = Rt();
function Et({
  activeIndex: e,
  onNext: t,
  onOpenPresentation: n,
  onPresentationControlsModeChange: i,
  onPrevious: r,
  placement: o,
  presentationButtonLabel: l,
  presentationControlsMode: d,
  presentationDisabled: w,
  presentationUnavailableLabel: N,
  showCounter: f,
  showPresentationButton: g,
  showPresentationControlsModeSelect: b,
  showPreviousNext: S,
  slideCount: c
}) {
  return /* @__PURE__ */ p("div", { className: "deck-show-toolbar", "data-placement": o, "aria-label": "Deck navigation", children: [
    g ? /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: n,
        disabled: w,
        title: w ? N : l,
        children: l
      }
    ) : null,
    g && b ? /* @__PURE__ */ p("label", { className: "deck-presentation-mode-select", children: [
      /* @__PURE__ */ a("span", { children: "Presentation controls" }),
      /* @__PURE__ */ p(
        "select",
        {
          value: d,
          onChange: (D) => i(D.currentTarget.value),
          children: [
            /* @__PURE__ */ a("option", { value: "visible", children: "Boutons visibles" }),
            /* @__PURE__ */ a("option", { value: "hidden", children: "Boutons hidden" }),
            /* @__PURE__ */ a("option", { value: "auto", children: "Auto" })
          ]
        }
      )
    ] }) : null,
    S ? /* @__PURE__ */ a("button", { type: "button", onClick: r, disabled: e === 0, children: "Previous" }) : null,
    f ? /* @__PURE__ */ p("span", { children: [
      e + 1,
      " / ",
      c
    ] }) : null,
    S ? /* @__PURE__ */ a("button", { type: "button", onClick: t, disabled: e >= c - 1, children: "Next" }) : null
  ] });
}
function an({
  controls: e,
  deck: t,
  defaultSelectedSlideId: n,
  initialSlideId: i,
  keyboardNavigation: r,
  mode: o = "viewer",
  onAction: l,
  onRequestPresentation: d,
  onSlideChange: w,
  selectedSlideId: N
}) {
  const { activeIndex: f, activeSlide: g, emitAction: b, goTo: S } = Fe({
    deck: t,
    defaultSelectedSlideId: n,
    initialSlideId: i,
    onAction: l,
    onSlideChange: w,
    selectedSlideId: N
  }), c = e === !1 ? void 0 : e, D = e !== !1, u = (c == null ? void 0 : c.showPreviousNext) ?? !0, M = (c == null ? void 0 : c.showCounter) ?? !0, R = !!(c != null && c.showPresentationButton), L = te(null), E = r ?? (o === "embedded" ? "focus-within" : "global"), y = $(() => {
    c != null && c.presentationDisabled || (d == null || d({
      type: "presentation-requested",
      slideId: g == null ? void 0 : g.id,
      activeSlideIndex: f,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }), b({
      type: "toggle-fullscreen",
      origin: "mouse",
      slideId: g == null ? void 0 : g.id,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [f, g == null ? void 0 : g.id, c == null ? void 0 : c.presentationDisabled, b, d]);
  U(() => {
    if (E === !1)
      return;
    function A(x) {
      var j;
      Tt(x.target) || E === "focus-within" && (!(x.target instanceof Node) || !((j = L.current) != null && j.contains(x.target))) || ((x.key === "ArrowRight" || x.key === "PageDown" || x.key === " ") && (x.preventDefault(), S(f + 1, "keyboard")), (x.key === "ArrowLeft" || x.key === "PageUp") && (x.preventDefault(), S(f - 1, "keyboard")));
    }
    return window.addEventListener("keydown", A), () => window.removeEventListener("keydown", A);
  }, [f, S, E]);
  const v = (c == null ? void 0 : c.placement) ?? "top", G = D ? /* @__PURE__ */ a(
    Et,
    {
      activeIndex: f,
      slideCount: t.slides.length,
      placement: v,
      showPreviousNext: u,
      showCounter: M,
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
        v === "top" ? G : null,
        /* @__PURE__ */ a(He, { deck: t, activeIndex: f }),
        v === "bottom" ? G : null
      ]
    }
  );
}
function Tt(e) {
  return e instanceof HTMLElement ? !!e.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']") : !1;
}
function ee(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n += 1)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, "0");
}
const Vt = {
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
  adapter: new Be(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, $t = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function de(e) {
  try {
    const t = _e.parse(e.content);
    return ie(t) ? t : null;
  } catch {
    return null;
  }
}
function ge(e, t) {
  return {
    ...e,
    content: _e.stringify(t, { lineWidth: 0 })
  };
}
function ne(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(ie);
}
function Te(e, t, n, i) {
  return xe(e, t, (r) => {
    const o = Ke(r);
    o[n] = { markdown: i };
  });
}
function Ne(e, t, n, i) {
  return xe(e, t, (r) => {
    const o = Ke(r);
    o[n] = {
      image: Ot({
        assetId: i.assetId,
        src: i.src,
        alt: i.alt
      })
    };
  });
}
function Ht(e, t, n) {
  return xe(e, t, (i) => {
    i.layout = n;
  });
}
function Ft(e, t = "title-body") {
  const n = de(e);
  if (!n)
    return e;
  const i = ne(n), r = je(i, "slide");
  return i.push({
    id: r,
    layout: t,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }), n.slides = i, ge(e, n);
}
function Bt(e, t) {
  const n = de(e);
  if (!n)
    return e;
  const i = ne(n), r = i.findIndex((l) => l.id === t);
  if (r < 0)
    return e;
  const o = structuredClone(i[r]);
  return o.id = je(i, `${t}-copy`), i.splice(r + 1, 0, o), n.slides = i, ge(e, n);
}
function Ut(e, t) {
  const n = de(e);
  if (!n)
    return e;
  const i = ne(n).filter((r) => r.id !== t);
  return n.slides = i.length > 0 ? i : ne(n), ge(e, n);
}
function Kt(e, t, n) {
  const i = Ue(e, t, n);
  return ie(i) && typeof i.markdown == "string" ? i.markdown : "";
}
function jt(e, t, n) {
  const i = Ue(e, t, n), r = ie(i) && ie(i.image) ? i.image : {};
  return {
    assetId: typeof r.assetId == "string" ? r.assetId : "",
    src: typeof r.src == "string" ? r.src : "",
    alt: typeof r.alt == "string" ? r.alt : ""
  };
}
function xe(e, t, n) {
  const i = de(e);
  if (!i)
    return e;
  const r = ne(i), o = r.find((l) => l.id === t);
  return o ? (n(o), i.slides = r, ge(e, i)) : e;
}
function Ue(e, t, n) {
  var o;
  const i = de(e);
  if (!i)
    return;
  const r = ne(i).find((l) => l.id === t);
  return (o = r == null ? void 0 : r.slots) == null ? void 0 : o[n];
}
function Ke(e) {
  return ie(e.slots) || (e.slots = {}), e.slots;
}
function je(e, t) {
  const n = new Set(e.map((o) => o.id).filter((o) => !!o));
  let i = Ve(t), r = 2;
  for (; n.has(i); )
    i = `${Ve(t)}-${r}`, r += 1;
  return i;
}
function Ve(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function Ot(e) {
  return Object.fromEntries(
    Object.entries(e).filter((t) => !!t[1])
  );
}
function ie(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function rn(e) {
  var Ce;
  const {
    autosave: t,
    deckId: n,
    features: i,
    initialSelectedSlideId: r,
    layout: o,
    locale: l = "fr-FR",
    namespace: d,
    onChange: w,
    onCompile: N,
    onError: f,
    onRestoreVersion: g,
    onSave: b,
    onSelectedSlideChange: S,
    readOnly: c,
    storage: D
  } = e, u = e.options, M = e.runtime ?? Lt, R = e.mode === "controlled", [L, E] = Y(
    R ? e.value : e.initialValue
  ), y = R ? e.value : L, [v, G] = Y(null), [A, x] = Y(
    r
  ), [j, we] = Y(
    ((Ce = u == null ? void 0 : u.editing) == null ? void 0 : Ce.defaultMode) === "source" ? "source" : "form"
  ), [ke, Q] = Y([]), O = te(N), F = te(f);
  O.current = N, F.current = f;
  const T = se(() => {
    var _;
    const s = { ...Vt, ...o }, m = u == null ? void 0 : u.panels;
    return (m == null ? void 0 : m.slideRail) === !1 ? s.showSlideRail = !1 : m != null && m.slideRail && (s.showSlideRail = m.slideRail.visibleDefault ?? s.showSlideRail, s.slideRailWidthPx = m.slideRail.widthPx ?? s.slideRailWidthPx), (m == null ? void 0 : m.inspector) === !1 ? s.showInspector = !1 : m != null && m.inspector && (s.showInspector = m.inspector.visibleDefault ?? s.showInspector, s.inspectorWidthPx = m.inspector.widthPx ?? s.inspectorWidthPx), (m == null ? void 0 : m.diagnostics) === !1 ? s.showDiagnosticsPanel = !1 : m != null && m.diagnostics && (s.showDiagnosticsPanel = m.diagnostics.visibleDefault ?? s.showDiagnosticsPanel), (m == null ? void 0 : m.activeSlidePreview) === !1 ? s.showActiveSlidePreview = !1 : m != null && m.activeSlidePreview && (s.showActiveSlidePreview = m.activeSlidePreview.visibleDefault ?? s.showActiveSlidePreview), (m == null ? void 0 : m.versionHistory) === !1 ? s.showVersionHistory = !1 : m != null && m.versionHistory && (s.showVersionHistory = m.versionHistory.visibleDefault ?? s.showVersionHistory), ((_ = u == null ? void 0 : u.editing) == null ? void 0 : _.allowSourceMode) === !1 && (s.showSourceModeToggle = !1), s;
  }, [o, u]), B = se(() => {
    var m, _, X, re;
    const s = { ..._t, ...i };
    return ((m = u == null ? void 0 : u.editing) == null ? void 0 : m.allowSourceMode) !== void 0 && (s.allowRawSourceEdit = u.editing.allowSourceMode), ((_ = u == null ? void 0 : u.editing) == null ? void 0 : _.allowLayoutChange) !== void 0 && (s.allowLayoutChange = u.editing.allowLayoutChange), ((X = u == null ? void 0 : u.layoutSelector) == null ? void 0 : X.enabled) !== void 0 && (s.allowLayoutChange = u.layoutSelector.enabled), (re = u == null ? void 0 : u.panels) != null && re.slideRail && (u.panels.slideRail.allowReorder !== void 0 && (s.allowReorderSlides = u.panels.slideRail.allowReorder), u.panels.slideRail.allowAddDelete !== void 0 && (s.allowAddSlide = u.panels.slideRail.allowAddDelete, s.allowDeleteSlide = u.panels.slideRail.allowAddDelete)), s;
  }, [i, u]), k = se(
    () => D === !1 ? void 0 : {
      ...Ie,
      namespace: d ?? (D == null ? void 0 : D.namespace) ?? Ie.namespace,
      adapter: (D == null ? void 0 : D.adapter) ?? M.storage ?? Ie.adapter,
      ...D
    },
    [d, M.storage, D]
  ), Z = se(
    () => t === !1 ? void 0 : { ...$t, ...t },
    [t]
  ), C = (v == null ? void 0 : v.status) === "valid" || (v == null ? void 0 : v.status) === "degraded" ? v.deck : void 0, I = (C == null ? void 0 : C.slides.find((s) => s.id === A)) ?? (C == null ? void 0 : C.slides[0]), W = $(
    (s, m, _) => {
      const X = {
        reason: m,
        deckId: n,
        selectedSlideId: _ ?? A,
        sourceHash: ee(s.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      R || E(s), w == null || w(s, X);
    },
    [R, n, w, A]
  );
  U(() => {
    let s = !1;
    return at(y, {
      runtime: M
    }).then((m) => {
      var _;
      s || (G(m), (_ = O.current) == null || _.call(O, m));
    }).catch((m) => {
      var _;
      (_ = F.current) == null || _.call(F, {
        message: m instanceof Error ? m.message : "Deck compilation failed.",
        cause: m
      });
    }), () => {
      s = !0;
    };
  }, [l, M, y]), U(() => {
    if (!C || A)
      return;
    const s = C.slides[0];
    s && x(s.id);
  }, [C, A]), U(() => {
    k != null && k.recoverOnMount && k.adapter.loadDraft({ deckId: n, namespace: k.namespace }).then((s) => {
      !s || s.sourceHash === ee(y.content) || (x(s.selectedSlideId), W(s.source, "crash-recovery", s.selectedSlideId));
    }).catch((s) => {
      f == null || f({
        message: s instanceof Error ? s.message : "Unable to recover deck draft.",
        cause: s
      });
    });
  }, [n, f, W, y.content, k]), U(() => {
    if (!k || !Z || !k.saveDraftOnChange)
      return;
    const s = window.setTimeout(() => {
      k.adapter.saveDraft({
        deckId: n,
        namespace: k.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: Jt(),
        source: y,
        sourceHash: ee(y.content),
        selectedSlideId: A,
        compilerStatus: (v == null ? void 0 : v.status) ?? "invalid"
      });
    }, Z.draftDebounceMs);
    return () => window.clearTimeout(s);
  }, [Z, v, n, A, y, k]);
  const J = $(() => {
    k && k.adapter.listVersions({ deckId: n, namespace: k.namespace }).then(Q).catch((s) => {
      f == null || f({
        message: s instanceof Error ? s.message : "Unable to list deck versions.",
        cause: s
      });
    });
  }, [n, f, k]);
  U(() => {
    J();
  }, [J]);
  const z = $(
    async (s, m) => {
      var re;
      if (!k)
        return;
      const _ = (v == null ? void 0 : v.diagnostics) ?? [], X = await k.adapter.createVersion({
        id: Oe(),
        deckId: n,
        namespace: k.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: m,
        reason: s,
        source: y,
        sourceHash: ee(y.content),
        selectedSlideId: A,
        compilerStatus: (v == null ? void 0 : v.status) ?? "invalid",
        diagnosticsSummary: Ze(_),
        limits: {
          maxVersionsPerDeck: k.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: k.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: k.maxBytesPerDeck
        }
      });
      X.status === "failed" && (f == null || f({ message: ((re = X.diagnostics[0]) == null ? void 0 : re.message) ?? "Unable to save deck version." })), J();
    },
    [v, n, f, J, A, y, k]
  ), ce = $(() => {
    k && (k.adapter.saveCurrent({
      deckId: n,
      namespace: k.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: y,
      sourceHash: ee(y.content),
      selectedSlideId: A
    }), k.createVersionOnManualSave && z("manual", "Manual save"), b == null || b({
      deckId: n,
      sourceHash: ee(y.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [z, n, b, A, y, k]), V = $(
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
  function P(s) {
    x(s), S == null || S({ deckId: n, slideId: s });
  }
  function q(s, m) {
    W(s, m, I == null ? void 0 : I.id);
  }
  const We = (v == null ? void 0 : v.diagnostics) ?? [], ae = j === "source" && !B.allowRawSourceEdit ? "form" : j;
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
            /* @__PURE__ */ a("strong", { children: (C == null ? void 0 : C.metadata.title) ?? "Deck" }),
            B.allowAddSlide ? /* @__PURE__ */ a("button", { type: "button", onClick: () => q(Ft(y), "slide-add"), disabled: c, children: "Add" }) : null
          ] }),
          /* @__PURE__ */ a("nav", { "aria-label": "Slides", children: C == null ? void 0 : C.slides.map((s) => /* @__PURE__ */ p(
            "button",
            {
              type: "button",
              className: s.id === (I == null ? void 0 : I.id) ? "is-active" : void 0,
              onClick: () => P(s.id),
              children: [
                /* @__PURE__ */ a("span", { children: s.index + 1 }),
                /* @__PURE__ */ a("span", { children: s.id }),
                /* @__PURE__ */ a("small", { children: s.layout.name })
              ]
            },
            s.id
          )) })
        ] }) : null,
        /* @__PURE__ */ p("main", { className: "deck-studio-main", children: [
          /* @__PURE__ */ p("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ p("div", { className: "deck-studio-slide-heading", children: [
              /* @__PURE__ */ a("strong", { children: ae === "source" ? "Source" : (I == null ? void 0 : I.id) ?? "Source" }),
              ae !== "source" && I ? /* @__PURE__ */ a("small", { children: I.layout.definition.displayName }) : null
            ] }),
            /* @__PURE__ */ p("div", { className: "deck-studio-actions", children: [
              T.showSourceModeToggle ? /* @__PURE__ */ p("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ a("span", { children: "Editor view" }),
                /* @__PURE__ */ p(
                  "select",
                  {
                    value: j,
                    onChange: (s) => we(s.currentTarget.value),
                    children: [
                      /* @__PURE__ */ a("option", { value: "form", children: "Form" }),
                      B.allowRawSourceEdit ? /* @__PURE__ */ a("option", { value: "source", children: "YAML" }) : null,
                      /* @__PURE__ */ a("option", { value: "preview", children: "Preview" })
                    ]
                  }
                )
              ] }) : null,
              B.allowDuplicateSlide && I ? /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  onClick: () => q(Bt(y, I.id), "slide-duplicate"),
                  disabled: c,
                  children: "Duplicate"
                }
              ) : null,
              B.allowDeleteSlide && I ? /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  onClick: () => q(Ut(y, I.id), "slide-delete"),
                  disabled: c || ((C == null ? void 0 : C.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              k ? /* @__PURE__ */ a("button", { type: "button", onClick: ce, disabled: c, children: "Save" }) : null
            ] })
          ] }),
          ae === "source" ? /* @__PURE__ */ a(
            "textarea",
            {
              className: "deck-source-editor",
              value: y.content,
              onChange: (s) => q({ ...y, content: s.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: c
            }
          ) : ae === "preview" && I ? /* @__PURE__ */ a("section", { className: "deck-studio-preview deck-studio-preview-main", "aria-label": "Slide preview", children: /* @__PURE__ */ a(he, { slide: I, target: "screen" }) }) : I ? /* @__PURE__ */ p("div", { className: "deck-studio-editor", children: [
            /* @__PURE__ */ a(
              Wt,
              {
                source: y,
                slideId: I.id,
                fields: I.layout.definition.editor.fieldGroups.flatMap((s) => s.fields),
                readOnly: !!c,
                onUpdate: q
              }
            ),
            B.allowLayoutChange ? /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
              /* @__PURE__ */ a("span", { children: "Layout" }),
              /* @__PURE__ */ a(
                "select",
                {
                  value: I.layout.name,
                  onChange: (s) => {
                    k != null && k.createVersionBeforeDestructiveAction && z("before-layout-change", "Before layout change"), q(Ht(y, I.id, s.currentTarget.value), "layout-change");
                  },
                  disabled: c,
                  children: Array.from(M.layouts.values()).map((s) => /* @__PURE__ */ a("option", { value: s.name, children: s.displayName }, s.name))
                }
              )
            ] }) : null
          ] }) : (v == null ? void 0 : v.status) === "invalid" ? /* @__PURE__ */ a(Ge, { fallback: v.fallback }) : null,
          T.showActiveSlidePreview && ae !== "preview" && I ? /* @__PURE__ */ a("section", { className: "deck-studio-preview", "aria-label": "Active slide preview", children: /* @__PURE__ */ a(he, { slide: I, target: "screen" }) }) : null
        ] }),
        T.showInspector ? /* @__PURE__ */ p("aside", { className: "deck-studio-inspector", style: { width: T.inspectorWidthPx }, children: [
          T.showDiagnosticsPanel ? /* @__PURE__ */ p("section", { children: [
            /* @__PURE__ */ a("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ a($e, { diagnostics: We })
          ] }) : null,
          T.showVersionHistory && k ? /* @__PURE__ */ p("section", { children: [
            /* @__PURE__ */ a("h3", { children: "Versions" }),
            /* @__PURE__ */ a("ul", { className: "deck-version-list", children: ke.map((s) => /* @__PURE__ */ p("li", { children: [
              /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  onClick: () => void V(s.id),
                  disabled: !B.allowVersionRestore || c,
                  children: s.label ?? s.reason
                }
              ),
              /* @__PURE__ */ a("small", { children: new Date(s.createdAtIso).toLocaleString() })
            ] }, s.id)) })
          ] }) : null
        ] }) : null
      ]
    }
  );
}
function Wt({
  source: e,
  slideId: t,
  fields: n,
  readOnly: i,
  onUpdate: r
}) {
  return /* @__PURE__ */ a("form", { className: "deck-slide-form", children: n.map((o) => /* @__PURE__ */ a(
    zt,
    {
      source: e,
      slideId: t,
      field: o,
      readOnly: i,
      onUpdate: r
    },
    `${o.kind}-${"slotName" in o ? o.slotName : o.label}`
  )) });
}
function zt({
  source: e,
  slideId: t,
  field: n,
  readOnly: i,
  onUpdate: r
}) {
  if (n.kind === "markdown") {
    const o = n.blockKind === "heading" || n.slotName === "title", l = Kt(e, t, n.slotName), d = o || Yt(n), w = d ? Gt(l, o) : l;
    return /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
      /* @__PURE__ */ a("span", { children: n.label }),
      d ? /* @__PURE__ */ a(
        "input",
        {
          className: "deck-form-input",
          placeholder: " ",
          value: w,
          onChange: (N) => r(
            Te(e, t, n.slotName, N.currentTarget.value),
            "slide-field-edit"
          ),
          readOnly: i
        }
      ) : /* @__PURE__ */ a(
        "textarea",
        {
          className: "deck-form-textarea",
          placeholder: " ",
          rows: n.minRows ?? 4,
          value: w,
          onChange: (N) => r(
            Te(e, t, n.slotName, N.currentTarget.value),
            "slide-field-edit"
          ),
          readOnly: i
        }
      )
    ] });
  }
  if (n.kind === "image") {
    const o = jt(e, t, n.slotName);
    return /* @__PURE__ */ p("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ a("legend", { children: n.label }),
      /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ a("span", { children: "Asset id" }),
        /* @__PURE__ */ a(
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
            readOnly: i
          }
        )
      ] }),
      /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ a("span", { children: "Source" }),
        /* @__PURE__ */ a(
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
            readOnly: i
          }
        )
      ] }),
      /* @__PURE__ */ p("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ a("span", { children: "Alt" }),
        /* @__PURE__ */ a(
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
            readOnly: i
          }
        )
      ] })
    ] });
  }
  return null;
}
function Yt(e) {
  return e.kind !== "markdown" ? !1 : e.minRows === 1 || e.slotName === "eyebrow" || e.slotName === "subtitle" || e.slotName === "footer";
}
function Gt(e, t) {
  return (t ? e.replace(/^(\s*)#{1,6}\s+/u, "$1") : e).replace(/\s*\n\s*/gu, " ").trim();
}
function Jt() {
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
  Ge as DebugDeckFallback,
  tn as DeckPresentationOverlay,
  an as DeckShow,
  rn as DeckStudio,
  nn as PrintDeck,
  at as compileDeck,
  Rt as createDeckRuntime,
  Lt as defaultDeckRuntime
};
