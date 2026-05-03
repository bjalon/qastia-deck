import { jsxs as c, jsx as r, Fragment as rn } from "react/jsx-runtime";
import { forwardRef as an, useRef as j, useImperativeHandle as sn, useEffect as J, useState as P, useMemo as ae, useCallback as T } from "react";
import { h as E, c as lt, s as ct } from "./hash-DKSnHqZ3.js";
import { L as on, d as ln } from "./defaultDeckRuntime-BXRoImNr.js";
import { d as cn } from "./ContentRenderer-D7lDas0N.js";
import { S as dt } from "./SlideRenderer-fwLgdQAA.js";
import kt from "yaml";
import { yaml as dn } from "@codemirror/lang-yaml";
import { EditorState as ut } from "@codemirror/state";
import { EditorView as le, lineNumbers as un, highlightActiveLine as fn, keymap as hn } from "@codemirror/view";
function mn({ fallback: e }) {
  return /* @__PURE__ */ c("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ r("header", { children: /* @__PURE__ */ r("h2", { children: e.title }) }),
    /* @__PURE__ */ r(yt, { diagnostics: e.diagnostics }),
    /* @__PURE__ */ r("pre", { children: e.source.content })
  ] });
}
function yt({
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
const pn = {
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
}, gn = {
  allowAddSlide: !0,
  allowDuplicateSlide: !0,
  allowDeleteSlide: !0,
  allowReorderSlides: !0,
  allowLayoutChange: !0,
  allowThemeChange: !0,
  allowRawSourceEdit: !0,
  allowPdfExport: !0,
  allowVersionRestore: !0,
  allowVersionCompare: !0
}, Me = {
  adapter: new on(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, vn = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function W(e) {
  try {
    const s = kt.parse(e.content);
    return L(s) ? s : null;
  } catch {
    return null;
  }
}
function ee(e, s) {
  return {
    ...e,
    content: kt.stringify(s, { lineWidth: 0 })
  };
}
function Q(e) {
  return Array.isArray(e.slides) || (e.slides = []), e.slides.filter(L);
}
function Re(e, s, n, i) {
  return Se(e, s, (l) => {
    const h = Be(l);
    h[n] = { markdown: i };
  });
}
function bn(e, s, n) {
  return Se(e, s, (i) => {
    L(i.slots) && (delete i.slots[n], Object.keys(i.slots).length === 0 && delete i.slots);
  });
}
function kn(e, s, n) {
  return $e(e, s, n) !== void 0;
}
function Fe(e, s) {
  const n = wt(e, s);
  return L(n) && typeof n.markdown == "string" ? n.markdown : "";
}
function yn(e, s) {
  return wt(e, s) !== void 0;
}
function ft(e, s, n) {
  const i = W(e);
  if (!i)
    return e;
  const l = Rn(i);
  return l[s] = { markdown: n }, ee(e, i);
}
function wn(e, s) {
  const n = W(e);
  return n ? (L(n.metadata) || (n.metadata = {}), n.metadata.title = s, ee(e, n)) : e;
}
function Pe(e, s, n, i) {
  return Se(e, s, (l) => {
    const h = Be(l);
    h[n] = {
      image: Ln({
        assetId: i.assetId,
        src: i.src,
        alt: i.alt
      })
    };
  });
}
function Sn(e, s, n, i) {
  const l = W(e);
  if (!l)
    return ht(e);
  const h = Q(l), d = h.find((N) => N.id === s);
  if (!d)
    return ht(e);
  const u = i && d.layout && d.layout !== n ? Pn(d, n, i) : {
    slots: L(d.slots) ? d.slots : {},
    unassignedSlots: L(d.unassignedSlots) ? d.unassignedSlots : {},
    diagnostics: [],
    movedSlots: []
  };
  return d.slots = u.slots, Object.keys(u.unassignedSlots).length > 0 ? d.unassignedSlots = u.unassignedSlots : delete d.unassignedSlots, d.layout = n, l.slides = h, {
    source: ee(e, l),
    diagnostics: u.diagnostics,
    movedSlots: u.movedSlots,
    unassignedSlots: Object.keys(u.unassignedSlots)
  };
}
function Dn(e, s = "title-body", n) {
  const i = W(e);
  if (!i)
    return { source: e };
  const l = Q(i), h = St(l, "slide"), d = {
    id: h,
    layout: s,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }, u = n ? l.findIndex((N) => N.id === n) : -1;
  return l.splice(u >= 0 ? u + 1 : l.length, 0, d), i.slides = l, { source: ee(e, i), slideId: h };
}
function Nn(e, s) {
  const n = W(e);
  if (!n)
    return e;
  const i = Q(n), l = i.findIndex((d) => d.id === s);
  if (l < 0)
    return e;
  const h = structuredClone(i[l]);
  return h.id = St(i, `${s}-copy`), i.splice(l + 1, 0, h), n.slides = i, ee(e, n);
}
function Cn(e, s) {
  const n = W(e);
  if (!n)
    return e;
  const i = Q(n).filter((l) => l.id !== s);
  return n.slides = i.length > 0 ? i : Q(n), ee(e, n);
}
function Vn(e, s, n, i) {
  if (s === n)
    return e;
  const l = W(e);
  if (!l)
    return e;
  const h = Q(l), d = h.findIndex((y) => y.id === s), u = h.findIndex((y) => y.id === n);
  if (d < 0 || u < 0)
    return e;
  const [N] = h.splice(d, 1), w = h.findIndex((y) => y.id === n), m = i === "after" ? w + 1 : w;
  return h.splice(m, 0, N), l.slides = h, ee(e, l);
}
function In(e, s, n) {
  const i = $e(e, s, n);
  return L(i) && typeof i.markdown == "string" ? i.markdown : "";
}
function xn(e, s, n) {
  const i = $e(e, s, n), l = L(i) && L(i.image) ? i.image : {};
  return {
    assetId: typeof l.assetId == "string" ? l.assetId : "",
    src: typeof l.src == "string" ? l.src : "",
    alt: typeof l.alt == "string" ? l.alt : ""
  };
}
function An(e, s) {
  const n = W(e);
  if (!n)
    return {};
  const i = Q(n).find((l) => l.id === s);
  return L(i == null ? void 0 : i.unassignedSlots) ? i.unassignedSlots : {};
}
function Mn(e, s, n) {
  return Se(e, s, (i) => {
    if (!L(i.unassignedSlots) || !(n in i.unassignedSlots))
      return;
    const l = Be(i);
    l[n] = i.unassignedSlots[n], delete i.unassignedSlots[n], Object.keys(i.unassignedSlots).length === 0 && delete i.unassignedSlots;
  });
}
function Se(e, s, n) {
  const i = W(e);
  if (!i)
    return e;
  const l = Q(i), h = l.find((d) => d.id === s);
  return h ? (n(h), i.slides = l, ee(e, i)) : e;
}
function $e(e, s, n) {
  var h;
  const i = W(e);
  if (!i)
    return;
  const l = Q(i).find((d) => d.id === s);
  return (h = l == null ? void 0 : l.slots) == null ? void 0 : h[n];
}
function wt(e, s) {
  var i;
  const n = W(e);
  if (n)
    return L((i = n.defaults) == null ? void 0 : i.slots) ? n.defaults.slots[s] : void 0;
}
function Be(e) {
  return L(e.slots) || (e.slots = {}), e.slots;
}
function Rn(e) {
  return L(e.defaults) || (e.defaults = {}), L(e.defaults.slots) || (e.defaults.slots = {}), e.defaults.slots;
}
function Pn(e, s, n) {
  var C, V;
  const i = L(e.slots) ? e.slots : {}, l = L(e.unassignedSlots) ? e.unassignedSlots : {}, h = n.get(s), d = e.layout ? (V = (C = n.get(s)) == null ? void 0 : C.migrateFrom) == null ? void 0 : V[e.layout] : void 0, u = {}, N = { ...l }, w = /* @__PURE__ */ new Set(), m = [], y = [];
  if (d)
    for (const f of d.operations)
      f.kind === "move-slot" && f.from in i && (u[f.to] = i[f.from], w.add(f.from), y.push({ from: f.from, to: f.to }), f.from !== f.to && m.push(Te(
        "info",
        `Le contenu du slot '${f.from}' a ete deplace vers '${f.to}'.`,
        e.id
      ))), (f.kind === "drop-slot" || f.kind === "keep-unassigned") && f.slotName in i && (N[f.slotName] = i[f.slotName], w.add(f.slotName), m.push(Te(
        "warning",
        `Le slot '${f.slotName}' a ete conserve hors rendu: ${f.reason}`,
        e.id
      )));
  for (const [f, D] of Object.entries(i))
    if (!w.has(f)) {
      if (h && Tn(h, f) && !(f in u)) {
        u[f] = D;
        continue;
      }
      N[f] = D, m.push(Te(
        "warning",
        `Le slot '${f}' ne correspond pas au layout '${s}' et a ete conserve hors rendu.`,
        e.id
      ));
    }
  return {
    slots: u,
    unassignedSlots: N,
    diagnostics: m,
    movedSlots: y
  };
}
function Tn(e, s) {
  return e.requiredSlots.includes(s) || e.optionalSlots.includes(s);
}
function Te(e, s, n) {
  return {
    code: "LAYOUT_UNASSIGNED_SLOT",
    severity: e,
    message: s,
    slideId: n,
    hint: "Le contenu reste disponible dans les slots non assignes du YAML."
  };
}
function ht(e) {
  return {
    source: e,
    diagnostics: [],
    movedSlots: [],
    unassignedSlots: []
  };
}
function St(e, s) {
  const n = new Set(e.map((h) => h.id).filter((h) => !!h));
  let i = mt(s), l = 2;
  for (; n.has(i); )
    i = `${mt(s)}-${l}`, l += 1;
  return i;
}
function mt(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function Ln(e) {
  return Object.fromEntries(
    Object.entries(e).filter((s) => !!s[1])
  );
}
function L(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Fn({
  fields: e,
  inheritedMarkdownSlots: s,
  onUpdate: n,
  readOnly: i,
  slideId: l,
  source: h
}) {
  return /* @__PURE__ */ r("form", { className: "deck-slide-form", children: e.map((d) => /* @__PURE__ */ r(
    Hn,
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
function Hn({
  source: e,
  slideId: s,
  field: n,
  inheritedMarkdownSlots: i,
  readOnly: l,
  onUpdate: h
}) {
  if (n.kind === "markdown") {
    const d = n.blockKind === "heading" || n.slotName === "title", u = $n(n.slotName) ? i == null ? void 0 : i.get(n.slotName) : void 0, N = u !== void 0, w = N && kn(e, s, n.slotName), m = N && !w ? u : In(e, s, n.slotName), y = d || Bn(n), C = y ? On(m, d) : m, V = l || N && !w, f = y ? /* @__PURE__ */ r(
      "input",
      {
        "aria-label": n.label,
        className: "deck-form-input",
        placeholder: " ",
        value: C,
        onFocus: (D) => D.currentTarget.select(),
        onChange: (D) => h(
          Re(e, s, n.slotName, D.currentTarget.value),
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
        onFocus: (D) => En(D.currentTarget),
        onChange: (D) => h(
          Re(e, s, n.slotName, D.currentTarget.value),
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
                  D.currentTarget.checked ? Re(e, s, n.slotName, u) : bn(e, s, n.slotName),
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
    const d = xn(e, s, n.slotName);
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
              Pe(e, s, n.slotName, {
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
              Pe(e, s, n.slotName, {
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
              Pe(e, s, n.slotName, {
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
function $n(e) {
  return e === "eyebrow" || e === "footer";
}
function Bn(e) {
  return e.kind !== "markdown" ? !1 : e.minRows === 1 || e.slotName === "eyebrow" || e.slotName === "subtitle" || e.slotName === "footer";
}
function On(e, s) {
  return (s ? e.replace(/^(\s*)#{1,6}\s+/u, "$1") : e).replace(/\s*\n\s*/gu, " ").trim();
}
function En(e) {
  const s = e.value.length;
  e.setSelectionRange(s, s);
}
function jn({
  onClose: e,
  onUpdate: s,
  readOnly: n,
  source: i
}) {
  const l = Fe(i, "eyebrow"), h = Fe(i, "footer");
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
                  ft(i, "eyebrow", d.currentTarget.value),
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
                  ft(i, "footer", d.currentTarget.value),
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
function Wn({
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
  onCreateCopyFromVersion: m,
  onDeleteDraft: y,
  onKeepCurrent: C,
  onOpenVersionHistory: V
}) {
  const f = n.slice(0, 4), D = Le(e.updatedAtIso), p = s ? Le(s.updatedAtIso) : "Aucune sauvegarde courante";
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
              /* @__PURE__ */ r("span", { className: "deck-recovery-status", "data-status": e.compilerStatus, children: pt(e.compilerStatus) })
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
                /* @__PURE__ */ r("dd", { children: p })
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
                    Le(x.createdAtIso),
                    " - ",
                    pt(x.compilerStatus)
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
                /* @__PURE__ */ r("button", { type: "button", onClick: () => m(x.id), children: "Copier" })
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
function Le(e) {
  return new Date(e).toLocaleString(void 0, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
function pt(e) {
  return e === "valid" ? "utilisable" : e === "degraded" ? "avec alertes" : "avec erreurs";
}
const Un = an(
  function({
    value: s,
    diagnostics: n,
    readOnly: i = !1,
    onChange: l
  }, h) {
    const d = j(null), u = j(null), N = j(l), w = j(s);
    N.current = l, w.current = s, sn(h, () => ({
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
          effects: le.scrollIntoView(f, { y: "center" })
        }), C.focus();
      }
    }), []), J(() => {
      const y = d.current;
      if (!y)
        return;
      const C = new le({
        parent: y,
        state: ut.create({
          doc: w.current,
          extensions: [
            un(),
            fn(),
            dn(),
            le.lineWrapping,
            le.editable.of(!i),
            ut.readOnly.of(i),
            hn.of([]),
            le.updateListener.of((V) => {
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
    const m = n.filter((y) => y.range);
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
      m.length > 0 ? /* @__PURE__ */ r("ul", { className: "deck-source-diagnostic-lines", "aria-label": "Diagnostics source YAML", children: m.map((y, C) => {
        var V;
        return /* @__PURE__ */ r("li", { children: /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            onClick: () => u.current ? Yn(u.current, y) : void 0,
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
function Yn(e, s) {
  var l;
  const n = (l = s.range) == null ? void 0 : l.start.offset;
  if (n === void 0) {
    e.focus();
    return;
  }
  const i = Math.min(Math.max(n, 0), e.state.doc.length);
  e.dispatch({
    selection: { anchor: i },
    effects: le.scrollIntoView(i, { y: "center" })
  }), e.focus();
}
function qn({
  title: e,
  leftLabel: s,
  leftSource: n,
  rightLabel: i,
  rightSource: l,
  onClose: h
}) {
  const d = Gn(n, l), u = d.filter((w) => w.kind === "added").length, N = d.filter((w) => w.kind === "removed").length;
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
        /* @__PURE__ */ r("pre", { className: "deck-diff-view", "aria-label": "Diff des versions", children: d.map((w, m) => /* @__PURE__ */ c("div", { className: "deck-diff-line", "data-kind": w.kind, children: [
          /* @__PURE__ */ r("span", { className: "deck-diff-marker", children: _n(w.kind) }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: w.leftNumber ?? "" }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: w.rightNumber ?? "" }),
          /* @__PURE__ */ r("code", { children: w.content || " " })
        ] }, `${m}-${w.kind}`)) })
      ]
    }
  ) });
}
function Gn(e, s) {
  const n = gt(e), i = gt(s), l = Kn(n, i), h = [];
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
function gt(e) {
  const s = e.replace(/\r\n/g, `
`).split(`
`);
  return s.at(-1) === "" ? s.slice(0, -1) : s;
}
function Kn(e, s) {
  const n = Array.from(
    { length: e.length + 1 },
    () => Array.from({ length: s.length + 1 }, () => 0)
  );
  for (let i = e.length - 1; i >= 0; i -= 1)
    for (let l = s.length - 1; l >= 0; l -= 1)
      n[i][l] = e[i] === s[l] ? n[i + 1][l + 1] + 1 : Math.max(n[i + 1][l], n[i][l + 1]);
  return n;
}
function _n(e) {
  return e === "added" ? "+" : e === "removed" ? "-" : " ";
}
const zn = [
  "before-layout-change",
  "before-slide-delete",
  "before-version-restore"
];
function Jn({
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
  const [m, y] = P("all"), [C, V] = P(""), [f, D] = P(null), [p, x] = P(""), [U, fe] = P(null), he = ae(
    () => e.filter((k) => m === "all" ? !0 : m === "safety" ? zn.includes(k.reason) : k.reason === m),
    [m, e]
  );
  function b() {
    l(C.trim() || void 0), V("");
  }
  function S(k) {
    D(k.id), x(k.label ?? k.reason);
  }
  function me() {
    if (!f)
      return;
    const k = p.trim();
    k && u(f, k), D(null), x("");
  }
  function H(k) {
    if (!U) {
      fe(k);
      return;
    }
    U !== k && w(U, k), fe(null);
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
            value: m,
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
    /* @__PURE__ */ r("ul", { className: "deck-version-list", children: he.map((k) => /* @__PURE__ */ c("li", { children: [
      f === k.id ? /* @__PURE__ */ c("div", { className: "deck-version-rename", children: [
        /* @__PURE__ */ r(
          "input",
          {
            "aria-label": "Renommer version",
            value: p,
            onChange: (_) => x(_.currentTarget.value),
            onKeyDown: (_) => {
              _.key === "Enter" && (_.preventDefault(), me()), _.key === "Escape" && (_.preventDefault(), D(null));
            }
          }
        ),
        /* @__PURE__ */ r("button", { type: "button", onClick: me, children: "OK" })
      ] }) : /* @__PURE__ */ r("strong", { children: k.label ?? k.reason }),
      /* @__PURE__ */ c("small", { children: [
        Qn(k.reason),
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
    he.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucune version." }) : null
  ] });
}
function Qn(e) {
  return e === "autosave" ? "Autosave" : e === "manual" ? "Manuelle" : e === "crash-recovery" ? "Recovery" : e.startsWith("before-") ? "Sécurité" : e === "external-save" ? "Externe" : "Import";
}
function Xn({
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
function gr(e) {
  var at, st;
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
    onError: m,
    onRestoreVersion: y,
    onSave: C,
    onSelectedSlideChange: V,
    readOnly: f,
    storage: D
  } = e, p = e.options, x = e.runtime ?? ln, U = e.mode === "controlled", [fe, he] = P(
    U ? e.value : e.initialValue
  ), b = U ? e.value : fe, [S, me] = P(null), [H, k] = P(
    l
  ), [_, De] = P(
    ((at = p == null ? void 0 : p.editing) == null ? void 0 : at.defaultMode) ?? "form"
  ), [Dt, Oe] = P(!1), [Nt, Ne] = P(!1), [M, X] = P(null), [se, pe] = P(null), [ge, Ce] = P(null), [Ct, Ve] = P(!1), [Vt, It] = P([]), [xt, Ie] = P(!1), [Ee, ve] = P(""), [R, ie] = P(null), [At, Mt] = P([]), [xe, je] = P(b), [Ae, We] = P(
    l
  ), Ue = j(null), Ye = j(null), be = j(w), ke = j(m), ce = j(null), qe = j(!1), Ge = j(null);
  be.current = w, ke.current = m;
  const B = ae(() => {
    const t = { ...pn, ...h }, a = p == null ? void 0 : p.panels;
    return (a == null ? void 0 : a.slideRail) === !1 ? t.showSlideRail = !1 : a != null && a.slideRail && (t.showSlideRail = a.slideRail.visibleDefault ?? t.showSlideRail, t.slideRailWidthPx = a.slideRail.widthPx ?? t.slideRailWidthPx), (a == null ? void 0 : a.inspector) === !1 ? t.showInspector = !1 : a != null && a.inspector && (t.showInspector = a.inspector.visibleDefault ?? t.showInspector, t.inspectorWidthPx = a.inspector.widthPx ?? t.inspectorWidthPx), (a == null ? void 0 : a.diagnostics) === !1 ? t.showDiagnosticsPanel = !1 : a != null && a.diagnostics && (t.showDiagnosticsPanel = a.diagnostics.visibleDefault ?? t.showDiagnosticsPanel), (a == null ? void 0 : a.activeSlidePreview) === !1 ? t.showActiveSlidePreview = !1 : a != null && a.activeSlidePreview && (t.showActiveSlidePreview = a.activeSlidePreview.visibleDefault ?? t.showActiveSlidePreview), (a == null ? void 0 : a.versionHistory) === !1 ? t.showVersionHistory = !1 : a != null && a.versionHistory && (t.showVersionHistory = a.versionHistory.visibleDefault ?? t.showVersionHistory), t;
  }, [h, p]), $ = ae(() => {
    var g, I, F, G, K;
    const t = { ...gn, ...i }, a = ((g = p == null ? void 0 : p.editing) == null ? void 0 : g.allowYamlMode) ?? ((I = p == null ? void 0 : p.editing) == null ? void 0 : I.allowSourceMode);
    return a !== void 0 && (t.allowRawSourceEdit = a), ((F = p == null ? void 0 : p.editing) == null ? void 0 : F.allowLayoutChange) !== void 0 && (t.allowLayoutChange = p.editing.allowLayoutChange), ((G = p == null ? void 0 : p.layoutSelector) == null ? void 0 : G.enabled) !== void 0 && (t.allowLayoutChange = p.layoutSelector.enabled), (K = p == null ? void 0 : p.panels) != null && K.slideRail && (p.panels.slideRail.allowReorder !== void 0 && (t.allowReorderSlides = p.panels.slideRail.allowReorder), p.panels.slideRail.allowAddDelete !== void 0 && (t.allowAddSlide = p.panels.slideRail.allowAddDelete, t.allowDeleteSlide = p.panels.slideRail.allowAddDelete)), t;
  }, [i, p]), de = ae(() => {
    var G, K, it, ot;
    const t = ((G = p == null ? void 0 : p.editing) == null ? void 0 : G.allowYamlMode) ?? ((K = p == null ? void 0 : p.editing) == null ? void 0 : K.allowSourceMode) ?? !0, a = ((it = p == null ? void 0 : p.editing) == null ? void 0 : it.allowPreviewMode) ?? !0, F = (((ot = p == null ? void 0 : p.editing) == null ? void 0 : ot.viewModes) ?? ["form", "source", "preview"]).filter(
      (re, tn, nn) => (re === "form" || re === "source" || re === "preview") && nn.indexOf(re) === tn
    ).filter((re) => re === "source" ? t && $.allowRawSourceEdit : re === "preview" ? a : !0);
    return F.length > 0 ? F : ["form"];
  }, [$.allowRawSourceEdit, p]), o = ae(
    () => D === !1 ? void 0 : {
      ...Me,
      namespace: u ?? (D == null ? void 0 : D.namespace) ?? Me.namespace,
      adapter: (D == null ? void 0 : D.adapter) ?? x.storage ?? Me.adapter,
      ...D
    },
    [u, x.storage, D]
  ), te = ae(
    () => s === !1 ? void 0 : { ...vn, ...s },
    [s]
  ), A = (S == null ? void 0 : S.status) === "valid" || (S == null ? void 0 : S.status) === "degraded" ? S.deck : void 0, v = (A == null ? void 0 : A.slides.find((t) => t.id === H)) ?? (A == null ? void 0 : A.slides[0]), ye = E(b.content) !== E(xe.content), Rt = ae(() => {
    const t = /* @__PURE__ */ new Map();
    for (const a of ["eyebrow", "footer"])
      yn(b, a) && t.set(a, Fe(b, a));
    return t;
  }, [b]), Z = T(
    (t, a, g) => {
      const I = {
        reason: a,
        deckId: n,
        selectedSlideId: g ?? H,
        sourceHash: E(t.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      U || he(t), N == null || N(t, I);
    },
    [U, n, N, H]
  );
  J(() => {
    let t = !1;
    return lt(b, {
      runtime: x,
      mode: "editor"
    }).then((a) => {
      var g;
      t || (me(a), (g = be.current) == null || g.call(be, a));
    }).catch((a) => {
      var g;
      (g = ke.current) == null || g.call(ke, {
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
    !(o != null && o.recoverOnMount) || qe.current || (qe.current = !0, Promise.all([
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
      m == null || m({
        message: t instanceof Error ? t.message : "Unable to inspect deck recovery state.",
        cause: t
      });
    }));
  }, [n, m, Z, b.content, o]), J(() => {
    if (!o || !te || !o.saveDraftOnChange)
      return;
    const t = window.setTimeout(() => {
      o.adapter.saveDraft({
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: er(),
        source: b,
        sourceHash: E(b.content),
        selectedSlideId: H,
        compilerStatus: (S == null ? void 0 : S.status) ?? "invalid"
      });
    }, te.draftDebounceMs);
    return () => window.clearTimeout(t);
  }, [te, S, n, H, b, o]);
  const Y = T(() => {
    o && o.adapter.listVersions({ deckId: n, namespace: o.namespace }).then(Mt).catch((t) => {
      m == null || m({
        message: t instanceof Error ? t.message : "Unable to list deck versions.",
        cause: t
      });
    });
  }, [n, m, o]);
  J(() => {
    Y();
  }, [Y]);
  const O = T(
    async (t, a) => {
      var F;
      if (!o)
        return;
      const g = (S == null ? void 0 : S.diagnostics) ?? [], I = await o.adapter.createVersion({
        id: He(),
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
        diagnosticsSummary: ct(g),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      I.status !== "success" && (m == null || m({ message: ((F = I.diagnostics[0]) == null ? void 0 : F.message) ?? "Unable to save deck version." })), Y();
    },
    [S, n, m, Y, H, b, o]
  ), we = T(
    async (t, a, g, I) => {
      var K;
      if (!o)
        return;
      const F = await lt(t, {
        runtime: x,
        mode: "editor"
      }), G = await o.adapter.createVersion({
        id: He(),
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
        diagnosticsSummary: ct(F.diagnostics),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      G.status !== "success" && (m == null || m({ message: ((K = G.diagnostics[0]) == null ? void 0 : K.message) ?? "Unable to save deck version." })), Y();
    },
    [n, d, m, Y, x, o]
  );
  J(() => {
    if (!o || !te || !o.saveDraftOnChange || te.createVersionOnValidDeckOnly && (S == null ? void 0 : S.status) === "invalid")
      return;
    const t = window.setTimeout(() => {
      const a = E(b.content);
      Ge.current !== a && (Ge.current = a, O("autosave", "Autosave"));
    }, te.versionIntervalMs);
    return () => window.clearTimeout(t);
  }, [te, S == null ? void 0 : S.status, O, b.content, o]);
  const Pt = T(() => {
    o && (o.adapter.saveCurrent({
      deckId: n,
      namespace: o.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: b,
      sourceHash: E(b.content),
      selectedSlideId: H
    }), o.createVersionOnManualSave && O("manual", "Manual save"), je(b), We(H), C == null || C({
      deckId: n,
      sourceHash: E(b.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [O, n, C, H, b, o]), ne = T(
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
        m == null || m({ message: ((I = g.diagnostics[0]) == null ? void 0 : I.message) ?? "Unable to save current deck." });
        return;
      }
      je(t), We(a);
    },
    [n, m, o]
  ), Tt = T(() => {
    !ye || !window.confirm(
      "Annuler les modifications non sauvegardées et revenir à la dernière version sauvegardée ?"
    ) || (k(Ae), Z(xe, "cancel-edit", Ae));
  }, [Ae, xe, Z, ye]), Ke = T(
    async (t) => {
      if (!o)
        return;
      o.createVersionBeforeDestructiveAction && await O("before-version-restore", "Before restore");
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a && (k(a.selectedSlideId), Z(a.source, "version-restore", a.selectedSlideId), await ne(a.source, a.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), y == null || y({
        deckId: n,
        versionId: t,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [O, n, y, Z, ne, o]
  ), Lt = T(
    async (t) => {
      var g;
      if (!o)
        return;
      const a = await o.adapter.deleteVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a.status !== "success" && (m == null || m({ message: ((g = a.diagnostics[0]) == null ? void 0 : g.message) ?? "Unable to delete deck version." })), Y();
    },
    [n, m, Y, o]
  ), Ft = T(
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
      I.status !== "success" && (m == null || m({ message: ((F = I.diagnostics[0]) == null ? void 0 : F.message) ?? "Unable to rename deck version." })), Y();
    },
    [n, m, Y, o]
  ), _e = T(
    async (t) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a && pe({
        title: "Version vs courant",
        leftLabel: a.label ?? a.reason,
        leftSource: a.source.content,
        rightLabel: "Courant",
        rightSource: b.content
      });
    },
    [n, b.content, o]
  ), Ht = T(
    async (t) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a && Ce({
        title: a.label ?? a.reason,
        label: "Source YAML",
        source: a.source.content
      });
    },
    [n, o]
  ), $t = T(
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
      !g || !I || pe({
        title: "Comparaison de versions",
        leftLabel: g.label ?? g.reason,
        leftSource: g.source.content,
        rightLabel: I.label ?? I.reason,
        rightSource: I.source.content
      });
    },
    [n, o]
  ), Bt = T(async () => {
    !M || !o || (o.createVersionBeforeDestructiveAction && await O("before-version-restore", "Before recovery restore"), k(M.draft.selectedSlideId), Z(M.draft.source, "crash-recovery", M.draft.selectedSlideId), await ne(M.draft.source, M.draft.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), X(null));
  }, [O, n, Z, M, ne, o]), Ot = T(() => {
    M && Ce({
      title: "Draft local",
      label: "Source YAML",
      source: M.draft.source.content
    });
  }, [M]), Et = T(() => {
    var t;
    M && pe({
      title: "Draft vs courant",
      leftLabel: "Draft local",
      leftSource: M.draft.source.content,
      rightLabel: "Courant",
      rightSource: ((t = M.current) == null ? void 0 : t.source.content) ?? b.content
    });
  }, [M, b.content]), jt = T(async () => {
    M && (await we(
      M.draft.source,
      "manual",
      "Copie du draft de recovery",
      M.draft.selectedSlideId
    ), Ne(!0), X(null));
  }, [we, M]), Wt = T(
    async (t) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: t
      });
      a && (await we(
        a.source,
        "manual",
        `Copie - ${a.label ?? a.reason}`,
        a.selectedSlideId
      ), Ne(!0), X(null));
    },
    [we, n, o]
  ), Ut = T(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), X(null));
  }, [n, o]), Yt = T(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), await ne(b, v == null ? void 0 : v.id), X(null));
  }, [n, ne, v == null ? void 0 : v.id, b, o]);
  function qt(t) {
    ce.current = t, k(t), V == null || V({ deckId: n, slideId: t });
  }
  function q(t, a, g = v == null ? void 0 : v.id) {
    Z(t, a, g);
  }
  function ze(t = "title-body") {
    const a = Dn(b, t, v == null ? void 0 : v.id);
    a.slideId && (ce.current = a.slideId, de.includes("form") && De("form"), k(a.slideId), V == null || V({ deckId: n, slideId: a.slideId })), q(a.source, "slide-add", a.slideId);
  }
  function Gt(t) {
    !$.allowAddSlide || f || !t.ctrlKey || t.altKey || t.key.toLowerCase() !== "m" || (t.preventDefault(), t.stopPropagation(), ze(t.shiftKey && v ? v.layout.name : "title-body"));
  }
  function Kt() {
    v && (o != null && o.createVersionBeforeDestructiveAction && O("before-slide-delete", "Before slide delete"), q(Cn(b, v.id), "slide-delete"));
  }
  function _t(t, a) {
    !$.allowReorderSlides || f || (t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("application/x-qastia-slide-id", a), t.dataTransfer.setData("text/plain", a), ie({ draggedSlideId: a }));
  }
  function zt(t, a) {
    const g = R == null ? void 0 : R.draggedSlideId;
    !$.allowReorderSlides || f || !g || g === a || (t.preventDefault(), t.dataTransfer.dropEffect = "move", ie({
      draggedSlideId: g,
      targetSlideId: a,
      placement: bt(t)
    }));
  }
  function Jt(t, a) {
    const g = (R == null ? void 0 : R.draggedSlideId) || t.dataTransfer.getData("application/x-qastia-slide-id") || t.dataTransfer.getData("text/plain");
    if (!$.allowReorderSlides || f || !g || g === a) {
      ie(null);
      return;
    }
    t.preventDefault();
    const I = (R == null ? void 0 : R.targetSlideId) === a && R.placement ? R.placement : bt(t);
    ie(null), k(g), q(Vn(b, g, a, I), "slide-reorder", g), V == null || V({ deckId: n, slideId: g });
  }
  const Je = [...(S == null ? void 0 : S.diagnostics) ?? [], ...Vt], oe = de.includes(_) ? _ : de[0], Qe = (A == null ? void 0 : A.theme.cssClassName) ?? "", Xe = A ? cn(A.theme) : void 0, ue = (A == null ? void 0 : A.metadata.title) ?? "Deck", z = (st = p == null ? void 0 : p.panels) != null && st.slideRail ? p.panels.slideRail : void 0, Ze = vt(z == null ? void 0 : z.itemHeightPx, 76), et = vt(z == null ? void 0 : z.maxVisibleItems, 6), Qt = {
    "--deck-slide-rail-item-height": `${Ze}px`,
    "--deck-slide-rail-list-max-height": `${Ze * et + 8 * Math.max(0, et - 1) + 24}px`
  }, tt = (z == null ? void 0 : z.thumbnailMode) ?? "compact", nt = v ? An(b, v.id) : {};
  function Xt(t) {
    De("source"), window.setTimeout(() => {
      var a;
      (a = Ye.current) == null || a.focusDiagnostic(t);
    }, 0);
  }
  function Zt() {
    f || (ve(ue), Ie(!0));
  }
  function rt() {
    const t = Ee.trim() || ue;
    Ie(!1), ve(t), t !== ue && q(wn(b, t), "metadata-edit", v == null ? void 0 : v.id);
  }
  function en() {
    Ie(!1), ve(ue);
  }
  return J(() => {
    if (!ce.current || ce.current !== (v == null ? void 0 : v.id))
      return;
    const t = Ue.current, a = window.setTimeout(() => {
      const g = t == null ? void 0 : t.querySelector(
        ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main"
      ), I = g != null && g.matches("textarea") ? g : g == null ? void 0 : g.querySelector(
        ".cm-content, input:not([type='checkbox']):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])"
      );
      if (ce.current = null, I) {
        I.focus();
        return;
      }
      t == null || t.focus();
    }, 0);
    return () => window.clearTimeout(a);
  }, [oe, v == null ? void 0 : v.id, b.content]), /* @__PURE__ */ c(
    "div",
    {
      className: "deck-studio-root",
      "data-density": B.density,
      "data-slide-rail": B.showSlideRail ? "visible" : "hidden",
      "data-inspector": B.showInspector ? "visible" : "hidden",
      style: Qt,
      onKeyDown: Gt,
      children: [
        B.showSlideRail ? /* @__PURE__ */ c(
          "aside",
          {
            className: "deck-studio-rail",
            "data-thumbnail-mode": tt === "simplified" ? "compact" : tt,
            style: { width: B.slideRailWidthPx },
            children: [
              /* @__PURE__ */ r("header", { children: xt ? /* @__PURE__ */ r(
                "input",
                {
                  className: "deck-studio-title-input",
                  "aria-label": "Titre du slideshow",
                  value: Ee,
                  autoFocus: !0,
                  onFocus: (t) => t.currentTarget.select(),
                  onChange: (t) => ve(t.currentTarget.value),
                  onBlur: rt,
                  onKeyDown: (t) => {
                    t.key === "Enter" && (t.preventDefault(), rt()), t.key === "Escape" && (t.preventDefault(), en());
                  }
                }
              ) : /* @__PURE__ */ r(
                "strong",
                {
                  className: "deck-studio-title-label",
                  title: f ? void 0 : "Double-cliquer pour modifier",
                  onDoubleClick: Zt,
                  children: ue
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
                  onClick: () => qt(t.id),
                  onDragStart: (a) => _t(a, t.id),
                  onDragOver: (a) => zt(a, t.id),
                  onDragLeave: () => {
                    (R == null ? void 0 : R.targetSlideId) === t.id && ie({ draggedSlideId: R.draggedSlideId });
                  },
                  onDrop: (a) => Jt(a, t.id),
                  onDragEnd: () => ie(null),
                  children: [
                    /* @__PURE__ */ r("span", { children: t.index + 1 }),
                    /* @__PURE__ */ r("span", { children: nr(t) }),
                    /* @__PURE__ */ r("small", { children: t.layout.name })
                  ]
                },
                t.id
              )) })
            ]
          }
        ) : null,
        /* @__PURE__ */ c("main", { className: "deck-studio-main", ref: Ue, tabIndex: -1, children: [
          /* @__PURE__ */ c("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ r("div", { className: "deck-studio-slide-heading", children: $.allowLayoutChange && v && oe !== "source" ? /* @__PURE__ */ r("label", { className: "deck-layout-select", children: /* @__PURE__ */ r(
              "select",
              {
                "aria-label": "Layout de la slide",
                value: v.layout.name,
                onChange: (t) => {
                  o != null && o.createVersionBeforeDestructiveAction && O("before-layout-change", "Before layout change");
                  const a = Sn(
                    b,
                    v.id,
                    t.currentTarget.value,
                    x.layouts
                  );
                  It(a.diagnostics), q(a.source, "layout-change");
                },
                disabled: f,
                children: Array.from(x.layouts.values()).map((t) => /* @__PURE__ */ r("option", { value: t.name, children: t.displayName }, t.name))
              }
            ) }) : null }),
            /* @__PURE__ */ c("div", { className: "deck-studio-actions", children: [
              B.showSourceModeToggle && de.length > 1 ? /* @__PURE__ */ c("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ r("span", { children: "Editor view" }),
                /* @__PURE__ */ r(
                  "select",
                  {
                    value: oe,
                    onChange: (t) => De(t.currentTarget.value),
                    children: de.map((t) => /* @__PURE__ */ r("option", { value: t, children: tr(t) }, t))
                  }
                )
              ] }) : null,
              /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => Oe(!0),
                  disabled: f,
                  children: "Global"
                }
              ),
              $.allowAddSlide ? /* @__PURE__ */ r("button", { type: "button", onClick: () => ze(), disabled: f, children: "Add" }) : null,
              $.allowDuplicateSlide && v ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => q(Nn(b, v.id), "slide-duplicate"),
                  disabled: f,
                  children: "Duplicate"
                }
              ) : null,
              $.allowDeleteSlide && v ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: Kt,
                  disabled: f || ((A == null ? void 0 : A.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              o ? /* @__PURE__ */ c(rn, { children: [
                /* @__PURE__ */ r("button", { type: "button", onClick: Pt, disabled: f || !ye, children: "Save" }),
                /* @__PURE__ */ r(
                  "button",
                  {
                    type: "button",
                    className: "deck-shortcuts-help-button",
                    "aria-label": "Afficher les raccourcis clavier",
                    onClick: () => Ve(!0),
                    children: "?"
                  }
                ),
                /* @__PURE__ */ r("button", { type: "button", onClick: Tt, disabled: f || !ye, children: "Cancel" })
              ] }) : /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  className: "deck-shortcuts-help-button",
                  "aria-label": "Afficher les raccourcis clavier",
                  onClick: () => Ve(!0),
                  children: "?"
                }
              )
            ] })
          ] }),
          oe === "source" ? /* @__PURE__ */ r(
            Un,
            {
              ref: Ye,
              value: b.content,
              diagnostics: Je,
              readOnly: f,
              onChange: (t) => q({ ...b, content: t }, "raw-source-edit")
            }
          ) : oe === "preview" && v ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${Qe}`,
              "aria-label": "Slide preview",
              tabIndex: -1,
              style: Xe,
              children: /* @__PURE__ */ r(dt, { slide: v, target: "screen", renderers: x.renderers })
            }
          ) : v ? /* @__PURE__ */ c("div", { className: "deck-studio-editor", children: [
            /* @__PURE__ */ r(
              Fn,
              {
                source: b,
                slideId: v.id,
                fields: v.layout.definition.editor.fieldGroups.flatMap((t) => t.fields),
                inheritedMarkdownSlots: Rt,
                readOnly: !!f,
                onUpdate: q
              }
            ),
            Object.keys(nt).length > 0 ? /* @__PURE__ */ c("section", { className: "deck-unassigned-slots", "aria-label": "Slots non assignes", children: [
              /* @__PURE__ */ c("header", { children: [
                /* @__PURE__ */ r("strong", { children: "Contenus conserves hors rendu" }),
                /* @__PURE__ */ r("span", { children: "Ces blocs ne sont pas affiches par le layout actuel." })
              ] }),
              Object.entries(nt).map(([t, a]) => /* @__PURE__ */ c("article", { children: [
                /* @__PURE__ */ c("div", { children: [
                  /* @__PURE__ */ r("strong", { children: t }),
                  /* @__PURE__ */ r("pre", { children: rr(a) })
                ] }),
                /* @__PURE__ */ r(
                  "button",
                  {
                    type: "button",
                    onClick: () => q(
                      Mn(b, v.id, t),
                      "layout-change",
                      v.id
                    ),
                    disabled: f,
                    children: "Restaurer"
                  }
                )
              ] }, t))
            ] }) : null
          ] }) : (S == null ? void 0 : S.status) === "invalid" ? /* @__PURE__ */ r(mn, { fallback: S.fallback }) : null,
          B.showActiveSlidePreview && oe !== "preview" && v ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview ${Qe}`,
              "aria-label": "Active slide preview",
              style: Xe,
              children: /* @__PURE__ */ r(dt, { slide: v, target: "screen", renderers: x.renderers })
            }
          ) : null
        ] }),
        B.showInspector ? /* @__PURE__ */ c("aside", { className: "deck-studio-inspector", style: { width: B.inspectorWidthPx }, children: [
          B.showDiagnosticsPanel ? /* @__PURE__ */ c("section", { children: [
            /* @__PURE__ */ r("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ r(yt, { diagnostics: Je, onDiagnosticClick: Xt })
          ] }) : null,
          (B.showVersionHistory || Nt) && o ? /* @__PURE__ */ r(
            Jn,
            {
              versions: At,
              readOnly: !!f,
              canRestore: $.allowVersionRestore,
              canCompare: $.allowVersionCompare,
              onCreateManualVersion: (t) => {
                ne(b, v == null ? void 0 : v.id), O("manual", t ?? "Manual save");
              },
              onRestoreVersion: (t) => void Ke(t),
              onDeleteVersion: (t) => void Lt(t),
              onRenameVersion: (t, a) => void Ft(t, a),
              onCompareWithCurrent: (t) => void _e(t),
              onCompareVersions: (t, a) => void $t(t, a)
            }
          ) : null
        ] }) : null,
        Dt ? /* @__PURE__ */ r(
          jn,
          {
            source: b,
            readOnly: !!f,
            onUpdate: q,
            onClose: () => Oe(!1)
          }
        ) : null,
        M ? /* @__PURE__ */ r(
          Wn,
          {
            draft: M.draft,
            current: M.current,
            versions: M.versions,
            onRestoreDraft: () => void Bt(),
            onRestoreVersion: (t) => {
              X(null), Ke(t);
            },
            onPreviewDraft: Ot,
            onPreviewVersion: (t) => void Ht(t),
            onCompareDraftWithCurrent: Et,
            onCompareVersionWithCurrent: (t) => void _e(t),
            onCreateCopyFromDraft: () => void jt(),
            onCreateCopyFromVersion: (t) => void Wt(t),
            onDeleteDraft: () => void Ut(),
            onKeepCurrent: () => void Yt(),
            onOpenVersionHistory: () => {
              Ne(!0), X(null);
            }
          }
        ) : null,
        se ? /* @__PURE__ */ r(
          qn,
          {
            title: se.title,
            leftLabel: se.leftLabel,
            leftSource: se.leftSource,
            rightLabel: se.rightLabel,
            rightSource: se.rightSource,
            onClose: () => pe(null)
          }
        ) : null,
        ge ? /* @__PURE__ */ r(
          Xn,
          {
            title: ge.title,
            label: ge.label,
            source: ge.source,
            onClose: () => Ce(null)
          }
        ) : null,
        Ct ? /* @__PURE__ */ r(Zn, { onClose: () => Ve(!1) }) : null
      ]
    }
  );
}
function Zn({ onClose: e }) {
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
function er() {
  const e = "deck-runtime-session-id", s = window.sessionStorage.getItem(e);
  if (s)
    return s;
  const n = He();
  return window.sessionStorage.setItem(e, n), n;
}
function He() {
  const e = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${e}`;
}
function tr(e) {
  return e === "source" ? "YAML" : e === "preview" ? "Preview" : "Form";
}
function nr(e) {
  const s = e.slots.get("title"), n = (s == null ? void 0 : s.content.kind) === "markdown" ? s.content.markdown : void 0;
  return (n == null ? void 0 : n.split(/\r?\n/).map((l) => l.replace(/^#{1,6}\s+/, "").trim()).find((l) => l.length > 0)) ?? `Slide ${e.index + 1}`;
}
function rr(e) {
  if (typeof e == "string")
    return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function vt(e, s) {
  return typeof e != "number" || !Number.isFinite(e) ? s : Math.max(1, Math.round(e));
}
function bt(e) {
  const s = e.currentTarget.getBoundingClientRect();
  return s.height <= 0 || e.clientY > s.top + s.height / 2 ? "after" : "before";
}
export {
  gr as D,
  mn as a
};
