import { jsxs as c, jsx as r, Fragment as Ht } from "react/jsx-runtime";
import { useState as x, useMemo as Q, useRef as ie, useCallback as T, useEffect as J } from "react";
import { h as W, c as ze, s as _e } from "./hash-BGAdcMpD.js";
import { L as Bt, d as Ot } from "./defaultDeckRuntime-CO0C-Lgd.js";
import { d as $t } from "./themeStyle-CyBLqMAf.js";
import { S as Je } from "./SlideRenderer-iimFvRrx.js";
import nt from "yaml";
function Wt({ fallback: t }) {
  return /* @__PURE__ */ c("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ r("header", { children: /* @__PURE__ */ r("h2", { children: t.title }) }),
    /* @__PURE__ */ r(rt, { diagnostics: t.diagnostics }),
    /* @__PURE__ */ r("pre", { children: t.source.content })
  ] });
}
function rt({
  diagnostics: t
}) {
  return t.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ r("ul", { className: "deck-diagnostics-list", children: t.map((i, n) => /* @__PURE__ */ c("li", { "data-severity": i.severity, children: [
    /* @__PURE__ */ r("strong", { children: i.code }),
    /* @__PURE__ */ r("span", { children: i.message }),
    i.hint ? /* @__PURE__ */ r("small", { children: i.hint }) : null
  ] }, `${i.code}-${n}`)) });
}
const Et = {
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
}, jt = {
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
}, Ve = {
  adapter: new Bt(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, qt = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function G(t) {
  try {
    const i = nt.parse(t.content);
    return B(i) ? i : null;
  } catch {
    return null;
  }
}
function Z(t, i) {
  return {
    ...t,
    content: nt.stringify(i, { lineWidth: 0 })
  };
}
function X(t) {
  return Array.isArray(t.slides) || (t.slides = []), t.slides.filter(B);
}
function Ie(t, i, n, s) {
  return ke(t, i, (l) => {
    const f = it(l);
    f[n] = { markdown: s };
  });
}
function Kt(t, i, n) {
  return ke(t, i, (s) => {
    B(s.slots) && (delete s.slots[n], Object.keys(s.slots).length === 0 && delete s.slots);
  });
}
function Gt(t, i, n) {
  return Me(t, i, n) !== void 0;
}
function Pe(t, i) {
  const n = at(t, i);
  return B(n) && typeof n.markdown == "string" ? n.markdown : "";
}
function Ut(t, i) {
  return at(t, i) !== void 0;
}
function Qe(t, i, n) {
  const s = G(t);
  if (!s)
    return t;
  const l = tn(s);
  return l[i] = { markdown: n }, Z(t, s);
}
function Yt(t, i) {
  const n = G(t);
  return n ? (B(n.metadata) || (n.metadata = {}), n.metadata.title = i, Z(t, n)) : t;
}
function Ae(t, i, n, s) {
  return ke(t, i, (l) => {
    const f = it(l);
    f[n] = {
      image: rn({
        assetId: s.assetId,
        src: s.src,
        alt: s.alt
      })
    };
  });
}
function zt(t, i, n, s) {
  return ke(t, i, (l) => {
    s && l.layout && l.layout !== n && (l.slots = nn(l, n, s)), l.layout = n;
  });
}
function _t(t, i = "title-body", n) {
  const s = G(t);
  if (!s)
    return { source: t };
  const l = X(s), f = ot(l, "slide"), d = {
    id: f,
    layout: i,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }, h = n ? l.findIndex((S) => S.id === n) : -1;
  return l.splice(h >= 0 ? h + 1 : l.length, 0, d), s.slides = l, { source: Z(t, s), slideId: f };
}
function Jt(t, i) {
  const n = G(t);
  if (!n)
    return t;
  const s = X(n), l = s.findIndex((d) => d.id === i);
  if (l < 0)
    return t;
  const f = structuredClone(s[l]);
  return f.id = ot(s, `${i}-copy`), s.splice(l + 1, 0, f), n.slides = s, Z(t, n);
}
function Qt(t, i) {
  const n = G(t);
  if (!n)
    return t;
  const s = X(n).filter((l) => l.id !== i);
  return n.slides = s.length > 0 ? s : X(n), Z(t, n);
}
function Xt(t, i, n, s) {
  if (i === n)
    return t;
  const l = G(t);
  if (!l)
    return t;
  const f = X(l), d = f.findIndex((M) => M.id === i), h = f.findIndex((M) => M.id === n);
  if (d < 0 || h < 0)
    return t;
  const [S] = f.splice(d, 1), D = f.findIndex((M) => M.id === n), m = s === "after" ? D + 1 : D;
  return f.splice(m, 0, S), l.slides = f, Z(t, l);
}
function Zt(t, i, n) {
  const s = Me(t, i, n);
  return B(s) && typeof s.markdown == "string" ? s.markdown : "";
}
function en(t, i, n) {
  const s = Me(t, i, n), l = B(s) && B(s.image) ? s.image : {};
  return {
    assetId: typeof l.assetId == "string" ? l.assetId : "",
    src: typeof l.src == "string" ? l.src : "",
    alt: typeof l.alt == "string" ? l.alt : ""
  };
}
function ke(t, i, n) {
  const s = G(t);
  if (!s)
    return t;
  const l = X(s), f = l.find((d) => d.id === i);
  return f ? (n(f), s.slides = l, Z(t, s)) : t;
}
function Me(t, i, n) {
  var f;
  const s = G(t);
  if (!s)
    return;
  const l = X(s).find((d) => d.id === i);
  return (f = l == null ? void 0 : l.slots) == null ? void 0 : f[n];
}
function at(t, i) {
  var s;
  const n = G(t);
  if (n)
    return B((s = n.defaults) == null ? void 0 : s.slots) ? n.defaults.slots[i] : void 0;
}
function it(t) {
  return B(t.slots) || (t.slots = {}), t.slots;
}
function tn(t) {
  return B(t.defaults) || (t.defaults = {}), B(t.defaults.slots) || (t.defaults.slots = {}), t.defaults.slots;
}
function nn(t, i, n) {
  var d, h;
  const s = B(t.slots) ? t.slots : {}, l = t.layout ? (h = (d = n.get(i)) == null ? void 0 : d.migrateFrom) == null ? void 0 : h[t.layout] : void 0;
  if (!l)
    return s;
  const f = {};
  for (const S of l.operations)
    S.kind === "move-slot" && S.from in s && (f[S.to] = s[S.from]);
  return f;
}
function ot(t, i) {
  const n = new Set(t.map((f) => f.id).filter((f) => !!f));
  let s = Xe(i), l = 2;
  for (; n.has(s); )
    s = `${Xe(i)}-${l}`, l += 1;
  return s;
}
function Xe(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function rn(t) {
  return Object.fromEntries(
    Object.entries(t).filter((i) => !!i[1])
  );
}
function B(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function an({
  fields: t,
  inheritedMarkdownSlots: i,
  onUpdate: n,
  readOnly: s,
  slideId: l,
  source: f
}) {
  return /* @__PURE__ */ r("form", { className: "deck-slide-form", children: t.map((d) => /* @__PURE__ */ r(
    on,
    {
      source: f,
      slideId: l,
      field: d,
      inheritedMarkdownSlots: i,
      readOnly: s,
      onUpdate: n
    },
    `${d.kind}-${"slotName" in d ? d.slotName : d.label}`
  )) });
}
function on({
  source: t,
  slideId: i,
  field: n,
  inheritedMarkdownSlots: s,
  readOnly: l,
  onUpdate: f
}) {
  if (n.kind === "markdown") {
    const d = n.blockKind === "heading" || n.slotName === "title", h = sn(n.slotName) ? s == null ? void 0 : s.get(n.slotName) : void 0, S = h !== void 0, D = S && Gt(t, i, n.slotName), m = S && !D ? h : Zt(t, i, n.slotName), M = d || ln(n), L = M ? cn(m, d) : m, R = l || S && !D, w = M ? /* @__PURE__ */ r(
      "input",
      {
        "aria-label": n.label,
        className: "deck-form-input",
        placeholder: " ",
        value: L,
        onFocus: (N) => N.currentTarget.select(),
        onChange: (N) => f(
          Ie(t, i, n.slotName, N.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: R
      }
    ) : /* @__PURE__ */ r(
      "textarea",
      {
        "aria-label": n.label,
        className: "deck-form-textarea",
        placeholder: " ",
        rows: n.minRows ?? 4,
        value: L,
        onFocus: (N) => dn(N.currentTarget),
        onChange: (N) => f(
          Ie(t, i, n.slotName, N.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: R
      }
    );
    return /* @__PURE__ */ c(
      "div",
      {
        className: "deck-form-field",
        "data-inherited": S && !D ? "true" : void 0,
        children: [
          /* @__PURE__ */ r("span", { children: n.label }),
          /* @__PURE__ */ c("div", { className: "deck-form-field__control", children: [
            w,
            S ? /* @__PURE__ */ r("label", { className: "deck-inherited-slot-toggle", title: "Override global", children: /* @__PURE__ */ r(
              "input",
              {
                "aria-label": `Override ${n.label} global`,
                title: `Override ${n.label} global`,
                type: "checkbox",
                checked: D,
                onChange: (N) => f(
                  N.currentTarget.checked ? Ie(t, i, n.slotName, h) : Kt(t, i, n.slotName),
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
    const d = en(t, i, n.slotName);
    return /* @__PURE__ */ c("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ r("legend", { children: n.label }),
      /* @__PURE__ */ c("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ r("span", { children: "Asset id" }),
        /* @__PURE__ */ r(
          "input",
          {
            placeholder: " ",
            value: d.assetId,
            onFocus: (h) => h.currentTarget.select(),
            onChange: (h) => f(
              Ae(t, i, n.slotName, {
                ...d,
                assetId: h.currentTarget.value
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
            onFocus: (h) => h.currentTarget.select(),
            onChange: (h) => f(
              Ae(t, i, n.slotName, {
                ...d,
                src: h.currentTarget.value
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
            onFocus: (h) => h.currentTarget.select(),
            onChange: (h) => f(
              Ae(t, i, n.slotName, {
                ...d,
                alt: h.currentTarget.value
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
function sn(t) {
  return t === "eyebrow" || t === "footer";
}
function ln(t) {
  return t.kind !== "markdown" ? !1 : t.minRows === 1 || t.slotName === "eyebrow" || t.slotName === "subtitle" || t.slotName === "footer";
}
function cn(t, i) {
  return (i ? t.replace(/^(\s*)#{1,6}\s+/u, "$1") : t).replace(/\s*\n\s*/gu, " ").trim();
}
function dn(t) {
  const i = t.value.length;
  t.setSelectionRange(i, i);
}
function un({
  onClose: t,
  onUpdate: i,
  readOnly: n,
  source: s
}) {
  const l = Pe(s, "eyebrow"), f = Pe(s, "footer");
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
                  Qe(s, "eyebrow", d.currentTarget.value),
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
                value: f,
                onChange: (d) => i(
                  Qe(s, "footer", d.currentTarget.value),
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
function fn({
  draft: t,
  current: i,
  versions: n,
  onRestoreDraft: s,
  onRestoreVersion: l,
  onPreviewDraft: f,
  onPreviewVersion: d,
  onCompareDraftWithCurrent: h,
  onCompareVersionWithCurrent: S,
  onCreateCopyFromDraft: D,
  onCreateCopyFromVersion: m,
  onDeleteDraft: M,
  onKeepCurrent: L,
  onOpenVersionHistory: R
}) {
  const w = n.slice(0, 4), N = xe(t.updatedAtIso), g = i ? xe(i.updatedAtIso) : "Aucune sauvegarde courante";
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
              /* @__PURE__ */ r("span", { className: "deck-recovery-status", "data-status": t.compilerStatus, children: Ze(t.compilerStatus) })
            ] }),
            /* @__PURE__ */ c("dl", { className: "deck-recovery-meta", children: [
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("dt", { children: "Dernière modification" }),
                /* @__PURE__ */ r("dd", { children: N })
              ] }),
              /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ r("dt", { children: "État" }),
                /* @__PURE__ */ r("dd", { children: t.sourceHash.slice(0, 8) })
              ] })
            ] }),
            /* @__PURE__ */ c("div", { className: "deck-recovery-primary-actions", children: [
              /* @__PURE__ */ r("button", { className: "deck-button-primary", type: "button", onClick: s, children: "Récupérer mon travail" }),
              /* @__PURE__ */ r("button", { type: "button", onClick: h, children: "Voir les différences" })
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
                /* @__PURE__ */ r("dd", { children: g })
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
            /* @__PURE__ */ r("button", { type: "button", onClick: f, children: "Voir le contenu récupéré" }),
            /* @__PURE__ */ r("button", { type: "button", onClick: D, children: "Créer une copie" }),
            /* @__PURE__ */ r("button", { className: "deck-button-danger", type: "button", onClick: M, children: "Supprimer définitivement cette récupération" })
          ] }),
          w.length > 0 ? /* @__PURE__ */ c("section", { className: "deck-recovery-versions", children: [
            /* @__PURE__ */ r("strong", { children: "Autres versions locales" }),
            /* @__PURE__ */ r("p", { children: "Ces versions sont utiles si tu cherches une sauvegarde plus ancienne." }),
            /* @__PURE__ */ r("ul", { className: "deck-version-list", children: w.map((C) => /* @__PURE__ */ c("li", { children: [
              /* @__PURE__ */ c("div", { className: "deck-recovery-version-row", children: [
                /* @__PURE__ */ c("div", { children: [
                  /* @__PURE__ */ r("strong", { children: C.label ?? C.reason }),
                  /* @__PURE__ */ c("small", { children: [
                    xe(C.createdAtIso),
                    " - ",
                    Ze(C.compilerStatus)
                  ] })
                ] }),
                /* @__PURE__ */ c("span", { children: [
                  C.sourceHash.slice(0, 8),
                  " - ",
                  C.sizeBytes,
                  " octets"
                ] })
              ] }),
              /* @__PURE__ */ c("div", { className: "deck-version-actions", children: [
                /* @__PURE__ */ r("button", { type: "button", onClick: () => l(C.id), children: "Récupérer" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => d(C.id), children: "Voir" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => S(C.id), children: "Différences" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => m(C.id), children: "Copier" })
              ] })
            ] }, C.id)) })
          ] }) : null
        ] }),
        /* @__PURE__ */ c("footer", { className: "deck-recovery-footer", children: [
          /* @__PURE__ */ r("button", { type: "button", onClick: R, children: "Voir tout l’historique" }),
          /* @__PURE__ */ r("button", { className: "deck-button-ghost", type: "button", onClick: L, children: "Ne rien récupérer" })
        ] })
      ]
    }
  ) });
}
function xe(t) {
  return new Date(t).toLocaleString(void 0, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
function Ze(t) {
  return t === "valid" ? "utilisable" : t === "degraded" ? "avec alertes" : "avec erreurs";
}
function hn({
  title: t,
  leftLabel: i,
  leftSource: n,
  rightLabel: s,
  rightSource: l,
  onClose: f
}) {
  const d = mn(n, l), h = d.filter((D) => D.kind === "added").length, S = d.filter((D) => D.kind === "removed").length;
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
              s
            ] })
          ] }),
          /* @__PURE__ */ r("button", { type: "button", onClick: f, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-diff-summary", role: "status", children: [
          /* @__PURE__ */ c("span", { "data-kind": "added", children: [
            h,
            " ajout(s)"
          ] }),
          /* @__PURE__ */ c("span", { "data-kind": "removed", children: [
            S,
            " suppression(s)"
          ] }),
          h === 0 && S === 0 ? /* @__PURE__ */ r("span", { children: "Aucune différence détectée." }) : null
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-diff-legend", "aria-hidden": "true", children: [
          /* @__PURE__ */ r("span", { "data-kind": "removed", children: "- supprimé" }),
          /* @__PURE__ */ r("span", { "data-kind": "added", children: "+ ajouté" }),
          /* @__PURE__ */ r("span", { "data-kind": "unchanged", children: "inchangé" })
        ] }),
        /* @__PURE__ */ r("pre", { className: "deck-diff-view", "aria-label": "Diff des versions", children: d.map((D, m) => /* @__PURE__ */ c("div", { className: "deck-diff-line", "data-kind": D.kind, children: [
          /* @__PURE__ */ r("span", { className: "deck-diff-marker", children: vn(D.kind) }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: D.leftNumber ?? "" }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: D.rightNumber ?? "" }),
          /* @__PURE__ */ r("code", { children: D.content || " " })
        ] }, `${m}-${D.kind}`)) })
      ]
    }
  ) });
}
function mn(t, i) {
  const n = et(t), s = et(i), l = pn(n, s), f = [];
  let d = 0, h = 0;
  for (; d < n.length || h < s.length; ) {
    if (d < n.length && h < s.length && n[d] === s[h]) {
      f.push({
        kind: "unchanged",
        content: n[d] ?? "",
        leftNumber: d + 1,
        rightNumber: h + 1
      }), d += 1, h += 1;
      continue;
    }
    if (h < s.length && (d >= n.length || l[d][h + 1] >= l[d + 1][h])) {
      f.push({
        kind: "added",
        content: s[h] ?? "",
        rightNumber: h + 1
      }), h += 1;
      continue;
    }
    d < n.length && (f.push({
      kind: "removed",
      content: n[d] ?? "",
      leftNumber: d + 1
    }), d += 1);
  }
  return f;
}
function et(t) {
  const i = t.replace(/\r\n/g, `
`).split(`
`);
  return i.at(-1) === "" ? i.slice(0, -1) : i;
}
function pn(t, i) {
  const n = Array.from(
    { length: t.length + 1 },
    () => Array.from({ length: i.length + 1 }, () => 0)
  );
  for (let s = t.length - 1; s >= 0; s -= 1)
    for (let l = i.length - 1; l >= 0; l -= 1)
      n[s][l] = t[s] === i[l] ? n[s + 1][l + 1] + 1 : Math.max(n[s + 1][l], n[s][l + 1]);
  return n;
}
function vn(t) {
  return t === "added" ? "+" : t === "removed" ? "-" : " ";
}
const gn = [
  "before-layout-change",
  "before-slide-delete",
  "before-version-restore"
];
function bn({
  versions: t,
  readOnly: i,
  canRestore: n,
  canCompare: s,
  onCreateManualVersion: l,
  onRestoreVersion: f,
  onDeleteVersion: d,
  onRenameVersion: h,
  onCompareWithCurrent: S,
  onCompareVersions: D
}) {
  const [m, M] = x("all"), [L, R] = x(""), [w, N] = x(null), [g, C] = x(""), [E, ce] = x(null), de = Q(
    () => t.filter((b) => m === "all" ? !0 : m === "safety" ? gn.includes(b.reason) : b.reason === m),
    [m, t]
  );
  function v() {
    l(L.trim() || void 0), R("");
  }
  function k(b) {
    N(b.id), C(b.label ?? b.reason);
  }
  function ue() {
    if (!w)
      return;
    const b = g.trim();
    b && h(w, b), N(null), C("");
  }
  function F(b) {
    if (!E) {
      ce(b);
      return;
    }
    E !== b && D(E, b), ce(null);
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
            onChange: (b) => M(b.currentTarget.value),
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
          onChange: (b) => R(b.currentTarget.value),
          disabled: i
        }
      ),
      /* @__PURE__ */ r("button", { type: "button", onClick: v, disabled: i, children: "Créer version" })
    ] }),
    E ? /* @__PURE__ */ r("p", { className: "deck-version-compare-hint", children: "Choisir une seconde version à comparer." }) : null,
    /* @__PURE__ */ r("ul", { className: "deck-version-list", children: de.map((b) => /* @__PURE__ */ c("li", { children: [
      w === b.id ? /* @__PURE__ */ c("div", { className: "deck-version-rename", children: [
        /* @__PURE__ */ r(
          "input",
          {
            "aria-label": "Renommer version",
            value: g,
            onChange: (q) => C(q.currentTarget.value),
            onKeyDown: (q) => {
              q.key === "Enter" && (q.preventDefault(), ue()), q.key === "Escape" && (q.preventDefault(), N(null));
            }
          }
        ),
        /* @__PURE__ */ r("button", { type: "button", onClick: ue, children: "OK" })
      ] }) : /* @__PURE__ */ r("strong", { children: b.label ?? b.reason }),
      /* @__PURE__ */ c("small", { children: [
        kn(b.reason),
        " - ",
        new Date(b.createdAtIso).toLocaleString(),
        " -",
        " ",
        b.compilerStatus
      ] }),
      /* @__PURE__ */ c("div", { className: "deck-version-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => f(b.id),
            disabled: !n || i,
            children: "Restaurer"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => S(b.id),
            disabled: !s,
            children: "Comparer actuel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => F(b.id),
            disabled: !s,
            "aria-pressed": E === b.id,
            children: "Comparer A/B"
          }
        ),
        b.reason === "manual" ? /* @__PURE__ */ r("button", { type: "button", onClick: () => k(b), disabled: i, children: "Renommer" }) : null,
        /* @__PURE__ */ r("button", { type: "button", onClick: () => d(b.id), disabled: i, children: "Supprimer" })
      ] })
    ] }, b.id)) }),
    de.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucune version." }) : null
  ] });
}
function kn(t) {
  return t === "autosave" ? "Autosave" : t === "manual" ? "Manuelle" : t === "crash-recovery" ? "Recovery" : t.startsWith("before-") ? "Sécurité" : t === "external-save" ? "Externe" : "Import";
}
function yn({
  title: t,
  label: i,
  source: n,
  onClose: s
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
          /* @__PURE__ */ r("button", { type: "button", onClick: s, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("label", { className: "deck-version-source-field", children: [
          /* @__PURE__ */ r("span", { children: i }),
          /* @__PURE__ */ r("textarea", { readOnly: !0, value: n })
        ] })
      ]
    }
  ) });
}
function Mn(t) {
  var Ye;
  const {
    autosave: i,
    deckId: n,
    features: s,
    initialSelectedSlideId: l,
    layout: f,
    locale: d = "fr-FR",
    namespace: h,
    onChange: S,
    onCompile: D,
    onError: m,
    onRestoreVersion: M,
    onSave: L,
    onSelectedSlideChange: R,
    readOnly: w,
    storage: N
  } = t, g = t.options, C = t.runtime ?? Ot, E = t.mode === "controlled", [ce, de] = x(
    E ? t.value : t.initialValue
  ), v = E ? t.value : ce, [k, ue] = x(null), [F, b] = x(
    l
  ), [q, Re] = x(
    ((Ye = g == null ? void 0 : g.editing) == null ? void 0 : Ye.defaultMode) ?? "form"
  ), [st, Le] = x(!1), [lt, ye] = x(!1), [I, U] = x(null), [ee, fe] = x(null), [he, we] = x(null), [ct, Se] = x(!1), [dt, De] = x(!1), [Fe, me] = x(""), [A, te] = x(null), [ut, ft] = x([]), [Ne, He] = x(v), [Ce, Be] = x(
    l
  ), Oe = ie(null), pe = ie(D), ve = ie(m), oe = ie(null), $e = ie(!1), We = ie(null);
  pe.current = D, ve.current = m;
  const O = Q(() => {
    var u;
    const e = { ...Et, ...f }, a = g == null ? void 0 : g.panels;
    return (a == null ? void 0 : a.slideRail) === !1 ? e.showSlideRail = !1 : a != null && a.slideRail && (e.showSlideRail = a.slideRail.visibleDefault ?? e.showSlideRail, e.slideRailWidthPx = a.slideRail.widthPx ?? e.slideRailWidthPx), (a == null ? void 0 : a.inspector) === !1 ? e.showInspector = !1 : a != null && a.inspector && (e.showInspector = a.inspector.visibleDefault ?? e.showInspector, e.inspectorWidthPx = a.inspector.widthPx ?? e.inspectorWidthPx), (a == null ? void 0 : a.diagnostics) === !1 ? e.showDiagnosticsPanel = !1 : a != null && a.diagnostics && (e.showDiagnosticsPanel = a.diagnostics.visibleDefault ?? e.showDiagnosticsPanel), (a == null ? void 0 : a.activeSlidePreview) === !1 ? e.showActiveSlidePreview = !1 : a != null && a.activeSlidePreview && (e.showActiveSlidePreview = a.activeSlidePreview.visibleDefault ?? e.showActiveSlidePreview), (a == null ? void 0 : a.versionHistory) === !1 ? e.showVersionHistory = !1 : a != null && a.versionHistory && (e.showVersionHistory = a.versionHistory.visibleDefault ?? e.showVersionHistory), ((u = g == null ? void 0 : g.editing) == null ? void 0 : u.allowSourceMode) === !1 && (e.showSourceModeToggle = !1), e;
  }, [f, g]), H = Q(() => {
    var a, u, y, P;
    const e = { ...jt, ...s };
    return ((a = g == null ? void 0 : g.editing) == null ? void 0 : a.allowSourceMode) !== void 0 && (e.allowRawSourceEdit = g.editing.allowSourceMode), ((u = g == null ? void 0 : g.editing) == null ? void 0 : u.allowLayoutChange) !== void 0 && (e.allowLayoutChange = g.editing.allowLayoutChange), ((y = g == null ? void 0 : g.layoutSelector) == null ? void 0 : y.enabled) !== void 0 && (e.allowLayoutChange = g.layoutSelector.enabled), (P = g == null ? void 0 : g.panels) != null && P.slideRail && (g.panels.slideRail.allowReorder !== void 0 && (e.allowReorderSlides = g.panels.slideRail.allowReorder), g.panels.slideRail.allowAddDelete !== void 0 && (e.allowAddSlide = g.panels.slideRail.allowAddDelete, e.allowDeleteSlide = g.panels.slideRail.allowAddDelete)), e;
  }, [s, g]), se = Q(() => {
    var y;
    const u = (((y = g == null ? void 0 : g.editing) == null ? void 0 : y.viewModes) ?? ["form", "source", "preview"]).filter(
      (P, re, ae) => (P === "form" || P === "source" || P === "preview") && ae.indexOf(P) === re
    ).filter((P) => P !== "source" || H.allowRawSourceEdit);
    return u.length > 0 ? u : ["form"];
  }, [H.allowRawSourceEdit, g]), o = Q(
    () => N === !1 ? void 0 : {
      ...Ve,
      namespace: h ?? (N == null ? void 0 : N.namespace) ?? Ve.namespace,
      adapter: (N == null ? void 0 : N.adapter) ?? C.storage ?? Ve.adapter,
      ...N
    },
    [h, C.storage, N]
  ), z = Q(
    () => i === !1 ? void 0 : { ...qt, ...i },
    [i]
  ), V = (k == null ? void 0 : k.status) === "valid" || (k == null ? void 0 : k.status) === "degraded" ? k.deck : void 0, p = (V == null ? void 0 : V.slides.find((e) => e.id === F)) ?? (V == null ? void 0 : V.slides[0]), ge = W(v.content) !== W(Ne.content), ht = Q(() => {
    const e = /* @__PURE__ */ new Map();
    for (const a of ["eyebrow", "footer"])
      Ut(v, a) && e.set(a, Pe(v, a));
    return e;
  }, [v]), Y = T(
    (e, a, u) => {
      const y = {
        reason: a,
        deckId: n,
        selectedSlideId: u ?? F,
        sourceHash: W(e.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      E || de(e), S == null || S(e, y);
    },
    [E, n, S, F]
  );
  J(() => {
    let e = !1;
    return ze(v, {
      runtime: C,
      mode: "editor"
    }).then((a) => {
      var u;
      e || (ue(a), (u = pe.current) == null || u.call(pe, a));
    }).catch((a) => {
      var u;
      (u = ve.current) == null || u.call(ve, {
        message: a instanceof Error ? a.message : "Deck compilation failed.",
        cause: a
      });
    }), () => {
      e = !0;
    };
  }, [d, C, v]), J(() => {
    if (!V || F)
      return;
    const e = V.slides[0];
    e && b(e.id);
  }, [V, F]), J(() => {
    !(o != null && o.recoverOnMount) || $e.current || ($e.current = !0, Promise.all([
      o.adapter.loadCurrent({ deckId: n, namespace: o.namespace }),
      o.adapter.loadDraft({ deckId: n, namespace: o.namespace }),
      o.adapter.listVersions({ deckId: n, namespace: o.namespace })
    ]).then(([e, a, u]) => {
      if (!a)
        return;
      const y = W(v.content), P = a.sourceHash !== y, re = !e || a.sourceHash !== e.sourceHash, ae = !e || a.updatedAtIso > e.updatedAtIso;
      !P || !re || !ae || U({
        draft: a,
        current: e,
        versions: u
      });
    }).catch((e) => {
      m == null || m({
        message: e instanceof Error ? e.message : "Unable to inspect deck recovery state.",
        cause: e
      });
    }));
  }, [n, m, Y, v.content, o]), J(() => {
    if (!o || !z || !o.saveDraftOnChange)
      return;
    const e = window.setTimeout(() => {
      o.adapter.saveDraft({
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: Sn(),
        source: v,
        sourceHash: W(v.content),
        selectedSlideId: F,
        compilerStatus: (k == null ? void 0 : k.status) ?? "invalid"
      });
    }, z.draftDebounceMs);
    return () => window.clearTimeout(e);
  }, [z, k, n, F, v, o]);
  const j = T(() => {
    o && o.adapter.listVersions({ deckId: n, namespace: o.namespace }).then(ft).catch((e) => {
      m == null || m({
        message: e instanceof Error ? e.message : "Unable to list deck versions.",
        cause: e
      });
    });
  }, [n, m, o]);
  J(() => {
    j();
  }, [j]);
  const $ = T(
    async (e, a) => {
      var P;
      if (!o)
        return;
      const u = (k == null ? void 0 : k.diagnostics) ?? [], y = await o.adapter.createVersion({
        id: Te(),
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: a,
        reason: e,
        source: v,
        sourceHash: W(v.content),
        selectedSlideId: F,
        compilerStatus: (k == null ? void 0 : k.status) ?? "invalid",
        diagnosticsSummary: _e(u),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      y.status !== "success" && (m == null || m({ message: ((P = y.diagnostics[0]) == null ? void 0 : P.message) ?? "Unable to save deck version." })), j();
    },
    [k, n, m, j, F, v, o]
  ), be = T(
    async (e, a, u, y) => {
      var ae;
      if (!o)
        return;
      const P = await ze(e, {
        runtime: C,
        mode: "editor"
      }), re = await o.adapter.createVersion({
        id: Te(),
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: u,
        reason: a,
        source: e,
        sourceHash: W(e.content),
        selectedSlideId: y,
        compilerStatus: P.status,
        diagnosticsSummary: _e(P.diagnostics),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      re.status !== "success" && (m == null || m({ message: ((ae = re.diagnostics[0]) == null ? void 0 : ae.message) ?? "Unable to save deck version." })), j();
    },
    [n, d, m, j, C, o]
  );
  J(() => {
    if (!o || !z || !o.saveDraftOnChange || z.createVersionOnValidDeckOnly && (k == null ? void 0 : k.status) === "invalid")
      return;
    const e = window.setTimeout(() => {
      const a = W(v.content);
      We.current !== a && (We.current = a, $("autosave", "Autosave"));
    }, z.versionIntervalMs);
    return () => window.clearTimeout(e);
  }, [z, k == null ? void 0 : k.status, $, v.content, o]);
  const mt = T(() => {
    o && (o.adapter.saveCurrent({
      deckId: n,
      namespace: o.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: v,
      sourceHash: W(v.content),
      selectedSlideId: F
    }), o.createVersionOnManualSave && $("manual", "Manual save"), He(v), Be(F), L == null || L({
      deckId: n,
      sourceHash: W(v.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [$, n, L, F, v, o]), _ = T(
    async (e, a) => {
      var y;
      if (!o)
        return;
      const u = await o.adapter.saveCurrent({
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        source: e,
        sourceHash: W(e.content),
        selectedSlideId: a
      });
      if (u.status !== "success") {
        m == null || m({ message: ((y = u.diagnostics[0]) == null ? void 0 : y.message) ?? "Unable to save current deck." });
        return;
      }
      He(e), Be(a);
    },
    [n, m, o]
  ), pt = T(() => {
    !ge || !window.confirm(
      "Annuler les modifications non sauvegardées et revenir à la dernière version sauvegardée ?"
    ) || (b(Ce), Y(Ne, "cancel-edit", Ce));
  }, [Ce, Ne, Y, ge]), Ee = T(
    async (e) => {
      if (!o)
        return;
      o.createVersionBeforeDestructiveAction && await $("before-version-restore", "Before restore");
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && (b(a.selectedSlideId), Y(a.source, "version-restore", a.selectedSlideId), await _(a.source, a.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), M == null || M({
        deckId: n,
        versionId: e,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [$, n, M, Y, _, o]
  ), vt = T(
    async (e) => {
      var u;
      if (!o)
        return;
      const a = await o.adapter.deleteVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a.status !== "success" && (m == null || m({ message: ((u = a.diagnostics[0]) == null ? void 0 : u.message) ?? "Unable to delete deck version." })), j();
    },
    [n, m, j, o]
  ), gt = T(
    async (e, a) => {
      var P;
      if (!o)
        return;
      const u = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      if (!u)
        return;
      const y = await o.adapter.createVersion({
        ...u,
        label: a,
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      y.status !== "success" && (m == null || m({ message: ((P = y.diagnostics[0]) == null ? void 0 : P.message) ?? "Unable to rename deck version." })), j();
    },
    [n, m, j, o]
  ), je = T(
    async (e) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && fe({
        title: "Version vs courant",
        leftLabel: a.label ?? a.reason,
        leftSource: a.source.content,
        rightLabel: "Courant",
        rightSource: v.content
      });
    },
    [n, v.content, o]
  ), bt = T(
    async (e) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && we({
        title: a.label ?? a.reason,
        label: "Source YAML",
        source: a.source.content
      });
    },
    [n, o]
  ), kt = T(
    async (e, a) => {
      if (!o)
        return;
      const [u, y] = await Promise.all([
        o.adapter.loadVersion({
          deckId: n,
          namespace: o.namespace,
          versionId: e
        }),
        o.adapter.loadVersion({
          deckId: n,
          namespace: o.namespace,
          versionId: a
        })
      ]);
      !u || !y || fe({
        title: "Comparaison de versions",
        leftLabel: u.label ?? u.reason,
        leftSource: u.source.content,
        rightLabel: y.label ?? y.reason,
        rightSource: y.source.content
      });
    },
    [n, o]
  ), yt = T(async () => {
    !I || !o || (o.createVersionBeforeDestructiveAction && await $("before-version-restore", "Before recovery restore"), b(I.draft.selectedSlideId), Y(I.draft.source, "crash-recovery", I.draft.selectedSlideId), await _(I.draft.source, I.draft.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), U(null));
  }, [$, n, Y, I, _, o]), wt = T(() => {
    I && we({
      title: "Draft local",
      label: "Source YAML",
      source: I.draft.source.content
    });
  }, [I]), St = T(() => {
    var e;
    I && fe({
      title: "Draft vs courant",
      leftLabel: "Draft local",
      leftSource: I.draft.source.content,
      rightLabel: "Courant",
      rightSource: ((e = I.current) == null ? void 0 : e.source.content) ?? v.content
    });
  }, [I, v.content]), Dt = T(async () => {
    I && (await be(
      I.draft.source,
      "manual",
      "Copie du draft de recovery",
      I.draft.selectedSlideId
    ), ye(!0), U(null));
  }, [be, I]), Nt = T(
    async (e) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && (await be(
        a.source,
        "manual",
        `Copie - ${a.label ?? a.reason}`,
        a.selectedSlideId
      ), ye(!0), U(null));
    },
    [be, n, o]
  ), Ct = T(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), U(null));
  }, [n, o]), Vt = T(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), await _(v, p == null ? void 0 : p.id), U(null));
  }, [n, _, p == null ? void 0 : p.id, v, o]);
  function It(e) {
    oe.current = e, b(e), R == null || R({ deckId: n, slideId: e });
  }
  function K(e, a, u = p == null ? void 0 : p.id) {
    Y(e, a, u);
  }
  function qe(e = "title-body") {
    const a = _t(v, e, p == null ? void 0 : p.id);
    a.slideId && (oe.current = a.slideId, se.includes("form") && Re("form"), b(a.slideId), R == null || R({ deckId: n, slideId: a.slideId })), K(a.source, "slide-add", a.slideId);
  }
  function At(e) {
    !H.allowAddSlide || w || !e.ctrlKey || e.altKey || e.key.toLowerCase() !== "m" || (e.preventDefault(), e.stopPropagation(), qe(e.shiftKey && p ? p.layout.name : "title-body"));
  }
  function xt() {
    p && (o != null && o.createVersionBeforeDestructiveAction && $("before-slide-delete", "Before slide delete"), K(Qt(v, p.id), "slide-delete"));
  }
  function Pt(e, a) {
    !H.allowReorderSlides || w || (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("application/x-qastia-slide-id", a), e.dataTransfer.setData("text/plain", a), te({ draggedSlideId: a }));
  }
  function Tt(e, a) {
    const u = A == null ? void 0 : A.draggedSlideId;
    !H.allowReorderSlides || w || !u || u === a || (e.preventDefault(), e.dataTransfer.dropEffect = "move", te({
      draggedSlideId: u,
      targetSlideId: a,
      placement: tt(e)
    }));
  }
  function Mt(e, a) {
    const u = (A == null ? void 0 : A.draggedSlideId) || e.dataTransfer.getData("application/x-qastia-slide-id") || e.dataTransfer.getData("text/plain");
    if (!H.allowReorderSlides || w || !u || u === a) {
      te(null);
      return;
    }
    e.preventDefault();
    const y = (A == null ? void 0 : A.targetSlideId) === a && A.placement ? A.placement : tt(e);
    te(null), b(u), K(Xt(v, u, a, y), "slide-reorder", u), R == null || R({ deckId: n, slideId: u });
  }
  const Rt = (k == null ? void 0 : k.diagnostics) ?? [], ne = se.includes(q) ? q : se[0], Ke = (V == null ? void 0 : V.theme.cssClassName) ?? "", Ge = V ? $t(V.theme) : void 0, le = (V == null ? void 0 : V.metadata.title) ?? "Deck";
  function Lt() {
    w || (me(le), De(!0));
  }
  function Ue() {
    const e = Fe.trim() || le;
    De(!1), me(e), e !== le && K(Yt(v, e), "metadata-edit", p == null ? void 0 : p.id);
  }
  function Ft() {
    De(!1), me(le);
  }
  return J(() => {
    if (!oe.current || oe.current !== (p == null ? void 0 : p.id))
      return;
    const e = Oe.current, a = window.setTimeout(() => {
      const u = e == null ? void 0 : e.querySelector(
        ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main"
      ), y = u != null && u.matches("textarea") ? u : u == null ? void 0 : u.querySelector(
        "input:not([type='checkbox']):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])"
      );
      if (oe.current = null, y) {
        y.focus();
        return;
      }
      e == null || e.focus();
    }, 0);
    return () => window.clearTimeout(a);
  }, [ne, p == null ? void 0 : p.id, v.content]), /* @__PURE__ */ c(
    "div",
    {
      className: "deck-studio-root",
      "data-density": O.density,
      "data-slide-rail": O.showSlideRail ? "visible" : "hidden",
      "data-inspector": O.showInspector ? "visible" : "hidden",
      onKeyDown: At,
      children: [
        O.showSlideRail ? /* @__PURE__ */ c("aside", { className: "deck-studio-rail", style: { width: O.slideRailWidthPx }, children: [
          /* @__PURE__ */ r("header", { children: dt ? /* @__PURE__ */ r(
            "input",
            {
              className: "deck-studio-title-input",
              "aria-label": "Titre du slideshow",
              value: Fe,
              autoFocus: !0,
              onFocus: (e) => e.currentTarget.select(),
              onChange: (e) => me(e.currentTarget.value),
              onBlur: Ue,
              onKeyDown: (e) => {
                e.key === "Enter" && (e.preventDefault(), Ue()), e.key === "Escape" && (e.preventDefault(), Ft());
              }
            }
          ) : /* @__PURE__ */ r(
            "strong",
            {
              className: "deck-studio-title-label",
              title: w ? void 0 : "Double-cliquer pour modifier",
              onDoubleClick: Lt,
              children: le
            }
          ) }),
          /* @__PURE__ */ r("nav", { "aria-label": "Slides", children: V == null ? void 0 : V.slides.map((e) => /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: e.id === (p == null ? void 0 : p.id) ? "is-active" : void 0,
              draggable: H.allowReorderSlides && !w,
              "data-drop-position": (A == null ? void 0 : A.targetSlideId) === e.id ? A.placement : void 0,
              "aria-grabbed": (A == null ? void 0 : A.draggedSlideId) === e.id ? "true" : void 0,
              onClick: () => It(e.id),
              onDragStart: (a) => Pt(a, e.id),
              onDragOver: (a) => Tt(a, e.id),
              onDragLeave: () => {
                (A == null ? void 0 : A.targetSlideId) === e.id && te({ draggedSlideId: A.draggedSlideId });
              },
              onDrop: (a) => Mt(a, e.id),
              onDragEnd: () => te(null),
              children: [
                /* @__PURE__ */ r("span", { children: e.index + 1 }),
                /* @__PURE__ */ r("span", { children: Nn(e) }),
                /* @__PURE__ */ r("small", { children: e.layout.name })
              ]
            },
            e.id
          )) })
        ] }) : null,
        /* @__PURE__ */ c("main", { className: "deck-studio-main", ref: Oe, tabIndex: -1, children: [
          /* @__PURE__ */ c("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ r("div", { className: "deck-studio-slide-heading", children: H.allowLayoutChange && p && ne !== "source" ? /* @__PURE__ */ r("label", { className: "deck-layout-select", children: /* @__PURE__ */ r(
              "select",
              {
                "aria-label": "Layout de la slide",
                value: p.layout.name,
                onChange: (e) => {
                  o != null && o.createVersionBeforeDestructiveAction && $("before-layout-change", "Before layout change"), K(
                    zt(v, p.id, e.currentTarget.value, C.layouts),
                    "layout-change"
                  );
                },
                disabled: w,
                children: Array.from(C.layouts.values()).map((e) => /* @__PURE__ */ r("option", { value: e.name, children: e.displayName }, e.name))
              }
            ) }) : null }),
            /* @__PURE__ */ c("div", { className: "deck-studio-actions", children: [
              O.showSourceModeToggle && se.length > 1 ? /* @__PURE__ */ c("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ r("span", { children: "Editor view" }),
                /* @__PURE__ */ r(
                  "select",
                  {
                    value: ne,
                    onChange: (e) => Re(e.currentTarget.value),
                    children: se.map((e) => /* @__PURE__ */ r("option", { value: e, children: Dn(e) }, e))
                  }
                )
              ] }) : null,
              /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => Le(!0),
                  disabled: w,
                  children: "Global"
                }
              ),
              H.allowAddSlide ? /* @__PURE__ */ r("button", { type: "button", onClick: () => qe(), disabled: w, children: "Add" }) : null,
              H.allowDuplicateSlide && p ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => K(Jt(v, p.id), "slide-duplicate"),
                  disabled: w,
                  children: "Duplicate"
                }
              ) : null,
              H.allowDeleteSlide && p ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: xt,
                  disabled: w || ((V == null ? void 0 : V.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              o ? /* @__PURE__ */ c(Ht, { children: [
                /* @__PURE__ */ r("button", { type: "button", onClick: mt, disabled: w || !ge, children: "Save" }),
                /* @__PURE__ */ r(
                  "button",
                  {
                    type: "button",
                    className: "deck-shortcuts-help-button",
                    "aria-label": "Afficher les raccourcis clavier",
                    onClick: () => Se(!0),
                    children: "?"
                  }
                ),
                /* @__PURE__ */ r("button", { type: "button", onClick: pt, disabled: w || !ge, children: "Cancel" })
              ] }) : /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  className: "deck-shortcuts-help-button",
                  "aria-label": "Afficher les raccourcis clavier",
                  onClick: () => Se(!0),
                  children: "?"
                }
              )
            ] })
          ] }),
          ne === "source" ? /* @__PURE__ */ r(
            "textarea",
            {
              className: "deck-source-editor",
              value: v.content,
              onChange: (e) => K({ ...v, content: e.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: w
            }
          ) : ne === "preview" && p ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${Ke}`,
              "aria-label": "Slide preview",
              tabIndex: -1,
              style: Ge,
              children: /* @__PURE__ */ r(Je, { slide: p, target: "screen" })
            }
          ) : p ? /* @__PURE__ */ r("div", { className: "deck-studio-editor", children: /* @__PURE__ */ r(
            an,
            {
              source: v,
              slideId: p.id,
              fields: p.layout.definition.editor.fieldGroups.flatMap((e) => e.fields),
              inheritedMarkdownSlots: ht,
              readOnly: !!w,
              onUpdate: K
            }
          ) }) : (k == null ? void 0 : k.status) === "invalid" ? /* @__PURE__ */ r(Wt, { fallback: k.fallback }) : null,
          O.showActiveSlidePreview && ne !== "preview" && p ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview ${Ke}`,
              "aria-label": "Active slide preview",
              style: Ge,
              children: /* @__PURE__ */ r(Je, { slide: p, target: "screen" })
            }
          ) : null
        ] }),
        O.showInspector ? /* @__PURE__ */ c("aside", { className: "deck-studio-inspector", style: { width: O.inspectorWidthPx }, children: [
          O.showDiagnosticsPanel ? /* @__PURE__ */ c("section", { children: [
            /* @__PURE__ */ r("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ r(rt, { diagnostics: Rt })
          ] }) : null,
          (O.showVersionHistory || lt) && o ? /* @__PURE__ */ r(
            bn,
            {
              versions: ut,
              readOnly: !!w,
              canRestore: H.allowVersionRestore,
              canCompare: H.allowVersionCompare,
              onCreateManualVersion: (e) => {
                _(v, p == null ? void 0 : p.id), $("manual", e ?? "Manual save");
              },
              onRestoreVersion: (e) => void Ee(e),
              onDeleteVersion: (e) => void vt(e),
              onRenameVersion: (e, a) => void gt(e, a),
              onCompareWithCurrent: (e) => void je(e),
              onCompareVersions: (e, a) => void kt(e, a)
            }
          ) : null
        ] }) : null,
        st ? /* @__PURE__ */ r(
          un,
          {
            source: v,
            readOnly: !!w,
            onUpdate: K,
            onClose: () => Le(!1)
          }
        ) : null,
        I ? /* @__PURE__ */ r(
          fn,
          {
            draft: I.draft,
            current: I.current,
            versions: I.versions,
            onRestoreDraft: () => void yt(),
            onRestoreVersion: (e) => {
              U(null), Ee(e);
            },
            onPreviewDraft: wt,
            onPreviewVersion: (e) => void bt(e),
            onCompareDraftWithCurrent: St,
            onCompareVersionWithCurrent: (e) => void je(e),
            onCreateCopyFromDraft: () => void Dt(),
            onCreateCopyFromVersion: (e) => void Nt(e),
            onDeleteDraft: () => void Ct(),
            onKeepCurrent: () => void Vt(),
            onOpenVersionHistory: () => {
              ye(!0), U(null);
            }
          }
        ) : null,
        ee ? /* @__PURE__ */ r(
          hn,
          {
            title: ee.title,
            leftLabel: ee.leftLabel,
            leftSource: ee.leftSource,
            rightLabel: ee.rightLabel,
            rightSource: ee.rightSource,
            onClose: () => fe(null)
          }
        ) : null,
        he ? /* @__PURE__ */ r(
          yn,
          {
            title: he.title,
            label: he.label,
            source: he.source,
            onClose: () => we(null)
          }
        ) : null,
        ct ? /* @__PURE__ */ r(wn, { onClose: () => Se(!1) }) : null
      ]
    }
  );
}
function wn({ onClose: t }) {
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
          /* @__PURE__ */ r("button", { type: "button", onClick: t, children: "Fermer" })
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
function Sn() {
  const t = "deck-runtime-session-id", i = window.sessionStorage.getItem(t);
  if (i)
    return i;
  const n = Te();
  return window.sessionStorage.setItem(t, n), n;
}
function Te() {
  const t = Math.random().toString(16).slice(2, 10);
  return `${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}_${t}`;
}
function Dn(t) {
  return t === "source" ? "YAML" : t === "preview" ? "Preview" : "Form";
}
function Nn(t) {
  const i = t.slots.get("title"), n = (i == null ? void 0 : i.content.kind) === "markdown" ? i.content.markdown : void 0;
  return (n == null ? void 0 : n.split(/\r?\n/).map((l) => l.replace(/^#{1,6}\s+/, "").trim()).find((l) => l.length > 0)) ?? `Slide ${t.index + 1}`;
}
function tt(t) {
  const i = t.currentTarget.getBoundingClientRect();
  return i.height <= 0 || t.clientY > i.top + i.height / 2 ? "after" : "before";
}
export {
  Mn as D,
  Wt as a
};
