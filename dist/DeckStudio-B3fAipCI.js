import { jsxs as m, jsx as r } from "react/jsx-runtime";
import { useState as $, useRef as ae, useMemo as _, useCallback as B, useEffect as W } from "react";
import { h as C, c as Ie, s as Ae } from "./hash-DooAEQA6.js";
import { L as Pe, d as Ve } from "./defaultDeckRuntime-BlLpFtOg.js";
import { d as xe } from "./themeStyle-CyBLqMAf.js";
import { S as re } from "./SlideRenderer-iimFvRrx.js";
import ce from "yaml";
function Me({ fallback: e }) {
  return /* @__PURE__ */ m("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ r("header", { children: /* @__PURE__ */ r("h2", { children: e.title }) }),
    /* @__PURE__ */ r(de, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ r("pre", { children: e.source.content })
  ] });
}
function de({
  diagnostics: e
}) {
  return e.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ r("ul", { className: "deck-diagnostics-list", children: e.map((s, i) => /* @__PURE__ */ m("li", { "data-severity": s.severity, children: [
    /* @__PURE__ */ r("strong", { children: s.code }),
    /* @__PURE__ */ r("span", { children: s.message }),
    s.hint ? /* @__PURE__ */ r("small", { children: s.hint }) : null
  ] }, `${s.code}-${i}`)) });
}
const Ce = {
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
}, Re = {
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
}, Z = {
  adapter: new Pe(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, Le = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function E(e) {
  try {
    const s = ce.parse(e.content);
    return P(s) ? s : null;
  } catch {
    return null;
  }
}
function J(e, s) {
  return {
    ...e,
    content: ce.stringify(s, { lineWidth: 0 })
  };
}
function R(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(P);
}
function oe(e, s, i, a) {
  return te(e, s, (o) => {
    const l = he(o);
    l[i] = { markdown: a };
  });
}
function ee(e, s, i, a) {
  return te(e, s, (o) => {
    const l = he(o);
    l[i] = {
      image: je({
        assetId: a.assetId,
        src: a.src,
        alt: a.alt
      })
    };
  });
}
function Te(e, s, i, a) {
  return te(e, s, (o) => {
    a && o.layout && o.layout !== i && (o.slots = Ee(o, i, a)), o.layout = i;
  });
}
function He(e, s = "title-body") {
  const i = E(e);
  if (!i)
    return e;
  const a = R(i), o = fe(a, "slide");
  return a.push({
    id: o,
    layout: s,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }), i.slides = a, J(e, i);
}
function Fe(e, s) {
  const i = E(e);
  if (!i)
    return e;
  const a = R(i), o = a.findIndex((v) => v.id === s);
  if (o < 0)
    return e;
  const l = structuredClone(a[o]);
  return l.id = fe(a, `${s}-copy`), a.splice(o + 1, 0, l), i.slides = a, J(e, i);
}
function $e(e, s) {
  const i = E(e);
  if (!i)
    return e;
  const a = R(i).filter((o) => o.id !== s);
  return i.slides = a.length > 0 ? a : R(i), J(e, i);
}
function Be(e, s, i) {
  const a = ue(e, s, i);
  return P(a) && typeof a.markdown == "string" ? a.markdown : "";
}
function We(e, s, i) {
  const a = ue(e, s, i), o = P(a) && P(a.image) ? a.image : {};
  return {
    assetId: typeof o.assetId == "string" ? o.assetId : "",
    src: typeof o.src == "string" ? o.src : "",
    alt: typeof o.alt == "string" ? o.alt : ""
  };
}
function te(e, s, i) {
  const a = E(e);
  if (!a)
    return e;
  const o = R(a), l = o.find((v) => v.id === s);
  return l ? (i(l), a.slides = o, J(e, a)) : e;
}
function ue(e, s, i) {
  var l;
  const a = E(e);
  if (!a)
    return;
  const o = R(a).find((v) => v.id === s);
  return (l = o == null ? void 0 : o.slots) == null ? void 0 : l[i];
}
function he(e) {
  return P(e.slots) || (e.slots = {}), e.slots;
}
function Ee(e, s, i) {
  var v, D;
  const a = P(e.slots) ? e.slots : {}, o = e.layout ? (D = (v = i.get(s)) == null ? void 0 : v.migrateFrom) == null ? void 0 : D[e.layout] : void 0;
  if (!o)
    return a;
  const l = {};
  for (const p of o.operations)
    p.kind === "move-slot" && p.from in a && (l[p.to] = a[p.from]);
  return l;
}
function fe(e, s) {
  const i = new Set(e.map((l) => l.id).filter((l) => !!l));
  let a = le(s), o = 2;
  for (; i.has(a); )
    a = `${le(s)}-${o}`, o += 1;
  return a;
}
function le(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function je(e) {
  return Object.fromEntries(
    Object.entries(e).filter((s) => !!s[1])
  );
}
function P(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Oe({
  fields: e,
  onUpdate: s,
  readOnly: i,
  slideId: a,
  source: o
}) {
  return /* @__PURE__ */ r("form", { className: "deck-slide-form", children: e.map((l) => /* @__PURE__ */ r(
    ze,
    {
      source: o,
      slideId: a,
      field: l,
      readOnly: i,
      onUpdate: s
    },
    `${l.kind}-${"slotName" in l ? l.slotName : l.label}`
  )) });
}
function ze({
  source: e,
  slideId: s,
  field: i,
  readOnly: a,
  onUpdate: o
}) {
  if (i.kind === "markdown") {
    const l = i.blockKind === "heading" || i.slotName === "title", v = Be(e, s, i.slotName), D = l || Ye(i), p = D ? qe(v, l) : v;
    return /* @__PURE__ */ m("label", { className: "deck-form-field", children: [
      /* @__PURE__ */ r("span", { children: i.label }),
      D ? /* @__PURE__ */ r(
        "input",
        {
          className: "deck-form-input",
          placeholder: " ",
          value: p,
          onChange: (V) => o(
            oe(e, s, i.slotName, V.currentTarget.value),
            "slide-field-edit"
          ),
          readOnly: a
        }
      ) : /* @__PURE__ */ r(
        "textarea",
        {
          className: "deck-form-textarea",
          placeholder: " ",
          rows: i.minRows ?? 4,
          value: p,
          onChange: (V) => o(
            oe(e, s, i.slotName, V.currentTarget.value),
            "slide-field-edit"
          ),
          readOnly: a
        }
      )
    ] });
  }
  if (i.kind === "image") {
    const l = We(e, s, i.slotName);
    return /* @__PURE__ */ m("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ r("legend", { children: i.label }),
      /* @__PURE__ */ m("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ r("span", { children: "Asset id" }),
        /* @__PURE__ */ r(
          "input",
          {
            placeholder: " ",
            value: l.assetId,
            onChange: (v) => o(
              ee(e, s, i.slotName, {
                ...l,
                assetId: v.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: a
          }
        )
      ] }),
      /* @__PURE__ */ m("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ r("span", { children: "Source" }),
        /* @__PURE__ */ r(
          "input",
          {
            placeholder: " ",
            value: l.src,
            onChange: (v) => o(
              ee(e, s, i.slotName, {
                ...l,
                src: v.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: a
          }
        )
      ] }),
      /* @__PURE__ */ m("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ r("span", { children: "Alt" }),
        /* @__PURE__ */ r(
          "input",
          {
            placeholder: " ",
            value: l.alt,
            onChange: (v) => o(
              ee(e, s, i.slotName, {
                ...l,
                alt: v.currentTarget.value
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
function Ye(e) {
  return e.kind !== "markdown" ? !1 : e.minRows === 1 || e.slotName === "eyebrow" || e.slotName === "subtitle" || e.slotName === "footer";
}
function qe(e, s) {
  return (s ? e.replace(/^(\s*)#{1,6}\s+/u, "$1") : e).replace(/\s*\n\s*/gu, " ").trim();
}
function et(e) {
  var ne;
  const {
    autosave: s,
    deckId: i,
    features: a,
    initialSelectedSlideId: o,
    layout: l,
    locale: v = "fr-FR",
    namespace: D,
    onChange: p,
    onCompile: V,
    onError: S,
    onRestoreVersion: j,
    onSave: O,
    onSelectedSlideChange: Q,
    readOnly: N,
    storage: b
  } = e, d = e.options, x = e.runtime ?? Ve, z = e.mode === "controlled", [we, ve] = $(
    z ? e.value : e.initialValue
  ), w = z ? e.value : we, [u, ge] = $(null), [k, Y] = $(
    o
  ), [U, Se] = $(
    ((ne = d == null ? void 0 : d.editing) == null ? void 0 : ne.defaultMode) === "source" ? "source" : "form"
  ), [pe, ke] = $([]), q = ae(V), G = ae(S);
  q.current = V, G.current = S;
  const y = _(() => {
    var g;
    const t = { ...Ce, ...l }, n = d == null ? void 0 : d.panels;
    return (n == null ? void 0 : n.slideRail) === !1 ? t.showSlideRail = !1 : n != null && n.slideRail && (t.showSlideRail = n.slideRail.visibleDefault ?? t.showSlideRail, t.slideRailWidthPx = n.slideRail.widthPx ?? t.slideRailWidthPx), (n == null ? void 0 : n.inspector) === !1 ? t.showInspector = !1 : n != null && n.inspector && (t.showInspector = n.inspector.visibleDefault ?? t.showInspector, t.inspectorWidthPx = n.inspector.widthPx ?? t.inspectorWidthPx), (n == null ? void 0 : n.diagnostics) === !1 ? t.showDiagnosticsPanel = !1 : n != null && n.diagnostics && (t.showDiagnosticsPanel = n.diagnostics.visibleDefault ?? t.showDiagnosticsPanel), (n == null ? void 0 : n.activeSlidePreview) === !1 ? t.showActiveSlidePreview = !1 : n != null && n.activeSlidePreview && (t.showActiveSlidePreview = n.activeSlidePreview.visibleDefault ?? t.showActiveSlidePreview), (n == null ? void 0 : n.versionHistory) === !1 ? t.showVersionHistory = !1 : n != null && n.versionHistory && (t.showVersionHistory = n.versionHistory.visibleDefault ?? t.showVersionHistory), ((g = d == null ? void 0 : d.editing) == null ? void 0 : g.allowSourceMode) === !1 && (t.showSourceModeToggle = !1), t;
  }, [l, d]), I = _(() => {
    var n, g, A, F;
    const t = { ...Re, ...a };
    return ((n = d == null ? void 0 : d.editing) == null ? void 0 : n.allowSourceMode) !== void 0 && (t.allowRawSourceEdit = d.editing.allowSourceMode), ((g = d == null ? void 0 : d.editing) == null ? void 0 : g.allowLayoutChange) !== void 0 && (t.allowLayoutChange = d.editing.allowLayoutChange), ((A = d == null ? void 0 : d.layoutSelector) == null ? void 0 : A.enabled) !== void 0 && (t.allowLayoutChange = d.layoutSelector.enabled), (F = d == null ? void 0 : d.panels) != null && F.slideRail && (d.panels.slideRail.allowReorder !== void 0 && (t.allowReorderSlides = d.panels.slideRail.allowReorder), d.panels.slideRail.allowAddDelete !== void 0 && (t.allowAddSlide = d.panels.slideRail.allowAddDelete, t.allowDeleteSlide = d.panels.slideRail.allowAddDelete)), t;
  }, [a, d]), c = _(
    () => b === !1 ? void 0 : {
      ...Z,
      namespace: D ?? (b == null ? void 0 : b.namespace) ?? Z.namespace,
      adapter: (b == null ? void 0 : b.adapter) ?? x.storage ?? Z.adapter,
      ...b
    },
    [D, x.storage, b]
  ), X = _(
    () => s === !1 ? void 0 : { ...Le, ...s },
    [s]
  ), f = (u == null ? void 0 : u.status) === "valid" || (u == null ? void 0 : u.status) === "degraded" ? u.deck : void 0, h = (f == null ? void 0 : f.slides.find((t) => t.id === k)) ?? (f == null ? void 0 : f.slides[0]), L = B(
    (t, n, g) => {
      const A = {
        reason: n,
        deckId: i,
        selectedSlideId: g ?? k,
        sourceHash: C(t.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      z || ve(t), p == null || p(t, A);
    },
    [z, i, p, k]
  );
  W(() => {
    let t = !1;
    return Ie(w, {
      runtime: x,
      mode: "editor"
    }).then((n) => {
      var g;
      t || (ge(n), (g = q.current) == null || g.call(q, n));
    }).catch((n) => {
      var g;
      (g = G.current) == null || g.call(G, {
        message: n instanceof Error ? n.message : "Deck compilation failed.",
        cause: n
      });
    }), () => {
      t = !0;
    };
  }, [v, x, w]), W(() => {
    if (!f || k)
      return;
    const t = f.slides[0];
    t && Y(t.id);
  }, [f, k]), W(() => {
    c != null && c.recoverOnMount && c.adapter.loadDraft({ deckId: i, namespace: c.namespace }).then((t) => {
      !t || t.sourceHash === C(w.content) || (Y(t.selectedSlideId), L(t.source, "crash-recovery", t.selectedSlideId));
    }).catch((t) => {
      S == null || S({
        message: t instanceof Error ? t.message : "Unable to recover deck draft.",
        cause: t
      });
    });
  }, [i, S, L, w.content, c]), W(() => {
    if (!c || !X || !c.saveDraftOnChange)
      return;
    const t = window.setTimeout(() => {
      c.adapter.saveDraft({
        deckId: i,
        namespace: c.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: Ge(),
        source: w,
        sourceHash: C(w.content),
        selectedSlideId: k,
        compilerStatus: (u == null ? void 0 : u.status) ?? "invalid"
      });
    }, X.draftDebounceMs);
    return () => window.clearTimeout(t);
  }, [X, u, i, k, w, c]);
  const K = B(() => {
    c && c.adapter.listVersions({ deckId: i, namespace: c.namespace }).then(ke).catch((t) => {
      S == null || S({
        message: t instanceof Error ? t.message : "Unable to list deck versions.",
        cause: t
      });
    });
  }, [i, S, c]);
  W(() => {
    K();
  }, [K]);
  const T = B(
    async (t, n) => {
      var F;
      if (!c)
        return;
      const g = (u == null ? void 0 : u.diagnostics) ?? [], A = await c.adapter.createVersion({
        id: me(),
        deckId: i,
        namespace: c.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: n,
        reason: t,
        source: w,
        sourceHash: C(w.content),
        selectedSlideId: k,
        compilerStatus: (u == null ? void 0 : u.status) ?? "invalid",
        diagnosticsSummary: Ae(g),
        limits: {
          maxVersionsPerDeck: c.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: c.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: c.maxBytesPerDeck
        }
      });
      A.status !== "success" && (S == null || S({ message: ((F = A.diagnostics[0]) == null ? void 0 : F.message) ?? "Unable to save deck version." })), K();
    },
    [u, i, S, K, k, w, c]
  ), ye = B(() => {
    c && (c.adapter.saveCurrent({
      deckId: i,
      namespace: c.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: w,
      sourceHash: C(w.content),
      selectedSlideId: k
    }), c.createVersionOnManualSave && T("manual", "Manual save"), O == null || O({
      deckId: i,
      sourceHash: C(w.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [T, i, O, k, w, c]), be = B(
    async (t) => {
      if (!c)
        return;
      c.createVersionBeforeDestructiveAction && await T("before-version-restore", "Before restore");
      const n = await c.adapter.loadVersion({
        deckId: i,
        namespace: c.namespace,
        versionId: t
      });
      n && (Y(n.selectedSlideId), L(n.source, "version-restore", n.selectedSlideId), j == null || j({
        deckId: i,
        versionId: t,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [T, i, j, L, c]
  );
  function De(t) {
    Y(t), Q == null || Q({ deckId: i, slideId: t });
  }
  function M(t, n) {
    L(t, n, h == null ? void 0 : h.id);
  }
  const Ne = (u == null ? void 0 : u.diagnostics) ?? [], H = U === "source" && !I.allowRawSourceEdit ? "form" : U, ie = (f == null ? void 0 : f.theme.cssClassName) ?? "", se = f ? xe(f.theme) : void 0;
  return /* @__PURE__ */ m(
    "div",
    {
      className: "deck-studio-root",
      "data-density": y.density,
      "data-slide-rail": y.showSlideRail ? "visible" : "hidden",
      "data-inspector": y.showInspector ? "visible" : "hidden",
      children: [
        y.showSlideRail ? /* @__PURE__ */ m("aside", { className: "deck-studio-rail", style: { width: y.slideRailWidthPx }, children: [
          /* @__PURE__ */ m("header", { children: [
            /* @__PURE__ */ r("strong", { children: (f == null ? void 0 : f.metadata.title) ?? "Deck" }),
            I.allowAddSlide ? /* @__PURE__ */ r("button", { type: "button", onClick: () => M(He(w), "slide-add"), disabled: N, children: "Add" }) : null
          ] }),
          /* @__PURE__ */ r("nav", { "aria-label": "Slides", children: f == null ? void 0 : f.slides.map((t) => /* @__PURE__ */ m(
            "button",
            {
              type: "button",
              className: t.id === (h == null ? void 0 : h.id) ? "is-active" : void 0,
              onClick: () => De(t.id),
              children: [
                /* @__PURE__ */ r("span", { children: t.index + 1 }),
                /* @__PURE__ */ r("span", { children: t.id }),
                /* @__PURE__ */ r("small", { children: t.layout.name })
              ]
            },
            t.id
          )) })
        ] }) : null,
        /* @__PURE__ */ m("main", { className: "deck-studio-main", children: [
          /* @__PURE__ */ m("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ m("div", { className: "deck-studio-slide-heading", children: [
              /* @__PURE__ */ r("strong", { children: H === "source" ? "Source" : (h == null ? void 0 : h.id) ?? "Source" }),
              H !== "source" && h ? /* @__PURE__ */ r("small", { children: h.layout.definition.displayName }) : null
            ] }),
            /* @__PURE__ */ m("div", { className: "deck-studio-actions", children: [
              y.showSourceModeToggle ? /* @__PURE__ */ m("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ r("span", { children: "Editor view" }),
                /* @__PURE__ */ m(
                  "select",
                  {
                    value: U,
                    onChange: (t) => Se(t.currentTarget.value),
                    children: [
                      /* @__PURE__ */ r("option", { value: "form", children: "Form" }),
                      I.allowRawSourceEdit ? /* @__PURE__ */ r("option", { value: "source", children: "YAML" }) : null,
                      /* @__PURE__ */ r("option", { value: "preview", children: "Preview" })
                    ]
                  }
                )
              ] }) : null,
              I.allowDuplicateSlide && h ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => M(Fe(w, h.id), "slide-duplicate"),
                  disabled: N,
                  children: "Duplicate"
                }
              ) : null,
              I.allowDeleteSlide && h ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => M($e(w, h.id), "slide-delete"),
                  disabled: N || ((f == null ? void 0 : f.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              c ? /* @__PURE__ */ r("button", { type: "button", onClick: ye, disabled: N, children: "Save" }) : null
            ] })
          ] }),
          H === "source" ? /* @__PURE__ */ r(
            "textarea",
            {
              className: "deck-source-editor",
              value: w.content,
              onChange: (t) => M({ ...w, content: t.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: N
            }
          ) : H === "preview" && h ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${ie}`,
              "aria-label": "Slide preview",
              style: se,
              children: /* @__PURE__ */ r(re, { slide: h, target: "screen" })
            }
          ) : h ? /* @__PURE__ */ m("div", { className: "deck-studio-editor", children: [
            /* @__PURE__ */ r(
              Oe,
              {
                source: w,
                slideId: h.id,
                fields: h.layout.definition.editor.fieldGroups.flatMap((t) => t.fields),
                readOnly: !!N,
                onUpdate: M
              }
            ),
            I.allowLayoutChange ? /* @__PURE__ */ m("label", { className: "deck-form-field", children: [
              /* @__PURE__ */ r("span", { children: "Layout" }),
              /* @__PURE__ */ r(
                "select",
                {
                  value: h.layout.name,
                  onChange: (t) => {
                    c != null && c.createVersionBeforeDestructiveAction && T("before-layout-change", "Before layout change"), M(
                      Te(w, h.id, t.currentTarget.value, x.layouts),
                      "layout-change"
                    );
                  },
                  disabled: N,
                  children: Array.from(x.layouts.values()).map((t) => /* @__PURE__ */ r("option", { value: t.name, children: t.displayName }, t.name))
                }
              )
            ] }) : null
          ] }) : (u == null ? void 0 : u.status) === "invalid" ? /* @__PURE__ */ r(Me, { fallback: u.fallback }) : null,
          y.showActiveSlidePreview && H !== "preview" && h ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview ${ie}`,
              "aria-label": "Active slide preview",
              style: se,
              children: /* @__PURE__ */ r(re, { slide: h, target: "screen" })
            }
          ) : null
        ] }),
        y.showInspector ? /* @__PURE__ */ m("aside", { className: "deck-studio-inspector", style: { width: y.inspectorWidthPx }, children: [
          y.showDiagnosticsPanel ? /* @__PURE__ */ m("section", { children: [
            /* @__PURE__ */ r("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ r(de, { diagnostics: Ne })
          ] }) : null,
          y.showVersionHistory && c ? /* @__PURE__ */ m("section", { children: [
            /* @__PURE__ */ r("h3", { children: "Versions" }),
            /* @__PURE__ */ r("ul", { className: "deck-version-list", children: pe.map((t) => /* @__PURE__ */ m("li", { children: [
              /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => void be(t.id),
                  disabled: !I.allowVersionRestore || N,
                  children: t.label ?? t.reason
                }
              ),
              /* @__PURE__ */ r("small", { children: new Date(t.createdAtIso).toLocaleString() })
            ] }, t.id)) })
          ] }) : null
        ] }) : null
      ]
    }
  );
}
function Ge() {
  const e = "deck-runtime-session-id", s = window.sessionStorage.getItem(e);
  if (s)
    return s;
  const i = me();
  return window.sessionStorage.setItem(e, i), i;
}
function me() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
export {
  et as D,
  Me as a
};
