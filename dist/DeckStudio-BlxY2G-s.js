import { jsxs as c, jsx as r } from "react/jsx-runtime";
import { useState as M, useMemo as J, useRef as ie, useCallback as P, useEffect as _ } from "react";
import { h as G, c as We, s as Ee } from "./hash-BGAdcMpD.js";
import { L as It, d as xt } from "./defaultDeckRuntime-CO0C-Lgd.js";
import { d as At } from "./themeStyle-CyBLqMAf.js";
import { S as qe } from "./SlideRenderer-iimFvRrx.js";
import Ke from "yaml";
function Pt({ fallback: t }) {
  return /* @__PURE__ */ c("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ r("header", { children: /* @__PURE__ */ r("h2", { children: t.title }) }),
    /* @__PURE__ */ r(_e, { diagnostics: t.diagnostics }),
    /* @__PURE__ */ r("pre", { children: t.source.content })
  ] });
}
function _e({
  diagnostics: t
}) {
  return t.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ r("ul", { className: "deck-diagnostics-list", children: t.map((i, n) => /* @__PURE__ */ c("li", { "data-severity": i.severity, children: [
    /* @__PURE__ */ r("strong", { children: i.code }),
    /* @__PURE__ */ r("span", { children: i.message }),
    i.hint ? /* @__PURE__ */ r("small", { children: i.hint }) : null
  ] }, `${i.code}-${n}`)) });
}
const Mt = {
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
}, Rt = {
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
}, Se = {
  adapter: new It(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, Tt = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function U(t) {
  try {
    const i = Ke.parse(t.content);
    return H(i) ? i : null;
  } catch {
    return null;
  }
}
function X(t, i) {
  return {
    ...t,
    content: Ke.stringify(i, { lineWidth: 0 })
  };
}
function Q(t) {
  return Array.isArray(t.slides) || (t.slides = []), t.slides.filter(H);
}
function De(t, i, n, o) {
  return ge(t, i, (l) => {
    const u = Qe(l);
    u[n] = { markdown: o };
  });
}
function Lt(t, i, n) {
  return ge(t, i, (o) => {
    H(o.slots) && (delete o.slots[n], Object.keys(o.slots).length === 0 && delete o.slots);
  });
}
function Ft(t, i, n) {
  return xe(t, i, n) !== void 0;
}
function Ve(t, i) {
  const n = Je(t, i);
  return H(n) && typeof n.markdown == "string" ? n.markdown : "";
}
function Ht(t, i) {
  return Je(t, i) !== void 0;
}
function je(t, i, n) {
  const o = U(t);
  if (!o)
    return t;
  const l = Ut(o);
  return l[i] = { markdown: n }, X(t, o);
}
function Bt(t, i) {
  const n = U(t);
  return n ? (H(n.metadata) || (n.metadata = {}), n.metadata.title = i, X(t, n)) : t;
}
function Ne(t, i, n, o) {
  return ge(t, i, (l) => {
    const u = Qe(l);
    u[n] = {
      image: zt({
        assetId: o.assetId,
        src: o.src,
        alt: o.alt
      })
    };
  });
}
function Ot(t, i, n, o) {
  return ge(t, i, (l) => {
    o && l.layout && l.layout !== n && (l.slots = Yt(l, n, o)), l.layout = n;
  });
}
function $t(t, i = "title-body", n) {
  const o = U(t);
  if (!o)
    return { source: t };
  const l = Q(o), u = Xe(l, "slide"), d = {
    id: u,
    layout: i,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }, p = n ? l.findIndex((w) => w.id === n) : -1;
  return l.splice(p >= 0 ? p + 1 : l.length, 0, d), o.slides = l, { source: X(t, o), slideId: u };
}
function Wt(t, i) {
  const n = U(t);
  if (!n)
    return t;
  const o = Q(n), l = o.findIndex((d) => d.id === i);
  if (l < 0)
    return t;
  const u = structuredClone(o[l]);
  return u.id = Xe(o, `${i}-copy`), o.splice(l + 1, 0, u), n.slides = o, X(t, n);
}
function Et(t, i) {
  const n = U(t);
  if (!n)
    return t;
  const o = Q(n).filter((l) => l.id !== i);
  return n.slides = o.length > 0 ? o : Q(n), X(t, n);
}
function qt(t, i, n, o) {
  if (i === n)
    return t;
  const l = U(t);
  if (!l)
    return t;
  const u = Q(l), d = u.findIndex((R) => R.id === i), p = u.findIndex((R) => R.id === n);
  if (d < 0 || p < 0)
    return t;
  const [w] = u.splice(d, 1), S = u.findIndex((R) => R.id === n), m = o === "after" ? S + 1 : S;
  return u.splice(m, 0, w), l.slides = u, X(t, l);
}
function jt(t, i, n) {
  const o = xe(t, i, n);
  return H(o) && typeof o.markdown == "string" ? o.markdown : "";
}
function Gt(t, i, n) {
  const o = xe(t, i, n), l = H(o) && H(o.image) ? o.image : {};
  return {
    assetId: typeof l.assetId == "string" ? l.assetId : "",
    src: typeof l.src == "string" ? l.src : "",
    alt: typeof l.alt == "string" ? l.alt : ""
  };
}
function ge(t, i, n) {
  const o = U(t);
  if (!o)
    return t;
  const l = Q(o), u = l.find((d) => d.id === i);
  return u ? (n(u), o.slides = l, X(t, o)) : t;
}
function xe(t, i, n) {
  var u;
  const o = U(t);
  if (!o)
    return;
  const l = Q(o).find((d) => d.id === i);
  return (u = l == null ? void 0 : l.slots) == null ? void 0 : u[n];
}
function Je(t, i) {
  var o;
  const n = U(t);
  if (n)
    return H((o = n.defaults) == null ? void 0 : o.slots) ? n.defaults.slots[i] : void 0;
}
function Qe(t) {
  return H(t.slots) || (t.slots = {}), t.slots;
}
function Ut(t) {
  return H(t.defaults) || (t.defaults = {}), H(t.defaults.slots) || (t.defaults.slots = {}), t.defaults.slots;
}
function Yt(t, i, n) {
  var d, p;
  const o = H(t.slots) ? t.slots : {}, l = t.layout ? (p = (d = n.get(i)) == null ? void 0 : d.migrateFrom) == null ? void 0 : p[t.layout] : void 0;
  if (!l)
    return o;
  const u = {};
  for (const w of l.operations)
    w.kind === "move-slot" && w.from in o && (u[w.to] = o[w.from]);
  return u;
}
function Xe(t, i) {
  const n = new Set(t.map((u) => u.id).filter((u) => !!u));
  let o = Ge(i), l = 2;
  for (; n.has(o); )
    o = `${Ge(i)}-${l}`, l += 1;
  return o;
}
function Ge(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function zt(t) {
  return Object.fromEntries(
    Object.entries(t).filter((i) => !!i[1])
  );
}
function H(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function Kt({
  fields: t,
  inheritedMarkdownSlots: i,
  onUpdate: n,
  readOnly: o,
  slideId: l,
  source: u
}) {
  return /* @__PURE__ */ r("form", { className: "deck-slide-form", children: t.map((d) => /* @__PURE__ */ r(
    _t,
    {
      source: u,
      slideId: l,
      field: d,
      inheritedMarkdownSlots: i,
      readOnly: o,
      onUpdate: n
    },
    `${d.kind}-${"slotName" in d ? d.slotName : d.label}`
  )) });
}
function _t({
  source: t,
  slideId: i,
  field: n,
  inheritedMarkdownSlots: o,
  readOnly: l,
  onUpdate: u
}) {
  if (n.kind === "markdown") {
    const d = n.blockKind === "heading" || n.slotName === "title", p = Jt(n.slotName) ? o == null ? void 0 : o.get(n.slotName) : void 0, w = p !== void 0, S = w && Ft(t, i, n.slotName), m = w && !S ? p : jt(t, i, n.slotName), R = d || Qt(n), L = R ? Xt(m, d) : m, T = l || w && !S, D = R ? /* @__PURE__ */ r(
      "input",
      {
        "aria-label": n.label,
        className: "deck-form-input",
        placeholder: " ",
        value: L,
        onChange: (x) => u(
          De(t, i, n.slotName, x.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: T
      }
    ) : /* @__PURE__ */ r(
      "textarea",
      {
        "aria-label": n.label,
        className: "deck-form-textarea",
        placeholder: " ",
        rows: n.minRows ?? 4,
        value: L,
        onChange: (x) => u(
          De(t, i, n.slotName, x.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: T
      }
    );
    return /* @__PURE__ */ c(
      "div",
      {
        className: "deck-form-field",
        "data-inherited": w && !S ? "true" : void 0,
        children: [
          /* @__PURE__ */ r("span", { children: n.label }),
          /* @__PURE__ */ c("div", { className: "deck-form-field__control", children: [
            D,
            w ? /* @__PURE__ */ r("label", { className: "deck-inherited-slot-toggle", title: "Override global", children: /* @__PURE__ */ r(
              "input",
              {
                "aria-label": `Override ${n.label} global`,
                title: `Override ${n.label} global`,
                type: "checkbox",
                checked: S,
                onChange: (x) => u(
                  x.currentTarget.checked ? De(t, i, n.slotName, p) : Lt(t, i, n.slotName),
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
    const d = Gt(t, i, n.slotName);
    return /* @__PURE__ */ c("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ r("legend", { children: n.label }),
      /* @__PURE__ */ c("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ r("span", { children: "Asset id" }),
        /* @__PURE__ */ r(
          "input",
          {
            placeholder: " ",
            value: d.assetId,
            onChange: (p) => u(
              Ne(t, i, n.slotName, {
                ...d,
                assetId: p.currentTarget.value
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
            onChange: (p) => u(
              Ne(t, i, n.slotName, {
                ...d,
                src: p.currentTarget.value
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
            onChange: (p) => u(
              Ne(t, i, n.slotName, {
                ...d,
                alt: p.currentTarget.value
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
function Jt(t) {
  return t === "eyebrow" || t === "footer";
}
function Qt(t) {
  return t.kind !== "markdown" ? !1 : t.minRows === 1 || t.slotName === "eyebrow" || t.slotName === "subtitle" || t.slotName === "footer";
}
function Xt(t, i) {
  return (i ? t.replace(/^(\s*)#{1,6}\s+/u, "$1") : t).replace(/\s*\n\s*/gu, " ").trim();
}
function Zt({
  onClose: t,
  onUpdate: i,
  readOnly: n,
  source: o
}) {
  const l = Ve(o, "eyebrow"), u = Ve(o, "footer");
  return /* @__PURE__ */ r("div", { className: "deck-global-defaults-backdrop", role: "presentation", onMouseDown: t, children: /* @__PURE__ */ c(
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
          /* @__PURE__ */ r("button", { type: "button", onClick: t, children: "Fermer" })
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
                onChange: (d) => i(
                  je(o, "eyebrow", d.currentTarget.value),
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
                value: u,
                onChange: (d) => i(
                  je(o, "footer", d.currentTarget.value),
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
function en({
  draft: t,
  current: i,
  versions: n,
  onRestoreDraft: o,
  onRestoreVersion: l,
  onPreviewDraft: u,
  onPreviewVersion: d,
  onCompareDraftWithCurrent: p,
  onCompareVersionWithCurrent: w,
  onCreateCopyFromDraft: S,
  onCreateCopyFromVersion: m,
  onDeleteDraft: R,
  onKeepCurrent: L,
  onOpenVersionHistory: T
}) {
  const D = n.slice(0, 4), x = Ce(t.updatedAtIso), h = i ? Ce(i.updatedAtIso) : "Aucune sauvegarde courante";
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
          /* @__PURE__ */ r("button", { className: "deck-button-ghost", type: "button", onClick: L, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-recovery-body", children: [
          /* @__PURE__ */ c("article", { className: "deck-recovery-card deck-recovery-card--recommended", children: [
            /* @__PURE__ */ c("div", { className: "deck-recovery-card-header", children: [
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("span", { className: "deck-recovery-badge", children: "Recommandé" }),
                /* @__PURE__ */ r("strong", { children: "Récupérer mon travail récent" })
              ] }),
              /* @__PURE__ */ r("span", { className: "deck-recovery-status", "data-status": t.compilerStatus, children: Ue(t.compilerStatus) })
            ] }),
            /* @__PURE__ */ c("dl", { className: "deck-recovery-meta", children: [
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("dt", { children: "Dernière modification" }),
                /* @__PURE__ */ r("dd", { children: x })
              ] }),
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("dt", { children: "État" }),
                /* @__PURE__ */ r("dd", { children: t.sourceHash.slice(0, 8) })
              ] })
            ] }),
            /* @__PURE__ */ c("div", { className: "deck-recovery-primary-actions", children: [
              /* @__PURE__ */ r("button", { className: "deck-button-primary", type: "button", onClick: o, children: "Récupérer mon travail" }),
              /* @__PURE__ */ r("button", { type: "button", onClick: p, children: "Voir les différences" })
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
                /* @__PURE__ */ r("dd", { children: h })
              ] }),
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("dt", { children: "État" }),
                /* @__PURE__ */ r("dd", { children: i ? i.sourceHash.slice(0, 8) : "Aucun hash" })
              ] })
            ] }),
            /* @__PURE__ */ c("div", { className: "deck-recovery-current-copy", children: [
              /* @__PURE__ */ r("strong", { children: "Ignorer les modifications trouvées" }),
              /* @__PURE__ */ r("small", { children: "À utiliser seulement si tu sais que les changements récents ne sont pas utiles." })
            ] }),
            /* @__PURE__ */ r("button", { type: "button", onClick: L, children: "Garder cette page" })
          ] })
        ] }),
        /* @__PURE__ */ c("details", { className: "deck-recovery-advanced", children: [
          /* @__PURE__ */ r("summary", { children: "Options avancées" }),
          /* @__PURE__ */ c("div", { className: "deck-recovery-secondary-actions", children: [
            /* @__PURE__ */ r("button", { type: "button", onClick: u, children: "Voir le contenu récupéré" }),
            /* @__PURE__ */ r("button", { type: "button", onClick: S, children: "Créer une copie" }),
            /* @__PURE__ */ r("button", { className: "deck-button-danger", type: "button", onClick: R, children: "Supprimer définitivement cette récupération" })
          ] }),
          D.length > 0 ? /* @__PURE__ */ c("section", { className: "deck-recovery-versions", children: [
            /* @__PURE__ */ r("strong", { children: "Autres versions locales" }),
            /* @__PURE__ */ r("p", { children: "Ces versions sont utiles si tu cherches une sauvegarde plus ancienne." }),
            /* @__PURE__ */ r("ul", { className: "deck-version-list", children: D.map((N) => /* @__PURE__ */ c("li", { children: [
              /* @__PURE__ */ c("div", { className: "deck-recovery-version-row", children: [
                /* @__PURE__ */ c("div", { children: [
                  /* @__PURE__ */ r("strong", { children: N.label ?? N.reason }),
                  /* @__PURE__ */ c("small", { children: [
                    Ce(N.createdAtIso),
                    " - ",
                    Ue(N.compilerStatus)
                  ] })
                ] }),
                /* @__PURE__ */ c("span", { children: [
                  N.sourceHash.slice(0, 8),
                  " - ",
                  N.sizeBytes,
                  " octets"
                ] })
              ] }),
              /* @__PURE__ */ c("div", { className: "deck-version-actions", children: [
                /* @__PURE__ */ r("button", { type: "button", onClick: () => l(N.id), children: "Récupérer" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => d(N.id), children: "Voir" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => w(N.id), children: "Différences" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => m(N.id), children: "Copier" })
              ] })
            ] }, N.id)) })
          ] }) : null
        ] }),
        /* @__PURE__ */ c("footer", { className: "deck-recovery-footer", children: [
          /* @__PURE__ */ r("button", { type: "button", onClick: T, children: "Voir tout l’historique" }),
          /* @__PURE__ */ r("button", { className: "deck-button-ghost", type: "button", onClick: L, children: "Ne rien récupérer" })
        ] })
      ]
    }
  ) });
}
function Ce(t) {
  return new Date(t).toLocaleString(void 0, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
function Ue(t) {
  return t === "valid" ? "utilisable" : t === "degraded" ? "avec alertes" : "avec erreurs";
}
function tn({
  title: t,
  leftLabel: i,
  leftSource: n,
  rightLabel: o,
  rightSource: l,
  onClose: u
}) {
  const d = nn(n, l), p = d.filter((S) => S.kind === "added").length, w = d.filter((S) => S.kind === "removed").length;
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
            /* @__PURE__ */ r("h3", { id: "deck-version-compare-title", children: t }),
            /* @__PURE__ */ c("span", { className: "deck-version-compare-subtitle", children: [
              i,
              " vers ",
              o
            ] })
          ] }),
          /* @__PURE__ */ r("button", { type: "button", onClick: u, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-diff-summary", role: "status", children: [
          /* @__PURE__ */ c("span", { "data-kind": "added", children: [
            p,
            " ajout(s)"
          ] }),
          /* @__PURE__ */ c("span", { "data-kind": "removed", children: [
            w,
            " suppression(s)"
          ] }),
          p === 0 && w === 0 ? /* @__PURE__ */ r("span", { children: "Aucune différence détectée." }) : null
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-diff-legend", "aria-hidden": "true", children: [
          /* @__PURE__ */ r("span", { "data-kind": "removed", children: "- supprimé" }),
          /* @__PURE__ */ r("span", { "data-kind": "added", children: "+ ajouté" }),
          /* @__PURE__ */ r("span", { "data-kind": "unchanged", children: "inchangé" })
        ] }),
        /* @__PURE__ */ r("pre", { className: "deck-diff-view", "aria-label": "Diff des versions", children: d.map((S, m) => /* @__PURE__ */ c("div", { className: "deck-diff-line", "data-kind": S.kind, children: [
          /* @__PURE__ */ r("span", { className: "deck-diff-marker", children: an(S.kind) }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: S.leftNumber ?? "" }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: S.rightNumber ?? "" }),
          /* @__PURE__ */ r("code", { children: S.content || " " })
        ] }, `${m}-${S.kind}`)) })
      ]
    }
  ) });
}
function nn(t, i) {
  const n = Ye(t), o = Ye(i), l = rn(n, o), u = [];
  let d = 0, p = 0;
  for (; d < n.length || p < o.length; ) {
    if (d < n.length && p < o.length && n[d] === o[p]) {
      u.push({
        kind: "unchanged",
        content: n[d] ?? "",
        leftNumber: d + 1,
        rightNumber: p + 1
      }), d += 1, p += 1;
      continue;
    }
    if (p < o.length && (d >= n.length || l[d][p + 1] >= l[d + 1][p])) {
      u.push({
        kind: "added",
        content: o[p] ?? "",
        rightNumber: p + 1
      }), p += 1;
      continue;
    }
    d < n.length && (u.push({
      kind: "removed",
      content: n[d] ?? "",
      leftNumber: d + 1
    }), d += 1);
  }
  return u;
}
function Ye(t) {
  const i = t.replace(/\r\n/g, `
`).split(`
`);
  return i.at(-1) === "" ? i.slice(0, -1) : i;
}
function rn(t, i) {
  const n = Array.from(
    { length: t.length + 1 },
    () => Array.from({ length: i.length + 1 }, () => 0)
  );
  for (let o = t.length - 1; o >= 0; o -= 1)
    for (let l = i.length - 1; l >= 0; l -= 1)
      n[o][l] = t[o] === i[l] ? n[o + 1][l + 1] + 1 : Math.max(n[o + 1][l], n[o][l + 1]);
  return n;
}
function an(t) {
  return t === "added" ? "+" : t === "removed" ? "-" : " ";
}
const sn = [
  "before-layout-change",
  "before-slide-delete",
  "before-version-restore"
];
function on({
  versions: t,
  readOnly: i,
  canRestore: n,
  canCompare: o,
  onCreateManualVersion: l,
  onRestoreVersion: u,
  onDeleteVersion: d,
  onRenameVersion: p,
  onCompareWithCurrent: w,
  onCompareVersions: S
}) {
  const [m, R] = M("all"), [L, T] = M(""), [D, x] = M(null), [h, N] = M(""), [W, oe] = M(null), le = J(
    () => t.filter((v) => m === "all" ? !0 : m === "safety" ? sn.includes(v.reason) : v.reason === m),
    [m, t]
  );
  function b() {
    l(L.trim() || void 0), T("");
  }
  function k(v) {
    x(v.id), N(v.label ?? v.reason);
  }
  function ce() {
    if (!D)
      return;
    const v = h.trim();
    v && p(D, v), x(null), N("");
  }
  function F(v) {
    if (!W) {
      oe(v);
      return;
    }
    W !== v && S(W, v), oe(null);
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
            onChange: (v) => R(v.currentTarget.value),
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
          value: L,
          placeholder: "Nom de version",
          onChange: (v) => T(v.currentTarget.value),
          disabled: i
        }
      ),
      /* @__PURE__ */ r("button", { type: "button", onClick: b, disabled: i, children: "Créer version" })
    ] }),
    W ? /* @__PURE__ */ r("p", { className: "deck-version-compare-hint", children: "Choisir une seconde version à comparer." }) : null,
    /* @__PURE__ */ r("ul", { className: "deck-version-list", children: le.map((v) => /* @__PURE__ */ c("li", { children: [
      D === v.id ? /* @__PURE__ */ c("div", { className: "deck-version-rename", children: [
        /* @__PURE__ */ r(
          "input",
          {
            "aria-label": "Renommer version",
            value: h,
            onChange: (q) => N(q.currentTarget.value),
            onKeyDown: (q) => {
              q.key === "Enter" && (q.preventDefault(), ce()), q.key === "Escape" && (q.preventDefault(), x(null));
            }
          }
        ),
        /* @__PURE__ */ r("button", { type: "button", onClick: ce, children: "OK" })
      ] }) : /* @__PURE__ */ r("strong", { children: v.label ?? v.reason }),
      /* @__PURE__ */ c("small", { children: [
        ln(v.reason),
        " - ",
        new Date(v.createdAtIso).toLocaleString(),
        " -",
        " ",
        v.compilerStatus
      ] }),
      /* @__PURE__ */ c("div", { className: "deck-version-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => u(v.id),
            disabled: !n || i,
            children: "Restaurer"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => w(v.id),
            disabled: !o,
            children: "Comparer actuel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => F(v.id),
            disabled: !o,
            "aria-pressed": W === v.id,
            children: "Comparer A/B"
          }
        ),
        v.reason === "manual" ? /* @__PURE__ */ r("button", { type: "button", onClick: () => k(v), disabled: i, children: "Renommer" }) : null,
        /* @__PURE__ */ r("button", { type: "button", onClick: () => d(v.id), disabled: i, children: "Supprimer" })
      ] })
    ] }, v.id)) }),
    le.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucune version." }) : null
  ] });
}
function ln(t) {
  return t === "autosave" ? "Autosave" : t === "manual" ? "Manuelle" : t === "crash-recovery" ? "Recovery" : t.startsWith("before-") ? "Sécurité" : t === "external-save" ? "Externe" : "Import";
}
function cn({
  title: t,
  label: i,
  source: n,
  onClose: o
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
            /* @__PURE__ */ r("h3", { id: "deck-version-source-title", children: t })
          ] }),
          /* @__PURE__ */ r("button", { type: "button", onClick: o, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("label", { className: "deck-version-source-field", children: [
          /* @__PURE__ */ r("span", { children: i }),
          /* @__PURE__ */ r("textarea", { readOnly: !0, value: n })
        ] })
      ]
    }
  ) });
}
function yn(t) {
  var $e;
  const {
    autosave: i,
    deckId: n,
    features: o,
    initialSelectedSlideId: l,
    layout: u,
    locale: d = "fr-FR",
    namespace: p,
    onChange: w,
    onCompile: S,
    onError: m,
    onRestoreVersion: R,
    onSave: L,
    onSelectedSlideChange: T,
    readOnly: D,
    storage: x
  } = t, h = t.options, N = t.runtime ?? xt, W = t.mode === "controlled", [oe, le] = M(
    W ? t.value : t.initialValue
  ), b = W ? t.value : oe, [k, ce] = M(null), [F, v] = M(
    l
  ), [q, Ze] = M(
    (($e = h == null ? void 0 : h.editing) == null ? void 0 : $e.defaultMode) ?? "form"
  ), [et, Ae] = M(!1), [tt, be] = M(!1), [V, Y] = M(null), [Z, de] = M(null), [ue, ke] = M(null), [nt, ye] = M(!1), [Pe, fe] = M(""), [I, ee] = M(null), [rt, at] = M([]), Me = ie(null), me = ie(S), he = ie(m), we = ie(!1), Re = ie(!1), Te = ie(null);
  me.current = S, he.current = m;
  const O = J(() => {
    var f;
    const e = { ...Mt, ...u }, a = h == null ? void 0 : h.panels;
    return (a == null ? void 0 : a.slideRail) === !1 ? e.showSlideRail = !1 : a != null && a.slideRail && (e.showSlideRail = a.slideRail.visibleDefault ?? e.showSlideRail, e.slideRailWidthPx = a.slideRail.widthPx ?? e.slideRailWidthPx), (a == null ? void 0 : a.inspector) === !1 ? e.showInspector = !1 : a != null && a.inspector && (e.showInspector = a.inspector.visibleDefault ?? e.showInspector, e.inspectorWidthPx = a.inspector.widthPx ?? e.inspectorWidthPx), (a == null ? void 0 : a.diagnostics) === !1 ? e.showDiagnosticsPanel = !1 : a != null && a.diagnostics && (e.showDiagnosticsPanel = a.diagnostics.visibleDefault ?? e.showDiagnosticsPanel), (a == null ? void 0 : a.activeSlidePreview) === !1 ? e.showActiveSlidePreview = !1 : a != null && a.activeSlidePreview && (e.showActiveSlidePreview = a.activeSlidePreview.visibleDefault ?? e.showActiveSlidePreview), (a == null ? void 0 : a.versionHistory) === !1 ? e.showVersionHistory = !1 : a != null && a.versionHistory && (e.showVersionHistory = a.versionHistory.visibleDefault ?? e.showVersionHistory), ((f = h == null ? void 0 : h.editing) == null ? void 0 : f.allowSourceMode) === !1 && (e.showSourceModeToggle = !1), e;
  }, [u, h]), B = J(() => {
    var a, f, y, A;
    const e = { ...Rt, ...o };
    return ((a = h == null ? void 0 : h.editing) == null ? void 0 : a.allowSourceMode) !== void 0 && (e.allowRawSourceEdit = h.editing.allowSourceMode), ((f = h == null ? void 0 : h.editing) == null ? void 0 : f.allowLayoutChange) !== void 0 && (e.allowLayoutChange = h.editing.allowLayoutChange), ((y = h == null ? void 0 : h.layoutSelector) == null ? void 0 : y.enabled) !== void 0 && (e.allowLayoutChange = h.layoutSelector.enabled), (A = h == null ? void 0 : h.panels) != null && A.slideRail && (h.panels.slideRail.allowReorder !== void 0 && (e.allowReorderSlides = h.panels.slideRail.allowReorder), h.panels.slideRail.allowAddDelete !== void 0 && (e.allowAddSlide = h.panels.slideRail.allowAddDelete, e.allowDeleteSlide = h.panels.slideRail.allowAddDelete)), e;
  }, [o, h]), pe = J(() => {
    var y;
    const f = (((y = h == null ? void 0 : h.editing) == null ? void 0 : y.viewModes) ?? ["form", "source", "preview"]).filter(
      (A, re, ae) => (A === "form" || A === "source" || A === "preview") && ae.indexOf(A) === re
    ).filter((A) => A !== "source" || B.allowRawSourceEdit);
    return f.length > 0 ? f : ["form"];
  }, [B.allowRawSourceEdit, h]), s = J(
    () => x === !1 ? void 0 : {
      ...Se,
      namespace: p ?? (x == null ? void 0 : x.namespace) ?? Se.namespace,
      adapter: (x == null ? void 0 : x.adapter) ?? N.storage ?? Se.adapter,
      ...x
    },
    [p, N.storage, x]
  ), z = J(
    () => i === !1 ? void 0 : { ...Tt, ...i },
    [i]
  ), C = (k == null ? void 0 : k.status) === "valid" || (k == null ? void 0 : k.status) === "degraded" ? k.deck : void 0, g = (C == null ? void 0 : C.slides.find((e) => e.id === F)) ?? (C == null ? void 0 : C.slides[0]), it = J(() => {
    const e = /* @__PURE__ */ new Map();
    for (const a of ["eyebrow", "footer"])
      Ht(b, a) && e.set(a, Ve(b, a));
    return e;
  }, [b]), te = P(
    (e, a, f) => {
      const y = {
        reason: a,
        deckId: n,
        selectedSlideId: f ?? F,
        sourceHash: G(e.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      W || le(e), w == null || w(e, y);
    },
    [W, n, w, F]
  );
  _(() => {
    let e = !1;
    return We(b, {
      runtime: N,
      mode: "editor"
    }).then((a) => {
      var f;
      e || (ce(a), (f = me.current) == null || f.call(me, a));
    }).catch((a) => {
      var f;
      (f = he.current) == null || f.call(he, {
        message: a instanceof Error ? a.message : "Deck compilation failed.",
        cause: a
      });
    }), () => {
      e = !0;
    };
  }, [d, N, b]), _(() => {
    if (!C || F)
      return;
    const e = C.slides[0];
    e && v(e.id);
  }, [C, F]), _(() => {
    !(s != null && s.recoverOnMount) || Re.current || (Re.current = !0, Promise.all([
      s.adapter.loadCurrent({ deckId: n, namespace: s.namespace }),
      s.adapter.loadDraft({ deckId: n, namespace: s.namespace }),
      s.adapter.listVersions({ deckId: n, namespace: s.namespace })
    ]).then(([e, a, f]) => {
      if (!a)
        return;
      const y = G(b.content), A = a.sourceHash !== y, re = !e || a.sourceHash !== e.sourceHash, ae = !e || a.updatedAtIso > e.updatedAtIso;
      !A || !re || !ae || Y({
        draft: a,
        current: e,
        versions: f
      });
    }).catch((e) => {
      m == null || m({
        message: e instanceof Error ? e.message : "Unable to inspect deck recovery state.",
        cause: e
      });
    }));
  }, [n, m, te, b.content, s]), _(() => {
    if (!s || !z || !s.saveDraftOnChange)
      return;
    const e = window.setTimeout(() => {
      s.adapter.saveDraft({
        deckId: n,
        namespace: s.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: dn(),
        source: b,
        sourceHash: G(b.content),
        selectedSlideId: F,
        compilerStatus: (k == null ? void 0 : k.status) ?? "invalid"
      });
    }, z.draftDebounceMs);
    return () => window.clearTimeout(e);
  }, [z, k, n, F, b, s]);
  const E = P(() => {
    s && s.adapter.listVersions({ deckId: n, namespace: s.namespace }).then(at).catch((e) => {
      m == null || m({
        message: e instanceof Error ? e.message : "Unable to list deck versions.",
        cause: e
      });
    });
  }, [n, m, s]);
  _(() => {
    E();
  }, [E]);
  const $ = P(
    async (e, a) => {
      var A;
      if (!s)
        return;
      const f = (k == null ? void 0 : k.diagnostics) ?? [], y = await s.adapter.createVersion({
        id: Ie(),
        deckId: n,
        namespace: s.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: a,
        reason: e,
        source: b,
        sourceHash: G(b.content),
        selectedSlideId: F,
        compilerStatus: (k == null ? void 0 : k.status) ?? "invalid",
        diagnosticsSummary: Ee(f),
        limits: {
          maxVersionsPerDeck: s.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: s.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: s.maxBytesPerDeck
        }
      });
      y.status !== "success" && (m == null || m({ message: ((A = y.diagnostics[0]) == null ? void 0 : A.message) ?? "Unable to save deck version." })), E();
    },
    [k, n, m, E, F, b, s]
  ), ve = P(
    async (e, a, f, y) => {
      var ae;
      if (!s)
        return;
      const A = await We(e, {
        runtime: N,
        mode: "editor"
      }), re = await s.adapter.createVersion({
        id: Ie(),
        deckId: n,
        namespace: s.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: f,
        reason: a,
        source: e,
        sourceHash: G(e.content),
        selectedSlideId: y,
        compilerStatus: A.status,
        diagnosticsSummary: Ee(A.diagnostics),
        limits: {
          maxVersionsPerDeck: s.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: s.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: s.maxBytesPerDeck
        }
      });
      re.status !== "success" && (m == null || m({ message: ((ae = re.diagnostics[0]) == null ? void 0 : ae.message) ?? "Unable to save deck version." })), E();
    },
    [n, d, m, E, N, s]
  );
  _(() => {
    if (!s || !z || !s.saveDraftOnChange || z.createVersionOnValidDeckOnly && (k == null ? void 0 : k.status) === "invalid")
      return;
    const e = window.setTimeout(() => {
      const a = G(b.content);
      Te.current !== a && (Te.current = a, $("autosave", "Autosave"));
    }, z.versionIntervalMs);
    return () => window.clearTimeout(e);
  }, [z, k == null ? void 0 : k.status, $, b.content, s]);
  const st = P(() => {
    s && (s.adapter.saveCurrent({
      deckId: n,
      namespace: s.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: b,
      sourceHash: G(b.content),
      selectedSlideId: F
    }), s.createVersionOnManualSave && $("manual", "Manual save"), L == null || L({
      deckId: n,
      sourceHash: G(b.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [$, n, L, F, b, s]), K = P(
    async (e, a) => {
      var y;
      if (!s)
        return;
      const f = await s.adapter.saveCurrent({
        deckId: n,
        namespace: s.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        source: e,
        sourceHash: G(e.content),
        selectedSlideId: a
      });
      f.status !== "success" && (m == null || m({ message: ((y = f.diagnostics[0]) == null ? void 0 : y.message) ?? "Unable to save current deck." }));
    },
    [n, m, s]
  ), Le = P(
    async (e) => {
      if (!s)
        return;
      s.createVersionBeforeDestructiveAction && await $("before-version-restore", "Before restore");
      const a = await s.adapter.loadVersion({
        deckId: n,
        namespace: s.namespace,
        versionId: e
      });
      a && (v(a.selectedSlideId), te(a.source, "version-restore", a.selectedSlideId), await K(a.source, a.selectedSlideId), await s.adapter.clearDraft({ deckId: n, namespace: s.namespace }), R == null || R({
        deckId: n,
        versionId: e,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [$, n, R, te, K, s]
  ), ot = P(
    async (e) => {
      var f;
      if (!s)
        return;
      const a = await s.adapter.deleteVersion({
        deckId: n,
        namespace: s.namespace,
        versionId: e
      });
      a.status !== "success" && (m == null || m({ message: ((f = a.diagnostics[0]) == null ? void 0 : f.message) ?? "Unable to delete deck version." })), E();
    },
    [n, m, E, s]
  ), lt = P(
    async (e, a) => {
      var A;
      if (!s)
        return;
      const f = await s.adapter.loadVersion({
        deckId: n,
        namespace: s.namespace,
        versionId: e
      });
      if (!f)
        return;
      const y = await s.adapter.createVersion({
        ...f,
        label: a,
        limits: {
          maxVersionsPerDeck: s.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: s.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: s.maxBytesPerDeck
        }
      });
      y.status !== "success" && (m == null || m({ message: ((A = y.diagnostics[0]) == null ? void 0 : A.message) ?? "Unable to rename deck version." })), E();
    },
    [n, m, E, s]
  ), Fe = P(
    async (e) => {
      if (!s)
        return;
      const a = await s.adapter.loadVersion({
        deckId: n,
        namespace: s.namespace,
        versionId: e
      });
      a && de({
        title: "Version vs courant",
        leftLabel: a.label ?? a.reason,
        leftSource: a.source.content,
        rightLabel: "Courant",
        rightSource: b.content
      });
    },
    [n, b.content, s]
  ), ct = P(
    async (e) => {
      if (!s)
        return;
      const a = await s.adapter.loadVersion({
        deckId: n,
        namespace: s.namespace,
        versionId: e
      });
      a && ke({
        title: a.label ?? a.reason,
        label: "Source YAML",
        source: a.source.content
      });
    },
    [n, s]
  ), dt = P(
    async (e, a) => {
      if (!s)
        return;
      const [f, y] = await Promise.all([
        s.adapter.loadVersion({
          deckId: n,
          namespace: s.namespace,
          versionId: e
        }),
        s.adapter.loadVersion({
          deckId: n,
          namespace: s.namespace,
          versionId: a
        })
      ]);
      !f || !y || de({
        title: "Comparaison de versions",
        leftLabel: f.label ?? f.reason,
        leftSource: f.source.content,
        rightLabel: y.label ?? y.reason,
        rightSource: y.source.content
      });
    },
    [n, s]
  ), ut = P(async () => {
    !V || !s || (s.createVersionBeforeDestructiveAction && await $("before-version-restore", "Before recovery restore"), v(V.draft.selectedSlideId), te(V.draft.source, "crash-recovery", V.draft.selectedSlideId), await K(V.draft.source, V.draft.selectedSlideId), await s.adapter.clearDraft({ deckId: n, namespace: s.namespace }), Y(null));
  }, [$, n, te, V, K, s]), ft = P(() => {
    V && ke({
      title: "Draft local",
      label: "Source YAML",
      source: V.draft.source.content
    });
  }, [V]), mt = P(() => {
    var e;
    V && de({
      title: "Draft vs courant",
      leftLabel: "Draft local",
      leftSource: V.draft.source.content,
      rightLabel: "Courant",
      rightSource: ((e = V.current) == null ? void 0 : e.source.content) ?? b.content
    });
  }, [V, b.content]), ht = P(async () => {
    V && (await ve(
      V.draft.source,
      "manual",
      "Copie du draft de recovery",
      V.draft.selectedSlideId
    ), be(!0), Y(null));
  }, [ve, V]), pt = P(
    async (e) => {
      if (!s)
        return;
      const a = await s.adapter.loadVersion({
        deckId: n,
        namespace: s.namespace,
        versionId: e
      });
      a && (await ve(
        a.source,
        "manual",
        `Copie - ${a.label ?? a.reason}`,
        a.selectedSlideId
      ), be(!0), Y(null));
    },
    [ve, n, s]
  ), vt = P(async () => {
    s && (await s.adapter.clearDraft({ deckId: n, namespace: s.namespace }), Y(null));
  }, [n, s]), gt = P(async () => {
    s && (await s.adapter.clearDraft({ deckId: n, namespace: s.namespace }), await K(b, g == null ? void 0 : g.id), Y(null));
  }, [n, K, g == null ? void 0 : g.id, b, s]);
  function bt(e) {
    we.current = !0, v(e), T == null || T({ deckId: n, slideId: e });
  }
  function j(e, a, f = g == null ? void 0 : g.id) {
    te(e, a, f);
  }
  function kt() {
    const e = $t(b, "title-body", g == null ? void 0 : g.id);
    e.slideId && (v(e.slideId), T == null || T({ deckId: n, slideId: e.slideId })), j(e.source, "slide-add", e.slideId);
  }
  function yt() {
    g && (s != null && s.createVersionBeforeDestructiveAction && $("before-slide-delete", "Before slide delete"), j(Et(b, g.id), "slide-delete"));
  }
  function wt(e, a) {
    !B.allowReorderSlides || D || (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("application/x-qastia-slide-id", a), e.dataTransfer.setData("text/plain", a), ee({ draggedSlideId: a }));
  }
  function St(e, a) {
    const f = I == null ? void 0 : I.draggedSlideId;
    !B.allowReorderSlides || D || !f || f === a || (e.preventDefault(), e.dataTransfer.dropEffect = "move", ee({
      draggedSlideId: f,
      targetSlideId: a,
      placement: ze(e)
    }));
  }
  function Dt(e, a) {
    const f = (I == null ? void 0 : I.draggedSlideId) || e.dataTransfer.getData("application/x-qastia-slide-id") || e.dataTransfer.getData("text/plain");
    if (!B.allowReorderSlides || D || !f || f === a) {
      ee(null);
      return;
    }
    e.preventDefault();
    const y = (I == null ? void 0 : I.targetSlideId) === a && I.placement ? I.placement : ze(e);
    ee(null), v(f), j(qt(b, f, a, y), "slide-reorder", f), T == null || T({ deckId: n, slideId: f });
  }
  const Nt = (k == null ? void 0 : k.diagnostics) ?? [], ne = pe.includes(q) ? q : pe[0], He = (C == null ? void 0 : C.theme.cssClassName) ?? "", Be = C ? At(C.theme) : void 0, se = (C == null ? void 0 : C.metadata.title) ?? "Deck";
  function Ct() {
    D || (fe(se), ye(!0));
  }
  function Oe() {
    const e = Pe.trim() || se;
    ye(!1), fe(e), e !== se && j(Bt(b, e), "metadata-edit", g == null ? void 0 : g.id);
  }
  function Vt() {
    ye(!1), fe(se);
  }
  return _(() => {
    if (!we.current)
      return;
    we.current = !1;
    const e = Me.current, a = e == null ? void 0 : e.querySelector(
      ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main"
    ), f = a != null && a.matches("textarea") ? a : a == null ? void 0 : a.querySelector(
      "input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]), button:not([disabled])"
    );
    if (f) {
      f.focus();
      return;
    }
    e == null || e.focus();
  }, [ne, g == null ? void 0 : g.id]), /* @__PURE__ */ c(
    "div",
    {
      className: "deck-studio-root",
      "data-density": O.density,
      "data-slide-rail": O.showSlideRail ? "visible" : "hidden",
      "data-inspector": O.showInspector ? "visible" : "hidden",
      children: [
        O.showSlideRail ? /* @__PURE__ */ c("aside", { className: "deck-studio-rail", style: { width: O.slideRailWidthPx }, children: [
          /* @__PURE__ */ r("header", { children: nt ? /* @__PURE__ */ r(
            "input",
            {
              className: "deck-studio-title-input",
              "aria-label": "Titre du slideshow",
              value: Pe,
              autoFocus: !0,
              onFocus: (e) => e.currentTarget.select(),
              onChange: (e) => fe(e.currentTarget.value),
              onBlur: Oe,
              onKeyDown: (e) => {
                e.key === "Enter" && (e.preventDefault(), Oe()), e.key === "Escape" && (e.preventDefault(), Vt());
              }
            }
          ) : /* @__PURE__ */ r(
            "strong",
            {
              className: "deck-studio-title-label",
              title: D ? void 0 : "Double-cliquer pour modifier",
              onDoubleClick: Ct,
              children: se
            }
          ) }),
          /* @__PURE__ */ r("nav", { "aria-label": "Slides", children: C == null ? void 0 : C.slides.map((e) => /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: e.id === (g == null ? void 0 : g.id) ? "is-active" : void 0,
              draggable: B.allowReorderSlides && !D,
              "data-drop-position": (I == null ? void 0 : I.targetSlideId) === e.id ? I.placement : void 0,
              "aria-grabbed": (I == null ? void 0 : I.draggedSlideId) === e.id ? "true" : void 0,
              onClick: () => bt(e.id),
              onDragStart: (a) => wt(a, e.id),
              onDragOver: (a) => St(a, e.id),
              onDragLeave: () => {
                (I == null ? void 0 : I.targetSlideId) === e.id && ee({ draggedSlideId: I.draggedSlideId });
              },
              onDrop: (a) => Dt(a, e.id),
              onDragEnd: () => ee(null),
              children: [
                /* @__PURE__ */ r("span", { children: e.index + 1 }),
                /* @__PURE__ */ r("span", { children: fn(e) }),
                /* @__PURE__ */ r("small", { children: e.layout.name })
              ]
            },
            e.id
          )) })
        ] }) : null,
        /* @__PURE__ */ c("main", { className: "deck-studio-main", ref: Me, tabIndex: -1, children: [
          /* @__PURE__ */ c("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ r("div", { className: "deck-studio-slide-heading", children: B.allowLayoutChange && g && ne !== "source" ? /* @__PURE__ */ r("label", { className: "deck-layout-select", children: /* @__PURE__ */ r(
              "select",
              {
                "aria-label": "Layout de la slide",
                value: g.layout.name,
                onChange: (e) => {
                  s != null && s.createVersionBeforeDestructiveAction && $("before-layout-change", "Before layout change"), j(
                    Ot(b, g.id, e.currentTarget.value, N.layouts),
                    "layout-change"
                  );
                },
                disabled: D,
                children: Array.from(N.layouts.values()).map((e) => /* @__PURE__ */ r("option", { value: e.name, children: e.displayName }, e.name))
              }
            ) }) : null }),
            /* @__PURE__ */ c("div", { className: "deck-studio-actions", children: [
              O.showSourceModeToggle && pe.length > 1 ? /* @__PURE__ */ c("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ r("span", { children: "Editor view" }),
                /* @__PURE__ */ r(
                  "select",
                  {
                    value: ne,
                    onChange: (e) => Ze(e.currentTarget.value),
                    children: pe.map((e) => /* @__PURE__ */ r("option", { value: e, children: un(e) }, e))
                  }
                )
              ] }) : null,
              /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => Ae(!0),
                  disabled: D,
                  children: "Global"
                }
              ),
              B.allowAddSlide ? /* @__PURE__ */ r("button", { type: "button", onClick: kt, disabled: D, children: "Add" }) : null,
              B.allowDuplicateSlide && g ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => j(Wt(b, g.id), "slide-duplicate"),
                  disabled: D,
                  children: "Duplicate"
                }
              ) : null,
              B.allowDeleteSlide && g ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: yt,
                  disabled: D || ((C == null ? void 0 : C.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              s ? /* @__PURE__ */ r("button", { type: "button", onClick: st, disabled: D, children: "Save" }) : null
            ] })
          ] }),
          ne === "source" ? /* @__PURE__ */ r(
            "textarea",
            {
              className: "deck-source-editor",
              value: b.content,
              onChange: (e) => j({ ...b, content: e.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: D
            }
          ) : ne === "preview" && g ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${He}`,
              "aria-label": "Slide preview",
              tabIndex: -1,
              style: Be,
              children: /* @__PURE__ */ r(qe, { slide: g, target: "screen" })
            }
          ) : g ? /* @__PURE__ */ r("div", { className: "deck-studio-editor", children: /* @__PURE__ */ r(
            Kt,
            {
              source: b,
              slideId: g.id,
              fields: g.layout.definition.editor.fieldGroups.flatMap((e) => e.fields),
              inheritedMarkdownSlots: it,
              readOnly: !!D,
              onUpdate: j
            }
          ) }) : (k == null ? void 0 : k.status) === "invalid" ? /* @__PURE__ */ r(Pt, { fallback: k.fallback }) : null,
          O.showActiveSlidePreview && ne !== "preview" && g ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview ${He}`,
              "aria-label": "Active slide preview",
              style: Be,
              children: /* @__PURE__ */ r(qe, { slide: g, target: "screen" })
            }
          ) : null
        ] }),
        O.showInspector ? /* @__PURE__ */ c("aside", { className: "deck-studio-inspector", style: { width: O.inspectorWidthPx }, children: [
          O.showDiagnosticsPanel ? /* @__PURE__ */ c("section", { children: [
            /* @__PURE__ */ r("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ r(_e, { diagnostics: Nt })
          ] }) : null,
          (O.showVersionHistory || tt) && s ? /* @__PURE__ */ r(
            on,
            {
              versions: rt,
              readOnly: !!D,
              canRestore: B.allowVersionRestore,
              canCompare: B.allowVersionCompare,
              onCreateManualVersion: (e) => {
                K(b, g == null ? void 0 : g.id), $("manual", e ?? "Manual save");
              },
              onRestoreVersion: (e) => void Le(e),
              onDeleteVersion: (e) => void ot(e),
              onRenameVersion: (e, a) => void lt(e, a),
              onCompareWithCurrent: (e) => void Fe(e),
              onCompareVersions: (e, a) => void dt(e, a)
            }
          ) : null
        ] }) : null,
        et ? /* @__PURE__ */ r(
          Zt,
          {
            source: b,
            readOnly: !!D,
            onUpdate: j,
            onClose: () => Ae(!1)
          }
        ) : null,
        V ? /* @__PURE__ */ r(
          en,
          {
            draft: V.draft,
            current: V.current,
            versions: V.versions,
            onRestoreDraft: () => void ut(),
            onRestoreVersion: (e) => {
              Y(null), Le(e);
            },
            onPreviewDraft: ft,
            onPreviewVersion: (e) => void ct(e),
            onCompareDraftWithCurrent: mt,
            onCompareVersionWithCurrent: (e) => void Fe(e),
            onCreateCopyFromDraft: () => void ht(),
            onCreateCopyFromVersion: (e) => void pt(e),
            onDeleteDraft: () => void vt(),
            onKeepCurrent: () => void gt(),
            onOpenVersionHistory: () => {
              be(!0), Y(null);
            }
          }
        ) : null,
        Z ? /* @__PURE__ */ r(
          tn,
          {
            title: Z.title,
            leftLabel: Z.leftLabel,
            leftSource: Z.leftSource,
            rightLabel: Z.rightLabel,
            rightSource: Z.rightSource,
            onClose: () => de(null)
          }
        ) : null,
        ue ? /* @__PURE__ */ r(
          cn,
          {
            title: ue.title,
            label: ue.label,
            source: ue.source,
            onClose: () => ke(null)
          }
        ) : null
      ]
    }
  );
}
function dn() {
  const t = "deck-runtime-session-id", i = window.sessionStorage.getItem(t);
  if (i)
    return i;
  const n = Ie();
  return window.sessionStorage.setItem(t, n), n;
}
function Ie() {
  const t = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${t}`;
}
function un(t) {
  return t === "source" ? "YAML" : t === "preview" ? "Preview" : "Form";
}
function fn(t) {
  const i = t.slots.get("title"), n = (i == null ? void 0 : i.content.kind) === "markdown" ? i.content.markdown : void 0;
  return (n == null ? void 0 : n.split(/\r?\n/).map((l) => l.replace(/^#{1,6}\s+/, "").trim()).find((l) => l.length > 0)) ?? `Slide ${t.index + 1}`;
}
function ze(t) {
  const i = t.currentTarget.getBoundingClientRect();
  return i.height <= 0 || t.clientY > i.top + i.height / 2 ? "after" : "before";
}
export {
  yn as D,
  Pt as a
};
