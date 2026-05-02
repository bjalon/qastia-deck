import { jsxs as k, jsx as s } from "react/jsx-runtime";
import Le, { parseDocument as Oe } from "yaml";
import { z as h } from "zod";
import { useState as Y, useMemo as se, useCallback as _, useRef as fe, useEffect as B } from "react";
import We from "react-markdown";
function Ke({ fallback: e }) {
  return /* @__PURE__ */ k("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ s("header", { children: /* @__PURE__ */ s("h2", { children: e.title }) }),
    /* @__PURE__ */ s(Ee, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ s("pre", { children: e.source.content })
  ] });
}
function Ee({
  diagnostics: e
}) {
  return /* @__PURE__ */ s("ul", { className: "deck-diagnostics-list", children: e.map((t, n) => /* @__PURE__ */ k("li", { "data-severity": t.severity, children: [
    /* @__PURE__ */ s("strong", { children: t.code }),
    /* @__PURE__ */ s("span", { children: t.message }),
    t.hint ? /* @__PURE__ */ s("small", { children: t.hint }) : null
  ] }, `${t.code}-${n}`)) });
}
const Ye = /```(\w+)?\n([\s\S]*?)```/g, ze = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;
function Ge(e, t) {
  const n = [];
  ze.test(e) && n.push({
    code: "MARKDOWN_UNSUPPORTED_HTML",
    severity: "warning",
    message: "Raw HTML is ignored by the default markdown renderer.",
    path: t,
    hint: "Use Markdown syntax or a custom renderer instead."
  });
  const i = [];
  let a = 0;
  for (const d of e.matchAll(Ye)) {
    const [m, y, b] = d, f = d.index ?? 0, p = e.slice(a, f);
    p.trim().length > 0 && i.push({ kind: "markdown", markdown: p }), (y == null ? void 0 : y.toLowerCase()) === "mermaid" ? i.push({ kind: "mermaid", chart: b.trim() }) : i.push({ kind: "code", language: y, code: b.replace(/\n$/, "") }), a = f + m.length;
  }
  const r = e.slice(a);
  return (r.trim().length > 0 || i.length === 0) && i.push({ kind: "markdown", markdown: r }), { nodes: i, diagnostics: n };
}
function $(e, t, n, i, a, r) {
  return {
    code: e,
    severity: t,
    message: n,
    path: i,
    slideId: a,
    hint: r
  };
}
function Je(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const i = `${n.code}:${n.severity}`, a = t.get(i);
    t.set(i, {
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
const Ce = h.object({
  in: h.string().default("none"),
  out: h.string().default("none"),
  durationMs: h.number().int().nonnegative().default(0)
}).strict(), Xe = h.object({
  markdown: h.string()
}).strict(), Qe = h.object({
  image: h.object({
    assetId: h.string().optional(),
    src: h.string().optional(),
    alt: h.string().optional()
  }).strict()
}).strict(), Ze = h.object({
  renderer: h.object({
    kind: h.string(),
    props: h.record(h.unknown()).default({})
  }).strict()
}).strict(), qe = h.union([Xe, Qe, Ze]), et = h.object({
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
    transition: Ce.default({ in: "none", out: "none", durationMs: 0 })
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
      slots: h.record(qe).default({}),
      transition: Ce.optional()
    }).strict()
  ).min(1)
}).strict();
async function tt(e, t) {
  const n = [];
  let i;
  try {
    const v = Oe(e.content, {
      prettyErrors: !1,
      strict: !0,
      uniqueKeys: !0
    });
    for (const c of v.errors)
      n.push(
        $("YAML_SYNTAX_ERROR", "error", c.message, void 0, void 0)
      );
    for (const c of v.warnings)
      n.push(
        $("YAML_PARSE_WARNING", "warning", c.message, void 0, void 0)
      );
    if (v.errors.length > 0)
      return de(e, n);
    i = v.toJSON();
  } catch (v) {
    return n.push(
      $(
        "YAML_SYNTAX_ERROR",
        "error",
        v instanceof Error ? v.message : "Unable to parse YAML source."
      )
    ), de(e, n);
  }
  const a = et.safeParse(i);
  if (!a.success)
    return n.push(...nt(a.error)), de(e, n);
  const r = a.data, d = it(r, t, n);
  if (n.push(...d), d.some((v) => v.code === "SLIDE_UNKNOWN_LAYOUT"))
    return de(e, n);
  const y = new Map(Object.entries(r.assets)), b = t.runtime.themes.get(r.theme.id) ?? t.runtime.themes.get("default");
  if (!b)
    throw new Error("Deck runtime must provide at least one theme.");
  t.runtime.themes.has(r.theme.id) || n.push(
    $(
      "SCHEMA_INVALID_VALUE",
      "warning",
      `Unknown theme '${r.theme.id}'. Falling back to '${b.id}'.`,
      ["theme", "id"]
    )
  );
  const f = [];
  for (const [v, c] of r.slides.entries()) {
    const D = t.runtime.layouts.get(c.layout);
    if (!D)
      continue;
    const I = /* @__PURE__ */ new Map();
    for (const [l, L] of Object.entries(c.slots)) {
      const M = await at(l, L, y, [
        "slides",
        String(v),
        "slots",
        l
      ]);
      I.set(l, M), n.push(
        ...M.diagnostics.map((E) => ({
          ...E,
          slideId: E.slideId ?? c.id
        }))
      );
    }
    for (const l of D.requiredSlots)
      I.has(l) || I.set(l, rt(l));
    f.push({
      id: c.id,
      index: v,
      layout: {
        name: D.name,
        definition: D
      },
      transition: ot(
        c.transition ?? r.defaults.transition,
        t,
        ["slides", String(v), "transition"],
        n
      ),
      slots: I,
      diagnostics: n.filter((l) => l.slideId === c.id)
    });
  }
  const p = {
    version: 1,
    metadata: r.metadata,
    theme: b,
    aspectRatio: r.defaults.aspectRatio,
    assets: y,
    slides: f
  };
  return n.length > 0 ? {
    status: "degraded",
    deck: p,
    diagnostics: n
  } : {
    status: "valid",
    deck: p,
    diagnostics: []
  };
}
function de(e, t) {
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
function nt(e) {
  return e.issues.map((t) => {
    const n = t.path.map(String), i = t.code === "unrecognized_keys" ? "SCHEMA_UNKNOWN_FIELD" : "SCHEMA_INVALID_VALUE";
    return $(
      i,
      "error",
      t.message,
      n.length > 0 ? n : void 0,
      void 0
    );
  });
}
function it(e, t, n) {
  const i = [], a = /* @__PURE__ */ new Set();
  e.slides.length === 0 && i.push($("DECK_EMPTY_SLIDES", "error", "Deck must contain at least one slide.", ["slides"]));
  for (const [r, d] of e.slides.entries()) {
    a.has(d.id) && i.push(
      $(
        "SLIDE_DUPLICATE_ID",
        "error",
        `Slide id '${d.id}' is already used.`,
        ["slides", String(r), "id"],
        d.id
      )
    ), a.add(d.id);
    const m = t.runtime.layouts.get(d.layout);
    if (!m) {
      i.push(
        $(
          "SLIDE_UNKNOWN_LAYOUT",
          "error",
          `Unknown layout '${d.layout}'.`,
          ["slides", String(r), "layout"],
          d.id,
          "Register the layout in createDeckRuntime or choose a default layout."
        )
      );
      continue;
    }
    for (const y of m.requiredSlots)
      y in d.slots || i.push(
        $(
          "LAYOUT_MISSING_SLOT",
          "error",
          `Layout '${m.name}' requires slot '${y}'.`,
          ["slides", String(r), "slots"],
          d.id
        )
      );
    for (const y of Object.keys(d.slots))
      m.forbiddenSlots.includes(y) && i.push(
        $(
          "LAYOUT_FORBIDDEN_SLOT",
          "warning",
          `Layout '${m.name}' does not render slot '${y}'.`,
          ["slides", String(r), "slots", y],
          d.id
        )
      );
  }
  return n.length > 0, i;
}
async function at(e, t, n, i) {
  const a = [], r = await st(t, n, i, a);
  return {
    name: e,
    kind: r.kind === "renderer" ? "renderer" : r.kind,
    content: r,
    diagnostics: a
  };
}
async function st(e, t, n, i) {
  if ("markdown" in e) {
    const a = Ge(e.markdown, n);
    return i.push(...a.diagnostics), {
      kind: "markdown",
      markdown: e.markdown,
      nodes: a.nodes
    };
  }
  if ("image" in e) {
    e.image.assetId && !t.has(e.image.assetId) && i.push(
      $(
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
function rt(e) {
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
function ot(e, t, n, i) {
  const a = t.runtime.transitions.has(e.in) ? e.in : "none", r = t.runtime.transitions.has(e.out) ? e.out : "none";
  return a !== e.in && i.push(
    $("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.in}'.`, [...n, "in"])
  ), r !== e.out && i.push(
    $("SCHEMA_INVALID_VALUE", "warning", `Unknown transition '${e.out}'.`, [...n, "out"])
  ), {
    in: a,
    out: r,
    durationMs: e.durationMs
  };
}
function Ne({ slide: e, target: t }) {
  const n = e.layout.definition.component;
  return /* @__PURE__ */ s(
    "section",
    {
      className: "deck-slide-frame",
      "data-slide-id": e.id,
      "data-layout": e.layout.name,
      "data-target": t,
      children: /* @__PURE__ */ s(n, { slide: e, target: t })
    }
  );
}
function Ve({
  activeIndex: e,
  deck: t,
  target: n = "screen"
}) {
  const i = t.slides[e] ?? t.slides[0];
  return i ? /* @__PURE__ */ s(Ne, { slide: i, target: n }) : null;
}
function Me(e, t) {
  if (!t)
    return 0;
  const n = e.slides.findIndex((i) => i.id === t);
  return n === -1 ? 0 : n;
}
function Te({
  deck: e,
  defaultSelectedSlideId: t,
  initialSlideId: n,
  onAction: i,
  onSlideChange: a,
  selectedSlideId: r
}) {
  const d = Me(e, t ?? n), m = r ? e.slides.findIndex((l) => l.id === r) : -1, [y, b] = Y(d), f = m >= 0 ? m : y, p = e.slides[f] ?? e.slides[0], v = se(
    () => ({
      activeSlideId: (p == null ? void 0 : p.id) ?? "",
      activeSlideIndex: f
    }),
    [f, p == null ? void 0 : p.id]
  ), c = _(
    (l) => {
      i == null || i(l, v);
    },
    [i, v]
  ), D = _(
    (l, L) => {
      const M = Math.min(Math.max(l, 0), e.slides.length - 1), E = p == null ? void 0 : p.id;
      m < 0 && b(M);
      const P = e.slides[M];
      P && P.id !== E && (a == null || a({
        previousSlideId: E,
        activeSlideId: P.id,
        activeSlideIndex: M
      })), c({
        type: M > f ? "next-slide" : "previous-slide",
        origin: L,
        slideId: P == null ? void 0 : P.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [f, p == null ? void 0 : p.id, m, e.slides, c, a]
  ), I = _(
    (l) => {
      m >= 0 || b(Me(e, l));
    },
    [m, e]
  );
  return {
    activeIndex: f,
    activeSlide: p,
    emitAction: c,
    goTo: D,
    resetToSlideId: I,
    state: v
  };
}
function lt({
  activeIndex: e,
  onClose: t,
  onNext: n,
  onPrevious: i,
  slideCount: a
}) {
  return /* @__PURE__ */ k("div", { className: "deck-presentation-controls", "aria-label": "Navigation presentation", children: [
    /* @__PURE__ */ s("button", { type: "button", onClick: i, disabled: e === 0, "aria-label": "Slide precedente", children: "Previous" }),
    /* @__PURE__ */ k("span", { children: [
      e + 1,
      " / ",
      a
    ] }),
    /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        onClick: n,
        disabled: e >= a - 1,
        "aria-label": "Slide suivante",
        children: "Next"
      }
    ),
    /* @__PURE__ */ s("button", { type: "button", onClick: t, children: "Quitter" })
  ] });
}
function Gt({
  deck: e,
  defaultOpen: t = !1,
  initialSlideId: n,
  onAction: i,
  onOpenChange: a,
  onSlideChange: r,
  open: d,
  options: m,
  selectedSlideId: y
}) {
  var g, Q, C, N, W, z, K;
  const b = fe(null), f = fe(void 0), [p, v] = Y(t), [c, D] = Y(!0), { activeIndex: I, activeSlide: l, emitAction: L, goTo: M, resetToSlideId: E } = Te({
    deck: e,
    initialSlideId: n,
    onAction: i,
    onSlideChange: r,
    selectedSlideId: y
  }), P = d ?? p, S = ((g = m == null ? void 0 : m.fullscreen) == null ? void 0 : g.strategy) ?? "browser-fullscreen", w = ((Q = m == null ? void 0 : m.fullscreen) == null ? void 0 : Q.closeOnEscape) ?? !0, F = ((C = m == null ? void 0 : m.controls) == null ? void 0 : C.visibility) ?? "auto", V = ((N = m == null ? void 0 : m.controls) == null ? void 0 : N.visibility) === "auto" ? m.controls.autoHideDelayMs ?? 1800 : 1800, J = ((W = m == null ? void 0 : m.hint) == null ? void 0 : W.showWhenControlsHidden) ?? !0, le = ((z = m == null ? void 0 : m.hint) == null ? void 0 : z.text) ?? "Fleches gauche/droite: precedent/suivant. Escape: quitter.", ge = ((K = m == null ? void 0 : m.hint) == null ? void 0 : K.position) ?? "bottom-right", X = _(
    (x, A) => {
      d === void 0 && v(x), a == null || a({
        open: x,
        origin: A,
        slideId: l == null ? void 0 : l.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [l == null ? void 0 : l.id, a, d]
  ), ne = _(
    (x = "mouse") => {
      const A = b.current;
      document.fullscreenElement === A && document.exitFullscreen().catch(() => {
      }), X(!1, x), L({
        type: "toggle-fullscreen",
        origin: x,
        slideId: l == null ? void 0 : l.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [l == null ? void 0 : l.id, L, X]
  ), U = _(() => {
    f.current !== void 0 && (window.clearTimeout(f.current), f.current = void 0);
  }, []), j = _(() => {
    F === "auto" && (D(!0), U(), f.current = window.setTimeout(() => {
      D(!1), f.current = void 0;
    }, V));
  }, [V, U, F]);
  if (B(() => {
    P && E(n);
  }, [n, P, E]), B(() => {
    if (P) {
      if (F === "auto")
        return j(), U;
      D(F === "visible"), U();
    }
  }, [U, F, P, j]), B(() => {
    if (!P)
      return;
    const x = b.current;
    S === "browser-fullscreen" && (x != null && x.requestFullscreen) && x.requestFullscreen().catch(() => {
    });
    function A() {
      S === "browser-fullscreen" && document.fullscreenElement === null && X(!1, "keyboard");
    }
    return document.addEventListener("fullscreenchange", A), () => {
      document.removeEventListener("fullscreenchange", A), document.fullscreenElement === x && document.exitFullscreen().catch(() => {
      });
    };
  }, [S, P, X]), B(() => {
    if (!P)
      return;
    function x(A) {
      (A.key === "Escape" || A.key === "ArrowRight" || A.key === "PageDown" || A.key === " " || A.key === "ArrowLeft" || A.key === "PageUp") && (A.preventDefault(), A.stopImmediatePropagation()), A.key === "Escape" && w && ne("keyboard"), (A.key === "ArrowRight" || A.key === "PageDown" || A.key === " ") && M(I + 1, "keyboard"), (A.key === "ArrowLeft" || A.key === "PageUp") && M(I - 1, "keyboard");
    }
    return window.addEventListener("keydown", x, !0), () => window.removeEventListener("keydown", x, !0);
  }, [I, w, ne, M, P]), !P || !l)
    return null;
  const T = F === "visible" || F === "auto" && c, O = J && !T;
  return /* @__PURE__ */ k(
    "section",
    {
      ref: b,
      className: `deck-presentation-overlay ${e.theme.cssClassName}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Presentation plein ecran",
      onMouseMove: j,
      onPointerMove: j,
      children: [
        /* @__PURE__ */ s("div", { className: "deck-presentation-stage", children: /* @__PURE__ */ s(Ve, { deck: e, activeIndex: I }) }),
        T ? /* @__PURE__ */ s(
          lt,
          {
            activeIndex: I,
            slideCount: e.slides.length,
            onPrevious: () => M(I - 1, "mouse"),
            onNext: () => M(I + 1, "mouse"),
            onClose: () => ne("mouse")
          }
        ) : null,
        O ? /* @__PURE__ */ s("p", { className: "deck-presentation-hint", "data-position": ge, children: le }) : null
      ]
    }
  );
}
function Jt({ deck: e }) {
  return /* @__PURE__ */ s("div", { className: `deck-print-root ${e.theme.cssClassName}`, children: e.slides.map((t) => /* @__PURE__ */ s("section", { className: "deck-print-page", "data-slide-id": t.id, children: /* @__PURE__ */ s(Ne, { slide: t, target: "print" }) }, t.id)) });
}
const dt = {
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
function xe(e, t) {
  return `${e}:v1:${t}:current`;
}
function we(e, t) {
  return `${e}:v1:${t}:draft`;
}
function Se(e, t) {
  return `${e}:v1:${t}:versions:index`;
}
function ue(e, t, n) {
  return `${e}:v1:${t}:versions:${n}`;
}
class _e {
  async loadCurrent(t) {
    return me(xe(t.namespace, t.deckId));
  }
  async saveCurrent(t) {
    return ae(xe(t.namespace, t.deckId), t);
  }
  async saveDraft(t) {
    return ae(we(t.namespace, t.deckId), t);
  }
  async loadDraft(t) {
    return me(we(t.namespace, t.deckId));
  }
  async clearDraft(t) {
    var n;
    try {
      return (n = re()) == null || n.removeItem(we(t.namespace, t.deckId)), { status: "success" };
    } catch (i) {
      return Ie(i);
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
    }, i = JSON.stringify(n), a = await ae(ue(t.namespace, t.deckId, t.id), n);
    if (a.status === "failed")
      return a;
    const r = await ye(t.namespace, t.deckId), d = {
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
        ...r.versions.filter((y) => y.id !== t.id)
      ]
    }, m = ct(d, t.limits);
    return ae(Se(t.namespace, t.deckId), m);
  }
  async listVersions(t) {
    return (await ye(t.namespace, t.deckId)).versions;
  }
  async loadVersion(t) {
    return me(
      ue(t.namespace, t.deckId, t.versionId)
    );
  }
  async deleteVersion(t) {
    var n;
    try {
      (n = re()) == null || n.removeItem(ue(t.namespace, t.deckId, t.versionId));
      const i = await ye(t.namespace, t.deckId), a = {
        ...i,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        versions: i.versions.filter((r) => r.id !== t.versionId)
      };
      return ae(Se(t.namespace, t.deckId), a);
    } catch (i) {
      return Ie(i);
    }
  }
}
function ct(e, t) {
  var r;
  if (!t)
    return e;
  const n = [...e.versions], i = n.filter((d) => d.reason === "autosave");
  for (; n.length > t.maxVersionsPerDeck; ) {
    const d = ke(n, (m) => m.reason === "autosave");
    n.splice(d >= 0 ? d : n.length - 1, 1);
  }
  for (; n.filter((d) => d.reason === "autosave").length > t.maxAutosaveVersionsPerDeck; ) {
    const d = ke(n, (m) => m.reason === "autosave");
    if (d < 0)
      break;
    n.splice(d, 1);
  }
  let a = n.reduce((d, m) => d + m.sizeBytes, 0);
  for (; a > t.maxBytesPerDeck && n.length > 0; ) {
    const d = ke(n, (b) => b.reason === "autosave"), m = d >= 0 ? d : n.length - 1, [y] = n.splice(m, 1);
    a -= (y == null ? void 0 : y.sizeBytes) ?? 0;
  }
  for (const d of i.filter((m) => !n.some((y) => y.id === m.id)))
    (r = re()) == null || r.removeItem(ue(e.namespace, e.deckId, d.id));
  return {
    ...e,
    versions: n
  };
}
async function ye(e, t) {
  return await me(Se(e, t)) ?? {
    deckId: t,
    namespace: e,
    schemaVersion: 1,
    updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
    versions: []
  };
}
function me(e) {
  var t;
  try {
    const n = (t = re()) == null ? void 0 : t.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function ae(e, t) {
  var n;
  try {
    return (n = re()) == null || n.setItem(e, JSON.stringify(t)), { status: "success" };
  } catch (i) {
    return Ie(i);
  }
}
function Ie(e) {
  return {
    status: "failed",
    diagnostics: [ut(e)]
  };
}
function ut(e) {
  return {
    code: "STORAGE_QUOTA_EXCEEDED",
    severity: "error",
    message: e instanceof Error ? e.message : "Unable to write deck state to storage."
  };
}
function re() {
  if (!(typeof window > "u"))
    return window.localStorage;
}
function ke(e, t) {
  for (let n = e.length - 1; n >= 0; n -= 1)
    if (t(e[n]))
      return n;
  return -1;
}
const mt = /^(javascript|data|vbscript):/i, ft = {
  async resolveImage(e) {
    const t = e.assetId ? e.assets.get(e.assetId) : void 0, n = (t == null ? void 0 : t.src) ?? e.src, i = (t == null ? void 0 : t.alt) ?? "";
    if (!n || mt.test(n.trim()))
      throw new Error("Image source is missing or unsafe.");
    return {
      src: n,
      alt: i
    };
  }
};
function H({ content: e }) {
  return e.kind === "image" ? /* @__PURE__ */ s(
    "img",
    {
      className: "deck-slot-image",
      src: e.src ?? "",
      alt: e.alt ?? "",
      loading: "lazy"
    }
  ) : e.kind === "renderer" ? /* @__PURE__ */ k("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    e.rendererKind
  ] }) : /* @__PURE__ */ s("div", { className: "deck-markdown", children: e.nodes.map((t, n) => /* @__PURE__ */ s(ht, { node: t }, `${t.kind}-${n}`)) });
}
function ht({ node: e }) {
  return e.kind === "code" ? /* @__PURE__ */ s("pre", { className: "deck-code-block", children: /* @__PURE__ */ s("code", { children: e.code }) }) : e.kind === "mermaid" ? /* @__PURE__ */ s("pre", { className: "deck-mermaid-block", children: e.chart }) : /* @__PURE__ */ s(
    We,
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
function gt({ slide: e, target: t }) {
  return /* @__PURE__ */ k("article", { className: "deck-layout deck-layout-cover", "data-target": t, children: [
    /* @__PURE__ */ k("div", { className: "deck-cover-copy", children: [
      /* @__PURE__ */ s(ce, { slide: e, name: "eyebrow", className: "deck-cover-eyebrow" }),
      /* @__PURE__ */ s(ce, { slide: e, name: "title", className: "deck-cover-title" }),
      /* @__PURE__ */ s(ce, { slide: e, name: "subtitle", className: "deck-cover-subtitle" })
    ] }),
    /* @__PURE__ */ s(ce, { slide: e, name: "footer", className: "deck-slide-footer" })
  ] });
}
function ce({
  slide: e,
  name: t,
  className: n
}) {
  const i = e.slots.get(t);
  return i ? /* @__PURE__ */ s("div", { className: n, "data-slot": t, children: /* @__PURE__ */ s(H, { content: i.content }) }) : null;
}
function wt({ slide: e, target: t }) {
  const n = e.slots.get("image"), i = e.slots.get("caption");
  return /* @__PURE__ */ k("article", { className: "deck-layout deck-layout-image-only", "data-target": t, children: [
    /* @__PURE__ */ s("main", { children: n ? /* @__PURE__ */ s(H, { content: n.content }) : null }),
    /* @__PURE__ */ s("footer", { children: i ? /* @__PURE__ */ s(H, { content: i.content }) : null })
  ] });
}
function yt({ slide: e, target: t }) {
  const n = e.slots.get("title"), i = e.slots.get("body"), a = e.slots.get("footer");
  return /* @__PURE__ */ k("article", { className: "deck-layout deck-layout-title-body", "data-target": t, children: [
    /* @__PURE__ */ s("header", { children: n ? /* @__PURE__ */ s(H, { content: n.content }) : null }),
    /* @__PURE__ */ s("main", { children: i ? /* @__PURE__ */ s(H, { content: i.content }) : null }),
    /* @__PURE__ */ s("footer", { children: a ? /* @__PURE__ */ s(H, { content: a.content }) : null })
  ] });
}
function kt({ slide: e, target: t }) {
  const n = e.slots.get("title"), i = e.slots.get("left"), a = e.slots.get("right"), r = e.slots.get("footer");
  return /* @__PURE__ */ k("article", { className: "deck-layout deck-layout-two-columns", "data-target": t, children: [
    /* @__PURE__ */ s("header", { children: n ? /* @__PURE__ */ s(H, { content: n.content }) : null }),
    /* @__PURE__ */ k("main", { className: "deck-two-columns-grid", children: [
      /* @__PURE__ */ s("section", { children: i ? /* @__PURE__ */ s(H, { content: i.content }) : null }),
      /* @__PURE__ */ s("section", { children: a ? /* @__PURE__ */ s(H, { content: a.content }) : null })
    ] }),
    /* @__PURE__ */ s("footer", { children: r ? /* @__PURE__ */ s(H, { content: r.content }) : null })
  ] });
}
const pt = [
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
    component: gt
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
    component: yt
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
    component: kt
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
    component: wt
  }
];
function De({ node: e }) {
  return /* @__PURE__ */ s(H, { content: { kind: "markdown", markdown: "", nodes: [e] } });
}
const vt = {
  kind: "markdown",
  render: De
}, bt = {
  kind: "code",
  render: De
}, St = {
  kind: "mermaid",
  render: De
}, It = [
  vt,
  bt,
  St
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
}, Nt = [
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
], Dt = [
  { name: "none", displayName: "None" },
  { name: "fade", displayName: "Fade" },
  { name: "slide-left", displayName: "Slide left" },
  { name: "slide-right", displayName: "Slide right" },
  { name: "zoom", displayName: "Zoom" }
];
function At(e = {}) {
  const t = e.layouts ?? pt, n = e.renderers ?? It, i = e.themes ?? Nt, a = e.transitions ?? Dt;
  return {
    layouts: new Map(t.map((r) => [r.name, r])),
    renderers: new Map(n.map((r) => [r.kind, r])),
    themes: new Map(i.map((r) => [r.id, r])),
    transitions: new Map(a.map((r) => [r.name, r])),
    assets: ft,
    storage: e.storage ?? new _e(),
    pdf: e.pdf ?? dt
  };
}
const Pt = At();
function Ct({
  activeIndex: e,
  onNext: t,
  onOpenPresentation: n,
  onPresentationControlsModeChange: i,
  onPrevious: a,
  placement: r,
  presentationButtonLabel: d,
  presentationControlsMode: m,
  presentationDisabled: y,
  presentationUnavailableLabel: b,
  showCounter: f,
  showPresentationButton: p,
  showPresentationControlsModeSelect: v,
  showPreviousNext: c,
  slideCount: D
}) {
  return /* @__PURE__ */ k("div", { className: "deck-show-toolbar", "data-placement": r, "aria-label": "Deck navigation", children: [
    p ? /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        onClick: n,
        disabled: y,
        title: y ? b : d,
        children: d
      }
    ) : null,
    p && v ? /* @__PURE__ */ k("label", { className: "deck-presentation-mode-select", children: [
      /* @__PURE__ */ s("span", { children: "Presentation controls" }),
      /* @__PURE__ */ k(
        "select",
        {
          value: m,
          onChange: (I) => i(I.currentTarget.value),
          children: [
            /* @__PURE__ */ s("option", { value: "visible", children: "Boutons visibles" }),
            /* @__PURE__ */ s("option", { value: "hidden", children: "Boutons hidden" }),
            /* @__PURE__ */ s("option", { value: "auto", children: "Auto" })
          ]
        }
      )
    ] }) : null,
    c ? /* @__PURE__ */ s("button", { type: "button", onClick: a, disabled: e === 0, children: "Previous" }) : null,
    f ? /* @__PURE__ */ k("span", { children: [
      e + 1,
      " / ",
      D
    ] }) : null,
    c ? /* @__PURE__ */ s("button", { type: "button", onClick: t, disabled: e >= D - 1, children: "Next" }) : null
  ] });
}
function Xt({
  controls: e,
  deck: t,
  defaultSelectedSlideId: n,
  initialSlideId: i,
  mode: a = "viewer",
  onAction: r,
  onRequestPresentation: d,
  onSlideChange: m,
  selectedSlideId: y
}) {
  const { activeIndex: b, activeSlide: f, emitAction: p, goTo: v } = Te({
    deck: t,
    defaultSelectedSlideId: n,
    initialSlideId: i,
    onAction: r,
    onSlideChange: m,
    selectedSlideId: y
  }), c = e === !1 ? void 0 : e, D = e !== !1, I = (c == null ? void 0 : c.showPreviousNext) ?? !0, l = (c == null ? void 0 : c.showCounter) ?? !0, L = !!(c != null && c.showPresentationButton), M = _(() => {
    c != null && c.presentationDisabled || (d == null || d({
      type: "presentation-requested",
      slideId: f == null ? void 0 : f.id,
      activeSlideIndex: b,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }), p({
      type: "toggle-fullscreen",
      origin: "mouse",
      slideId: f == null ? void 0 : f.id,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [b, f == null ? void 0 : f.id, c == null ? void 0 : c.presentationDisabled, p, d]);
  B(() => {
    function S(w) {
      (w.key === "ArrowRight" || w.key === "PageDown" || w.key === " ") && (w.preventDefault(), v(b + 1, "keyboard")), (w.key === "ArrowLeft" || w.key === "PageUp") && (w.preventDefault(), v(b - 1, "keyboard"));
    }
    return window.addEventListener("keydown", S), () => window.removeEventListener("keydown", S);
  }, [b, v]);
  const E = (c == null ? void 0 : c.placement) ?? "top", P = D ? /* @__PURE__ */ s(
    Ct,
    {
      activeIndex: b,
      slideCount: t.slides.length,
      placement: E,
      showPreviousNext: I,
      showCounter: l,
      showPresentationButton: L,
      presentationDisabled: !!(c != null && c.presentationDisabled),
      showPresentationControlsModeSelect: !!(c != null && c.showPresentationControlsModeSelect),
      presentationControlsMode: (c == null ? void 0 : c.presentationControlsMode) ?? "auto",
      presentationButtonLabel: (c == null ? void 0 : c.presentationButtonLabel) ?? "Presentation",
      presentationUnavailableLabel: (c == null ? void 0 : c.presentationUnavailableLabel) ?? "Presentation is unavailable",
      onOpenPresentation: M,
      onPresentationControlsModeChange: (S) => {
        var w;
        return (w = c == null ? void 0 : c.onPresentationControlsModeChange) == null ? void 0 : w.call(c, S);
      },
      onPrevious: () => v(b - 1, "mouse"),
      onNext: () => v(b + 1, "mouse")
    }
  ) : null;
  return /* @__PURE__ */ k("div", { className: `deck-screen-root ${t.theme.cssClassName}`, "data-mode": a, children: [
    E === "top" ? P : null,
    /* @__PURE__ */ s(Ve, { deck: t, activeIndex: b }),
    E === "bottom" ? P : null
  ] });
}
function q(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n += 1)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, "0");
}
const Mt = {
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
}, xt = {
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
}, ve = {
  adapter: new _e(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, Rt = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function oe(e) {
  try {
    const t = Le.parse(e.content);
    return te(t) ? t : null;
  } catch {
    return null;
  }
}
function he(e, t) {
  return {
    ...e,
    content: Le.stringify(t, { lineWidth: 0 })
  };
}
function ee(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(te);
}
function Lt(e, t, n, i) {
  return Ae(e, t, (a) => {
    const r = He(a);
    r[n] = { markdown: i };
  });
}
function be(e, t, n, i) {
  return Ae(e, t, (a) => {
    const r = He(a);
    r[n] = {
      image: Ut({
        assetId: i.assetId,
        src: i.src,
        alt: i.alt
      })
    };
  });
}
function Et(e, t, n) {
  return Ae(e, t, (i) => {
    i.layout = n;
  });
}
function Vt(e, t = "title-body") {
  const n = oe(e);
  if (!n)
    return e;
  const i = ee(n), a = Ue(i, "slide");
  return i.push({
    id: a,
    layout: t,
    slots: {
      title: { markdown: "## New slide" },
      body: { markdown: "" }
    }
  }), n.slides = i, he(e, n);
}
function Tt(e, t) {
  const n = oe(e);
  if (!n)
    return e;
  const i = ee(n), a = i.findIndex((d) => d.id === t);
  if (a < 0)
    return e;
  const r = structuredClone(i[a]);
  return r.id = Ue(i, `${t}-copy`), i.splice(a + 1, 0, r), n.slides = i, he(e, n);
}
function _t(e, t) {
  const n = oe(e);
  if (!n)
    return e;
  const i = ee(n).filter((a) => a.id !== t);
  return n.slides = i.length > 0 ? i : ee(n), he(e, n);
}
function $t(e, t, n) {
  const i = $e(e, t, n);
  return te(i) && typeof i.markdown == "string" ? i.markdown : "";
}
function Ht(e, t, n) {
  const i = $e(e, t, n), a = te(i) && te(i.image) ? i.image : {};
  return {
    assetId: typeof a.assetId == "string" ? a.assetId : "",
    src: typeof a.src == "string" ? a.src : "",
    alt: typeof a.alt == "string" ? a.alt : ""
  };
}
function Ae(e, t, n) {
  const i = oe(e);
  if (!i)
    return e;
  const a = ee(i), r = a.find((d) => d.id === t);
  return r ? (n(r), i.slides = a, he(e, i)) : e;
}
function $e(e, t, n) {
  var r;
  const i = oe(e);
  if (!i)
    return;
  const a = ee(i).find((d) => d.id === t);
  return (r = a == null ? void 0 : a.slots) == null ? void 0 : r[n];
}
function He(e) {
  return te(e.slots) || (e.slots = {}), e.slots;
}
function Ue(e, t) {
  const n = new Set(e.map((r) => r.id).filter((r) => !!r));
  let i = Re(t), a = 2;
  for (; n.has(i); )
    i = `${Re(t)}-${a}`, a += 1;
  return i;
}
function Re(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function Ut(e) {
  return Object.fromEntries(
    Object.entries(e).filter((t) => !!t[1])
  );
}
function te(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Qt(e) {
  var Pe;
  const {
    autosave: t,
    deckId: n,
    features: i,
    initialSelectedSlideId: a,
    layout: r,
    locale: d = "fr-FR",
    namespace: m,
    onChange: y,
    onCompile: b,
    onError: f,
    onRestoreVersion: p,
    onSave: v,
    onSelectedSlideChange: c,
    readOnly: D,
    storage: I
  } = e, l = e.options, L = e.runtime ?? Pt, M = e.mode === "controlled", [E, P] = Y(
    M ? e.value : e.initialValue
  ), S = M ? e.value : E, [w, F] = Y(null), [V, J] = Y(
    a
  ), [le, ge] = Y(((Pe = l == null ? void 0 : l.editing) == null ? void 0 : Pe.defaultMode) === "source"), [X, ne] = Y([]), U = fe(b), j = fe(f);
  U.current = b, j.current = f;
  const T = se(() => {
    var R;
    const o = { ...Mt, ...r }, u = l == null ? void 0 : l.panels;
    return (u == null ? void 0 : u.slideRail) === !1 ? o.showSlideRail = !1 : u != null && u.slideRail && (o.showSlideRail = u.slideRail.visibleDefault ?? o.showSlideRail, o.slideRailWidthPx = u.slideRail.widthPx ?? o.slideRailWidthPx), (u == null ? void 0 : u.inspector) === !1 ? o.showInspector = !1 : u != null && u.inspector && (o.showInspector = u.inspector.visibleDefault ?? o.showInspector, o.inspectorWidthPx = u.inspector.widthPx ?? o.inspectorWidthPx), (u == null ? void 0 : u.diagnostics) === !1 ? o.showDiagnosticsPanel = !1 : u != null && u.diagnostics && (o.showDiagnosticsPanel = u.diagnostics.visibleDefault ?? o.showDiagnosticsPanel), (u == null ? void 0 : u.activeSlidePreview) === !1 ? o.showActiveSlidePreview = !1 : u != null && u.activeSlidePreview && (o.showActiveSlidePreview = u.activeSlidePreview.visibleDefault ?? o.showActiveSlidePreview), (u == null ? void 0 : u.versionHistory) === !1 ? o.showVersionHistory = !1 : u != null && u.versionHistory && (o.showVersionHistory = u.versionHistory.visibleDefault ?? o.showVersionHistory), ((R = l == null ? void 0 : l.editing) == null ? void 0 : R.allowSourceMode) === !1 && (o.showSourceModeToggle = !1), o;
  }, [r, l]), O = se(() => {
    var u, R, G, ie;
    const o = { ...xt, ...i };
    return ((u = l == null ? void 0 : l.editing) == null ? void 0 : u.allowSourceMode) !== void 0 && (o.allowRawSourceEdit = l.editing.allowSourceMode), ((R = l == null ? void 0 : l.editing) == null ? void 0 : R.allowLayoutChange) !== void 0 && (o.allowLayoutChange = l.editing.allowLayoutChange), ((G = l == null ? void 0 : l.layoutSelector) == null ? void 0 : G.enabled) !== void 0 && (o.allowLayoutChange = l.layoutSelector.enabled), (ie = l == null ? void 0 : l.panels) != null && ie.slideRail && (l.panels.slideRail.allowReorder !== void 0 && (o.allowReorderSlides = l.panels.slideRail.allowReorder), l.panels.slideRail.allowAddDelete !== void 0 && (o.allowAddSlide = l.panels.slideRail.allowAddDelete, o.allowDeleteSlide = l.panels.slideRail.allowAddDelete)), o;
  }, [i, l]), g = se(
    () => I === !1 ? void 0 : {
      ...ve,
      namespace: m ?? (I == null ? void 0 : I.namespace) ?? ve.namespace,
      adapter: (I == null ? void 0 : I.adapter) ?? L.storage ?? ve.adapter,
      ...I
    },
    [m, L.storage, I]
  ), Q = se(
    () => t === !1 ? void 0 : { ...Rt, ...t },
    [t]
  ), C = (w == null ? void 0 : w.status) === "valid" || (w == null ? void 0 : w.status) === "degraded" ? w.deck : void 0, N = (C == null ? void 0 : C.slides.find((o) => o.id === V)) ?? (C == null ? void 0 : C.slides[0]), W = _(
    (o, u, R) => {
      const G = {
        reason: u,
        deckId: n,
        selectedSlideId: R ?? V,
        sourceHash: q(o.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      M || P(o), y == null || y(o, G);
    },
    [M, n, y, V]
  );
  B(() => {
    let o = !1;
    return tt(S, {
      runtime: L
    }).then((u) => {
      var R;
      o || (F(u), (R = U.current) == null || R.call(U, u));
    }).catch((u) => {
      var R;
      (R = j.current) == null || R.call(j, {
        message: u instanceof Error ? u.message : "Deck compilation failed.",
        cause: u
      });
    }), () => {
      o = !0;
    };
  }, [d, L, S]), B(() => {
    if (!C || V)
      return;
    const o = C.slides[0];
    o && J(o.id);
  }, [C, V]), B(() => {
    g != null && g.recoverOnMount && g.adapter.loadDraft({ deckId: n, namespace: g.namespace }).then((o) => {
      !o || o.sourceHash === q(S.content) || (J(o.selectedSlideId), W(o.source, "crash-recovery", o.selectedSlideId));
    }).catch((o) => {
      f == null || f({
        message: o instanceof Error ? o.message : "Unable to recover deck draft.",
        cause: o
      });
    });
  }, [n, f, W, S.content, g]), B(() => {
    if (!g || !Q || !g.saveDraftOnChange)
      return;
    const o = window.setTimeout(() => {
      g.adapter.saveDraft({
        deckId: n,
        namespace: g.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: jt(),
        source: S,
        sourceHash: q(S.content),
        selectedSlideId: V,
        compilerStatus: (w == null ? void 0 : w.status) ?? "invalid"
      });
    }, Q.draftDebounceMs);
    return () => window.clearTimeout(o);
  }, [Q, w, n, V, S, g]);
  const z = _(() => {
    g && g.adapter.listVersions({ deckId: n, namespace: g.namespace }).then(ne).catch((o) => {
      f == null || f({
        message: o instanceof Error ? o.message : "Unable to list deck versions.",
        cause: o
      });
    });
  }, [n, f, g]);
  B(() => {
    z();
  }, [z]);
  const K = _(
    async (o, u) => {
      var ie;
      if (!g)
        return;
      const R = (w == null ? void 0 : w.diagnostics) ?? [], G = await g.adapter.createVersion({
        id: Be(),
        deckId: n,
        namespace: g.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: u,
        reason: o,
        source: S,
        sourceHash: q(S.content),
        selectedSlideId: V,
        compilerStatus: (w == null ? void 0 : w.status) ?? "invalid",
        diagnosticsSummary: Je(R),
        limits: {
          maxVersionsPerDeck: g.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: g.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: g.maxBytesPerDeck
        }
      });
      G.status === "failed" && (f == null || f({ message: ((ie = G.diagnostics[0]) == null ? void 0 : ie.message) ?? "Unable to save deck version." })), z();
    },
    [w, n, f, z, V, S, g]
  ), x = _(() => {
    g && (g.adapter.saveCurrent({
      deckId: n,
      namespace: g.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: S,
      sourceHash: q(S.content),
      selectedSlideId: V
    }), g.createVersionOnManualSave && K("manual", "Manual save"), v == null || v({
      deckId: n,
      sourceHash: q(S.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [K, n, v, V, S, g]), A = _(
    async (o) => {
      if (!g)
        return;
      g.createVersionBeforeDestructiveAction && await K("before-version-restore", "Before restore");
      const u = await g.adapter.loadVersion({
        deckId: n,
        namespace: g.namespace,
        versionId: o
      });
      u && (J(u.selectedSlideId), W(u.source, "version-restore", u.selectedSlideId), p == null || p({
        deckId: n,
        versionId: o,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [K, n, p, W, g]
  );
  function Fe(o) {
    J(o), c == null || c({ deckId: n, slideId: o });
  }
  function Z(o, u) {
    W(o, u, N == null ? void 0 : N.id);
  }
  const je = (w == null ? void 0 : w.diagnostics) ?? [];
  return /* @__PURE__ */ k(
    "div",
    {
      className: "deck-studio-root",
      "data-density": T.density,
      "data-slide-rail": T.showSlideRail ? "visible" : "hidden",
      "data-inspector": T.showInspector ? "visible" : "hidden",
      children: [
        T.showSlideRail ? /* @__PURE__ */ k("aside", { className: "deck-studio-rail", style: { width: T.slideRailWidthPx }, children: [
          /* @__PURE__ */ k("header", { children: [
            /* @__PURE__ */ s("strong", { children: (C == null ? void 0 : C.metadata.title) ?? "Deck" }),
            O.allowAddSlide ? /* @__PURE__ */ s("button", { type: "button", onClick: () => Z(Vt(S), "slide-add"), disabled: D, children: "Add" }) : null
          ] }),
          /* @__PURE__ */ s("nav", { "aria-label": "Slides", children: C == null ? void 0 : C.slides.map((o) => /* @__PURE__ */ k(
            "button",
            {
              type: "button",
              className: o.id === (N == null ? void 0 : N.id) ? "is-active" : void 0,
              onClick: () => Fe(o.id),
              children: [
                /* @__PURE__ */ s("span", { children: o.index + 1 }),
                /* @__PURE__ */ s("span", { children: o.id }),
                /* @__PURE__ */ s("small", { children: o.layout.name })
              ]
            },
            o.id
          )) })
        ] }) : null,
        /* @__PURE__ */ k("main", { className: "deck-studio-main", children: [
          /* @__PURE__ */ k("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ k("div", { children: [
              /* @__PURE__ */ s("strong", { children: (N == null ? void 0 : N.id) ?? "Source" }),
              N ? /* @__PURE__ */ s("small", { children: N.layout.definition.displayName }) : null
            ] }),
            /* @__PURE__ */ k("div", { className: "deck-studio-actions", children: [
              T.showSourceModeToggle && O.allowRawSourceEdit ? /* @__PURE__ */ s("button", { type: "button", onClick: () => ge((o) => !o), children: le ? "Form" : "YAML" }) : null,
              O.allowDuplicateSlide && N ? /* @__PURE__ */ s(
                "button",
                {
                  type: "button",
                  onClick: () => Z(Tt(S, N.id), "slide-duplicate"),
                  disabled: D,
                  children: "Duplicate"
                }
              ) : null,
              O.allowDeleteSlide && N ? /* @__PURE__ */ s(
                "button",
                {
                  type: "button",
                  onClick: () => Z(_t(S, N.id), "slide-delete"),
                  disabled: D || ((C == null ? void 0 : C.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              g ? /* @__PURE__ */ s("button", { type: "button", onClick: x, disabled: D, children: "Save" }) : null
            ] })
          ] }),
          le ? /* @__PURE__ */ s(
            "textarea",
            {
              className: "deck-source-editor",
              value: S.content,
              onChange: (o) => Z({ ...S, content: o.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: D
            }
          ) : N ? /* @__PURE__ */ k("div", { className: "deck-studio-editor", children: [
            /* @__PURE__ */ s(
              Bt,
              {
                source: S,
                slideId: N.id,
                fields: N.layout.definition.editor.fieldGroups.flatMap((o) => o.fields),
                readOnly: !!D,
                onUpdate: Z
              }
            ),
            O.allowLayoutChange ? /* @__PURE__ */ k("label", { className: "deck-form-field", children: [
              /* @__PURE__ */ s("span", { children: "Layout" }),
              /* @__PURE__ */ s(
                "select",
                {
                  value: N.layout.name,
                  onChange: (o) => {
                    g != null && g.createVersionBeforeDestructiveAction && K("before-layout-change", "Before layout change"), Z(Et(S, N.id, o.currentTarget.value), "layout-change");
                  },
                  disabled: D,
                  children: Array.from(L.layouts.values()).map((o) => /* @__PURE__ */ s("option", { value: o.name, children: o.displayName }, o.name))
                }
              )
            ] }) : null
          ] }) : (w == null ? void 0 : w.status) === "invalid" ? /* @__PURE__ */ s(Ke, { fallback: w.fallback }) : null,
          T.showActiveSlidePreview && N ? /* @__PURE__ */ s("section", { className: "deck-studio-preview", "aria-label": "Active slide preview", children: /* @__PURE__ */ s(Ne, { slide: N, target: "screen" }) }) : null
        ] }),
        T.showInspector ? /* @__PURE__ */ k("aside", { className: "deck-studio-inspector", style: { width: T.inspectorWidthPx }, children: [
          T.showDiagnosticsPanel ? /* @__PURE__ */ k("section", { children: [
            /* @__PURE__ */ s("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ s(Ee, { diagnostics: je })
          ] }) : null,
          T.showVersionHistory && g ? /* @__PURE__ */ k("section", { children: [
            /* @__PURE__ */ s("h3", { children: "Versions" }),
            /* @__PURE__ */ s("ul", { className: "deck-version-list", children: X.map((o) => /* @__PURE__ */ k("li", { children: [
              /* @__PURE__ */ s(
                "button",
                {
                  type: "button",
                  onClick: () => void A(o.id),
                  disabled: !O.allowVersionRestore || D,
                  children: o.label ?? o.reason
                }
              ),
              /* @__PURE__ */ s("small", { children: new Date(o.createdAtIso).toLocaleString() })
            ] }, o.id)) })
          ] }) : null
        ] }) : null
      ]
    }
  );
}
function Bt({
  source: e,
  slideId: t,
  fields: n,
  readOnly: i,
  onUpdate: a
}) {
  return /* @__PURE__ */ s("form", { className: "deck-slide-form", children: n.map((r) => /* @__PURE__ */ s(
    Ft,
    {
      source: e,
      slideId: t,
      field: r,
      readOnly: i,
      onUpdate: a
    },
    `${r.kind}-${"slotName" in r ? r.slotName : r.label}`
  )) });
}
function Ft({
  source: e,
  slideId: t,
  field: n,
  readOnly: i,
  onUpdate: a
}) {
  if (n.kind === "markdown")
    return /* @__PURE__ */ k("label", { className: "deck-form-field", children: [
      /* @__PURE__ */ s("span", { children: n.label }),
      /* @__PURE__ */ s(
        "textarea",
        {
          rows: n.minRows ?? 4,
          value: $t(e, t, n.slotName),
          onChange: (r) => a(Lt(e, t, n.slotName, r.currentTarget.value), "slide-field-edit"),
          readOnly: i
        }
      )
    ] });
  if (n.kind === "image") {
    const r = Ht(e, t, n.slotName);
    return /* @__PURE__ */ k("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ s("legend", { children: n.label }),
      /* @__PURE__ */ k("label", { children: [
        /* @__PURE__ */ s("span", { children: "Asset id" }),
        /* @__PURE__ */ s(
          "input",
          {
            value: r.assetId,
            onChange: (d) => a(
              be(e, t, n.slotName, {
                ...r,
                assetId: d.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: i
          }
        )
      ] }),
      /* @__PURE__ */ k("label", { children: [
        /* @__PURE__ */ s("span", { children: "Source" }),
        /* @__PURE__ */ s(
          "input",
          {
            value: r.src,
            onChange: (d) => a(
              be(e, t, n.slotName, {
                ...r,
                src: d.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: i
          }
        )
      ] }),
      /* @__PURE__ */ k("label", { children: [
        /* @__PURE__ */ s("span", { children: "Alt" }),
        /* @__PURE__ */ s(
          "input",
          {
            value: r.alt,
            onChange: (d) => a(
              be(e, t, n.slotName, {
                ...r,
                alt: d.currentTarget.value
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
function jt() {
  const e = "deck-runtime-session-id", t = window.sessionStorage.getItem(e);
  if (t)
    return t;
  const n = Be();
  return window.sessionStorage.setItem(e, n), n;
}
function Be() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
export {
  Ke as DebugDeckFallback,
  Gt as DeckPresentationOverlay,
  Xt as DeckShow,
  Qt as DeckStudio,
  Jt as PrintDeck,
  tt as compileDeck,
  At as createDeckRuntime,
  Pt as defaultDeckRuntime
};
