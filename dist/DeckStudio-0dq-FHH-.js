import { jsxs as f, jsx as i } from "react/jsx-runtime";
import { useState as F, useRef as ce, useMemo as j, useCallback as G, useEffect as _ } from "react";
import { h as H, c as Me, s as Re } from "./hash-BGAdcMpD.js";
import { L as Le, d as Te } from "./defaultDeckRuntime-BlLpFtOg.js";
import { d as Fe } from "./themeStyle-CyBLqMAf.js";
import { S as de } from "./SlideRenderer-iimFvRrx.js";
import he from "yaml";
function He({ fallback: e }) {
  return /* @__PURE__ */ f("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ i("header", { children: /* @__PURE__ */ i("h2", { children: e.title }) }),
    /* @__PURE__ */ i(me, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ i("pre", { children: e.source.content })
  ] });
}
function me({
  diagnostics: e
}) {
  return e.length === 0 ? /* @__PURE__ */ i("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ i("ul", { className: "deck-diagnostics-list", children: e.map((n, t) => /* @__PURE__ */ f("li", { "data-severity": n.severity, children: [
    /* @__PURE__ */ i("strong", { children: n.code }),
    /* @__PURE__ */ i("span", { children: n.message }),
    n.hint ? /* @__PURE__ */ i("small", { children: n.hint }) : null
  ] }, `${n.code}-${t}`)) });
}
const Oe = {
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
}, $e = {
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
}, ee = {
  adapter: new Le(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, Be = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function R(e) {
  try {
    const n = he.parse(e.content);
    return D(n) ? n : null;
  } catch {
    return null;
  }
}
function z(e, n) {
  return {
    ...e,
    content: he.stringify(n, { lineWidth: 0 })
  };
}
function O(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(D);
}
function te(e, n, t, s) {
  return X(e, n, (o) => {
    const c = we(o);
    c[t] = { markdown: s };
  });
}
function Ee(e, n, t) {
  return X(e, n, (s) => {
    D(s.slots) && (delete s.slots[t], Object.keys(s.slots).length === 0 && delete s.slots);
  });
}
function We(e, n, t) {
  return se(e, n, t) !== void 0;
}
function ne(e, n) {
  const t = ge(e, n);
  return D(t) && typeof t.markdown == "string" ? t.markdown : "";
}
function je(e, n) {
  return ge(e, n) !== void 0;
}
function ue(e, n, t) {
  const s = R(e);
  if (!s)
    return e;
  const o = Je(s);
  return o[n] = { markdown: t }, z(e, s);
}
function ae(e, n, t, s) {
  return X(e, n, (o) => {
    const c = we(o);
    c[t] = {
      image: Xe({
        assetId: s.assetId,
        src: s.src,
        alt: s.alt
      })
    };
  });
}
function Ge(e, n, t, s) {
  return X(e, n, (o) => {
    s && o.layout && o.layout !== t && (o.slots = Qe(o, t, s)), o.layout = t;
  });
}
function _e(e, n = "title-body") {
  const t = R(e);
  if (!t)
    return e;
  const s = O(t), o = ve(s, "slide");
  return s.push({
    id: o,
    layout: n,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }), t.slides = s, z(e, t);
}
function ze(e, n) {
  const t = R(e);
  if (!t)
    return e;
  const s = O(t), o = s.findIndex((d) => d.id === n);
  if (o < 0)
    return e;
  const c = structuredClone(s[o]);
  return c.id = ve(s, `${n}-copy`), s.splice(o + 1, 0, c), t.slides = s, z(e, t);
}
function Ye(e, n) {
  const t = R(e);
  if (!t)
    return e;
  const s = O(t).filter((o) => o.id !== n);
  return t.slides = s.length > 0 ? s : O(t), z(e, t);
}
function qe(e, n, t) {
  const s = se(e, n, t);
  return D(s) && typeof s.markdown == "string" ? s.markdown : "";
}
function Ke(e, n, t) {
  const s = se(e, n, t), o = D(s) && D(s.image) ? s.image : {};
  return {
    assetId: typeof o.assetId == "string" ? o.assetId : "",
    src: typeof o.src == "string" ? o.src : "",
    alt: typeof o.alt == "string" ? o.alt : ""
  };
}
function X(e, n, t) {
  const s = R(e);
  if (!s)
    return e;
  const o = O(s), c = o.find((d) => d.id === n);
  return c ? (t(c), s.slides = o, z(e, s)) : e;
}
function se(e, n, t) {
  var c;
  const s = R(e);
  if (!s)
    return;
  const o = O(s).find((d) => d.id === n);
  return (c = o == null ? void 0 : o.slots) == null ? void 0 : c[t];
}
function ge(e, n) {
  var s;
  const t = R(e);
  if (t)
    return D((s = t.defaults) == null ? void 0 : s.slots) ? t.defaults.slots[n] : void 0;
}
function we(e) {
  return D(e.slots) || (e.slots = {}), e.slots;
}
function Je(e) {
  return D(e.defaults) || (e.defaults = {}), D(e.defaults.slots) || (e.defaults.slots = {}), e.defaults.slots;
}
function Qe(e, n, t) {
  var d, S;
  const s = D(e.slots) ? e.slots : {}, o = e.layout ? (S = (d = t.get(n)) == null ? void 0 : d.migrateFrom) == null ? void 0 : S[e.layout] : void 0;
  if (!o)
    return s;
  const c = {};
  for (const p of o.operations)
    p.kind === "move-slot" && p.from in s && (c[p.to] = s[p.from]);
  return c;
}
function ve(e, n) {
  const t = new Set(e.map((c) => c.id).filter((c) => !!c));
  let s = fe(n), o = 2;
  for (; t.has(s); )
    s = `${fe(n)}-${o}`, o += 1;
  return s;
}
function fe(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function Xe(e) {
  return Object.fromEntries(
    Object.entries(e).filter((n) => !!n[1])
  );
}
function D(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Ze({
  fields: e,
  inheritedMarkdownSlots: n,
  onUpdate: t,
  readOnly: s,
  slideId: o,
  source: c
}) {
  return /* @__PURE__ */ i("form", { className: "deck-slide-form", children: e.map((d) => /* @__PURE__ */ i(
    Ue,
    {
      source: c,
      slideId: o,
      field: d,
      inheritedMarkdownSlots: n,
      readOnly: s,
      onUpdate: t
    },
    `${d.kind}-${"slotName" in d ? d.slotName : d.label}`
  )) });
}
function Ue({
  source: e,
  slideId: n,
  field: t,
  inheritedMarkdownSlots: s,
  readOnly: o,
  onUpdate: c
}) {
  if (t.kind === "markdown") {
    const d = t.blockKind === "heading" || t.slotName === "title", S = et(t.slotName) ? s == null ? void 0 : s.get(t.slotName) : void 0, p = S !== void 0, P = p && We(e, n, t.slotName), v = p && !P ? S : qe(e, n, t.slotName), V = d || tt(t), A = V ? at(v, d) : v, L = o || p && !P, y = V ? /* @__PURE__ */ i(
      "input",
      {
        "aria-label": t.label,
        className: "deck-form-input",
        placeholder: " ",
        value: A,
        onChange: (b) => c(
          te(e, n, t.slotName, b.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: L
      }
    ) : /* @__PURE__ */ i(
      "textarea",
      {
        "aria-label": t.label,
        className: "deck-form-textarea",
        placeholder: " ",
        rows: t.minRows ?? 4,
        value: A,
        onChange: (b) => c(
          te(e, n, t.slotName, b.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: L
      }
    );
    return /* @__PURE__ */ f(
      "div",
      {
        className: "deck-form-field",
        "data-inherited": p && !P ? "true" : void 0,
        children: [
          /* @__PURE__ */ i("span", { children: t.label }),
          /* @__PURE__ */ f("div", { className: "deck-form-field__control", children: [
            y,
            p ? /* @__PURE__ */ i("label", { className: "deck-inherited-slot-toggle", title: "Override global", children: /* @__PURE__ */ i(
              "input",
              {
                "aria-label": `Override ${t.label} global`,
                title: `Override ${t.label} global`,
                type: "checkbox",
                checked: P,
                onChange: (b) => c(
                  b.currentTarget.checked ? te(e, n, t.slotName, S) : Ee(e, n, t.slotName),
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
  if (t.kind === "image") {
    const d = Ke(e, n, t.slotName);
    return /* @__PURE__ */ f("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ i("legend", { children: t.label }),
      /* @__PURE__ */ f("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ i("span", { children: "Asset id" }),
        /* @__PURE__ */ i(
          "input",
          {
            placeholder: " ",
            value: d.assetId,
            onChange: (S) => c(
              ae(e, n, t.slotName, {
                ...d,
                assetId: S.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: o
          }
        )
      ] }),
      /* @__PURE__ */ f("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ i("span", { children: "Source" }),
        /* @__PURE__ */ i(
          "input",
          {
            placeholder: " ",
            value: d.src,
            onChange: (S) => c(
              ae(e, n, t.slotName, {
                ...d,
                src: S.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: o
          }
        )
      ] }),
      /* @__PURE__ */ f("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ i("span", { children: "Alt" }),
        /* @__PURE__ */ i(
          "input",
          {
            placeholder: " ",
            value: d.alt,
            onChange: (S) => c(
              ae(e, n, t.slotName, {
                ...d,
                alt: S.currentTarget.value
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
function et(e) {
  return e === "eyebrow" || e === "footer";
}
function tt(e) {
  return e.kind !== "markdown" ? !1 : e.minRows === 1 || e.slotName === "eyebrow" || e.slotName === "subtitle" || e.slotName === "footer";
}
function at(e, n) {
  return (n ? e.replace(/^(\s*)#{1,6}\s+/u, "$1") : e).replace(/\s*\n\s*/gu, " ").trim();
}
function nt({
  onClose: e,
  onUpdate: n,
  readOnly: t,
  source: s
}) {
  const o = ne(s, "eyebrow"), c = ne(s, "footer");
  return /* @__PURE__ */ i("div", { className: "deck-global-defaults-backdrop", role: "presentation", onMouseDown: e, children: /* @__PURE__ */ f(
    "section",
    {
      "aria-labelledby": "deck-global-defaults-title",
      className: "deck-global-defaults-dialog",
      role: "dialog",
      "aria-modal": "true",
      onMouseDown: (d) => d.stopPropagation(),
      children: [
        /* @__PURE__ */ f("header", { children: [
          /* @__PURE__ */ f("div", { children: [
            /* @__PURE__ */ i("p", { children: "Defaults" }),
            /* @__PURE__ */ i("h3", { id: "deck-global-defaults-title", children: "Valeurs globales" })
          ] }),
          /* @__PURE__ */ i("button", { type: "button", onClick: e, children: "Fermer" })
        ] }),
        /* @__PURE__ */ f("div", { className: "deck-global-defaults-body", children: [
          /* @__PURE__ */ f("label", { className: "deck-form-field", children: [
            /* @__PURE__ */ i("span", { children: "Eyebrow global" }),
            /* @__PURE__ */ i(
              "input",
              {
                className: "deck-form-input",
                placeholder: " ",
                value: o,
                onChange: (d) => n(
                  ue(s, "eyebrow", d.currentTarget.value),
                  "defaults-edit"
                ),
                readOnly: t
              }
            )
          ] }),
          /* @__PURE__ */ f("label", { className: "deck-form-field", children: [
            /* @__PURE__ */ i("span", { children: "Footer global" }),
            /* @__PURE__ */ i(
              "input",
              {
                className: "deck-form-input",
                placeholder: " ",
                value: c,
                onChange: (d) => n(
                  ue(s, "footer", d.currentTarget.value),
                  "defaults-edit"
                ),
                readOnly: t
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function ft(e) {
  var re;
  const {
    autosave: n,
    deckId: t,
    features: s,
    initialSelectedSlideId: o,
    layout: c,
    locale: d = "fr-FR",
    namespace: S,
    onChange: p,
    onCompile: P,
    onError: v,
    onRestoreVersion: V,
    onSave: A,
    onSelectedSlideChange: L,
    readOnly: y,
    storage: b
  } = e, u = e.options, T = e.runtime ?? Te, Y = e.mode === "controlled", [pe, be] = F(
    Y ? e.value : e.initialValue
  ), h = Y ? e.value : pe, [m, ke] = F(null), [N, q] = F(
    o
  ), [Z, ye] = F(
    ((re = u == null ? void 0 : u.editing) == null ? void 0 : re.defaultMode) === "source" ? "source" : "form"
  ), [De, ie] = F(!1), [Ne, Ie] = F([]), K = ce(P), J = ce(v);
  K.current = P, J.current = v;
  const I = j(() => {
    var k;
    const a = { ...Oe, ...c }, l = u == null ? void 0 : u.panels;
    return (l == null ? void 0 : l.slideRail) === !1 ? a.showSlideRail = !1 : l != null && l.slideRail && (a.showSlideRail = l.slideRail.visibleDefault ?? a.showSlideRail, a.slideRailWidthPx = l.slideRail.widthPx ?? a.slideRailWidthPx), (l == null ? void 0 : l.inspector) === !1 ? a.showInspector = !1 : l != null && l.inspector && (a.showInspector = l.inspector.visibleDefault ?? a.showInspector, a.inspectorWidthPx = l.inspector.widthPx ?? a.inspectorWidthPx), (l == null ? void 0 : l.diagnostics) === !1 ? a.showDiagnosticsPanel = !1 : l != null && l.diagnostics && (a.showDiagnosticsPanel = l.diagnostics.visibleDefault ?? a.showDiagnosticsPanel), (l == null ? void 0 : l.activeSlidePreview) === !1 ? a.showActiveSlidePreview = !1 : l != null && l.activeSlidePreview && (a.showActiveSlidePreview = l.activeSlidePreview.visibleDefault ?? a.showActiveSlidePreview), (l == null ? void 0 : l.versionHistory) === !1 ? a.showVersionHistory = !1 : l != null && l.versionHistory && (a.showVersionHistory = l.versionHistory.visibleDefault ?? a.showVersionHistory), ((k = u == null ? void 0 : u.editing) == null ? void 0 : k.allowSourceMode) === !1 && (a.showSourceModeToggle = !1), a;
  }, [c, u]), x = j(() => {
    var l, k, M, W;
    const a = { ...$e, ...s };
    return ((l = u == null ? void 0 : u.editing) == null ? void 0 : l.allowSourceMode) !== void 0 && (a.allowRawSourceEdit = u.editing.allowSourceMode), ((k = u == null ? void 0 : u.editing) == null ? void 0 : k.allowLayoutChange) !== void 0 && (a.allowLayoutChange = u.editing.allowLayoutChange), ((M = u == null ? void 0 : u.layoutSelector) == null ? void 0 : M.enabled) !== void 0 && (a.allowLayoutChange = u.layoutSelector.enabled), (W = u == null ? void 0 : u.panels) != null && W.slideRail && (u.panels.slideRail.allowReorder !== void 0 && (a.allowReorderSlides = u.panels.slideRail.allowReorder), u.panels.slideRail.allowAddDelete !== void 0 && (a.allowAddSlide = u.panels.slideRail.allowAddDelete, a.allowDeleteSlide = u.panels.slideRail.allowAddDelete)), a;
  }, [s, u]), r = j(
    () => b === !1 ? void 0 : {
      ...ee,
      namespace: S ?? (b == null ? void 0 : b.namespace) ?? ee.namespace,
      adapter: (b == null ? void 0 : b.adapter) ?? T.storage ?? ee.adapter,
      ...b
    },
    [S, T.storage, b]
  ), U = j(
    () => n === !1 ? void 0 : { ...Be, ...n },
    [n]
  ), w = (m == null ? void 0 : m.status) === "valid" || (m == null ? void 0 : m.status) === "degraded" ? m.deck : void 0, g = (w == null ? void 0 : w.slides.find((a) => a.id === N)) ?? (w == null ? void 0 : w.slides[0]), Pe = j(() => {
    const a = /* @__PURE__ */ new Map();
    for (const l of ["eyebrow", "footer"])
      je(h, l) && a.set(l, ne(h, l));
    return a;
  }, [h]), $ = G(
    (a, l, k) => {
      const M = {
        reason: l,
        deckId: t,
        selectedSlideId: k ?? N,
        sourceHash: H(a.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      Y || be(a), p == null || p(a, M);
    },
    [Y, t, p, N]
  );
  _(() => {
    let a = !1;
    return Me(h, {
      runtime: T,
      mode: "editor"
    }).then((l) => {
      var k;
      a || (ke(l), (k = K.current) == null || k.call(K, l));
    }).catch((l) => {
      var k;
      (k = J.current) == null || k.call(J, {
        message: l instanceof Error ? l.message : "Deck compilation failed.",
        cause: l
      });
    }), () => {
      a = !0;
    };
  }, [d, T, h]), _(() => {
    if (!w || N)
      return;
    const a = w.slides[0];
    a && q(a.id);
  }, [w, N]), _(() => {
    r != null && r.recoverOnMount && r.adapter.loadDraft({ deckId: t, namespace: r.namespace }).then((a) => {
      !a || a.sourceHash === H(h.content) || (q(a.selectedSlideId), $(a.source, "crash-recovery", a.selectedSlideId));
    }).catch((a) => {
      v == null || v({
        message: a instanceof Error ? a.message : "Unable to recover deck draft.",
        cause: a
      });
    });
  }, [t, v, $, h.content, r]), _(() => {
    if (!r || !U || !r.saveDraftOnChange)
      return;
    const a = window.setTimeout(() => {
      r.adapter.saveDraft({
        deckId: t,
        namespace: r.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: st(),
        source: h,
        sourceHash: H(h.content),
        selectedSlideId: N,
        compilerStatus: (m == null ? void 0 : m.status) ?? "invalid"
      });
    }, U.draftDebounceMs);
    return () => window.clearTimeout(a);
  }, [U, m, t, N, h, r]);
  const Q = G(() => {
    r && r.adapter.listVersions({ deckId: t, namespace: r.namespace }).then(Ie).catch((a) => {
      v == null || v({
        message: a instanceof Error ? a.message : "Unable to list deck versions.",
        cause: a
      });
    });
  }, [t, v, r]);
  _(() => {
    Q();
  }, [Q]);
  const B = G(
    async (a, l) => {
      var W;
      if (!r)
        return;
      const k = (m == null ? void 0 : m.diagnostics) ?? [], M = await r.adapter.createVersion({
        id: Se(),
        deckId: t,
        namespace: r.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: l,
        reason: a,
        source: h,
        sourceHash: H(h.content),
        selectedSlideId: N,
        compilerStatus: (m == null ? void 0 : m.status) ?? "invalid",
        diagnosticsSummary: Re(k),
        limits: {
          maxVersionsPerDeck: r.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: r.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: r.maxBytesPerDeck
        }
      });
      M.status !== "success" && (v == null || v({ message: ((W = M.diagnostics[0]) == null ? void 0 : W.message) ?? "Unable to save deck version." })), Q();
    },
    [m, t, v, Q, N, h, r]
  ), Ve = G(() => {
    r && (r.adapter.saveCurrent({
      deckId: t,
      namespace: r.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: h,
      sourceHash: H(h.content),
      selectedSlideId: N
    }), r.createVersionOnManualSave && B("manual", "Manual save"), A == null || A({
      deckId: t,
      sourceHash: H(h.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [B, t, A, N, h, r]), Ae = G(
    async (a) => {
      if (!r)
        return;
      r.createVersionBeforeDestructiveAction && await B("before-version-restore", "Before restore");
      const l = await r.adapter.loadVersion({
        deckId: t,
        namespace: r.namespace,
        versionId: a
      });
      l && (q(l.selectedSlideId), $(l.source, "version-restore", l.selectedSlideId), V == null || V({
        deckId: t,
        versionId: a,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [B, t, V, $, r]
  );
  function xe(a) {
    q(a), L == null || L({ deckId: t, slideId: a });
  }
  function C(a, l) {
    $(a, l, g == null ? void 0 : g.id);
  }
  const Ce = (m == null ? void 0 : m.diagnostics) ?? [], E = Z === "source" && !x.allowRawSourceEdit ? "form" : Z, le = (w == null ? void 0 : w.theme.cssClassName) ?? "", oe = w ? Fe(w.theme) : void 0;
  return /* @__PURE__ */ f(
    "div",
    {
      className: "deck-studio-root",
      "data-density": I.density,
      "data-slide-rail": I.showSlideRail ? "visible" : "hidden",
      "data-inspector": I.showInspector ? "visible" : "hidden",
      children: [
        I.showSlideRail ? /* @__PURE__ */ f("aside", { className: "deck-studio-rail", style: { width: I.slideRailWidthPx }, children: [
          /* @__PURE__ */ f("header", { children: [
            /* @__PURE__ */ i("strong", { children: (w == null ? void 0 : w.metadata.title) ?? "Deck" }),
            x.allowAddSlide ? /* @__PURE__ */ i("button", { type: "button", onClick: () => C(_e(h), "slide-add"), disabled: y, children: "Add" }) : null
          ] }),
          /* @__PURE__ */ i("nav", { "aria-label": "Slides", children: w == null ? void 0 : w.slides.map((a) => /* @__PURE__ */ f(
            "button",
            {
              type: "button",
              className: a.id === (g == null ? void 0 : g.id) ? "is-active" : void 0,
              onClick: () => xe(a.id),
              children: [
                /* @__PURE__ */ i("span", { children: a.index + 1 }),
                /* @__PURE__ */ i("span", { children: a.id }),
                /* @__PURE__ */ i("small", { children: a.layout.name })
              ]
            },
            a.id
          )) })
        ] }) : null,
        /* @__PURE__ */ f("main", { className: "deck-studio-main", children: [
          /* @__PURE__ */ f("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ f("div", { className: "deck-studio-slide-heading", children: [
              /* @__PURE__ */ i("strong", { children: E === "source" ? "Source" : (g == null ? void 0 : g.id) ?? "Source" }),
              E !== "source" && g ? /* @__PURE__ */ i("small", { children: g.layout.definition.displayName }) : null
            ] }),
            /* @__PURE__ */ f("div", { className: "deck-studio-actions", children: [
              I.showSourceModeToggle ? /* @__PURE__ */ f("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ i("span", { children: "Editor view" }),
                /* @__PURE__ */ f(
                  "select",
                  {
                    value: Z,
                    onChange: (a) => ye(a.currentTarget.value),
                    children: [
                      /* @__PURE__ */ i("option", { value: "form", children: "Form" }),
                      x.allowRawSourceEdit ? /* @__PURE__ */ i("option", { value: "source", children: "YAML" }) : null,
                      /* @__PURE__ */ i("option", { value: "preview", children: "Preview" })
                    ]
                  }
                )
              ] }) : null,
              /* @__PURE__ */ i(
                "button",
                {
                  type: "button",
                  onClick: () => ie(!0),
                  disabled: y,
                  children: "Global"
                }
              ),
              x.allowDuplicateSlide && g ? /* @__PURE__ */ i(
                "button",
                {
                  type: "button",
                  onClick: () => C(ze(h, g.id), "slide-duplicate"),
                  disabled: y,
                  children: "Duplicate"
                }
              ) : null,
              x.allowDeleteSlide && g ? /* @__PURE__ */ i(
                "button",
                {
                  type: "button",
                  onClick: () => C(Ye(h, g.id), "slide-delete"),
                  disabled: y || ((w == null ? void 0 : w.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              r ? /* @__PURE__ */ i("button", { type: "button", onClick: Ve, disabled: y, children: "Save" }) : null
            ] })
          ] }),
          E === "source" ? /* @__PURE__ */ i(
            "textarea",
            {
              className: "deck-source-editor",
              value: h.content,
              onChange: (a) => C({ ...h, content: a.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: y
            }
          ) : E === "preview" && g ? /* @__PURE__ */ i(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${le}`,
              "aria-label": "Slide preview",
              style: oe,
              children: /* @__PURE__ */ i(de, { slide: g, target: "screen" })
            }
          ) : g ? /* @__PURE__ */ f("div", { className: "deck-studio-editor", children: [
            /* @__PURE__ */ i(
              Ze,
              {
                source: h,
                slideId: g.id,
                fields: g.layout.definition.editor.fieldGroups.flatMap((a) => a.fields),
                inheritedMarkdownSlots: Pe,
                readOnly: !!y,
                onUpdate: C
              }
            ),
            x.allowLayoutChange ? /* @__PURE__ */ f("label", { className: "deck-form-field", children: [
              /* @__PURE__ */ i("span", { children: "Layout" }),
              /* @__PURE__ */ i(
                "select",
                {
                  value: g.layout.name,
                  onChange: (a) => {
                    r != null && r.createVersionBeforeDestructiveAction && B("before-layout-change", "Before layout change"), C(
                      Ge(h, g.id, a.currentTarget.value, T.layouts),
                      "layout-change"
                    );
                  },
                  disabled: y,
                  children: Array.from(T.layouts.values()).map((a) => /* @__PURE__ */ i("option", { value: a.name, children: a.displayName }, a.name))
                }
              )
            ] }) : null
          ] }) : (m == null ? void 0 : m.status) === "invalid" ? /* @__PURE__ */ i(He, { fallback: m.fallback }) : null,
          I.showActiveSlidePreview && E !== "preview" && g ? /* @__PURE__ */ i(
            "section",
            {
              className: `deck-studio-preview ${le}`,
              "aria-label": "Active slide preview",
              style: oe,
              children: /* @__PURE__ */ i(de, { slide: g, target: "screen" })
            }
          ) : null
        ] }),
        I.showInspector ? /* @__PURE__ */ f("aside", { className: "deck-studio-inspector", style: { width: I.inspectorWidthPx }, children: [
          I.showDiagnosticsPanel ? /* @__PURE__ */ f("section", { children: [
            /* @__PURE__ */ i("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ i(me, { diagnostics: Ce })
          ] }) : null,
          I.showVersionHistory && r ? /* @__PURE__ */ f("section", { children: [
            /* @__PURE__ */ i("h3", { children: "Versions" }),
            /* @__PURE__ */ i("ul", { className: "deck-version-list", children: Ne.map((a) => /* @__PURE__ */ f("li", { children: [
              /* @__PURE__ */ i(
                "button",
                {
                  type: "button",
                  onClick: () => void Ae(a.id),
                  disabled: !x.allowVersionRestore || y,
                  children: a.label ?? a.reason
                }
              ),
              /* @__PURE__ */ i("small", { children: new Date(a.createdAtIso).toLocaleString() })
            ] }, a.id)) })
          ] }) : null
        ] }) : null,
        De ? /* @__PURE__ */ i(
          nt,
          {
            source: h,
            readOnly: !!y,
            onUpdate: C,
            onClose: () => ie(!1)
          }
        ) : null
      ]
    }
  );
}
function st() {
  const e = "deck-runtime-session-id", n = window.sessionStorage.getItem(e);
  if (n)
    return n;
  const t = Se();
  return window.sessionStorage.setItem(e, t), t;
}
function Se() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
export {
  ft as D,
  He as a
};
