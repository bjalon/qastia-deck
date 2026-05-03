import { jsxs as c, jsx as r, Fragment as dn } from "react/jsx-runtime";
import { forwardRef as un, useRef as j, useImperativeHandle as fn, useEffect as J, useState as M, useMemo as se, useCallback as L } from "react";
import { h as E, c as ft, s as ht } from "./hash-DKSnHqZ3.js";
import { D as hn } from "./DeckPresentationOverlay-Bv0zVXYQ.js";
import { L as mn, d as pn } from "./defaultDeckRuntime-L2USYTwM.js";
import { d as gn } from "./ContentRenderer-cNVb24xQ.js";
import { S as mt } from "./SlideRenderer-DY_VRveh.js";
import Dt from "yaml";
import { yaml as vn } from "@codemirror/lang-yaml";
import { EditorState as pt } from "@codemirror/state";
import { EditorView as ce, lineNumbers as bn, highlightActiveLine as kn, keymap as yn } from "@codemirror/view";
function wn({ fallback: e }) {
  return /* @__PURE__ */ c("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ r("header", { children: /* @__PURE__ */ r("h2", { children: e.title }) }),
    /* @__PURE__ */ r(Nt, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ r("pre", { children: e.source.content })
  ] });
}
function Nt({
  diagnostics: e,
  onDiagnosticClick: s
}) {
  return e.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ r("ul", { className: "deck-diagnostics-list", children: e.map((n, i) => /* @__PURE__ */ r("li", { "data-severity": n.severity, children: /* @__PURE__ */ c(
    "button",
    {
      type: "button",
      disabled: !s,
      onClick: () => s == null ? void 0 : s(n),
      children: [
        /* @__PURE__ */ r("strong", { children: n.code }),
        /* @__PURE__ */ r("span", { children: n.message }),
        n.range ? /* @__PURE__ */ c("small", { children: [
          "Ligne ",
          n.range.start.line + 1
        ] }) : null,
        n.hint ? /* @__PURE__ */ r("small", { children: n.hint }) : null
      ]
    }
  ) }, `${n.code}-${i}`)) });
}
const Sn = {
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
}, Dn = {
  allowAddSlide: !0,
  allowDuplicateSlide: !0,
  allowDeleteSlide: !0,
  allowReorderSlides: !0,
  allowLayoutChange: !0,
  allowThemeChange: !0,
  allowRawSourceEdit: !0,
  allowFullscreenPreview: !0,
  allowPdfExport: !0,
  allowVersionRestore: !0,
  allowVersionCompare: !0
}, Re = {
  adapter: new mn(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, Nn = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function W(e) {
  try {
    const s = Dt.parse(e.content);
    return T(s) ? s : null;
  } catch {
    return null;
  }
}
function te(e, s) {
  return {
    ...e,
    content: Dt.stringify(s, { lineWidth: 0 })
  };
}
function Q(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(T);
}
function Le(e, s, n, i) {
  return De(e, s, (l) => {
    const h = Ee(l);
    h[n] = { markdown: i };
  });
}
function Cn(e, s, n) {
  return De(e, s, (i) => {
    T(i.slots) && (delete i.slots[n], Object.keys(i.slots).length === 0 && delete i.slots);
  });
}
function Vn(e, s, n) {
  return Oe(e, s, n) !== void 0;
}
function $e(e, s) {
  const n = Ct(e, s);
  return T(n) && typeof n.markdown == "string" ? n.markdown : "";
}
function In(e, s) {
  return Ct(e, s) !== void 0;
}
function gt(e, s, n) {
  const i = W(e);
  if (!i)
    return e;
  const l = Bn(i);
  return l[s] = { markdown: n }, te(e, i);
}
function xn(e, s) {
  const n = W(e);
  return n ? (T(n.metadata) || (n.metadata = {}), n.metadata.title = s, te(e, n)) : e;
}
function Te(e, s, n, i) {
  return De(e, s, (l) => {
    const h = Ee(l);
    h[n] = {
      image: jn({
        assetId: i.assetId,
        src: i.src,
        alt: i.alt
      })
    };
  });
}
function An(e, s, n, i) {
  const l = W(e);
  if (!l)
    return vt(e);
  const h = Q(l), d = h.find((N) => N.id === s);
  if (!d)
    return vt(e);
  const u = i && d.layout && d.layout !== n ? On(d, n, i) : {
    slots: T(d.slots) ? d.slots : {},
    unassignedSlots: T(d.unassignedSlots) ? d.unassignedSlots : {},
    diagnostics: [],
    movedSlots: []
  };
  return d.slots = u.slots, Object.keys(u.unassignedSlots).length > 0 ? d.unassignedSlots = u.unassignedSlots : delete d.unassignedSlots, d.layout = n, l.slides = h, {
    source: te(e, l),
    diagnostics: u.diagnostics,
    movedSlots: u.movedSlots,
    unassignedSlots: Object.keys(u.unassignedSlots)
  };
}
function Mn(e, s = "title-body", n) {
  const i = W(e);
  if (!i)
    return { source: e };
  const l = Q(i), h = Vt(l, "slide"), d = {
    id: h,
    layout: s,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }, u = n ? l.findIndex((N) => N.id === n) : -1;
  return l.splice(u >= 0 ? u + 1 : l.length, 0, d), i.slides = l, { source: te(e, i), slideId: h };
}
function Pn(e, s) {
  const n = W(e);
  if (!n)
    return e;
  const i = Q(n), l = i.findIndex((d) => d.id === s);
  if (l < 0)
    return e;
  const h = structuredClone(i[l]);
  return h.id = Vt(i, `${s}-copy`), i.splice(l + 1, 0, h), n.slides = i, te(e, n);
}
function Rn(e, s) {
  const n = W(e);
  if (!n)
    return e;
  const i = Q(n).filter((l) => l.id !== s);
  return n.slides = i.length > 0 ? i : Q(n), te(e, n);
}
function Ln(e, s, n, i) {
  if (s === n)
    return e;
  const l = W(e);
  if (!l)
    return e;
  const h = Q(l), d = h.findIndex((y) => y.id === s), u = h.findIndex((y) => y.id === n);
  if (d < 0 || u < 0)
    return e;
  const [N] = h.splice(d, 1), w = h.findIndex((y) => y.id === n), p = i === "after" ? w + 1 : w;
  return h.splice(p, 0, N), l.slides = h, te(e, l);
}
function Tn(e, s, n) {
  const i = Oe(e, s, n);
  return T(i) && typeof i.markdown == "string" ? i.markdown : "";
}
function Fn(e, s, n) {
  const i = Oe(e, s, n), l = T(i) && T(i.image) ? i.image : {};
  return {
    assetId: typeof l.assetId == "string" ? l.assetId : "",
    src: typeof l.src == "string" ? l.src : "",
    alt: typeof l.alt == "string" ? l.alt : ""
  };
}
function Hn(e, s) {
  const n = W(e);
  if (!n)
    return {};
  const i = Q(n).find((l) => l.id === s);
  return T(i == null ? void 0 : i.unassignedSlots) ? i.unassignedSlots : {};
}
function $n(e, s, n) {
  return De(e, s, (i) => {
    if (!T(i.unassignedSlots) || !(n in i.unassignedSlots))
      return;
    const l = Ee(i);
    l[n] = i.unassignedSlots[n], delete i.unassignedSlots[n], Object.keys(i.unassignedSlots).length === 0 && delete i.unassignedSlots;
  });
}
function De(e, s, n) {
  const i = W(e);
  if (!i)
    return e;
  const l = Q(i), h = l.find((d) => d.id === s);
  return h ? (n(h), i.slides = l, te(e, i)) : e;
}
function Oe(e, s, n) {
  var h;
  const i = W(e);
  if (!i)
    return;
  const l = Q(i).find((d) => d.id === s);
  return (h = l == null ? void 0 : l.slots) == null ? void 0 : h[n];
}
function Ct(e, s) {
  var i;
  const n = W(e);
  if (n)
    return T((i = n.defaults) == null ? void 0 : i.slots) ? n.defaults.slots[s] : void 0;
}
function Ee(e) {
  return T(e.slots) || (e.slots = {}), e.slots;
}
function Bn(e) {
  return T(e.defaults) || (e.defaults = {}), T(e.defaults.slots) || (e.defaults.slots = {}), e.defaults.slots;
}
function On(e, s, n) {
  var C, V;
  const i = T(e.slots) ? e.slots : {}, l = T(e.unassignedSlots) ? e.unassignedSlots : {}, h = n.get(s), d = e.layout ? (V = (C = n.get(s)) == null ? void 0 : C.migrateFrom) == null ? void 0 : V[e.layout] : void 0, u = {}, N = { ...l }, w = /* @__PURE__ */ new Set(), p = [], y = [];
  if (d)
    for (const f of d.operations)
      f.kind === "move-slot" && f.from in i && (u[f.to] = i[f.from], w.add(f.from), y.push({ from: f.from, to: f.to }), f.from !== f.to && p.push(Fe(
        "info",
        `Le contenu du slot '${f.from}' a ete deplace vers '${f.to}'.`,
        e.id
      ))), (f.kind === "drop-slot" || f.kind === "keep-unassigned") && f.slotName in i && (N[f.slotName] = i[f.slotName], w.add(f.slotName), p.push(Fe(
        "warning",
        `Le slot '${f.slotName}' a ete conserve hors rendu: ${f.reason}`,
        e.id
      )));
  for (const [f, D] of Object.entries(i))
    if (!w.has(f)) {
      if (h && En(h, f) && !(f in u)) {
        u[f] = D;
        continue;
      }
      N[f] = D, p.push(Fe(
        "warning",
        `Le slot '${f}' ne correspond pas au layout '${s}' et a ete conserve hors rendu.`,
        e.id
      ));
    }
  return {
    slots: u,
    unassignedSlots: N,
    diagnostics: p,
    movedSlots: y
  };
}
function En(e, s) {
  return e.requiredSlots.includes(s) || e.optionalSlots.includes(s);
}
function Fe(e, s, n) {
  return {
    code: "LAYOUT_UNASSIGNED_SLOT",
    severity: e,
    message: s,
    slideId: n,
    hint: "Le contenu reste disponible dans les slots non assignes du YAML."
  };
}
function vt(e) {
  return {
    source: e,
    diagnostics: [],
    movedSlots: [],
    unassignedSlots: []
  };
}
function Vt(e, s) {
  const n = new Set(e.map((h) => h.id).filter((h) => !!h));
  let i = bt(s), l = 2;
  for (; n.has(i); )
    i = `${bt(s)}-${l}`, l += 1;
  return i;
}
function bt(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function jn(e) {
  return Object.fromEntries(
    Object.entries(e).filter((s) => !!s[1])
  );
}
function T(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Wn({
  fields: e,
  inheritedMarkdownSlots: s,
  onUpdate: n,
  readOnly: i,
  slideId: l,
  source: h
}) {
  return /* @__PURE__ */ r("form", { className: "deck-slide-form", children: e.map((d) => /* @__PURE__ */ r(
    Un,
    {
      source: h,
      slideId: l,
      field: d,
      inheritedMarkdownSlots: s,
      readOnly: i,
      onUpdate: n
    },
    `${d.kind}-${"slotName" in d ? d.slotName : d.label}`
  )) });
}
function Un({
  source: e,
  slideId: s,
  field: n,
  inheritedMarkdownSlots: i,
  readOnly: l,
  onUpdate: h
}) {
  if (n.kind === "markdown") {
    const d = n.blockKind === "heading" || n.slotName === "title", u = Yn(n.slotName) ? i == null ? void 0 : i.get(n.slotName) : void 0, N = u !== void 0, w = N && Vn(e, s, n.slotName), p = N && !w ? u : Tn(e, s, n.slotName), y = d || qn(n), C = y ? Gn(p, d) : p, V = l || N && !w, f = y ? /* @__PURE__ */ r(
      "input",
      {
        "aria-label": n.label,
        className: "deck-form-input",
        placeholder: " ",
        value: C,
        onFocus: (D) => D.currentTarget.select(),
        onChange: (D) => h(
          Le(e, s, n.slotName, D.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: V
      }
    ) : /* @__PURE__ */ r(
      "textarea",
      {
        "aria-label": n.label,
        className: "deck-form-textarea",
        placeholder: " ",
        rows: n.minRows ?? 4,
        value: C,
        onFocus: (D) => Kn(D.currentTarget),
        onChange: (D) => h(
          Le(e, s, n.slotName, D.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: V
      }
    );
    return /* @__PURE__ */ c(
      "div",
      {
        className: "deck-form-field",
        "data-inherited": N && !w ? "true" : void 0,
        children: [
          /* @__PURE__ */ r("span", { children: n.label }),
          /* @__PURE__ */ c("div", { className: "deck-form-field__control", children: [
            f,
            N ? /* @__PURE__ */ r("label", { className: "deck-inherited-slot-toggle", title: "Override global", children: /* @__PURE__ */ r(
              "input",
              {
                "aria-label": `Override ${n.label} global`,
                title: `Override ${n.label} global`,
                type: "checkbox",
                checked: w,
                onChange: (D) => h(
                  D.currentTarget.checked ? Le(e, s, n.slotName, u) : Cn(e, s, n.slotName),
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
    const d = Fn(e, s, n.slotName);
    return /* @__PURE__ */ c("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ r("legend", { children: n.label }),
      /* @__PURE__ */ c("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ r("span", { children: "Asset id" }),
        /* @__PURE__ */ r(
          "input",
          {
            placeholder: " ",
            value: d.assetId,
            onFocus: (u) => u.currentTarget.select(),
            onChange: (u) => h(
              Te(e, s, n.slotName, {
                ...d,
                assetId: u.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: l
          }
        )
      ] }),
      /* @__PURE__ */ c("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ r("span", { children: "Source" }),
        /* @__PURE__ */ r(
          "input",
          {
            placeholder: " ",
            value: d.src,
            onFocus: (u) => u.currentTarget.select(),
            onChange: (u) => h(
              Te(e, s, n.slotName, {
                ...d,
                src: u.currentTarget.value
              }),
              "slide-field-edit"
            ),
            readOnly: l
          }
        )
      ] }),
      /* @__PURE__ */ c("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ r("span", { children: "Alt" }),
        /* @__PURE__ */ r(
          "input",
          {
            placeholder: " ",
            value: d.alt,
            onFocus: (u) => u.currentTarget.select(),
            onChange: (u) => h(
              Te(e, s, n.slotName, {
                ...d,
                alt: u.currentTarget.value
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
function Yn(e) {
  return e === "eyebrow" || e === "footer";
}
function qn(e) {
  return e.kind !== "markdown" ? !1 : e.minRows === 1 || e.slotName === "eyebrow" || e.slotName === "subtitle" || e.slotName === "footer";
}
function Gn(e, s) {
  return (s ? e.replace(/^(\s*)#{1,6}\s+/u, "$1") : e).replace(/\s*\n\s*/gu, " ").trim();
}
function Kn(e) {
  const s = e.value.length;
  e.setSelectionRange(s, s);
}
function _n({
  onClose: e,
  onUpdate: s,
  readOnly: n,
  source: i
}) {
  const l = $e(i, "eyebrow"), h = $e(i, "footer");
  return /* @__PURE__ */ r("div", { className: "deck-global-defaults-backdrop", role: "presentation", onMouseDown: e, children: /* @__PURE__ */ c(
    "section",
    {
      "aria-labelledby": "deck-global-defaults-title",
      className: "deck-global-defaults-dialog",
      role: "dialog",
      "aria-modal": "true",
      onMouseDown: (d) => d.stopPropagation(),
      children: [
        /* @__PURE__ */ c("header", { children: [
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ r("p", { children: "Defaults" }),
            /* @__PURE__ */ r("h3", { id: "deck-global-defaults-title", children: "Valeurs globales" })
          ] }),
          /* @__PURE__ */ r("button", { type: "button", onClick: e, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-global-defaults-body", children: [
          /* @__PURE__ */ c("label", { className: "deck-form-field", children: [
            /* @__PURE__ */ r("span", { children: "Eyebrow global" }),
            /* @__PURE__ */ r(
              "input",
              {
                className: "deck-form-input",
                placeholder: " ",
                value: l,
                onChange: (d) => s(
                  gt(i, "eyebrow", d.currentTarget.value),
                  "defaults-edit"
                ),
                readOnly: n
              }
            )
          ] }),
          /* @__PURE__ */ c("label", { className: "deck-form-field", children: [
            /* @__PURE__ */ r("span", { children: "Footer global" }),
            /* @__PURE__ */ r(
              "input",
              {
                className: "deck-form-input",
                placeholder: " ",
                value: h,
                onChange: (d) => s(
                  gt(i, "footer", d.currentTarget.value),
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
function zn({
  draft: e,
  current: s,
  versions: n,
  onRestoreDraft: i,
  onRestoreVersion: l,
  onPreviewDraft: h,
  onPreviewVersion: d,
  onCompareDraftWithCurrent: u,
  onCompareVersionWithCurrent: N,
  onCreateCopyFromDraft: w,
  onCreateCopyFromVersion: p,
  onDeleteDraft: y,
  onKeepCurrent: C,
  onOpenVersionHistory: V
}) {
  const f = n.slice(0, 4), D = He(e.updatedAtIso), m = s ? He(s.updatedAtIso) : "Aucune sauvegarde courante";
  return /* @__PURE__ */ r("div", { className: "deck-modal-backdrop", role: "presentation", children: /* @__PURE__ */ c(
    "section",
    {
      "aria-labelledby": "deck-crash-recovery-title",
      "aria-modal": "true",
      className: "deck-modal-dialog deck-recovery-dialog",
      role: "dialog",
      children: [
        /* @__PURE__ */ c("header", { className: "deck-recovery-header", children: [
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ r("p", { children: "Récupération" }),
            /* @__PURE__ */ r("h3", { id: "deck-crash-recovery-title", children: "Tu as un travail non récupéré" }),
            /* @__PURE__ */ r("span", { children: "Une modification plus récente a été trouvée sur cet ordinateur. Le choix le plus sûr est de récupérer ce travail." })
          ] }),
          /* @__PURE__ */ r("button", { className: "deck-button-ghost", type: "button", onClick: C, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-recovery-body", children: [
          /* @__PURE__ */ c("article", { className: "deck-recovery-card deck-recovery-card--recommended", children: [
            /* @__PURE__ */ c("div", { className: "deck-recovery-card-header", children: [
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("span", { className: "deck-recovery-badge", children: "Recommandé" }),
                /* @__PURE__ */ r("strong", { children: "Récupérer mon travail récent" })
              ] }),
              /* @__PURE__ */ r("span", { className: "deck-recovery-status", "data-status": e.compilerStatus, children: kt(e.compilerStatus) })
            ] }),
            /* @__PURE__ */ c("dl", { className: "deck-recovery-meta", children: [
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("dt", { children: "Dernière modification" }),
                /* @__PURE__ */ r("dd", { children: D })
              ] }),
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("dt", { children: "État" }),
                /* @__PURE__ */ r("dd", { children: e.sourceHash.slice(0, 8) })
              ] })
            ] }),
            /* @__PURE__ */ c("div", { className: "deck-recovery-primary-actions", children: [
              /* @__PURE__ */ r("button", { className: "deck-button-primary", type: "button", onClick: i, children: "Récupérer mon travail" }),
              /* @__PURE__ */ r("button", { type: "button", onClick: u, children: "Voir les différences" })
            ] })
          ] }),
          /* @__PURE__ */ c("article", { className: "deck-recovery-card", children: [
            /* @__PURE__ */ c("div", { className: "deck-recovery-card-header", children: [
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("span", { className: "deck-recovery-badge deck-recovery-badge--neutral", children: "Actuel" }),
                /* @__PURE__ */ r("strong", { children: "Garder la page actuelle" })
              ] }),
              /* @__PURE__ */ r("span", { className: "deck-recovery-status", "data-status": "current", children: "conservée" })
            ] }),
            /* @__PURE__ */ c("dl", { className: "deck-recovery-meta", children: [
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("dt", { children: "Dernière sauvegarde" }),
                /* @__PURE__ */ r("dd", { children: m })
              ] }),
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("dt", { children: "État" }),
                /* @__PURE__ */ r("dd", { children: s ? s.sourceHash.slice(0, 8) : "Aucun hash" })
              ] })
            ] }),
            /* @__PURE__ */ c("div", { className: "deck-recovery-current-copy", children: [
              /* @__PURE__ */ r("strong", { children: "Ignorer les modifications trouvées" }),
              /* @__PURE__ */ r("small", { children: "À utiliser seulement si tu sais que les changements récents ne sont pas utiles." })
            ] }),
            /* @__PURE__ */ r("button", { type: "button", onClick: C, children: "Garder cette page" })
          ] })
        ] }),
        /* @__PURE__ */ c("details", { className: "deck-recovery-advanced", children: [
          /* @__PURE__ */ r("summary", { children: "Options avancées" }),
          /* @__PURE__ */ c("div", { className: "deck-recovery-secondary-actions", children: [
            /* @__PURE__ */ r("button", { type: "button", onClick: h, children: "Voir le contenu récupéré" }),
            /* @__PURE__ */ r("button", { type: "button", onClick: w, children: "Créer une copie" }),
            /* @__PURE__ */ r("button", { className: "deck-button-danger", type: "button", onClick: y, children: "Supprimer définitivement cette récupération" })
          ] }),
          f.length > 0 ? /* @__PURE__ */ c("section", { className: "deck-recovery-versions", children: [
            /* @__PURE__ */ r("strong", { children: "Autres versions locales" }),
            /* @__PURE__ */ r("p", { children: "Ces versions sont utiles si tu cherches une sauvegarde plus ancienne." }),
            /* @__PURE__ */ r("ul", { className: "deck-version-list", children: f.map((x) => /* @__PURE__ */ c("li", { children: [
              /* @__PURE__ */ c("div", { className: "deck-recovery-version-row", children: [
                /* @__PURE__ */ c("div", { children: [
                  /* @__PURE__ */ r("strong", { children: x.label ?? x.reason }),
                  /* @__PURE__ */ c("small", { children: [
                    He(x.createdAtIso),
                    " - ",
                    kt(x.compilerStatus)
                  ] })
                ] }),
                /* @__PURE__ */ c("span", { children: [
                  x.sourceHash.slice(0, 8),
                  " - ",
                  x.sizeBytes,
                  " octets"
                ] })
              ] }),
              /* @__PURE__ */ c("div", { className: "deck-version-actions", children: [
                /* @__PURE__ */ r("button", { type: "button", onClick: () => l(x.id), children: "Récupérer" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => d(x.id), children: "Voir" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => N(x.id), children: "Différences" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => p(x.id), children: "Copier" })
              ] })
            ] }, x.id)) })
          ] }) : null
        ] }),
        /* @__PURE__ */ c("footer", { className: "deck-recovery-footer", children: [
          /* @__PURE__ */ r("button", { type: "button", onClick: V, children: "Voir tout l’historique" }),
          /* @__PURE__ */ r("button", { className: "deck-button-ghost", type: "button", onClick: C, children: "Ne rien récupérer" })
        ] })
      ]
    }
  ) });
}
function He(e) {
  return new Date(e).toLocaleString(void 0, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
function kt(e) {
  return e === "valid" ? "utilisable" : e === "degraded" ? "avec alertes" : "avec erreurs";
}
const Jn = un(
  function({
    value: s,
    diagnostics: n,
    readOnly: i = !1,
    onChange: l
  }, h) {
    const d = j(null), u = j(null), N = j(l), w = j(s);
    N.current = l, w.current = s, fn(h, () => ({
      focusDiagnostic(y) {
        var D;
        const C = u.current, V = (D = y.range) == null ? void 0 : D.start.offset;
        if (!C || V === void 0) {
          C == null || C.focus();
          return;
        }
        const f = Math.min(Math.max(V, 0), C.state.doc.length);
        C.dispatch({
          selection: { anchor: f },
          effects: ce.scrollIntoView(f, { y: "center" })
        }), C.focus();
      }
    }), []), J(() => {
      const y = d.current;
      if (!y)
        return;
      const C = new ce({
        parent: y,
        state: pt.create({
          doc: w.current,
          extensions: [
            bn(),
            kn(),
            vn(),
            ce.lineWrapping,
            ce.editable.of(!i),
            pt.readOnly.of(i),
            yn.of([]),
            ce.updateListener.of((V) => {
              if (!V.docChanged)
                return;
              const f = V.state.doc.toString();
              w.current = f, N.current(f);
            })
          ]
        })
      });
      return u.current = C, () => {
        C.destroy(), u.current = null;
      };
    }, [i]), J(() => {
      const y = u.current;
      !y || y.state.doc.toString() === s || y.dispatch({
        changes: {
          from: 0,
          to: y.state.doc.length,
          insert: s
        }
      });
    }, [s]);
    const p = n.filter((y) => y.range);
    return /* @__PURE__ */ c("section", { className: "deck-source-editor", "aria-label": "Source YAML", children: [
      /* @__PURE__ */ r("div", { ref: d, className: "deck-source-editor-codemirror" }),
      /* @__PURE__ */ r(
        "textarea",
        {
          "aria-hidden": "true",
          className: "deck-source-editor-fallback",
          readOnly: !0,
          tabIndex: -1,
          value: s
        }
      ),
      p.length > 0 ? /* @__PURE__ */ r("ul", { className: "deck-source-diagnostic-lines", "aria-label": "Diagnostics source YAML", children: p.map((y, C) => {
        var V;
        return /* @__PURE__ */ r("li", { children: /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            onClick: () => u.current ? Qn(u.current, y) : void 0,
            children: [
              /* @__PURE__ */ c("strong", { children: [
                "Ligne ",
                y.range ? y.range.start.line + 1 : "?"
              ] }),
              /* @__PURE__ */ r("span", { children: y.message })
            ]
          }
        ) }, `${y.code}-${((V = y.range) == null ? void 0 : V.start.offset) ?? C}`);
      }) }) : null
    ] });
  }
);
function Qn(e, s) {
  var l;
  const n = (l = s.range) == null ? void 0 : l.start.offset;
  if (n === void 0) {
    e.focus();
    return;
  }
  const i = Math.min(Math.max(n, 0), e.state.doc.length);
  e.dispatch({
    selection: { anchor: i },
    effects: ce.scrollIntoView(i, { y: "center" })
  }), e.focus();
}
function Xn({
  title: e,
  leftLabel: s,
  leftSource: n,
  rightLabel: i,
  rightSource: l,
  onClose: h
}) {
  const d = Zn(n, l), u = d.filter((w) => w.kind === "added").length, N = d.filter((w) => w.kind === "removed").length;
  return /* @__PURE__ */ r("div", { className: "deck-modal-backdrop", role: "presentation", children: /* @__PURE__ */ c(
    "section",
    {
      "aria-labelledby": "deck-version-compare-title",
      "aria-modal": "true",
      className: "deck-modal-dialog deck-version-compare-dialog",
      role: "dialog",
      children: [
        /* @__PURE__ */ c("header", { children: [
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ r("p", { children: "Comparaison" }),
            /* @__PURE__ */ r("h3", { id: "deck-version-compare-title", children: e }),
            /* @__PURE__ */ c("span", { className: "deck-version-compare-subtitle", children: [
              s,
              " vers ",
              i
            ] })
          ] }),
          /* @__PURE__ */ r("button", { type: "button", onClick: h, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-diff-summary", role: "status", children: [
          /* @__PURE__ */ c("span", { "data-kind": "added", children: [
            u,
            " ajout(s)"
          ] }),
          /* @__PURE__ */ c("span", { "data-kind": "removed", children: [
            N,
            " suppression(s)"
          ] }),
          u === 0 && N === 0 ? /* @__PURE__ */ r("span", { children: "Aucune différence détectée." }) : null
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-diff-legend", "aria-hidden": "true", children: [
          /* @__PURE__ */ r("span", { "data-kind": "removed", children: "- supprimé" }),
          /* @__PURE__ */ r("span", { "data-kind": "added", children: "+ ajouté" }),
          /* @__PURE__ */ r("span", { "data-kind": "unchanged", children: "inchangé" })
        ] }),
        /* @__PURE__ */ r("pre", { className: "deck-diff-view", "aria-label": "Diff des versions", children: d.map((w, p) => /* @__PURE__ */ c("div", { className: "deck-diff-line", "data-kind": w.kind, children: [
          /* @__PURE__ */ r("span", { className: "deck-diff-marker", children: tr(w.kind) }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: w.leftNumber ?? "" }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: w.rightNumber ?? "" }),
          /* @__PURE__ */ r("code", { children: w.content || " " })
        ] }, `${p}-${w.kind}`)) })
      ]
    }
  ) });
}
function Zn(e, s) {
  const n = yt(e), i = yt(s), l = er(n, i), h = [];
  let d = 0, u = 0;
  for (; d < n.length || u < i.length; ) {
    if (d < n.length && u < i.length && n[d] === i[u]) {
      h.push({
        kind: "unchanged",
        content: n[d] ?? "",
        leftNumber: d + 1,
        rightNumber: u + 1
      }), d += 1, u += 1;
      continue;
    }
    if (u < i.length && (d >= n.length || l[d][u + 1] >= l[d + 1][u])) {
      h.push({
        kind: "added",
        content: i[u] ?? "",
        rightNumber: u + 1
      }), u += 1;
      continue;
    }
    d < n.length && (h.push({
      kind: "removed",
      content: n[d] ?? "",
      leftNumber: d + 1
    }), d += 1);
  }
  return h;
}
function yt(e) {
  const s = e.replace(/\r\n/g, `
`).split(`
`);
  return s.at(-1) === "" ? s.slice(0, -1) : s;
}
function er(e, s) {
  const n = Array.from(
    { length: e.length + 1 },
    () => Array.from({ length: s.length + 1 }, () => 0)
  );
  for (let i = e.length - 1; i >= 0; i -= 1)
    for (let l = s.length - 1; l >= 0; l -= 1)
      n[i][l] = e[i] === s[l] ? n[i + 1][l + 1] + 1 : Math.max(n[i + 1][l], n[i][l + 1]);
  return n;
}
function tr(e) {
  return e === "added" ? "+" : e === "removed" ? "-" : " ";
}
const nr = [
  "before-layout-change",
  "before-slide-delete",
  "before-version-restore"
];
function rr({
  versions: e,
  readOnly: s,
  canRestore: n,
  canCompare: i,
  onCreateManualVersion: l,
  onRestoreVersion: h,
  onDeleteVersion: d,
  onRenameVersion: u,
  onCompareWithCurrent: N,
  onCompareVersions: w
}) {
  const [p, y] = M("all"), [C, V] = M(""), [f, D] = M(null), [m, x] = M(""), [U, he] = M(null), me = se(
    () => e.filter((k) => p === "all" ? !0 : p === "safety" ? nr.includes(k.reason) : k.reason === p),
    [p, e]
  );
  function b() {
    l(C.trim() || void 0), V("");
  }
  function S(k) {
    D(k.id), x(k.label ?? k.reason);
  }
  function pe() {
    if (!f)
      return;
    const k = m.trim();
    k && u(f, k), D(null), x("");
  }
  function H(k) {
    if (!U) {
      he(k);
      return;
    }
    U !== k && w(U, k), he(null);
  }
  return /* @__PURE__ */ c("section", { className: "deck-version-history-panel", children: [
    /* @__PURE__ */ c("header", { children: [
      /* @__PURE__ */ r("h3", { children: "Versions" }),
      /* @__PURE__ */ c("label", { className: "deck-version-filter", children: [
        /* @__PURE__ */ r("span", { children: "Filtre" }),
        /* @__PURE__ */ c(
          "select",
          {
            "aria-label": "Filtrer les versions",
            value: p,
            onChange: (k) => y(k.currentTarget.value),
            children: [
              /* @__PURE__ */ r("option", { value: "all", children: "Toutes" }),
              /* @__PURE__ */ r("option", { value: "manual", children: "Manuelles" }),
              /* @__PURE__ */ r("option", { value: "autosave", children: "Autosaves" }),
              /* @__PURE__ */ r("option", { value: "safety", children: "Sécurité" }),
              /* @__PURE__ */ r("option", { value: "crash-recovery", children: "Recovery" }),
              /* @__PURE__ */ r("option", { value: "import", children: "Imports" }),
              /* @__PURE__ */ r("option", { value: "external-save", children: "Externes" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ c("div", { className: "deck-version-create", children: [
      /* @__PURE__ */ r(
        "input",
        {
          "aria-label": "Nom de version",
          value: C,
          placeholder: "Nom de version",
          onChange: (k) => V(k.currentTarget.value),
          disabled: s
        }
      ),
      /* @__PURE__ */ r("button", { type: "button", onClick: b, disabled: s, children: "Créer version" })
    ] }),
    U ? /* @__PURE__ */ r("p", { className: "deck-version-compare-hint", children: "Choisir une seconde version à comparer." }) : null,
    /* @__PURE__ */ r("ul", { className: "deck-version-list", children: me.map((k) => /* @__PURE__ */ c("li", { children: [
      f === k.id ? /* @__PURE__ */ c("div", { className: "deck-version-rename", children: [
        /* @__PURE__ */ r(
          "input",
          {
            "aria-label": "Renommer version",
            value: m,
            onChange: (_) => x(_.currentTarget.value),
            onKeyDown: (_) => {
              _.key === "Enter" && (_.preventDefault(), pe()), _.key === "Escape" && (_.preventDefault(), D(null));
            }
          }
        ),
        /* @__PURE__ */ r("button", { type: "button", onClick: pe, children: "OK" })
      ] }) : /* @__PURE__ */ r("strong", { children: k.label ?? k.reason }),
      /* @__PURE__ */ c("small", { children: [
        ar(k.reason),
        " - ",
        new Date(k.createdAtIso).toLocaleString(),
        " -",
        " ",
        k.compilerStatus
      ] }),
      /* @__PURE__ */ c("div", { className: "deck-version-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => h(k.id),
            disabled: !n || s,
            children: "Restaurer"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => N(k.id),
            disabled: !i,
            children: "Comparer actuel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => H(k.id),
            disabled: !i,
            "aria-pressed": U === k.id,
            children: "Comparer A/B"
          }
        ),
        k.reason === "manual" ? /* @__PURE__ */ r("button", { type: "button", onClick: () => S(k), disabled: s, children: "Renommer" }) : null,
        /* @__PURE__ */ r("button", { type: "button", onClick: () => d(k.id), disabled: s, children: "Supprimer" })
      ] })
    ] }, k.id)) }),
    me.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucune version." }) : null
  ] });
}
function ar(e) {
  return e === "autosave" ? "Autosave" : e === "manual" ? "Manuelle" : e === "crash-recovery" ? "Recovery" : e.startsWith("before-") ? "Sécurité" : e === "external-save" ? "Externe" : "Import";
}
function sr({
  title: e,
  label: s,
  source: n,
  onClose: i
}) {
  return /* @__PURE__ */ r("div", { className: "deck-modal-backdrop", role: "presentation", children: /* @__PURE__ */ c(
    "section",
    {
      "aria-labelledby": "deck-version-source-title",
      "aria-modal": "true",
      className: "deck-modal-dialog deck-version-source-dialog",
      role: "dialog",
      children: [
        /* @__PURE__ */ c("header", { children: [
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ r("p", { children: "Lecture seule" }),
            /* @__PURE__ */ r("h3", { id: "deck-version-source-title", children: e })
          ] }),
          /* @__PURE__ */ r("button", { type: "button", onClick: i, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("label", { className: "deck-version-source-field", children: [
          /* @__PURE__ */ r("span", { children: s }),
          /* @__PURE__ */ r("textarea", { readOnly: !0, value: n })
        ] })
      ]
    }
  ) });
}
function Nr(e) {
  var lt, ct;
  const {
    autosave: s,
    deckId: n,
    features: i,
    initialSelectedSlideId: l,
    layout: h,
    locale: d = "fr-FR",
    namespace: u,
    onChange: N,
    onCompile: w,
    onError: p,
    onRestoreVersion: y,
    onSave: C,
    onSelectedSlideChange: V,
    readOnly: f,
    storage: D
  } = e, m = e.options, x = e.runtime ?? pn, U = e.mode === "controlled", [he, me] = M(
    U ? e.value : e.initialValue
  ), b = U ? e.value : he, [S, pe] = M(null), [H, k] = M(
    l
  ), [_, Ne] = M(
    ((lt = m == null ? void 0 : m.editing) == null ? void 0 : lt.defaultMode) ?? "form"
  ), [It, je] = M(!1), [xt, We] = M(!1), [At, Ce] = M(!1), [P, X] = M(null), [ie, ge] = M(null), [ve, Ve] = M(null), [Mt, Ie] = M(!1), [Pt, Rt] = M([]), [Lt, xe] = M(!1), [Ue, be] = M(""), [R, oe] = M(null), [Tt, Ft] = M([]), [Ae, Ye] = M(b), [Me, qe] = M(
    l
  ), Ge = j(null), Ke = j(null), ke = j(w), ye = j(p), de = j(null), _e = j(!1), ze = j(null);
  ke.current = w, ye.current = p;
  const B = se(() => {
    const t = { ...Sn, ...h }, a = m == null ? void 0 : m.panels;
    return (a == null ? void 0 : a.slideRail) === !1 ? t.showSlideRail = !1 : a != null && a.slideRail && (t.showSlideRail = a.slideRail.visibleDefault ?? t.showSlideRail, t.slideRailWidthPx = a.slideRail.widthPx ?? t.slideRailWidthPx), (a == null ? void 0 : a.inspector) === !1 ? t.showInspector = !1 : a != null && a.inspector && (t.showInspector = a.inspector.visibleDefault ?? t.showInspector, t.inspectorWidthPx = a.inspector.widthPx ?? t.inspectorWidthPx), (a == null ? void 0 : a.diagnostics) === !1 ? t.showDiagnosticsPanel = !1 : a != null && a.diagnostics && (t.showDiagnosticsPanel = a.diagnostics.visibleDefault ?? t.showDiagnosticsPanel), (a == null ? void 0 : a.activeSlidePreview) === !1 ? t.showActiveSlidePreview = !1 : a != null && a.activeSlidePreview && (t.showActiveSlidePreview = a.activeSlidePreview.visibleDefault ?? t.showActiveSlidePreview), (a == null ? void 0 : a.versionHistory) === !1 ? t.showVersionHistory = !1 : a != null && a.versionHistory && (t.showVersionHistory = a.versionHistory.visibleDefault ?? t.showVersionHistory), t;
  }, [h, m]), $ = se(() => {
    var g, I, F, G, K;
    const t = { ...Dn, ...i }, a = ((g = m == null ? void 0 : m.editing) == null ? void 0 : g.allowYamlMode) ?? ((I = m == null ? void 0 : m.editing) == null ? void 0 : I.allowSourceMode);
    return a !== void 0 && (t.allowRawSourceEdit = a), ((F = m == null ? void 0 : m.editing) == null ? void 0 : F.allowLayoutChange) !== void 0 && (t.allowLayoutChange = m.editing.allowLayoutChange), ((G = m == null ? void 0 : m.layoutSelector) == null ? void 0 : G.enabled) !== void 0 && (t.allowLayoutChange = m.layoutSelector.enabled), (K = m == null ? void 0 : m.panels) != null && K.slideRail && (m.panels.slideRail.allowReorder !== void 0 && (t.allowReorderSlides = m.panels.slideRail.allowReorder), m.panels.slideRail.allowAddDelete !== void 0 && (t.allowAddSlide = m.panels.slideRail.allowAddDelete, t.allowDeleteSlide = m.panels.slideRail.allowAddDelete)), t;
  }, [i, m]), ue = se(() => {
    var G, K, dt, ut;
    const t = ((G = m == null ? void 0 : m.editing) == null ? void 0 : G.allowYamlMode) ?? ((K = m == null ? void 0 : m.editing) == null ? void 0 : K.allowSourceMode) ?? !0, a = ((dt = m == null ? void 0 : m.editing) == null ? void 0 : dt.allowPreviewMode) ?? !0, F = (((ut = m == null ? void 0 : m.editing) == null ? void 0 : ut.viewModes) ?? ["form", "source", "preview"]).filter(
      (ae, ln, cn) => (ae === "form" || ae === "source" || ae === "preview") && cn.indexOf(ae) === ln
    ).filter((ae) => ae === "source" ? t && $.allowRawSourceEdit : ae === "preview" ? a : !0);
    return F.length > 0 ? F : ["form"];
  }, [$.allowRawSourceEdit, m]), o = se(
    () => D === !1 ? void 0 : {
      ...Re,
      namespace: u ?? (D == null ? void 0 : D.namespace) ?? Re.namespace,
      adapter: (D == null ? void 0 : D.adapter) ?? x.storage ?? Re.adapter,
      ...D
    },
    [u, x.storage, D]
  ), ne = se(
    () => s === !1 ? void 0 : { ...Nn, ...s },
    [s]
  ), A = (S == null ? void 0 : S.status) === "valid" || (S == null ? void 0 : S.status) === "degraded" ? S.deck : void 0, v = (A == null ? void 0 : A.slides.find((t) => t.id === H)) ?? (A == null ? void 0 : A.slides[0]), we = E(b.content) !== E(Ae.content), Ht = se(() => {
    const t = /* @__PURE__ */ new Map();
    for (const a of ["eyebrow", "footer"])
      In(b, a) && t.set(a, $e(b, a));
    return t;
  }, [b]), Z = L(
    (t, a, g) => {
      const I = {
        reason: a,
        deckId: n,
        selectedSlideId: g ?? H,
        sourceHash: E(t.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      U || me(t), N == null || N(t, I);
    },
    [U, n, N, H]
  );
  J(() => {
    let t = !1;
    return ft(b, {
      runtime: x,
      mode: "editor"
    }).then((a) => {
      var g;
      t || (pe(a), (g = ke.current) == null || g.call(ke, a));
    }).catch((a) => {
      var g;
      (g = ye.current) == null || g.call(ye, {
        message: a instanceof Error ? a.message : "Deck compilation failed.",
        cause: a
      });
    }), () => {
      t = !0;
    };
  }, [d, x, b]), J(() => {
    if (!A || H)
      return;
    const t = A.slides[0];
    t && k(t.id);
  }, [A, H]), J(() => {
    !(o != null && o.recoverOnMount) || _e.current || (_e.current = !0, Promise.all([
      o.adapter.loadCurrent({ deckId: n, namespace: o.namespace }),
      o.adapter.loadDraft({ deckId: n, namespace: o.namespace }),
      o.adapter.listVersions({ deckId: n, namespace: o.namespace })
    ]).then(([t, a, g]) => {
      if (!a)
        return;
      const I = E(b.content), F = a.sourceHash !== I, G = !t || a.sourceHash !== t.sourceHash, K = !t || a.updatedAtIso > t.updatedAtIso;
      !F || !G || !K || X({
        draft: a,
        current: t,
        versions: g
      });
    }).catch((t) => {
      p == null || p({
        message: t instanceof Error ? t.message : "Unable to inspect deck recovery state.",
        cause: t
      });
    }));
  }, [n, p, Z, b.content, o]), J(() => {
    if (!o || !ne || !o.saveDraftOnChange)
      return;
    const t = window.setTimeout(() => {
      o.adapter.saveDraft({
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: or(),
        source: b,
        sourceHash: E(b.content),
        selectedSlideId: H,
        compilerStatus: (S == null ? void 0 : S.status) ?? "invalid"
      });
    }, ne.draftDebounceMs);
    return () => window.clearTimeout(t);
  }, [ne, S, n, H, b, o]);
  const Y = L(() => {
    o && o.adapter.listVersions({ deckId: n, namespace: o.namespace }).then(Ft).catch((t) => {
      p == null || p({
        message: t instanceof Error ? t.message : "Unable to list deck versions.",
        cause: t
      });
    });
  }, [n, p, o]);
  J(() => {
    Y();
  }, [Y]);
  const O = L(
    async (t, a) => {
      var F;
      if (!o)
        return;
      const g = (S == null ? void 0 : S.diagnostics) ?? [], I = await o.adapter.createVersion({
        id: Be(),
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: a,
        reason: t,
        source: b,
        sourceHash: E(b.content),
        selectedSlideId: H,
        compilerStatus: (S == null ? void 0 : S.status) ?? "invalid",
        diagnosticsSummary: ht(g),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      I.status !== "success" && (p == null || p({ message: ((F = I.diagnostics[0]) == null ? void 0 : F.message) ?? "Unable to save deck version." })), Y();
    },
    [S, n, p, Y, H, b, o]
  ), Se = L(
    async (t, a, g, I) => {
      var K;
      if (!o)
        return;
      const F = await ft(t, {
        runtime: x,
        mode: "editor"
      }), G = await o.adapter.createVersion({
        id: Be(),
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: g,
        reason: a,
        source: t,
        sourceHash: E(t.content),
        selectedSlideId: I,
        compilerStatus: F.status,
        diagnosticsSummary: ht(F.diagnostics),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      G.status !== "success" && (p == null || p({ message: ((K = G.diagnostics[0]) == null ? void 0 : K.message) ?? "Unable to save deck version." })), Y();
    },
    [n, d, p, Y, x, o]
  );
  J(() => {
    if (!o || !ne || !o.saveDraftOnChange || ne.createVersionOnValidDeckOnly && (S == null ? void 0 : S.status) === "invalid")
      return;
    const t = window.setTimeout(() => {
      const a = E(b.content);
      ze.current !== a && (ze.current = a, O("autosave", "Autosave"));
    }, ne.versionIntervalMs);
    return () => window.clearTimeout(t);
  }, [ne, S == null ? void 0 : S.status, O, b.content, o]);
  const $t = L(() => {
    o && (o.adapter.saveCurrent({
      deckId: n,
      namespace: o.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: b,
      sourceHash: E(b.content),
      selectedSlideId: H
    }), o.createVersionOnManualSave && O("manual", "Manual save"), Ye(b), qe(H), C == null || C({
      deckId: n,
      sourceHash: E(b.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [O, n, C, H, b, o]), re = L(
    async (t, a) => {
      var I;
      if (!o)
        return;
      const g = await o.adapter.saveCurrent({
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        source: t,
        sourceHash: E(t.content),
        selectedSlideId: a
      });
      if (g.status !== "success") {
        p == null || p({ message: ((I = g.diagnostics[0]) == null ? void 0 : I.message) ?? "Unable to save current deck." });
        return;
      }
      Ye(t), qe(a);
    },
    [n, p, o]
  ), Bt = L(() => {
    !we || !window.confirm(
      "Annuler les modifications non sauvegardées et revenir à la dernière version sauvegardée ?"
    ) || (k(Me), Z(Ae, "cancel-edit", Me));
  }, [Me, Ae, Z, we]), Je = L(
    async (t) => {
      if (!o)
        return;
      o.createVersionBeforeDestructiveAction && await O("before-version-restore", "Before restore");
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a && (k(a.selectedSlideId), Z(a.source, "version-restore", a.selectedSlideId), await re(a.source, a.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), y == null || y({
        deckId: n,
        versionId: t,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [O, n, y, Z, re, o]
  ), Ot = L(
    async (t) => {
      var g;
      if (!o)
        return;
      const a = await o.adapter.deleteVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a.status !== "success" && (p == null || p({ message: ((g = a.diagnostics[0]) == null ? void 0 : g.message) ?? "Unable to delete deck version." })), Y();
    },
    [n, p, Y, o]
  ), Et = L(
    async (t, a) => {
      var F;
      if (!o)
        return;
      const g = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      if (!g)
        return;
      const I = await o.adapter.createVersion({
        ...g,
        label: a,
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      I.status !== "success" && (p == null || p({ message: ((F = I.diagnostics[0]) == null ? void 0 : F.message) ?? "Unable to rename deck version." })), Y();
    },
    [n, p, Y, o]
  ), Qe = L(
    async (t) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a && ge({
        title: "Version vs courant",
        leftLabel: a.label ?? a.reason,
        leftSource: a.source.content,
        rightLabel: "Courant",
        rightSource: b.content
      });
    },
    [n, b.content, o]
  ), jt = L(
    async (t) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a && Ve({
        title: a.label ?? a.reason,
        label: "Source YAML",
        source: a.source.content
      });
    },
    [n, o]
  ), Wt = L(
    async (t, a) => {
      if (!o)
        return;
      const [g, I] = await Promise.all([
        o.adapter.loadVersion({
          deckId: n,
          namespace: o.namespace,
          versionId: t
        }),
        o.adapter.loadVersion({
          deckId: n,
          namespace: o.namespace,
          versionId: a
        })
      ]);
      !g || !I || ge({
        title: "Comparaison de versions",
        leftLabel: g.label ?? g.reason,
        leftSource: g.source.content,
        rightLabel: I.label ?? I.reason,
        rightSource: I.source.content
      });
    },
    [n, o]
  ), Ut = L(async () => {
    !P || !o || (o.createVersionBeforeDestructiveAction && await O("before-version-restore", "Before recovery restore"), k(P.draft.selectedSlideId), Z(P.draft.source, "crash-recovery", P.draft.selectedSlideId), await re(P.draft.source, P.draft.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), X(null));
  }, [O, n, Z, P, re, o]), Yt = L(() => {
    P && Ve({
      title: "Draft local",
      label: "Source YAML",
      source: P.draft.source.content
    });
  }, [P]), qt = L(() => {
    var t;
    P && ge({
      title: "Draft vs courant",
      leftLabel: "Draft local",
      leftSource: P.draft.source.content,
      rightLabel: "Courant",
      rightSource: ((t = P.current) == null ? void 0 : t.source.content) ?? b.content
    });
  }, [P, b.content]), Gt = L(async () => {
    P && (await Se(
      P.draft.source,
      "manual",
      "Copie du draft de recovery",
      P.draft.selectedSlideId
    ), Ce(!0), X(null));
  }, [Se, P]), Kt = L(
    async (t) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a && (await Se(
        a.source,
        "manual",
        `Copie - ${a.label ?? a.reason}`,
        a.selectedSlideId
      ), Ce(!0), X(null));
    },
    [Se, n, o]
  ), _t = L(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), X(null));
  }, [n, o]), zt = L(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), await re(b, v == null ? void 0 : v.id), X(null));
  }, [n, re, v == null ? void 0 : v.id, b, o]);
  function Jt(t) {
    de.current = t, k(t), V == null || V({ deckId: n, slideId: t });
  }
  function q(t, a, g = v == null ? void 0 : v.id) {
    Z(t, a, g);
  }
  function Xe(t = "title-body") {
    const a = Mn(b, t, v == null ? void 0 : v.id);
    a.slideId && (de.current = a.slideId, ue.includes("form") && Ne("form"), k(a.slideId), V == null || V({ deckId: n, slideId: a.slideId })), q(a.source, "slide-add", a.slideId);
  }
  function Qt(t) {
    !$.allowAddSlide || f || !t.ctrlKey || t.altKey || t.key.toLowerCase() !== "m" || (t.preventDefault(), t.stopPropagation(), Xe(t.shiftKey && v ? v.layout.name : "title-body"));
  }
  function Xt() {
    v && (o != null && o.createVersionBeforeDestructiveAction && O("before-slide-delete", "Before slide delete"), q(Rn(b, v.id), "slide-delete"));
  }
  function Zt(t, a) {
    !$.allowReorderSlides || f || (t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("application/x-qastia-slide-id", a), t.dataTransfer.setData("text/plain", a), oe({ draggedSlideId: a }));
  }
  function en(t, a) {
    const g = R == null ? void 0 : R.draggedSlideId;
    !$.allowReorderSlides || f || !g || g === a || (t.preventDefault(), t.dataTransfer.dropEffect = "move", oe({
      draggedSlideId: g,
      targetSlideId: a,
      placement: St(t)
    }));
  }
  function tn(t, a) {
    const g = (R == null ? void 0 : R.draggedSlideId) || t.dataTransfer.getData("application/x-qastia-slide-id") || t.dataTransfer.getData("text/plain");
    if (!$.allowReorderSlides || f || !g || g === a) {
      oe(null);
      return;
    }
    t.preventDefault();
    const I = (R == null ? void 0 : R.targetSlideId) === a && R.placement ? R.placement : St(t);
    oe(null), k(g), q(Ln(b, g, a, I), "slide-reorder", g), V == null || V({ deckId: n, slideId: g });
  }
  const Ze = [...(S == null ? void 0 : S.diagnostics) ?? [], ...Pt], le = ue.includes(_) ? _ : ue[0], et = (A == null ? void 0 : A.theme.cssClassName) ?? "", tt = A ? gn(A.theme) : void 0, Pe = m == null ? void 0 : m.presentation, ee = Pe === !1 ? void 0 : Pe, nt = $.allowFullscreenPreview && Pe !== !1 && ((ee == null ? void 0 : ee.enabled) ?? !0), nn = ee ? ee.buttonLabel ?? "Plein écran" : "Plein écran", fe = (A == null ? void 0 : A.metadata.title) ?? "Deck", z = (ct = m == null ? void 0 : m.panels) != null && ct.slideRail ? m.panels.slideRail : void 0, rt = wt(z == null ? void 0 : z.itemHeightPx, 76), at = wt(z == null ? void 0 : z.maxVisibleItems, 6), rn = {
    "--deck-slide-rail-item-height": `${rt}px`,
    "--deck-slide-rail-list-max-height": `${rt * at + 8 * Math.max(0, at - 1) + 24}px`
  }, st = (z == null ? void 0 : z.thumbnailMode) ?? "compact", it = v ? Hn(b, v.id) : {};
  function an(t) {
    Ne("source"), window.setTimeout(() => {
      var a;
      (a = Ke.current) == null || a.focusDiagnostic(t);
    }, 0);
  }
  function sn() {
    f || (be(fe), xe(!0));
  }
  function ot() {
    const t = Ue.trim() || fe;
    xe(!1), be(t), t !== fe && q(xn(b, t), "metadata-edit", v == null ? void 0 : v.id);
  }
  function on() {
    xe(!1), be(fe);
  }
  return J(() => {
    if (!de.current || de.current !== (v == null ? void 0 : v.id))
      return;
    const t = Ge.current, a = window.setTimeout(() => {
      const g = t == null ? void 0 : t.querySelector(
        ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main"
      ), I = g != null && g.matches("textarea") ? g : g == null ? void 0 : g.querySelector(
        ".cm-content, input:not([type='checkbox']):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])"
      );
      if (de.current = null, I) {
        I.focus();
        return;
      }
      t == null || t.focus();
    }, 0);
    return () => window.clearTimeout(a);
  }, [le, v == null ? void 0 : v.id, b.content]), /* @__PURE__ */ c(
    "div",
    {
      className: "deck-studio-root",
      "data-density": B.density,
      "data-slide-rail": B.showSlideRail ? "visible" : "hidden",
      "data-inspector": B.showInspector ? "visible" : "hidden",
      style: rn,
      onKeyDown: Qt,
      children: [
        B.showSlideRail ? /* @__PURE__ */ c(
          "aside",
          {
            className: "deck-studio-rail",
            "data-thumbnail-mode": st === "simplified" ? "compact" : st,
            style: { width: B.slideRailWidthPx },
            children: [
              /* @__PURE__ */ r("header", { children: Lt ? /* @__PURE__ */ r(
                "input",
                {
                  className: "deck-studio-title-input",
                  "aria-label": "Titre du slideshow",
                  value: Ue,
                  autoFocus: !0,
                  onFocus: (t) => t.currentTarget.select(),
                  onChange: (t) => be(t.currentTarget.value),
                  onBlur: ot,
                  onKeyDown: (t) => {
                    t.key === "Enter" && (t.preventDefault(), ot()), t.key === "Escape" && (t.preventDefault(), on());
                  }
                }
              ) : /* @__PURE__ */ r(
                "strong",
                {
                  className: "deck-studio-title-label",
                  title: f ? void 0 : "Double-cliquer pour modifier",
                  onDoubleClick: sn,
                  children: fe
                }
              ) }),
              /* @__PURE__ */ r("nav", { "aria-label": "Slides", children: A == null ? void 0 : A.slides.map((t) => /* @__PURE__ */ c(
                "button",
                {
                  type: "button",
                  className: t.id === (v == null ? void 0 : v.id) ? "is-active" : void 0,
                  draggable: $.allowReorderSlides && !f,
                  "data-drop-position": (R == null ? void 0 : R.targetSlideId) === t.id ? R.placement : void 0,
                  "aria-grabbed": (R == null ? void 0 : R.draggedSlideId) === t.id ? "true" : void 0,
                  onClick: () => Jt(t.id),
                  onDragStart: (a) => Zt(a, t.id),
                  onDragOver: (a) => en(a, t.id),
                  onDragLeave: () => {
                    (R == null ? void 0 : R.targetSlideId) === t.id && oe({ draggedSlideId: R.draggedSlideId });
                  },
                  onDrop: (a) => tn(a, t.id),
                  onDragEnd: () => oe(null),
                  children: [
                    /* @__PURE__ */ r("span", { children: t.index + 1 }),
                    /* @__PURE__ */ r("span", { children: cr(t) }),
                    /* @__PURE__ */ r("small", { children: t.layout.name })
                  ]
                },
                t.id
              )) })
            ]
          }
        ) : null,
        /* @__PURE__ */ c("main", { className: "deck-studio-main", ref: Ge, tabIndex: -1, children: [
          /* @__PURE__ */ c("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ r("div", { className: "deck-studio-slide-heading", children: $.allowLayoutChange && v && le !== "source" ? /* @__PURE__ */ r("label", { className: "deck-layout-select", children: /* @__PURE__ */ r(
              "select",
              {
                "aria-label": "Layout de la slide",
                value: v.layout.name,
                onChange: (t) => {
                  o != null && o.createVersionBeforeDestructiveAction && O("before-layout-change", "Before layout change");
                  const a = An(
                    b,
                    v.id,
                    t.currentTarget.value,
                    x.layouts
                  );
                  Rt(a.diagnostics), q(a.source, "layout-change");
                },
                disabled: f,
                children: Array.from(x.layouts.values()).map((t) => /* @__PURE__ */ r("option", { value: t.name, children: t.displayName }, t.name))
              }
            ) }) : null }),
            /* @__PURE__ */ c("div", { className: "deck-studio-actions", children: [
              nt ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  className: "deck-studio-fullscreen-preview-button",
                  onClick: () => We(!0),
                  disabled: !A,
                  children: nn
                }
              ) : null,
              B.showSourceModeToggle && ue.length > 1 ? /* @__PURE__ */ c("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ r("span", { children: "Editor view" }),
                /* @__PURE__ */ r(
                  "select",
                  {
                    value: le,
                    onChange: (t) => Ne(t.currentTarget.value),
                    children: ue.map((t) => /* @__PURE__ */ r("option", { value: t, children: lr(t) }, t))
                  }
                )
              ] }) : null,
              /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => je(!0),
                  disabled: f,
                  children: "Global"
                }
              ),
              $.allowAddSlide ? /* @__PURE__ */ r("button", { type: "button", onClick: () => Xe(), disabled: f, children: "Add" }) : null,
              $.allowDuplicateSlide && v ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => q(Pn(b, v.id), "slide-duplicate"),
                  disabled: f,
                  children: "Duplicate"
                }
              ) : null,
              $.allowDeleteSlide && v ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: Xt,
                  disabled: f || ((A == null ? void 0 : A.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              o ? /* @__PURE__ */ c(dn, { children: [
                /* @__PURE__ */ r("button", { type: "button", onClick: $t, disabled: f || !we, children: "Save" }),
                /* @__PURE__ */ r(
                  "button",
                  {
                    type: "button",
                    className: "deck-shortcuts-help-button",
                    "aria-label": "Afficher les raccourcis clavier",
                    onClick: () => Ie(!0),
                    children: "?"
                  }
                ),
                /* @__PURE__ */ r("button", { type: "button", onClick: Bt, disabled: f || !we, children: "Cancel" })
              ] }) : /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  className: "deck-shortcuts-help-button",
                  "aria-label": "Afficher les raccourcis clavier",
                  onClick: () => Ie(!0),
                  children: "?"
                }
              )
            ] })
          ] }),
          le === "source" ? /* @__PURE__ */ r(
            Jn,
            {
              ref: Ke,
              value: b.content,
              diagnostics: Ze,
              readOnly: f,
              onChange: (t) => q({ ...b, content: t }, "raw-source-edit")
            }
          ) : le === "preview" && v ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${et}`,
              "aria-label": "Slide preview",
              tabIndex: -1,
              style: tt,
              children: /* @__PURE__ */ r(mt, { slide: v, target: "screen", renderers: x.renderers })
            }
          ) : v ? /* @__PURE__ */ c("div", { className: "deck-studio-editor", children: [
            /* @__PURE__ */ r(
              Wn,
              {
                source: b,
                slideId: v.id,
                fields: v.layout.definition.editor.fieldGroups.flatMap((t) => t.fields),
                inheritedMarkdownSlots: Ht,
                readOnly: !!f,
                onUpdate: q
              }
            ),
            Object.keys(it).length > 0 ? /* @__PURE__ */ c("section", { className: "deck-unassigned-slots", "aria-label": "Slots non assignes", children: [
              /* @__PURE__ */ c("header", { children: [
                /* @__PURE__ */ r("strong", { children: "Contenus conserves hors rendu" }),
                /* @__PURE__ */ r("span", { children: "Ces blocs ne sont pas affiches par le layout actuel." })
              ] }),
              Object.entries(it).map(([t, a]) => /* @__PURE__ */ c("article", { children: [
                /* @__PURE__ */ c("div", { children: [
                  /* @__PURE__ */ r("strong", { children: t }),
                  /* @__PURE__ */ r("pre", { children: dr(a) })
                ] }),
                /* @__PURE__ */ r(
                  "button",
                  {
                    type: "button",
                    onClick: () => q(
                      $n(b, v.id, t),
                      "layout-change",
                      v.id
                    ),
                    disabled: f,
                    children: "Restaurer"
                  }
                )
              ] }, t))
            ] }) : null
          ] }) : (S == null ? void 0 : S.status) === "invalid" ? /* @__PURE__ */ r(wn, { fallback: S.fallback }) : null,
          B.showActiveSlidePreview && le !== "preview" && v ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview ${et}`,
              "aria-label": "Active slide preview",
              style: tt,
              children: /* @__PURE__ */ r(mt, { slide: v, target: "screen", renderers: x.renderers })
            }
          ) : null
        ] }),
        B.showInspector ? /* @__PURE__ */ c("aside", { className: "deck-studio-inspector", style: { width: B.inspectorWidthPx }, children: [
          B.showDiagnosticsPanel ? /* @__PURE__ */ c("section", { children: [
            /* @__PURE__ */ r("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ r(Nt, { diagnostics: Ze, onDiagnosticClick: an })
          ] }) : null,
          (B.showVersionHistory || At) && o ? /* @__PURE__ */ r(
            rr,
            {
              versions: Tt,
              readOnly: !!f,
              canRestore: $.allowVersionRestore,
              canCompare: $.allowVersionCompare,
              onCreateManualVersion: (t) => {
                re(b, v == null ? void 0 : v.id), O("manual", t ?? "Manual save");
              },
              onRestoreVersion: (t) => void Je(t),
              onDeleteVersion: (t) => void Ot(t),
              onRenameVersion: (t, a) => void Et(t, a),
              onCompareWithCurrent: (t) => void Qe(t),
              onCompareVersions: (t, a) => void Wt(t, a)
            }
          ) : null
        ] }) : null,
        It ? /* @__PURE__ */ r(
          _n,
          {
            source: b,
            readOnly: !!f,
            onUpdate: q,
            onClose: () => je(!1)
          }
        ) : null,
        A && nt ? /* @__PURE__ */ r(
          hn,
          {
            deck: A,
            initialSlideId: v == null ? void 0 : v.id,
            open: xt,
            options: ee == null ? void 0 : ee.options,
            onOpenChange: (t) => We(t.open)
          }
        ) : null,
        P ? /* @__PURE__ */ r(
          zn,
          {
            draft: P.draft,
            current: P.current,
            versions: P.versions,
            onRestoreDraft: () => void Ut(),
            onRestoreVersion: (t) => {
              X(null), Je(t);
            },
            onPreviewDraft: Yt,
            onPreviewVersion: (t) => void jt(t),
            onCompareDraftWithCurrent: qt,
            onCompareVersionWithCurrent: (t) => void Qe(t),
            onCreateCopyFromDraft: () => void Gt(),
            onCreateCopyFromVersion: (t) => void Kt(t),
            onDeleteDraft: () => void _t(),
            onKeepCurrent: () => void zt(),
            onOpenVersionHistory: () => {
              Ce(!0), X(null);
            }
          }
        ) : null,
        ie ? /* @__PURE__ */ r(
          Xn,
          {
            title: ie.title,
            leftLabel: ie.leftLabel,
            leftSource: ie.leftSource,
            rightLabel: ie.rightLabel,
            rightSource: ie.rightSource,
            onClose: () => ge(null)
          }
        ) : null,
        ve ? /* @__PURE__ */ r(
          sr,
          {
            title: ve.title,
            label: ve.label,
            source: ve.source,
            onClose: () => Ve(null)
          }
        ) : null,
        Mt ? /* @__PURE__ */ r(ir, { onClose: () => Ie(!1) }) : null
      ]
    }
  );
}
function ir({ onClose: e }) {
  return /* @__PURE__ */ r("div", { className: "deck-modal-backdrop", role: "presentation", children: /* @__PURE__ */ c(
    "section",
    {
      "aria-labelledby": "deck-shortcuts-title",
      "aria-modal": "true",
      className: "deck-modal-dialog deck-shortcuts-dialog",
      role: "dialog",
      children: [
        /* @__PURE__ */ c("header", { children: [
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ r("p", { children: "Aide" }),
            /* @__PURE__ */ r("h3", { id: "deck-shortcuts-title", children: "Raccourcis clavier" })
          ] }),
          /* @__PURE__ */ r("button", { type: "button", onClick: e, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("dl", { className: "deck-shortcuts-list", children: [
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ r("dt", { children: "Ctrl + M" }),
            /* @__PURE__ */ r("dd", { children: "Ajouter une slide avec le layout par défaut." })
          ] }),
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ r("dt", { children: "Ctrl + Maj + M" }),
            /* @__PURE__ */ r("dd", { children: "Ajouter une slide avec le même layout que la slide sélectionnée." })
          ] })
        ] })
      ]
    }
  ) });
}
function or() {
  const e = "deck-runtime-session-id", s = window.sessionStorage.getItem(e);
  if (s)
    return s;
  const n = Be();
  return window.sessionStorage.setItem(e, n), n;
}
function Be() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
function lr(e) {
  return e === "source" ? "YAML" : e === "preview" ? "Preview" : "Form";
}
function cr(e) {
  const s = e.slots.get("title"), n = (s == null ? void 0 : s.content.kind) === "markdown" ? s.content.markdown : void 0;
  return (n == null ? void 0 : n.split(/\r?\n/).map((l) => l.replace(/^#{1,6}\s+/, "").trim()).find((l) => l.length > 0)) ?? `Slide ${e.index + 1}`;
}
function dr(e) {
  if (typeof e == "string")
    return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function wt(e, s) {
  return typeof e != "number" || !Number.isFinite(e) ? s : Math.max(1, Math.round(e));
}
function St(e) {
  const s = e.currentTarget.getBoundingClientRect();
  return s.height <= 0 || e.clientY > s.top + s.height / 2 ? "after" : "before";
}
export {
  Nr as D,
  wn as a
};
