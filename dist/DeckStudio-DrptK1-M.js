import { jsxs as g, jsx as o } from "react/jsx-runtime";
import { useState as O, useRef as ee, useMemo as q, useCallback as K, useEffect as j } from "react";
import { h as G, c as je, s as Ge } from "./hash-BGAdcMpD.js";
import { L as Ye, d as _e } from "./defaultDeckRuntime-BlLpFtOg.js";
import { d as ze } from "./themeStyle-CyBLqMAf.js";
import { S as ge } from "./SlideRenderer-iimFvRrx.js";
import be from "yaml";
function Ke({ fallback: e }) {
  return /* @__PURE__ */ g("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ o("header", { children: /* @__PURE__ */ o("h2", { children: e.title }) }),
    /* @__PURE__ */ o(Se, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ o("pre", { children: e.source.content })
  ] });
}
function Se({
  diagnostics: e
}) {
  return e.length === 0 ? /* @__PURE__ */ o("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ o("ul", { className: "deck-diagnostics-list", children: e.map((a, n) => /* @__PURE__ */ g("li", { "data-severity": a.severity, children: [
    /* @__PURE__ */ o("strong", { children: a.code }),
    /* @__PURE__ */ o("span", { children: a.message }),
    a.hint ? /* @__PURE__ */ o("small", { children: a.hint }) : null
  ] }, `${a.code}-${n}`)) });
}
const Je = {
  desktopBreakpointPx: 1024,
  slideRailWidthPx: 220,
  inspectorWidthPx: 340,
  showSlideRail: !0,
  showInspector: !0,
  showActiveSlidePreview: !0,
  showSourceModeToggle: !0,
  showVersionHistory: !0,
  showDiagnosticsPanel: !0,
  density: "comfortable"
}, Qe = {
  allowAddSlide: !0,
  allowDuplicateSlide: !0,
  allowDeleteSlide: !0,
  allowReorderSlides: !0,
  allowLayoutChange: !0,
  allowThemeChange: !0,
  allowRawSourceEdit: !0,
  allowPdfExport: !0,
  allowVersionRestore: !0,
  allowVersionCompare: !1
}, ie = {
  adapter: new Ye(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, Xe = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function L(e) {
  try {
    const a = be.parse(e.content);
    return A(a) ? a : null;
  } catch {
    return null;
  }
}
function Y(e, a) {
  return {
    ...e,
    content: be.stringify(a, { lineWidth: 0 })
  };
}
function $(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(A);
}
function se(e, a, n, s) {
  return te(e, a, (l) => {
    const r = ye(l);
    r[n] = { markdown: s };
  });
}
function Ze(e, a, n) {
  return te(e, a, (s) => {
    A(s.slots) && (delete s.slots[n], Object.keys(s.slots).length === 0 && delete s.slots);
  });
}
function Ue(e, a, n) {
  return re(e, a, n) !== void 0;
}
function oe(e, a) {
  const n = ke(e, a);
  return A(n) && typeof n.markdown == "string" ? n.markdown : "";
}
function et(e, a) {
  return ke(e, a) !== void 0;
}
function we(e, a, n) {
  const s = L(e);
  if (!s)
    return e;
  const l = rt(s);
  return l[a] = { markdown: n }, Y(e, s);
}
function le(e, a, n, s) {
  return te(e, a, (l) => {
    const r = ye(l);
    r[n] = {
      image: ct({
        assetId: s.assetId,
        src: s.src,
        alt: s.alt
      })
    };
  });
}
function tt(e, a, n, s) {
  return te(e, a, (l) => {
    s && l.layout && l.layout !== n && (l.slots = dt(l, n, s)), l.layout = n;
  });
}
function nt(e, a = "title-body", n) {
  const s = L(e);
  if (!s)
    return { source: e };
  const l = $(s), r = De(l, "slide"), d = {
    id: r,
    layout: a,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }, b = n ? l.findIndex((S) => S.id === n) : -1;
  return l.splice(b >= 0 ? b + 1 : l.length, 0, d), s.slides = l, { source: Y(e, s), slideId: r };
}
function at(e, a) {
  const n = L(e);
  if (!n)
    return e;
  const s = $(n), l = s.findIndex((d) => d.id === a);
  if (l < 0)
    return e;
  const r = structuredClone(s[l]);
  return r.id = De(s, `${a}-copy`), s.splice(l + 1, 0, r), n.slides = s, Y(e, n);
}
function it(e, a) {
  const n = L(e);
  if (!n)
    return e;
  const s = $(n).filter((l) => l.id !== a);
  return n.slides = s.length > 0 ? s : $(n), Y(e, n);
}
function st(e, a, n, s) {
  if (a === n)
    return e;
  const l = L(e);
  if (!l)
    return e;
  const r = $(l), d = r.findIndex((I) => I.id === a), b = r.findIndex((I) => I.id === n);
  if (d < 0 || b < 0)
    return e;
  const [S] = r.splice(d, 1), R = r.findIndex((I) => I.id === n), k = s === "after" ? R + 1 : R;
  return r.splice(k, 0, S), l.slides = r, Y(e, l);
}
function lt(e, a, n) {
  const s = re(e, a, n);
  return A(s) && typeof s.markdown == "string" ? s.markdown : "";
}
function ot(e, a, n) {
  const s = re(e, a, n), l = A(s) && A(s.image) ? s.image : {};
  return {
    assetId: typeof l.assetId == "string" ? l.assetId : "",
    src: typeof l.src == "string" ? l.src : "",
    alt: typeof l.alt == "string" ? l.alt : ""
  };
}
function te(e, a, n) {
  const s = L(e);
  if (!s)
    return e;
  const l = $(s), r = l.find((d) => d.id === a);
  return r ? (n(r), s.slides = l, Y(e, s)) : e;
}
function re(e, a, n) {
  var r;
  const s = L(e);
  if (!s)
    return;
  const l = $(s).find((d) => d.id === a);
  return (r = l == null ? void 0 : l.slots) == null ? void 0 : r[n];
}
function ke(e, a) {
  var s;
  const n = L(e);
  if (n)
    return A((s = n.defaults) == null ? void 0 : s.slots) ? n.defaults.slots[a] : void 0;
}
function ye(e) {
  return A(e.slots) || (e.slots = {}), e.slots;
}
function rt(e) {
  return A(e.defaults) || (e.defaults = {}), A(e.defaults.slots) || (e.defaults.slots = {}), e.defaults.slots;
}
function dt(e, a, n) {
  var d, b;
  const s = A(e.slots) ? e.slots : {}, l = e.layout ? (b = (d = n.get(a)) == null ? void 0 : d.migrateFrom) == null ? void 0 : b[e.layout] : void 0;
  if (!l)
    return s;
  const r = {};
  for (const S of l.operations)
    S.kind === "move-slot" && S.from in s && (r[S.to] = s[S.from]);
  return r;
}
function De(e, a) {
  const n = new Set(e.map((r) => r.id).filter((r) => !!r));
  let s = ve(a), l = 2;
  for (; n.has(s); )
    s = `${ve(a)}-${l}`, l += 1;
  return s;
}
function ve(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function ct(e) {
  return Object.fromEntries(
    Object.entries(e).filter((a) => !!a[1])
  );
}
function A(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function ut({
  fields: e,
  inheritedMarkdownSlots: a,
  onUpdate: n,
  readOnly: s,
  slideId: l,
  source: r
}) {
  return /* @__PURE__ */ o("form", { className: "deck-slide-form", children: e.map((d) => /* @__PURE__ */ o(
    ft,
    {
      source: r,
      slideId: l,
      field: d,
      inheritedMarkdownSlots: a,
      readOnly: s,
      onUpdate: n
    },
    `${d.kind}-${"slotName" in d ? d.slotName : d.label}`
  )) });
}
function ft({
  source: e,
  slideId: a,
  field: n,
  inheritedMarkdownSlots: s,
  readOnly: l,
  onUpdate: r
}) {
  if (n.kind === "markdown") {
    const d = n.blockKind === "heading" || n.slotName === "title", b = ht(n.slotName) ? s == null ? void 0 : s.get(n.slotName) : void 0, S = b !== void 0, R = S && Ue(e, a, n.slotName), k = S && !R ? b : lt(e, a, n.slotName), I = d || mt(n), F = I ? gt(k, d) : k, N = l || S && !R, y = I ? /* @__PURE__ */ o(
      "input",
      {
        "aria-label": n.label,
        className: "deck-form-input",
        placeholder: " ",
        value: F,
        onChange: (D) => r(
          se(e, a, n.slotName, D.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: N
      }
    ) : /* @__PURE__ */ o(
      "textarea",
      {
        "aria-label": n.label,
        className: "deck-form-textarea",
        placeholder: " ",
        rows: n.minRows ?? 4,
        value: F,
        onChange: (D) => r(
          se(e, a, n.slotName, D.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: N
      }
    );
    return /* @__PURE__ */ g(
      "div",
      {
        className: "deck-form-field",
        "data-inherited": S && !R ? "true" : void 0,
        children: [
          /* @__PURE__ */ o("span", { children: n.label }),
          /* @__PURE__ */ g("div", { className: "deck-form-field__control", children: [
            y,
            S ? /* @__PURE__ */ o("label", { className: "deck-inherited-slot-toggle", title: "Override global", children: /* @__PURE__ */ o(
              "input",
              {
                "aria-label": `Override ${n.label} global`,
                title: `Override ${n.label} global`,
                type: "checkbox",
                checked: R,
                onChange: (D) => r(
                  D.currentTarget.checked ? se(e, a, n.slotName, b) : Ze(e, a, n.slotName),
                  "slide-field-edit"
                ),
                disabled: l
              }
            ) }) : null
          ] })
        ]
      }
    );
  }
  if (n.kind === "image") {
    const d = ot(e, a, n.slotName);
    return /* @__PURE__ */ g("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ o("legend", { children: n.label }),
      /* @__PURE__ */ g("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ o("span", { children: "Asset id" }),
        /* @__PURE__ */ o(
          "input",
          {
            placeholder: " ",
            value: d.assetId,
            onChange: (b) => r(
              le(e, a, n.slotName, {
                ...d,
                assetId: b.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: l
          }
        )
      ] }),
      /* @__PURE__ */ g("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ o("span", { children: "Source" }),
        /* @__PURE__ */ o(
          "input",
          {
            placeholder: " ",
            value: d.src,
            onChange: (b) => r(
              le(e, a, n.slotName, {
                ...d,
                src: b.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: l
          }
        )
      ] }),
      /* @__PURE__ */ g("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ o("span", { children: "Alt" }),
        /* @__PURE__ */ o(
          "input",
          {
            placeholder: " ",
            value: d.alt,
            onChange: (b) => r(
              le(e, a, n.slotName, {
                ...d,
                alt: b.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: l
          }
        )
      ] })
    ] });
  }
  return null;
}
function ht(e) {
  return e === "eyebrow" || e === "footer";
}
function mt(e) {
  return e.kind !== "markdown" ? !1 : e.minRows === 1 || e.slotName === "eyebrow" || e.slotName === "subtitle" || e.slotName === "footer";
}
function gt(e, a) {
  return (a ? e.replace(/^(\s*)#{1,6}\s+/u, "$1") : e).replace(/\s*\n\s*/gu, " ").trim();
}
function wt({
  onClose: e,
  onUpdate: a,
  readOnly: n,
  source: s
}) {
  const l = oe(s, "eyebrow"), r = oe(s, "footer");
  return /* @__PURE__ */ o("div", { className: "deck-global-defaults-backdrop", role: "presentation", onMouseDown: e, children: /* @__PURE__ */ g(
    "section",
    {
      "aria-labelledby": "deck-global-defaults-title",
      className: "deck-global-defaults-dialog",
      role: "dialog",
      "aria-modal": "true",
      onMouseDown: (d) => d.stopPropagation(),
      children: [
        /* @__PURE__ */ g("header", { children: [
          /* @__PURE__ */ g("div", { children: [
            /* @__PURE__ */ o("p", { children: "Defaults" }),
            /* @__PURE__ */ o("h3", { id: "deck-global-defaults-title", children: "Valeurs globales" })
          ] }),
          /* @__PURE__ */ o("button", { type: "button", onClick: e, children: "Fermer" })
        ] }),
        /* @__PURE__ */ g("div", { className: "deck-global-defaults-body", children: [
          /* @__PURE__ */ g("label", { className: "deck-form-field", children: [
            /* @__PURE__ */ o("span", { children: "Eyebrow global" }),
            /* @__PURE__ */ o(
              "input",
              {
                className: "deck-form-input",
                placeholder: " ",
                value: l,
                onChange: (d) => a(
                  we(s, "eyebrow", d.currentTarget.value),
                  "defaults-edit"
                ),
                readOnly: n
              }
            )
          ] }),
          /* @__PURE__ */ g("label", { className: "deck-form-field", children: [
            /* @__PURE__ */ o("span", { children: "Footer global" }),
            /* @__PURE__ */ o(
              "input",
              {
                className: "deck-form-input",
                placeholder: " ",
                value: r,
                onChange: (d) => a(
                  we(s, "footer", d.currentTarget.value),
                  "defaults-edit"
                ),
                readOnly: n
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function Mt(e) {
  var me;
  const {
    autosave: a,
    deckId: n,
    features: s,
    initialSelectedSlideId: l,
    layout: r,
    locale: d = "fr-FR",
    namespace: b,
    onChange: S,
    onCompile: R,
    onError: k,
    onRestoreVersion: I,
    onSave: F,
    onSelectedSlideChange: N,
    readOnly: y,
    storage: D
  } = e, u = e.options, H = e.runtime ?? _e, J = e.mode === "controlled", [Ne, xe] = O(
    J ? e.value : e.initialValue
  ), h = J ? e.value : Ne, [w, Me] = O(null), [P, B] = O(
    l
  ), [de, Ae] = O(
    ((me = u == null ? void 0 : u.editing) == null ? void 0 : me.defaultMode) ?? "form"
  ), [Pe, ce] = O(!1), [p, E] = O(null), [Ve, Ce] = O([]), ue = ee(null), Q = ee(R), X = ee(k), ne = ee(!1);
  Q.current = R, X.current = k;
  const V = q(() => {
    var f;
    const t = { ...Je, ...r }, i = u == null ? void 0 : u.panels;
    return (i == null ? void 0 : i.slideRail) === !1 ? t.showSlideRail = !1 : i != null && i.slideRail && (t.showSlideRail = i.slideRail.visibleDefault ?? t.showSlideRail, t.slideRailWidthPx = i.slideRail.widthPx ?? t.slideRailWidthPx), (i == null ? void 0 : i.inspector) === !1 ? t.showInspector = !1 : i != null && i.inspector && (t.showInspector = i.inspector.visibleDefault ?? t.showInspector, t.inspectorWidthPx = i.inspector.widthPx ?? t.inspectorWidthPx), (i == null ? void 0 : i.diagnostics) === !1 ? t.showDiagnosticsPanel = !1 : i != null && i.diagnostics && (t.showDiagnosticsPanel = i.diagnostics.visibleDefault ?? t.showDiagnosticsPanel), (i == null ? void 0 : i.activeSlidePreview) === !1 ? t.showActiveSlidePreview = !1 : i != null && i.activeSlidePreview && (t.showActiveSlidePreview = i.activeSlidePreview.visibleDefault ?? t.showActiveSlidePreview), (i == null ? void 0 : i.versionHistory) === !1 ? t.showVersionHistory = !1 : i != null && i.versionHistory && (t.showVersionHistory = i.versionHistory.visibleDefault ?? t.showVersionHistory), ((f = u == null ? void 0 : u.editing) == null ? void 0 : f.allowSourceMode) === !1 && (t.showSourceModeToggle = !1), t;
  }, [r, u]), C = q(() => {
    var i, f, x, M;
    const t = { ...Qe, ...s };
    return ((i = u == null ? void 0 : u.editing) == null ? void 0 : i.allowSourceMode) !== void 0 && (t.allowRawSourceEdit = u.editing.allowSourceMode), ((f = u == null ? void 0 : u.editing) == null ? void 0 : f.allowLayoutChange) !== void 0 && (t.allowLayoutChange = u.editing.allowLayoutChange), ((x = u == null ? void 0 : u.layoutSelector) == null ? void 0 : x.enabled) !== void 0 && (t.allowLayoutChange = u.layoutSelector.enabled), (M = u == null ? void 0 : u.panels) != null && M.slideRail && (u.panels.slideRail.allowReorder !== void 0 && (t.allowReorderSlides = u.panels.slideRail.allowReorder), u.panels.slideRail.allowAddDelete !== void 0 && (t.allowAddSlide = u.panels.slideRail.allowAddDelete, t.allowDeleteSlide = u.panels.slideRail.allowAddDelete)), t;
  }, [s, u]), Z = q(() => {
    var x;
    const f = (((x = u == null ? void 0 : u.editing) == null ? void 0 : x.viewModes) ?? ["form", "source", "preview"]).filter(
      (M, We, qe) => (M === "form" || M === "source" || M === "preview") && qe.indexOf(M) === We
    ).filter((M) => M !== "source" || C.allowRawSourceEdit);
    return f.length > 0 ? f : ["form"];
  }, [C.allowRawSourceEdit, u]), c = q(
    () => D === !1 ? void 0 : {
      ...ie,
      namespace: b ?? (D == null ? void 0 : D.namespace) ?? ie.namespace,
      adapter: (D == null ? void 0 : D.adapter) ?? H.storage ?? ie.adapter,
      ...D
    },
    [b, H.storage, D]
  ), ae = q(
    () => a === !1 ? void 0 : { ...Xe, ...a },
    [a]
  ), v = (w == null ? void 0 : w.status) === "valid" || (w == null ? void 0 : w.status) === "degraded" ? w.deck : void 0, m = (v == null ? void 0 : v.slides.find((t) => t.id === P)) ?? (v == null ? void 0 : v.slides[0]), Re = q(() => {
    const t = /* @__PURE__ */ new Map();
    for (const i of ["eyebrow", "footer"])
      et(h, i) && t.set(i, oe(h, i));
    return t;
  }, [h]), _ = K(
    (t, i, f) => {
      const x = {
        reason: i,
        deckId: n,
        selectedSlideId: f ?? P,
        sourceHash: G(t.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      J || xe(t), S == null || S(t, x);
    },
    [J, n, S, P]
  );
  j(() => {
    let t = !1;
    return je(h, {
      runtime: H,
      mode: "editor"
    }).then((i) => {
      var f;
      t || (Me(i), (f = Q.current) == null || f.call(Q, i));
    }).catch((i) => {
      var f;
      (f = X.current) == null || f.call(X, {
        message: i instanceof Error ? i.message : "Deck compilation failed.",
        cause: i
      });
    }), () => {
      t = !0;
    };
  }, [d, H, h]), j(() => {
    if (!v || P)
      return;
    const t = v.slides[0];
    t && B(t.id);
  }, [v, P]), j(() => {
    c != null && c.recoverOnMount && c.adapter.loadDraft({ deckId: n, namespace: c.namespace }).then((t) => {
      !t || t.sourceHash === G(h.content) || (B(t.selectedSlideId), _(t.source, "crash-recovery", t.selectedSlideId));
    }).catch((t) => {
      k == null || k({
        message: t instanceof Error ? t.message : "Unable to recover deck draft.",
        cause: t
      });
    });
  }, [n, k, _, h.content, c]), j(() => {
    if (!c || !ae || !c.saveDraftOnChange)
      return;
    const t = window.setTimeout(() => {
      c.adapter.saveDraft({
        deckId: n,
        namespace: c.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: vt(),
        source: h,
        sourceHash: G(h.content),
        selectedSlideId: P,
        compilerStatus: (w == null ? void 0 : w.status) ?? "invalid"
      });
    }, ae.draftDebounceMs);
    return () => window.clearTimeout(t);
  }, [ae, w, n, P, h, c]);
  const U = K(() => {
    c && c.adapter.listVersions({ deckId: n, namespace: c.namespace }).then(Ce).catch((t) => {
      k == null || k({
        message: t instanceof Error ? t.message : "Unable to list deck versions.",
        cause: t
      });
    });
  }, [n, k, c]);
  j(() => {
    U();
  }, [U]);
  const z = K(
    async (t, i) => {
      var M;
      if (!c)
        return;
      const f = (w == null ? void 0 : w.diagnostics) ?? [], x = await c.adapter.createVersion({
        id: Ie(),
        deckId: n,
        namespace: c.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: i,
        reason: t,
        source: h,
        sourceHash: G(h.content),
        selectedSlideId: P,
        compilerStatus: (w == null ? void 0 : w.status) ?? "invalid",
        diagnosticsSummary: Ge(f),
        limits: {
          maxVersionsPerDeck: c.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: c.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: c.maxBytesPerDeck
        }
      });
      x.status !== "success" && (k == null || k({ message: ((M = x.diagnostics[0]) == null ? void 0 : M.message) ?? "Unable to save deck version." })), U();
    },
    [w, n, k, U, P, h, c]
  ), Te = K(() => {
    c && (c.adapter.saveCurrent({
      deckId: n,
      namespace: c.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: h,
      sourceHash: G(h.content),
      selectedSlideId: P
    }), c.createVersionOnManualSave && z("manual", "Manual save"), F == null || F({
      deckId: n,
      sourceHash: G(h.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [z, n, F, P, h, c]), Le = K(
    async (t) => {
      if (!c)
        return;
      c.createVersionBeforeDestructiveAction && await z("before-version-restore", "Before restore");
      const i = await c.adapter.loadVersion({
        deckId: n,
        namespace: c.namespace,
        versionId: t
      });
      i && (B(i.selectedSlideId), _(i.source, "version-restore", i.selectedSlideId), I == null || I({
        deckId: n,
        versionId: t,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [z, n, I, _, c]
  );
  function Fe(t) {
    ne.current = !0, B(t), N == null || N({ deckId: n, slideId: t });
  }
  function T(t, i, f = m == null ? void 0 : m.id) {
    _(t, i, f);
  }
  function Oe() {
    const t = nt(h, "title-body", m == null ? void 0 : m.id);
    t.slideId && (B(t.slideId), N == null || N({ deckId: n, slideId: t.slideId })), T(t.source, "slide-add", t.slideId);
  }
  function $e(t, i) {
    !C.allowReorderSlides || y || (t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("application/x-qastia-slide-id", i), t.dataTransfer.setData("text/plain", i), E({ draggedSlideId: i }));
  }
  function He(t, i) {
    const f = p == null ? void 0 : p.draggedSlideId;
    !C.allowReorderSlides || y || !f || f === i || (t.preventDefault(), t.dataTransfer.dropEffect = "move", E({
      draggedSlideId: f,
      targetSlideId: i,
      placement: pe(t)
    }));
  }
  function Be(t, i) {
    const f = (p == null ? void 0 : p.draggedSlideId) || t.dataTransfer.getData("application/x-qastia-slide-id") || t.dataTransfer.getData("text/plain");
    if (!C.allowReorderSlides || y || !f || f === i) {
      E(null);
      return;
    }
    t.preventDefault();
    const x = (p == null ? void 0 : p.targetSlideId) === i && p.placement ? p.placement : pe(t);
    E(null), B(f), T(st(h, f, i, x), "slide-reorder", f), N == null || N({ deckId: n, slideId: f });
  }
  const Ee = (w == null ? void 0 : w.diagnostics) ?? [], W = Z.includes(de) ? de : Z[0], fe = (v == null ? void 0 : v.theme.cssClassName) ?? "", he = v ? ze(v.theme) : void 0;
  return j(() => {
    if (!ne.current)
      return;
    ne.current = !1;
    const t = ue.current, i = t == null ? void 0 : t.querySelector(
      ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main"
    ), f = i != null && i.matches("textarea") ? i : i == null ? void 0 : i.querySelector(
      "input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]), button:not([disabled])"
    );
    if (f) {
      f.focus();
      return;
    }
    t == null || t.focus();
  }, [W, m == null ? void 0 : m.id]), /* @__PURE__ */ g(
    "div",
    {
      className: "deck-studio-root",
      "data-density": V.density,
      "data-slide-rail": V.showSlideRail ? "visible" : "hidden",
      "data-inspector": V.showInspector ? "visible" : "hidden",
      children: [
        V.showSlideRail ? /* @__PURE__ */ g("aside", { className: "deck-studio-rail", style: { width: V.slideRailWidthPx }, children: [
          /* @__PURE__ */ g("header", { children: [
            /* @__PURE__ */ o("strong", { children: (v == null ? void 0 : v.metadata.title) ?? "Deck" }),
            C.allowAddSlide ? /* @__PURE__ */ o("button", { type: "button", onClick: Oe, disabled: y, children: "Add" }) : null
          ] }),
          /* @__PURE__ */ o("nav", { "aria-label": "Slides", children: v == null ? void 0 : v.slides.map((t) => /* @__PURE__ */ g(
            "button",
            {
              type: "button",
              className: t.id === (m == null ? void 0 : m.id) ? "is-active" : void 0,
              draggable: C.allowReorderSlides && !y,
              "data-drop-position": (p == null ? void 0 : p.targetSlideId) === t.id ? p.placement : void 0,
              "aria-grabbed": (p == null ? void 0 : p.draggedSlideId) === t.id ? "true" : void 0,
              onClick: () => Fe(t.id),
              onDragStart: (i) => $e(i, t.id),
              onDragOver: (i) => He(i, t.id),
              onDragLeave: () => {
                (p == null ? void 0 : p.targetSlideId) === t.id && E({ draggedSlideId: p.draggedSlideId });
              },
              onDrop: (i) => Be(i, t.id),
              onDragEnd: () => E(null),
              children: [
                /* @__PURE__ */ o("span", { children: t.index + 1 }),
                /* @__PURE__ */ o("span", { children: bt(t) }),
                /* @__PURE__ */ o("small", { children: t.layout.name })
              ]
            },
            t.id
          )) })
        ] }) : null,
        /* @__PURE__ */ g("main", { className: "deck-studio-main", ref: ue, tabIndex: -1, children: [
          /* @__PURE__ */ g("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ o("div", { className: "deck-studio-slide-heading", children: C.allowLayoutChange && m && W !== "source" ? /* @__PURE__ */ o("label", { className: "deck-layout-select", children: /* @__PURE__ */ o(
              "select",
              {
                "aria-label": "Layout de la slide",
                value: m.layout.name,
                onChange: (t) => {
                  c != null && c.createVersionBeforeDestructiveAction && z("before-layout-change", "Before layout change"), T(
                    tt(h, m.id, t.currentTarget.value, H.layouts),
                    "layout-change"
                  );
                },
                disabled: y,
                children: Array.from(H.layouts.values()).map((t) => /* @__PURE__ */ o("option", { value: t.name, children: t.displayName }, t.name))
              }
            ) }) : null }),
            /* @__PURE__ */ g("div", { className: "deck-studio-actions", children: [
              V.showSourceModeToggle && Z.length > 1 ? /* @__PURE__ */ g("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ o("span", { children: "Editor view" }),
                /* @__PURE__ */ o(
                  "select",
                  {
                    value: W,
                    onChange: (t) => Ae(t.currentTarget.value),
                    children: Z.map((t) => /* @__PURE__ */ o("option", { value: t, children: pt(t) }, t))
                  }
                )
              ] }) : null,
              /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  onClick: () => ce(!0),
                  disabled: y,
                  children: "Global"
                }
              ),
              C.allowDuplicateSlide && m ? /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  onClick: () => T(at(h, m.id), "slide-duplicate"),
                  disabled: y,
                  children: "Duplicate"
                }
              ) : null,
              C.allowDeleteSlide && m ? /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  onClick: () => T(it(h, m.id), "slide-delete"),
                  disabled: y || ((v == null ? void 0 : v.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              c ? /* @__PURE__ */ o("button", { type: "button", onClick: Te, disabled: y, children: "Save" }) : null
            ] })
          ] }),
          W === "source" ? /* @__PURE__ */ o(
            "textarea",
            {
              className: "deck-source-editor",
              value: h.content,
              onChange: (t) => T({ ...h, content: t.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: y
            }
          ) : W === "preview" && m ? /* @__PURE__ */ o(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${fe}`,
              "aria-label": "Slide preview",
              tabIndex: -1,
              style: he,
              children: /* @__PURE__ */ o(ge, { slide: m, target: "screen" })
            }
          ) : m ? /* @__PURE__ */ o("div", { className: "deck-studio-editor", children: /* @__PURE__ */ o(
            ut,
            {
              source: h,
              slideId: m.id,
              fields: m.layout.definition.editor.fieldGroups.flatMap((t) => t.fields),
              inheritedMarkdownSlots: Re,
              readOnly: !!y,
              onUpdate: T
            }
          ) }) : (w == null ? void 0 : w.status) === "invalid" ? /* @__PURE__ */ o(Ke, { fallback: w.fallback }) : null,
          V.showActiveSlidePreview && W !== "preview" && m ? /* @__PURE__ */ o(
            "section",
            {
              className: `deck-studio-preview ${fe}`,
              "aria-label": "Active slide preview",
              style: he,
              children: /* @__PURE__ */ o(ge, { slide: m, target: "screen" })
            }
          ) : null
        ] }),
        V.showInspector ? /* @__PURE__ */ g("aside", { className: "deck-studio-inspector", style: { width: V.inspectorWidthPx }, children: [
          V.showDiagnosticsPanel ? /* @__PURE__ */ g("section", { children: [
            /* @__PURE__ */ o("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ o(Se, { diagnostics: Ee })
          ] }) : null,
          V.showVersionHistory && c ? /* @__PURE__ */ g("section", { children: [
            /* @__PURE__ */ o("h3", { children: "Versions" }),
            /* @__PURE__ */ o("ul", { className: "deck-version-list", children: Ve.map((t) => /* @__PURE__ */ g("li", { children: [
              /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  onClick: () => void Le(t.id),
                  disabled: !C.allowVersionRestore || y,
                  children: t.label ?? t.reason
                }
              ),
              /* @__PURE__ */ o("small", { children: new Date(t.createdAtIso).toLocaleString() })
            ] }, t.id)) })
          ] }) : null
        ] }) : null,
        Pe ? /* @__PURE__ */ o(
          wt,
          {
            source: h,
            readOnly: !!y,
            onUpdate: T,
            onClose: () => ce(!1)
          }
        ) : null
      ]
    }
  );
}
function vt() {
  const e = "deck-runtime-session-id", a = window.sessionStorage.getItem(e);
  if (a)
    return a;
  const n = Ie();
  return window.sessionStorage.setItem(e, n), n;
}
function Ie() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
function pt(e) {
  return e === "source" ? "YAML" : e === "preview" ? "Preview" : "Form";
}
function bt(e) {
  const a = e.slots.get("title"), n = (a == null ? void 0 : a.content.kind) === "markdown" ? a.content.markdown : void 0;
  return (n == null ? void 0 : n.split(/\r?\n/).map((l) => l.replace(/^#{1,6}\s+/, "").trim()).find((l) => l.length > 0)) ?? `Slide ${e.index + 1}`;
}
function pe(e) {
  const a = e.currentTarget.getBoundingClientRect();
  return a.height <= 0 || e.clientY > a.top + a.height / 2 ? "after" : "before";
}
export {
  Mt as D,
  Ke as a
};
