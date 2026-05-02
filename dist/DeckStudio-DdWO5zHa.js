import { jsxs as w, jsx as l } from "react/jsx-runtime";
import { useState as L, useRef as ne, useMemo as j, useCallback as J, useEffect as G } from "react";
import { h as Y, c as Xe, s as Ze } from "./hash-BGAdcMpD.js";
import { L as Ue, d as et } from "./defaultDeckRuntime-BlLpFtOg.js";
import { d as tt } from "./themeStyle-CyBLqMAf.js";
import { S as ke } from "./SlideRenderer-iimFvRrx.js";
import Ne from "yaml";
function nt({ fallback: t }) {
  return /* @__PURE__ */ w("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ l("header", { children: /* @__PURE__ */ l("h2", { children: t.title }) }),
    /* @__PURE__ */ l(Ie, { diagnostics: t.diagnostics }),
    /* @__PURE__ */ l("pre", { children: t.source.content })
  ] });
}
function Ie({
  diagnostics: t
}) {
  return t.length === 0 ? /* @__PURE__ */ l("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ l("ul", { className: "deck-diagnostics-list", children: t.map((a, n) => /* @__PURE__ */ w("li", { "data-severity": a.severity, children: [
    /* @__PURE__ */ l("strong", { children: a.code }),
    /* @__PURE__ */ l("span", { children: a.message }),
    a.hint ? /* @__PURE__ */ l("small", { children: a.hint }) : null
  ] }, `${a.code}-${n}`)) });
}
const at = {
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
}, it = {
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
}, oe = {
  adapter: new Ue(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, st = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function F(t) {
  try {
    const a = Ne.parse(t.content);
    return I(a) ? a : null;
  } catch {
    return null;
  }
}
function $(t, a) {
  return {
    ...t,
    content: Ne.stringify(a, { lineWidth: 0 })
  };
}
function O(t) {
  return Array.isArray(t.slides) || (t.slides = []), t.slides.filter(I);
}
function re(t, a, n, s) {
  return ae(t, a, (o) => {
    const r = Me(o);
    r[n] = { markdown: s };
  });
}
function lt(t, a, n) {
  return ae(t, a, (s) => {
    I(s.slots) && (delete s.slots[n], Object.keys(s.slots).length === 0 && delete s.slots);
  });
}
function ot(t, a, n) {
  return ue(t, a, n) !== void 0;
}
function ce(t, a) {
  const n = xe(t, a);
  return I(n) && typeof n.markdown == "string" ? n.markdown : "";
}
function rt(t, a) {
  return xe(t, a) !== void 0;
}
function Se(t, a, n) {
  const s = F(t);
  if (!s)
    return t;
  const o = vt(s);
  return o[a] = { markdown: n }, $(t, s);
}
function dt(t, a) {
  const n = F(t);
  return n ? (I(n.metadata) || (n.metadata = {}), n.metadata.title = a, $(t, n)) : t;
}
function de(t, a, n, s) {
  return ae(t, a, (o) => {
    const r = Me(o);
    r[n] = {
      image: bt({
        assetId: s.assetId,
        src: s.src,
        alt: s.alt
      })
    };
  });
}
function ct(t, a, n, s) {
  return ae(t, a, (o) => {
    s && o.layout && o.layout !== n && (o.slots = pt(o, n, s)), o.layout = n;
  });
}
function ut(t, a = "title-body", n) {
  const s = F(t);
  if (!s)
    return { source: t };
  const o = O(s), r = Ae(o, "slide"), d = {
    id: r,
    layout: a,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }, b = n ? o.findIndex((k) => k.id === n) : -1;
  return o.splice(b >= 0 ? b + 1 : o.length, 0, d), s.slides = o, { source: $(t, s), slideId: r };
}
function ft(t, a) {
  const n = F(t);
  if (!n)
    return t;
  const s = O(n), o = s.findIndex((d) => d.id === a);
  if (o < 0)
    return t;
  const r = structuredClone(s[o]);
  return r.id = Ae(s, `${a}-copy`), s.splice(o + 1, 0, r), n.slides = s, $(t, n);
}
function ht(t, a) {
  const n = F(t);
  if (!n)
    return t;
  const s = O(n).filter((o) => o.id !== a);
  return n.slides = s.length > 0 ? s : O(n), $(t, n);
}
function mt(t, a, n, s) {
  if (a === n)
    return t;
  const o = F(t);
  if (!o)
    return t;
  const r = O(o), d = r.findIndex((N) => N.id === a), b = r.findIndex((N) => N.id === n);
  if (d < 0 || b < 0)
    return t;
  const [k] = r.splice(d, 1), C = r.findIndex((N) => N.id === n), S = s === "after" ? C + 1 : C;
  return r.splice(S, 0, k), o.slides = r, $(t, o);
}
function gt(t, a, n) {
  const s = ue(t, a, n);
  return I(s) && typeof s.markdown == "string" ? s.markdown : "";
}
function wt(t, a, n) {
  const s = ue(t, a, n), o = I(s) && I(s.image) ? s.image : {};
  return {
    assetId: typeof o.assetId == "string" ? o.assetId : "",
    src: typeof o.src == "string" ? o.src : "",
    alt: typeof o.alt == "string" ? o.alt : ""
  };
}
function ae(t, a, n) {
  const s = F(t);
  if (!s)
    return t;
  const o = O(s), r = o.find((d) => d.id === a);
  return r ? (n(r), s.slides = o, $(t, s)) : t;
}
function ue(t, a, n) {
  var r;
  const s = F(t);
  if (!s)
    return;
  const o = O(s).find((d) => d.id === a);
  return (r = o == null ? void 0 : o.slots) == null ? void 0 : r[n];
}
function xe(t, a) {
  var s;
  const n = F(t);
  if (n)
    return I((s = n.defaults) == null ? void 0 : s.slots) ? n.defaults.slots[a] : void 0;
}
function Me(t) {
  return I(t.slots) || (t.slots = {}), t.slots;
}
function vt(t) {
  return I(t.defaults) || (t.defaults = {}), I(t.defaults.slots) || (t.defaults.slots = {}), t.defaults.slots;
}
function pt(t, a, n) {
  var d, b;
  const s = I(t.slots) ? t.slots : {}, o = t.layout ? (b = (d = n.get(a)) == null ? void 0 : d.migrateFrom) == null ? void 0 : b[t.layout] : void 0;
  if (!o)
    return s;
  const r = {};
  for (const k of o.operations)
    k.kind === "move-slot" && k.from in s && (r[k.to] = s[k.from]);
  return r;
}
function Ae(t, a) {
  const n = new Set(t.map((r) => r.id).filter((r) => !!r));
  let s = ye(a), o = 2;
  for (; n.has(s); )
    s = `${ye(a)}-${o}`, o += 1;
  return s;
}
function ye(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function bt(t) {
  return Object.fromEntries(
    Object.entries(t).filter((a) => !!a[1])
  );
}
function I(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function kt({
  fields: t,
  inheritedMarkdownSlots: a,
  onUpdate: n,
  readOnly: s,
  slideId: o,
  source: r
}) {
  return /* @__PURE__ */ l("form", { className: "deck-slide-form", children: t.map((d) => /* @__PURE__ */ l(
    St,
    {
      source: r,
      slideId: o,
      field: d,
      inheritedMarkdownSlots: a,
      readOnly: s,
      onUpdate: n
    },
    `${d.kind}-${"slotName" in d ? d.slotName : d.label}`
  )) });
}
function St({
  source: t,
  slideId: a,
  field: n,
  inheritedMarkdownSlots: s,
  readOnly: o,
  onUpdate: r
}) {
  if (n.kind === "markdown") {
    const d = n.blockKind === "heading" || n.slotName === "title", b = yt(n.slotName) ? s == null ? void 0 : s.get(n.slotName) : void 0, k = b !== void 0, C = k && ot(t, a, n.slotName), S = k && !C ? b : gt(t, a, n.slotName), N = d || Dt(n), E = N ? Nt(S, d) : S, x = o || k && !C, y = N ? /* @__PURE__ */ l(
      "input",
      {
        "aria-label": n.label,
        className: "deck-form-input",
        placeholder: " ",
        value: E,
        onChange: (D) => r(
          re(t, a, n.slotName, D.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: x
      }
    ) : /* @__PURE__ */ l(
      "textarea",
      {
        "aria-label": n.label,
        className: "deck-form-textarea",
        placeholder: " ",
        rows: n.minRows ?? 4,
        value: E,
        onChange: (D) => r(
          re(t, a, n.slotName, D.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: x
      }
    );
    return /* @__PURE__ */ w(
      "div",
      {
        className: "deck-form-field",
        "data-inherited": k && !C ? "true" : void 0,
        children: [
          /* @__PURE__ */ l("span", { children: n.label }),
          /* @__PURE__ */ w("div", { className: "deck-form-field__control", children: [
            y,
            k ? /* @__PURE__ */ l("label", { className: "deck-inherited-slot-toggle", title: "Override global", children: /* @__PURE__ */ l(
              "input",
              {
                "aria-label": `Override ${n.label} global`,
                title: `Override ${n.label} global`,
                type: "checkbox",
                checked: C,
                onChange: (D) => r(
                  D.currentTarget.checked ? re(t, a, n.slotName, b) : lt(t, a, n.slotName),
                  "slide-field-edit"
                ),
                disabled: o
              }
            ) }) : null
          ] })
        ]
      }
    );
  }
  if (n.kind === "image") {
    const d = wt(t, a, n.slotName);
    return /* @__PURE__ */ w("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ l("legend", { children: n.label }),
      /* @__PURE__ */ w("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ l("span", { children: "Asset id" }),
        /* @__PURE__ */ l(
          "input",
          {
            placeholder: " ",
            value: d.assetId,
            onChange: (b) => r(
              de(t, a, n.slotName, {
                ...d,
                assetId: b.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: o
          }
        )
      ] }),
      /* @__PURE__ */ w("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ l("span", { children: "Source" }),
        /* @__PURE__ */ l(
          "input",
          {
            placeholder: " ",
            value: d.src,
            onChange: (b) => r(
              de(t, a, n.slotName, {
                ...d,
                src: b.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: o
          }
        )
      ] }),
      /* @__PURE__ */ w("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ l("span", { children: "Alt" }),
        /* @__PURE__ */ l(
          "input",
          {
            placeholder: " ",
            value: d.alt,
            onChange: (b) => r(
              de(t, a, n.slotName, {
                ...d,
                alt: b.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: o
          }
        )
      ] })
    ] });
  }
  return null;
}
function yt(t) {
  return t === "eyebrow" || t === "footer";
}
function Dt(t) {
  return t.kind !== "markdown" ? !1 : t.minRows === 1 || t.slotName === "eyebrow" || t.slotName === "subtitle" || t.slotName === "footer";
}
function Nt(t, a) {
  return (a ? t.replace(/^(\s*)#{1,6}\s+/u, "$1") : t).replace(/\s*\n\s*/gu, " ").trim();
}
function It({
  onClose: t,
  onUpdate: a,
  readOnly: n,
  source: s
}) {
  const o = ce(s, "eyebrow"), r = ce(s, "footer");
  return /* @__PURE__ */ l("div", { className: "deck-global-defaults-backdrop", role: "presentation", onMouseDown: t, children: /* @__PURE__ */ w(
    "section",
    {
      "aria-labelledby": "deck-global-defaults-title",
      className: "deck-global-defaults-dialog",
      role: "dialog",
      "aria-modal": "true",
      onMouseDown: (d) => d.stopPropagation(),
      children: [
        /* @__PURE__ */ w("header", { children: [
          /* @__PURE__ */ w("div", { children: [
            /* @__PURE__ */ l("p", { children: "Defaults" }),
            /* @__PURE__ */ l("h3", { id: "deck-global-defaults-title", children: "Valeurs globales" })
          ] }),
          /* @__PURE__ */ l("button", { type: "button", onClick: t, children: "Fermer" })
        ] }),
        /* @__PURE__ */ w("div", { className: "deck-global-defaults-body", children: [
          /* @__PURE__ */ w("label", { className: "deck-form-field", children: [
            /* @__PURE__ */ l("span", { children: "Eyebrow global" }),
            /* @__PURE__ */ l(
              "input",
              {
                className: "deck-form-input",
                placeholder: " ",
                value: o,
                onChange: (d) => a(
                  Se(s, "eyebrow", d.currentTarget.value),
                  "defaults-edit"
                ),
                readOnly: n
              }
            )
          ] }),
          /* @__PURE__ */ w("label", { className: "deck-form-field", children: [
            /* @__PURE__ */ l("span", { children: "Footer global" }),
            /* @__PURE__ */ l(
              "input",
              {
                className: "deck-form-input",
                placeholder: " ",
                value: r,
                onChange: (d) => a(
                  Se(s, "footer", d.currentTarget.value),
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
function Et(t) {
  var be;
  const {
    autosave: a,
    deckId: n,
    features: s,
    initialSelectedSlideId: o,
    layout: r,
    locale: d = "fr-FR",
    namespace: b,
    onChange: k,
    onCompile: C,
    onError: S,
    onRestoreVersion: N,
    onSave: E,
    onSelectedSlideChange: x,
    readOnly: y,
    storage: D
  } = t, u = t.options, B = t.runtime ?? et, Q = t.mode === "controlled", [Pe, Ve] = L(
    Q ? t.value : t.initialValue
  ), m = Q ? t.value : Pe, [g, Ce] = L(null), [T, H] = L(
    o
  ), [fe, Re] = L(
    ((be = u == null ? void 0 : u.editing) == null ? void 0 : be.defaultMode) ?? "form"
  ), [Le, he] = L(!1), [Fe, ie] = L(!1), [me, X] = L(""), [p, W] = L(null), [Ee, Oe] = L([]), ge = ne(null), Z = ne(C), U = ne(S), se = ne(!1);
  Z.current = C, U.current = S;
  const P = j(() => {
    var f;
    const e = { ...at, ...r }, i = u == null ? void 0 : u.panels;
    return (i == null ? void 0 : i.slideRail) === !1 ? e.showSlideRail = !1 : i != null && i.slideRail && (e.showSlideRail = i.slideRail.visibleDefault ?? e.showSlideRail, e.slideRailWidthPx = i.slideRail.widthPx ?? e.slideRailWidthPx), (i == null ? void 0 : i.inspector) === !1 ? e.showInspector = !1 : i != null && i.inspector && (e.showInspector = i.inspector.visibleDefault ?? e.showInspector, e.inspectorWidthPx = i.inspector.widthPx ?? e.inspectorWidthPx), (i == null ? void 0 : i.diagnostics) === !1 ? e.showDiagnosticsPanel = !1 : i != null && i.diagnostics && (e.showDiagnosticsPanel = i.diagnostics.visibleDefault ?? e.showDiagnosticsPanel), (i == null ? void 0 : i.activeSlidePreview) === !1 ? e.showActiveSlidePreview = !1 : i != null && i.activeSlidePreview && (e.showActiveSlidePreview = i.activeSlidePreview.visibleDefault ?? e.showActiveSlidePreview), (i == null ? void 0 : i.versionHistory) === !1 ? e.showVersionHistory = !1 : i != null && i.versionHistory && (e.showVersionHistory = i.versionHistory.visibleDefault ?? e.showVersionHistory), ((f = u == null ? void 0 : u.editing) == null ? void 0 : f.allowSourceMode) === !1 && (e.showSourceModeToggle = !1), e;
  }, [r, u]), V = j(() => {
    var i, f, M, A;
    const e = { ...it, ...s };
    return ((i = u == null ? void 0 : u.editing) == null ? void 0 : i.allowSourceMode) !== void 0 && (e.allowRawSourceEdit = u.editing.allowSourceMode), ((f = u == null ? void 0 : u.editing) == null ? void 0 : f.allowLayoutChange) !== void 0 && (e.allowLayoutChange = u.editing.allowLayoutChange), ((M = u == null ? void 0 : u.layoutSelector) == null ? void 0 : M.enabled) !== void 0 && (e.allowLayoutChange = u.layoutSelector.enabled), (A = u == null ? void 0 : u.panels) != null && A.slideRail && (u.panels.slideRail.allowReorder !== void 0 && (e.allowReorderSlides = u.panels.slideRail.allowReorder), u.panels.slideRail.allowAddDelete !== void 0 && (e.allowAddSlide = u.panels.slideRail.allowAddDelete, e.allowDeleteSlide = u.panels.slideRail.allowAddDelete)), e;
  }, [s, u]), ee = j(() => {
    var M;
    const f = (((M = u == null ? void 0 : u.editing) == null ? void 0 : M.viewModes) ?? ["form", "source", "preview"]).filter(
      (A, Je, Qe) => (A === "form" || A === "source" || A === "preview") && Qe.indexOf(A) === Je
    ).filter((A) => A !== "source" || V.allowRawSourceEdit);
    return f.length > 0 ? f : ["form"];
  }, [V.allowRawSourceEdit, u]), c = j(
    () => D === !1 ? void 0 : {
      ...oe,
      namespace: b ?? (D == null ? void 0 : D.namespace) ?? oe.namespace,
      adapter: (D == null ? void 0 : D.adapter) ?? B.storage ?? oe.adapter,
      ...D
    },
    [b, B.storage, D]
  ), le = j(
    () => a === !1 ? void 0 : { ...st, ...a },
    [a]
  ), v = (g == null ? void 0 : g.status) === "valid" || (g == null ? void 0 : g.status) === "degraded" ? g.deck : void 0, h = (v == null ? void 0 : v.slides.find((e) => e.id === T)) ?? (v == null ? void 0 : v.slides[0]), $e = j(() => {
    const e = /* @__PURE__ */ new Map();
    for (const i of ["eyebrow", "footer"])
      rt(m, i) && e.set(i, ce(m, i));
    return e;
  }, [m]), _ = J(
    (e, i, f) => {
      const M = {
        reason: i,
        deckId: n,
        selectedSlideId: f ?? T,
        sourceHash: Y(e.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      Q || Ve(e), k == null || k(e, M);
    },
    [Q, n, k, T]
  );
  G(() => {
    let e = !1;
    return Xe(m, {
      runtime: B,
      mode: "editor"
    }).then((i) => {
      var f;
      e || (Ce(i), (f = Z.current) == null || f.call(Z, i));
    }).catch((i) => {
      var f;
      (f = U.current) == null || f.call(U, {
        message: i instanceof Error ? i.message : "Deck compilation failed.",
        cause: i
      });
    }), () => {
      e = !0;
    };
  }, [d, B, m]), G(() => {
    if (!v || T)
      return;
    const e = v.slides[0];
    e && H(e.id);
  }, [v, T]), G(() => {
    c != null && c.recoverOnMount && c.adapter.loadDraft({ deckId: n, namespace: c.namespace }).then((e) => {
      !e || e.sourceHash === Y(m.content) || (H(e.selectedSlideId), _(e.source, "crash-recovery", e.selectedSlideId));
    }).catch((e) => {
      S == null || S({
        message: e instanceof Error ? e.message : "Unable to recover deck draft.",
        cause: e
      });
    });
  }, [n, S, _, m.content, c]), G(() => {
    if (!c || !le || !c.saveDraftOnChange)
      return;
    const e = window.setTimeout(() => {
      c.adapter.saveDraft({
        deckId: n,
        namespace: c.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: xt(),
        source: m,
        sourceHash: Y(m.content),
        selectedSlideId: T,
        compilerStatus: (g == null ? void 0 : g.status) ?? "invalid"
      });
    }, le.draftDebounceMs);
    return () => window.clearTimeout(e);
  }, [le, g, n, T, m, c]);
  const te = J(() => {
    c && c.adapter.listVersions({ deckId: n, namespace: c.namespace }).then(Oe).catch((e) => {
      S == null || S({
        message: e instanceof Error ? e.message : "Unable to list deck versions.",
        cause: e
      });
    });
  }, [n, S, c]);
  G(() => {
    te();
  }, [te]);
  const z = J(
    async (e, i) => {
      var A;
      if (!c)
        return;
      const f = (g == null ? void 0 : g.diagnostics) ?? [], M = await c.adapter.createVersion({
        id: Te(),
        deckId: n,
        namespace: c.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: i,
        reason: e,
        source: m,
        sourceHash: Y(m.content),
        selectedSlideId: T,
        compilerStatus: (g == null ? void 0 : g.status) ?? "invalid",
        diagnosticsSummary: Ze(f),
        limits: {
          maxVersionsPerDeck: c.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: c.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: c.maxBytesPerDeck
        }
      });
      M.status !== "success" && (S == null || S({ message: ((A = M.diagnostics[0]) == null ? void 0 : A.message) ?? "Unable to save deck version." })), te();
    },
    [g, n, S, te, T, m, c]
  ), Be = J(() => {
    c && (c.adapter.saveCurrent({
      deckId: n,
      namespace: c.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: m,
      sourceHash: Y(m.content),
      selectedSlideId: T
    }), c.createVersionOnManualSave && z("manual", "Manual save"), E == null || E({
      deckId: n,
      sourceHash: Y(m.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [z, n, E, T, m, c]), He = J(
    async (e) => {
      if (!c)
        return;
      c.createVersionBeforeDestructiveAction && await z("before-version-restore", "Before restore");
      const i = await c.adapter.loadVersion({
        deckId: n,
        namespace: c.namespace,
        versionId: e
      });
      i && (H(i.selectedSlideId), _(i.source, "version-restore", i.selectedSlideId), N == null || N({
        deckId: n,
        versionId: e,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [z, n, N, _, c]
  );
  function We(e) {
    se.current = !0, H(e), x == null || x({ deckId: n, slideId: e });
  }
  function R(e, i, f = h == null ? void 0 : h.id) {
    _(e, i, f);
  }
  function qe() {
    const e = ut(m, "title-body", h == null ? void 0 : h.id);
    e.slideId && (H(e.slideId), x == null || x({ deckId: n, slideId: e.slideId })), R(e.source, "slide-add", e.slideId);
  }
  function je(e, i) {
    !V.allowReorderSlides || y || (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("application/x-qastia-slide-id", i), e.dataTransfer.setData("text/plain", i), W({ draggedSlideId: i }));
  }
  function Ge(e, i) {
    const f = p == null ? void 0 : p.draggedSlideId;
    !V.allowReorderSlides || y || !f || f === i || (e.preventDefault(), e.dataTransfer.dropEffect = "move", W({
      draggedSlideId: f,
      targetSlideId: i,
      placement: De(e)
    }));
  }
  function Ye(e, i) {
    const f = (p == null ? void 0 : p.draggedSlideId) || e.dataTransfer.getData("application/x-qastia-slide-id") || e.dataTransfer.getData("text/plain");
    if (!V.allowReorderSlides || y || !f || f === i) {
      W(null);
      return;
    }
    e.preventDefault();
    const M = (p == null ? void 0 : p.targetSlideId) === i && p.placement ? p.placement : De(e);
    W(null), H(f), R(mt(m, f, i, M), "slide-reorder", f), x == null || x({ deckId: n, slideId: f });
  }
  const _e = (g == null ? void 0 : g.diagnostics) ?? [], q = ee.includes(fe) ? fe : ee[0], we = (v == null ? void 0 : v.theme.cssClassName) ?? "", ve = v ? tt(v.theme) : void 0, K = (v == null ? void 0 : v.metadata.title) ?? "Deck";
  function ze() {
    y || (X(K), ie(!0));
  }
  function pe() {
    const e = me.trim() || K;
    ie(!1), X(e), e !== K && R(dt(m, e), "metadata-edit", h == null ? void 0 : h.id);
  }
  function Ke() {
    ie(!1), X(K);
  }
  return G(() => {
    if (!se.current)
      return;
    se.current = !1;
    const e = ge.current, i = e == null ? void 0 : e.querySelector(
      ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main"
    ), f = i != null && i.matches("textarea") ? i : i == null ? void 0 : i.querySelector(
      "input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]), button:not([disabled])"
    );
    if (f) {
      f.focus();
      return;
    }
    e == null || e.focus();
  }, [q, h == null ? void 0 : h.id]), /* @__PURE__ */ w(
    "div",
    {
      className: "deck-studio-root",
      "data-density": P.density,
      "data-slide-rail": P.showSlideRail ? "visible" : "hidden",
      "data-inspector": P.showInspector ? "visible" : "hidden",
      children: [
        P.showSlideRail ? /* @__PURE__ */ w("aside", { className: "deck-studio-rail", style: { width: P.slideRailWidthPx }, children: [
          /* @__PURE__ */ l("header", { children: Fe ? /* @__PURE__ */ l(
            "input",
            {
              className: "deck-studio-title-input",
              "aria-label": "Titre du slideshow",
              value: me,
              autoFocus: !0,
              onFocus: (e) => e.currentTarget.select(),
              onChange: (e) => X(e.currentTarget.value),
              onBlur: pe,
              onKeyDown: (e) => {
                e.key === "Enter" && (e.preventDefault(), pe()), e.key === "Escape" && (e.preventDefault(), Ke());
              }
            }
          ) : /* @__PURE__ */ l(
            "strong",
            {
              className: "deck-studio-title-label",
              title: y ? void 0 : "Double-cliquer pour modifier",
              onDoubleClick: ze,
              children: K
            }
          ) }),
          /* @__PURE__ */ l("nav", { "aria-label": "Slides", children: v == null ? void 0 : v.slides.map((e) => /* @__PURE__ */ w(
            "button",
            {
              type: "button",
              className: e.id === (h == null ? void 0 : h.id) ? "is-active" : void 0,
              draggable: V.allowReorderSlides && !y,
              "data-drop-position": (p == null ? void 0 : p.targetSlideId) === e.id ? p.placement : void 0,
              "aria-grabbed": (p == null ? void 0 : p.draggedSlideId) === e.id ? "true" : void 0,
              onClick: () => We(e.id),
              onDragStart: (i) => je(i, e.id),
              onDragOver: (i) => Ge(i, e.id),
              onDragLeave: () => {
                (p == null ? void 0 : p.targetSlideId) === e.id && W({ draggedSlideId: p.draggedSlideId });
              },
              onDrop: (i) => Ye(i, e.id),
              onDragEnd: () => W(null),
              children: [
                /* @__PURE__ */ l("span", { children: e.index + 1 }),
                /* @__PURE__ */ l("span", { children: At(e) }),
                /* @__PURE__ */ l("small", { children: e.layout.name })
              ]
            },
            e.id
          )) })
        ] }) : null,
        /* @__PURE__ */ w("main", { className: "deck-studio-main", ref: ge, tabIndex: -1, children: [
          /* @__PURE__ */ w("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ l("div", { className: "deck-studio-slide-heading", children: V.allowLayoutChange && h && q !== "source" ? /* @__PURE__ */ l("label", { className: "deck-layout-select", children: /* @__PURE__ */ l(
              "select",
              {
                "aria-label": "Layout de la slide",
                value: h.layout.name,
                onChange: (e) => {
                  c != null && c.createVersionBeforeDestructiveAction && z("before-layout-change", "Before layout change"), R(
                    ct(m, h.id, e.currentTarget.value, B.layouts),
                    "layout-change"
                  );
                },
                disabled: y,
                children: Array.from(B.layouts.values()).map((e) => /* @__PURE__ */ l("option", { value: e.name, children: e.displayName }, e.name))
              }
            ) }) : null }),
            /* @__PURE__ */ w("div", { className: "deck-studio-actions", children: [
              P.showSourceModeToggle && ee.length > 1 ? /* @__PURE__ */ w("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ l("span", { children: "Editor view" }),
                /* @__PURE__ */ l(
                  "select",
                  {
                    value: q,
                    onChange: (e) => Re(e.currentTarget.value),
                    children: ee.map((e) => /* @__PURE__ */ l("option", { value: e, children: Mt(e) }, e))
                  }
                )
              ] }) : null,
              /* @__PURE__ */ l(
                "button",
                {
                  type: "button",
                  onClick: () => he(!0),
                  disabled: y,
                  children: "Global"
                }
              ),
              V.allowAddSlide ? /* @__PURE__ */ l("button", { type: "button", onClick: qe, disabled: y, children: "Add" }) : null,
              V.allowDuplicateSlide && h ? /* @__PURE__ */ l(
                "button",
                {
                  type: "button",
                  onClick: () => R(ft(m, h.id), "slide-duplicate"),
                  disabled: y,
                  children: "Duplicate"
                }
              ) : null,
              V.allowDeleteSlide && h ? /* @__PURE__ */ l(
                "button",
                {
                  type: "button",
                  onClick: () => R(ht(m, h.id), "slide-delete"),
                  disabled: y || ((v == null ? void 0 : v.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              c ? /* @__PURE__ */ l("button", { type: "button", onClick: Be, disabled: y, children: "Save" }) : null
            ] })
          ] }),
          q === "source" ? /* @__PURE__ */ l(
            "textarea",
            {
              className: "deck-source-editor",
              value: m.content,
              onChange: (e) => R({ ...m, content: e.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: y
            }
          ) : q === "preview" && h ? /* @__PURE__ */ l(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${we}`,
              "aria-label": "Slide preview",
              tabIndex: -1,
              style: ve,
              children: /* @__PURE__ */ l(ke, { slide: h, target: "screen" })
            }
          ) : h ? /* @__PURE__ */ l("div", { className: "deck-studio-editor", children: /* @__PURE__ */ l(
            kt,
            {
              source: m,
              slideId: h.id,
              fields: h.layout.definition.editor.fieldGroups.flatMap((e) => e.fields),
              inheritedMarkdownSlots: $e,
              readOnly: !!y,
              onUpdate: R
            }
          ) }) : (g == null ? void 0 : g.status) === "invalid" ? /* @__PURE__ */ l(nt, { fallback: g.fallback }) : null,
          P.showActiveSlidePreview && q !== "preview" && h ? /* @__PURE__ */ l(
            "section",
            {
              className: `deck-studio-preview ${we}`,
              "aria-label": "Active slide preview",
              style: ve,
              children: /* @__PURE__ */ l(ke, { slide: h, target: "screen" })
            }
          ) : null
        ] }),
        P.showInspector ? /* @__PURE__ */ w("aside", { className: "deck-studio-inspector", style: { width: P.inspectorWidthPx }, children: [
          P.showDiagnosticsPanel ? /* @__PURE__ */ w("section", { children: [
            /* @__PURE__ */ l("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ l(Ie, { diagnostics: _e })
          ] }) : null,
          P.showVersionHistory && c ? /* @__PURE__ */ w("section", { children: [
            /* @__PURE__ */ l("h3", { children: "Versions" }),
            /* @__PURE__ */ l("ul", { className: "deck-version-list", children: Ee.map((e) => /* @__PURE__ */ w("li", { children: [
              /* @__PURE__ */ l(
                "button",
                {
                  type: "button",
                  onClick: () => void He(e.id),
                  disabled: !V.allowVersionRestore || y,
                  children: e.label ?? e.reason
                }
              ),
              /* @__PURE__ */ l("small", { children: new Date(e.createdAtIso).toLocaleString() })
            ] }, e.id)) })
          ] }) : null
        ] }) : null,
        Le ? /* @__PURE__ */ l(
          It,
          {
            source: m,
            readOnly: !!y,
            onUpdate: R,
            onClose: () => he(!1)
          }
        ) : null
      ]
    }
  );
}
function xt() {
  const t = "deck-runtime-session-id", a = window.sessionStorage.getItem(t);
  if (a)
    return a;
  const n = Te();
  return window.sessionStorage.setItem(t, n), n;
}
function Te() {
  const t = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${t}`;
}
function Mt(t) {
  return t === "source" ? "YAML" : t === "preview" ? "Preview" : "Form";
}
function At(t) {
  const a = t.slots.get("title"), n = (a == null ? void 0 : a.content.kind) === "markdown" ? a.content.markdown : void 0;
  return (n == null ? void 0 : n.split(/\r?\n/).map((o) => o.replace(/^#{1,6}\s+/, "").trim()).find((o) => o.length > 0)) ?? `Slide ${t.index + 1}`;
}
function De(t) {
  const a = t.currentTarget.getBoundingClientRect();
  return a.height <= 0 || t.clientY > a.top + a.height / 2 ? "after" : "before";
}
export {
  Et as D,
  nt as a
};
