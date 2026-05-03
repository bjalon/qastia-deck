import { jsxs as c, jsx as r, Fragment as Et } from "react/jsx-runtime";
import { useState as x, useMemo as ee, useRef as oe, useCallback as P, useEffect as Z } from "react";
import { h as W, c as Qe, s as Xe } from "./hash-BGAdcMpD.js";
import { L as jt, d as qt } from "./defaultDeckRuntime-CO0C-Lgd.js";
import { d as Yt } from "./themeStyle-CyBLqMAf.js";
import { S as Ze } from "./SlideRenderer-iimFvRrx.js";
import it from "yaml";
function Kt({ fallback: t }) {
  return /* @__PURE__ */ c("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ r("header", { children: /* @__PURE__ */ r("h2", { children: t.title }) }),
    /* @__PURE__ */ r(ot, { diagnostics: t.diagnostics }),
    /* @__PURE__ */ r("pre", { children: t.source.content })
  ] });
}
function ot({
  diagnostics: t
}) {
  return t.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ r("ul", { className: "deck-diagnostics-list", children: t.map((i, n) => /* @__PURE__ */ c("li", { "data-severity": i.severity, children: [
    /* @__PURE__ */ r("strong", { children: i.code }),
    /* @__PURE__ */ r("span", { children: i.message }),
    i.hint ? /* @__PURE__ */ r("small", { children: i.hint }) : null
  ] }, `${i.code}-${n}`)) });
}
const Gt = {
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
}, Ut = {
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
}, Ie = {
  adapter: new jt(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, zt = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function U(t) {
  try {
    const i = it.parse(t.content);
    return B(i) ? i : null;
  } catch {
    return null;
  }
}
function ne(t, i) {
  return {
    ...t,
    content: it.stringify(i, { lineWidth: 0 })
  };
}
function te(t) {
  return Array.isArray(t.slides) || (t.slides = []), t.slides.filter(B);
}
function Ae(t, i, n, s) {
  return ye(t, i, (l) => {
    const u = lt(l);
    u[n] = { markdown: s };
  });
}
function _t(t, i, n) {
  return ye(t, i, (s) => {
    B(s.slots) && (delete s.slots[n], Object.keys(s.slots).length === 0 && delete s.slots);
  });
}
function Jt(t, i, n) {
  return Re(t, i, n) !== void 0;
}
function Me(t, i) {
  const n = st(t, i);
  return B(n) && typeof n.markdown == "string" ? n.markdown : "";
}
function Qt(t, i) {
  return st(t, i) !== void 0;
}
function et(t, i, n) {
  const s = U(t);
  if (!s)
    return t;
  const l = sn(s);
  return l[i] = { markdown: n }, ne(t, s);
}
function Xt(t, i) {
  const n = U(t);
  return n ? (B(n.metadata) || (n.metadata = {}), n.metadata.title = i, ne(t, n)) : t;
}
function xe(t, i, n, s) {
  return ye(t, i, (l) => {
    const u = lt(l);
    u[n] = {
      image: cn({
        assetId: s.assetId,
        src: s.src,
        alt: s.alt
      })
    };
  });
}
function Zt(t, i, n, s) {
  return ye(t, i, (l) => {
    s && l.layout && l.layout !== n && (l.slots = ln(l, n, s)), l.layout = n;
  });
}
function en(t, i = "title-body", n) {
  const s = U(t);
  if (!s)
    return { source: t };
  const l = te(s), u = ct(l, "slide"), d = {
    id: u,
    layout: i,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }, h = n ? l.findIndex((D) => D.id === n) : -1;
  return l.splice(h >= 0 ? h + 1 : l.length, 0, d), s.slides = l, { source: ne(t, s), slideId: u };
}
function tn(t, i) {
  const n = U(t);
  if (!n)
    return t;
  const s = te(n), l = s.findIndex((d) => d.id === i);
  if (l < 0)
    return t;
  const u = structuredClone(s[l]);
  return u.id = ct(s, `${i}-copy`), s.splice(l + 1, 0, u), n.slides = s, ne(t, n);
}
function nn(t, i) {
  const n = U(t);
  if (!n)
    return t;
  const s = te(n).filter((l) => l.id !== i);
  return n.slides = s.length > 0 ? s : te(n), ne(t, n);
}
function rn(t, i, n, s) {
  if (i === n)
    return t;
  const l = U(t);
  if (!l)
    return t;
  const u = te(l), d = u.findIndex((M) => M.id === i), h = u.findIndex((M) => M.id === n);
  if (d < 0 || h < 0)
    return t;
  const [D] = u.splice(d, 1), S = u.findIndex((M) => M.id === n), p = s === "after" ? S + 1 : S;
  return u.splice(p, 0, D), l.slides = u, ne(t, l);
}
function an(t, i, n) {
  const s = Re(t, i, n);
  return B(s) && typeof s.markdown == "string" ? s.markdown : "";
}
function on(t, i, n) {
  const s = Re(t, i, n), l = B(s) && B(s.image) ? s.image : {};
  return {
    assetId: typeof l.assetId == "string" ? l.assetId : "",
    src: typeof l.src == "string" ? l.src : "",
    alt: typeof l.alt == "string" ? l.alt : ""
  };
}
function ye(t, i, n) {
  const s = U(t);
  if (!s)
    return t;
  const l = te(s), u = l.find((d) => d.id === i);
  return u ? (n(u), s.slides = l, ne(t, s)) : t;
}
function Re(t, i, n) {
  var u;
  const s = U(t);
  if (!s)
    return;
  const l = te(s).find((d) => d.id === i);
  return (u = l == null ? void 0 : l.slots) == null ? void 0 : u[n];
}
function st(t, i) {
  var s;
  const n = U(t);
  if (n)
    return B((s = n.defaults) == null ? void 0 : s.slots) ? n.defaults.slots[i] : void 0;
}
function lt(t) {
  return B(t.slots) || (t.slots = {}), t.slots;
}
function sn(t) {
  return B(t.defaults) || (t.defaults = {}), B(t.defaults.slots) || (t.defaults.slots = {}), t.defaults.slots;
}
function ln(t, i, n) {
  var d, h;
  const s = B(t.slots) ? t.slots : {}, l = t.layout ? (h = (d = n.get(i)) == null ? void 0 : d.migrateFrom) == null ? void 0 : h[t.layout] : void 0;
  if (!l)
    return s;
  const u = {};
  for (const D of l.operations)
    D.kind === "move-slot" && D.from in s && (u[D.to] = s[D.from]);
  return u;
}
function ct(t, i) {
  const n = new Set(t.map((u) => u.id).filter((u) => !!u));
  let s = tt(i), l = 2;
  for (; n.has(s); )
    s = `${tt(i)}-${l}`, l += 1;
  return s;
}
function tt(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function cn(t) {
  return Object.fromEntries(
    Object.entries(t).filter((i) => !!i[1])
  );
}
function B(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function dn({
  fields: t,
  inheritedMarkdownSlots: i,
  onUpdate: n,
  readOnly: s,
  slideId: l,
  source: u
}) {
  return /* @__PURE__ */ r("form", { className: "deck-slide-form", children: t.map((d) => /* @__PURE__ */ r(
    un,
    {
      source: u,
      slideId: l,
      field: d,
      inheritedMarkdownSlots: i,
      readOnly: s,
      onUpdate: n
    },
    `${d.kind}-${"slotName" in d ? d.slotName : d.label}`
  )) });
}
function un({
  source: t,
  slideId: i,
  field: n,
  inheritedMarkdownSlots: s,
  readOnly: l,
  onUpdate: u
}) {
  if (n.kind === "markdown") {
    const d = n.blockKind === "heading" || n.slotName === "title", h = fn(n.slotName) ? s == null ? void 0 : s.get(n.slotName) : void 0, D = h !== void 0, S = D && Jt(t, i, n.slotName), p = D && !S ? h : an(t, i, n.slotName), M = d || mn(n), L = M ? hn(p, d) : p, T = l || D && !S, w = M ? /* @__PURE__ */ r(
      "input",
      {
        "aria-label": n.label,
        className: "deck-form-input",
        placeholder: " ",
        value: L,
        onFocus: (N) => N.currentTarget.select(),
        onChange: (N) => u(
          Ae(t, i, n.slotName, N.currentTarget.value),
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
        onFocus: (N) => pn(N.currentTarget),
        onChange: (N) => u(
          Ae(t, i, n.slotName, N.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: T
      }
    );
    return /* @__PURE__ */ c(
      "div",
      {
        className: "deck-form-field",
        "data-inherited": D && !S ? "true" : void 0,
        children: [
          /* @__PURE__ */ r("span", { children: n.label }),
          /* @__PURE__ */ c("div", { className: "deck-form-field__control", children: [
            w,
            D ? /* @__PURE__ */ r("label", { className: "deck-inherited-slot-toggle", title: "Override global", children: /* @__PURE__ */ r(
              "input",
              {
                "aria-label": `Override ${n.label} global`,
                title: `Override ${n.label} global`,
                type: "checkbox",
                checked: S,
                onChange: (N) => u(
                  N.currentTarget.checked ? Ae(t, i, n.slotName, h) : _t(t, i, n.slotName),
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
    const d = on(t, i, n.slotName);
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
            onChange: (h) => u(
              xe(t, i, n.slotName, {
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
            onChange: (h) => u(
              xe(t, i, n.slotName, {
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
            onChange: (h) => u(
              xe(t, i, n.slotName, {
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
function fn(t) {
  return t === "eyebrow" || t === "footer";
}
function mn(t) {
  return t.kind !== "markdown" ? !1 : t.minRows === 1 || t.slotName === "eyebrow" || t.slotName === "subtitle" || t.slotName === "footer";
}
function hn(t, i) {
  return (i ? t.replace(/^(\s*)#{1,6}\s+/u, "$1") : t).replace(/\s*\n\s*/gu, " ").trim();
}
function pn(t) {
  const i = t.value.length;
  t.setSelectionRange(i, i);
}
function vn({
  onClose: t,
  onUpdate: i,
  readOnly: n,
  source: s
}) {
  const l = Me(s, "eyebrow"), u = Me(s, "footer");
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
                  et(s, "eyebrow", d.currentTarget.value),
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
                  et(s, "footer", d.currentTarget.value),
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
function gn({
  draft: t,
  current: i,
  versions: n,
  onRestoreDraft: s,
  onRestoreVersion: l,
  onPreviewDraft: u,
  onPreviewVersion: d,
  onCompareDraftWithCurrent: h,
  onCompareVersionWithCurrent: D,
  onCreateCopyFromDraft: S,
  onCreateCopyFromVersion: p,
  onDeleteDraft: M,
  onKeepCurrent: L,
  onOpenVersionHistory: T
}) {
  const w = n.slice(0, 4), N = Pe(t.updatedAtIso), m = i ? Pe(i.updatedAtIso) : "Aucune sauvegarde courante";
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
              /* @__PURE__ */ r("span", { className: "deck-recovery-status", "data-status": t.compilerStatus, children: nt(t.compilerStatus) })
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
                /* @__PURE__ */ r("dd", { children: m })
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
                    Pe(C.createdAtIso),
                    " - ",
                    nt(C.compilerStatus)
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
                /* @__PURE__ */ r("button", { type: "button", onClick: () => D(C.id), children: "Différences" }),
                /* @__PURE__ */ r("button", { type: "button", onClick: () => p(C.id), children: "Copier" })
              ] })
            ] }, C.id)) })
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
function Pe(t) {
  return new Date(t).toLocaleString(void 0, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
function nt(t) {
  return t === "valid" ? "utilisable" : t === "degraded" ? "avec alertes" : "avec erreurs";
}
function bn({
  title: t,
  leftLabel: i,
  leftSource: n,
  rightLabel: s,
  rightSource: l,
  onClose: u
}) {
  const d = kn(n, l), h = d.filter((S) => S.kind === "added").length, D = d.filter((S) => S.kind === "removed").length;
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
          /* @__PURE__ */ r("button", { type: "button", onClick: u, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-diff-summary", role: "status", children: [
          /* @__PURE__ */ c("span", { "data-kind": "added", children: [
            h,
            " ajout(s)"
          ] }),
          /* @__PURE__ */ c("span", { "data-kind": "removed", children: [
            D,
            " suppression(s)"
          ] }),
          h === 0 && D === 0 ? /* @__PURE__ */ r("span", { children: "Aucune différence détectée." }) : null
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-diff-legend", "aria-hidden": "true", children: [
          /* @__PURE__ */ r("span", { "data-kind": "removed", children: "- supprimé" }),
          /* @__PURE__ */ r("span", { "data-kind": "added", children: "+ ajouté" }),
          /* @__PURE__ */ r("span", { "data-kind": "unchanged", children: "inchangé" })
        ] }),
        /* @__PURE__ */ r("pre", { className: "deck-diff-view", "aria-label": "Diff des versions", children: d.map((S, p) => /* @__PURE__ */ c("div", { className: "deck-diff-line", "data-kind": S.kind, children: [
          /* @__PURE__ */ r("span", { className: "deck-diff-marker", children: wn(S.kind) }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: S.leftNumber ?? "" }),
          /* @__PURE__ */ r("span", { className: "deck-diff-number", children: S.rightNumber ?? "" }),
          /* @__PURE__ */ r("code", { children: S.content || " " })
        ] }, `${p}-${S.kind}`)) })
      ]
    }
  ) });
}
function kn(t, i) {
  const n = rt(t), s = rt(i), l = yn(n, s), u = [];
  let d = 0, h = 0;
  for (; d < n.length || h < s.length; ) {
    if (d < n.length && h < s.length && n[d] === s[h]) {
      u.push({
        kind: "unchanged",
        content: n[d] ?? "",
        leftNumber: d + 1,
        rightNumber: h + 1
      }), d += 1, h += 1;
      continue;
    }
    if (h < s.length && (d >= n.length || l[d][h + 1] >= l[d + 1][h])) {
      u.push({
        kind: "added",
        content: s[h] ?? "",
        rightNumber: h + 1
      }), h += 1;
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
function rt(t) {
  const i = t.replace(/\r\n/g, `
`).split(`
`);
  return i.at(-1) === "" ? i.slice(0, -1) : i;
}
function yn(t, i) {
  const n = Array.from(
    { length: t.length + 1 },
    () => Array.from({ length: i.length + 1 }, () => 0)
  );
  for (let s = t.length - 1; s >= 0; s -= 1)
    for (let l = i.length - 1; l >= 0; l -= 1)
      n[s][l] = t[s] === i[l] ? n[s + 1][l + 1] + 1 : Math.max(n[s + 1][l], n[s][l + 1]);
  return n;
}
function wn(t) {
  return t === "added" ? "+" : t === "removed" ? "-" : " ";
}
const Dn = [
  "before-layout-change",
  "before-slide-delete",
  "before-version-restore"
];
function Sn({
  versions: t,
  readOnly: i,
  canRestore: n,
  canCompare: s,
  onCreateManualVersion: l,
  onRestoreVersion: u,
  onDeleteVersion: d,
  onRenameVersion: h,
  onCompareWithCurrent: D,
  onCompareVersions: S
}) {
  const [p, M] = x("all"), [L, T] = x(""), [w, N] = x(null), [m, C] = x(""), [E, de] = x(null), ue = ee(
    () => t.filter((b) => p === "all" ? !0 : p === "safety" ? Dn.includes(b.reason) : b.reason === p),
    [p, t]
  );
  function g() {
    l(L.trim() || void 0), T("");
  }
  function k(b) {
    N(b.id), C(b.label ?? b.reason);
  }
  function fe() {
    if (!w)
      return;
    const b = m.trim();
    b && h(w, b), N(null), C("");
  }
  function F(b) {
    if (!E) {
      de(b);
      return;
    }
    E !== b && S(E, b), de(null);
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
          onChange: (b) => T(b.currentTarget.value),
          disabled: i
        }
      ),
      /* @__PURE__ */ r("button", { type: "button", onClick: g, disabled: i, children: "Créer version" })
    ] }),
    E ? /* @__PURE__ */ r("p", { className: "deck-version-compare-hint", children: "Choisir une seconde version à comparer." }) : null,
    /* @__PURE__ */ r("ul", { className: "deck-version-list", children: ue.map((b) => /* @__PURE__ */ c("li", { children: [
      w === b.id ? /* @__PURE__ */ c("div", { className: "deck-version-rename", children: [
        /* @__PURE__ */ r(
          "input",
          {
            "aria-label": "Renommer version",
            value: m,
            onChange: (K) => C(K.currentTarget.value),
            onKeyDown: (K) => {
              K.key === "Enter" && (K.preventDefault(), fe()), K.key === "Escape" && (K.preventDefault(), N(null));
            }
          }
        ),
        /* @__PURE__ */ r("button", { type: "button", onClick: fe, children: "OK" })
      ] }) : /* @__PURE__ */ r("strong", { children: b.label ?? b.reason }),
      /* @__PURE__ */ c("small", { children: [
        Nn(b.reason),
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
            onClick: () => u(b.id),
            disabled: !n || i,
            children: "Restaurer"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => D(b.id),
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
    ue.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucune version." }) : null
  ] });
}
function Nn(t) {
  return t === "autosave" ? "Autosave" : t === "manual" ? "Manuelle" : t === "crash-recovery" ? "Recovery" : t.startsWith("before-") ? "Sécurité" : t === "external-save" ? "Externe" : "Import";
}
function Cn({
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
function Bn(t) {
  var ze;
  const {
    autosave: i,
    deckId: n,
    features: s,
    initialSelectedSlideId: l,
    layout: u,
    locale: d = "fr-FR",
    namespace: h,
    onChange: D,
    onCompile: S,
    onError: p,
    onRestoreVersion: M,
    onSave: L,
    onSelectedSlideChange: T,
    readOnly: w,
    storage: N
  } = t, m = t.options, C = t.runtime ?? qt, E = t.mode === "controlled", [de, ue] = x(
    E ? t.value : t.initialValue
  ), g = E ? t.value : de, [k, fe] = x(null), [F, b] = x(
    l
  ), [K, Le] = x(
    ((ze = m == null ? void 0 : m.editing) == null ? void 0 : ze.defaultMode) ?? "form"
  ), [dt, Fe] = x(!1), [ut, we] = x(!1), [I, z] = x(null), [re, me] = x(null), [he, De] = x(null), [ft, Se] = x(!1), [mt, Ne] = x(!1), [He, pe] = x(""), [A, ae] = x(null), [ht, pt] = x([]), [Ce, Be] = x(g), [Ve, Oe] = x(
    l
  ), $e = oe(null), ve = oe(S), ge = oe(p), se = oe(null), We = oe(!1), Ee = oe(null);
  ve.current = S, ge.current = p;
  const O = ee(() => {
    const e = { ...Gt, ...u }, a = m == null ? void 0 : m.panels;
    return (a == null ? void 0 : a.slideRail) === !1 ? e.showSlideRail = !1 : a != null && a.slideRail && (e.showSlideRail = a.slideRail.visibleDefault ?? e.showSlideRail, e.slideRailWidthPx = a.slideRail.widthPx ?? e.slideRailWidthPx), (a == null ? void 0 : a.inspector) === !1 ? e.showInspector = !1 : a != null && a.inspector && (e.showInspector = a.inspector.visibleDefault ?? e.showInspector, e.inspectorWidthPx = a.inspector.widthPx ?? e.inspectorWidthPx), (a == null ? void 0 : a.diagnostics) === !1 ? e.showDiagnosticsPanel = !1 : a != null && a.diagnostics && (e.showDiagnosticsPanel = a.diagnostics.visibleDefault ?? e.showDiagnosticsPanel), (a == null ? void 0 : a.activeSlidePreview) === !1 ? e.showActiveSlidePreview = !1 : a != null && a.activeSlidePreview && (e.showActiveSlidePreview = a.activeSlidePreview.visibleDefault ?? e.showActiveSlidePreview), (a == null ? void 0 : a.versionHistory) === !1 ? e.showVersionHistory = !1 : a != null && a.versionHistory && (e.showVersionHistory = a.versionHistory.visibleDefault ?? e.showVersionHistory), e;
  }, [u, m]), H = ee(() => {
    var f, y, R, q, Y;
    const e = { ...Ut, ...s }, a = ((f = m == null ? void 0 : m.editing) == null ? void 0 : f.allowYamlMode) ?? ((y = m == null ? void 0 : m.editing) == null ? void 0 : y.allowSourceMode);
    return a !== void 0 && (e.allowRawSourceEdit = a), ((R = m == null ? void 0 : m.editing) == null ? void 0 : R.allowLayoutChange) !== void 0 && (e.allowLayoutChange = m.editing.allowLayoutChange), ((q = m == null ? void 0 : m.layoutSelector) == null ? void 0 : q.enabled) !== void 0 && (e.allowLayoutChange = m.layoutSelector.enabled), (Y = m == null ? void 0 : m.panels) != null && Y.slideRail && (m.panels.slideRail.allowReorder !== void 0 && (e.allowReorderSlides = m.panels.slideRail.allowReorder), m.panels.slideRail.allowAddDelete !== void 0 && (e.allowAddSlide = m.panels.slideRail.allowAddDelete, e.allowDeleteSlide = m.panels.slideRail.allowAddDelete)), e;
  }, [s, m]), le = ee(() => {
    var q, Y, _e, Je;
    const e = ((q = m == null ? void 0 : m.editing) == null ? void 0 : q.allowYamlMode) ?? ((Y = m == null ? void 0 : m.editing) == null ? void 0 : Y.allowSourceMode) ?? !0, a = ((_e = m == null ? void 0 : m.editing) == null ? void 0 : _e.allowPreviewMode) ?? !0, R = (((Je = m == null ? void 0 : m.editing) == null ? void 0 : Je.viewModes) ?? ["form", "source", "preview"]).filter(
      (X, $t, Wt) => (X === "form" || X === "source" || X === "preview") && Wt.indexOf(X) === $t
    ).filter((X) => X === "source" ? e && H.allowRawSourceEdit : X === "preview" ? a : !0);
    return R.length > 0 ? R : ["form"];
  }, [H.allowRawSourceEdit, m]), o = ee(
    () => N === !1 ? void 0 : {
      ...Ie,
      namespace: h ?? (N == null ? void 0 : N.namespace) ?? Ie.namespace,
      adapter: (N == null ? void 0 : N.adapter) ?? C.storage ?? Ie.adapter,
      ...N
    },
    [h, C.storage, N]
  ), J = ee(
    () => i === !1 ? void 0 : { ...zt, ...i },
    [i]
  ), V = (k == null ? void 0 : k.status) === "valid" || (k == null ? void 0 : k.status) === "degraded" ? k.deck : void 0, v = (V == null ? void 0 : V.slides.find((e) => e.id === F)) ?? (V == null ? void 0 : V.slides[0]), be = W(g.content) !== W(Ce.content), vt = ee(() => {
    const e = /* @__PURE__ */ new Map();
    for (const a of ["eyebrow", "footer"])
      Qt(g, a) && e.set(a, Me(g, a));
    return e;
  }, [g]), _ = P(
    (e, a, f) => {
      const y = {
        reason: a,
        deckId: n,
        selectedSlideId: f ?? F,
        sourceHash: W(e.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      E || ue(e), D == null || D(e, y);
    },
    [E, n, D, F]
  );
  Z(() => {
    let e = !1;
    return Qe(g, {
      runtime: C,
      mode: "editor"
    }).then((a) => {
      var f;
      e || (fe(a), (f = ve.current) == null || f.call(ve, a));
    }).catch((a) => {
      var f;
      (f = ge.current) == null || f.call(ge, {
        message: a instanceof Error ? a.message : "Deck compilation failed.",
        cause: a
      });
    }), () => {
      e = !0;
    };
  }, [d, C, g]), Z(() => {
    if (!V || F)
      return;
    const e = V.slides[0];
    e && b(e.id);
  }, [V, F]), Z(() => {
    !(o != null && o.recoverOnMount) || We.current || (We.current = !0, Promise.all([
      o.adapter.loadCurrent({ deckId: n, namespace: o.namespace }),
      o.adapter.loadDraft({ deckId: n, namespace: o.namespace }),
      o.adapter.listVersions({ deckId: n, namespace: o.namespace })
    ]).then(([e, a, f]) => {
      if (!a)
        return;
      const y = W(g.content), R = a.sourceHash !== y, q = !e || a.sourceHash !== e.sourceHash, Y = !e || a.updatedAtIso > e.updatedAtIso;
      !R || !q || !Y || z({
        draft: a,
        current: e,
        versions: f
      });
    }).catch((e) => {
      p == null || p({
        message: e instanceof Error ? e.message : "Unable to inspect deck recovery state.",
        cause: e
      });
    }));
  }, [n, p, _, g.content, o]), Z(() => {
    if (!o || !J || !o.saveDraftOnChange)
      return;
    const e = window.setTimeout(() => {
      o.adapter.saveDraft({
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: In(),
        source: g,
        sourceHash: W(g.content),
        selectedSlideId: F,
        compilerStatus: (k == null ? void 0 : k.status) ?? "invalid"
      });
    }, J.draftDebounceMs);
    return () => window.clearTimeout(e);
  }, [J, k, n, F, g, o]);
  const j = P(() => {
    o && o.adapter.listVersions({ deckId: n, namespace: o.namespace }).then(pt).catch((e) => {
      p == null || p({
        message: e instanceof Error ? e.message : "Unable to list deck versions.",
        cause: e
      });
    });
  }, [n, p, o]);
  Z(() => {
    j();
  }, [j]);
  const $ = P(
    async (e, a) => {
      var R;
      if (!o)
        return;
      const f = (k == null ? void 0 : k.diagnostics) ?? [], y = await o.adapter.createVersion({
        id: Te(),
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: a,
        reason: e,
        source: g,
        sourceHash: W(g.content),
        selectedSlideId: F,
        compilerStatus: (k == null ? void 0 : k.status) ?? "invalid",
        diagnosticsSummary: Xe(f),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      y.status !== "success" && (p == null || p({ message: ((R = y.diagnostics[0]) == null ? void 0 : R.message) ?? "Unable to save deck version." })), j();
    },
    [k, n, p, j, F, g, o]
  ), ke = P(
    async (e, a, f, y) => {
      var Y;
      if (!o)
        return;
      const R = await Qe(e, {
        runtime: C,
        mode: "editor"
      }), q = await o.adapter.createVersion({
        id: Te(),
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: f,
        reason: a,
        source: e,
        sourceHash: W(e.content),
        selectedSlideId: y,
        compilerStatus: R.status,
        diagnosticsSummary: Xe(R.diagnostics),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      q.status !== "success" && (p == null || p({ message: ((Y = q.diagnostics[0]) == null ? void 0 : Y.message) ?? "Unable to save deck version." })), j();
    },
    [n, d, p, j, C, o]
  );
  Z(() => {
    if (!o || !J || !o.saveDraftOnChange || J.createVersionOnValidDeckOnly && (k == null ? void 0 : k.status) === "invalid")
      return;
    const e = window.setTimeout(() => {
      const a = W(g.content);
      Ee.current !== a && (Ee.current = a, $("autosave", "Autosave"));
    }, J.versionIntervalMs);
    return () => window.clearTimeout(e);
  }, [J, k == null ? void 0 : k.status, $, g.content, o]);
  const gt = P(() => {
    o && (o.adapter.saveCurrent({
      deckId: n,
      namespace: o.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: g,
      sourceHash: W(g.content),
      selectedSlideId: F
    }), o.createVersionOnManualSave && $("manual", "Manual save"), Be(g), Oe(F), L == null || L({
      deckId: n,
      sourceHash: W(g.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [$, n, L, F, g, o]), Q = P(
    async (e, a) => {
      var y;
      if (!o)
        return;
      const f = await o.adapter.saveCurrent({
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        source: e,
        sourceHash: W(e.content),
        selectedSlideId: a
      });
      if (f.status !== "success") {
        p == null || p({ message: ((y = f.diagnostics[0]) == null ? void 0 : y.message) ?? "Unable to save current deck." });
        return;
      }
      Be(e), Oe(a);
    },
    [n, p, o]
  ), bt = P(() => {
    !be || !window.confirm(
      "Annuler les modifications non sauvegardées et revenir à la dernière version sauvegardée ?"
    ) || (b(Ve), _(Ce, "cancel-edit", Ve));
  }, [Ve, Ce, _, be]), je = P(
    async (e) => {
      if (!o)
        return;
      o.createVersionBeforeDestructiveAction && await $("before-version-restore", "Before restore");
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && (b(a.selectedSlideId), _(a.source, "version-restore", a.selectedSlideId), await Q(a.source, a.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), M == null || M({
        deckId: n,
        versionId: e,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [$, n, M, _, Q, o]
  ), kt = P(
    async (e) => {
      var f;
      if (!o)
        return;
      const a = await o.adapter.deleteVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a.status !== "success" && (p == null || p({ message: ((f = a.diagnostics[0]) == null ? void 0 : f.message) ?? "Unable to delete deck version." })), j();
    },
    [n, p, j, o]
  ), yt = P(
    async (e, a) => {
      var R;
      if (!o)
        return;
      const f = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      if (!f)
        return;
      const y = await o.adapter.createVersion({
        ...f,
        label: a,
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      y.status !== "success" && (p == null || p({ message: ((R = y.diagnostics[0]) == null ? void 0 : R.message) ?? "Unable to rename deck version." })), j();
    },
    [n, p, j, o]
  ), qe = P(
    async (e) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && me({
        title: "Version vs courant",
        leftLabel: a.label ?? a.reason,
        leftSource: a.source.content,
        rightLabel: "Courant",
        rightSource: g.content
      });
    },
    [n, g.content, o]
  ), wt = P(
    async (e) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && De({
        title: a.label ?? a.reason,
        label: "Source YAML",
        source: a.source.content
      });
    },
    [n, o]
  ), Dt = P(
    async (e, a) => {
      if (!o)
        return;
      const [f, y] = await Promise.all([
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
      !f || !y || me({
        title: "Comparaison de versions",
        leftLabel: f.label ?? f.reason,
        leftSource: f.source.content,
        rightLabel: y.label ?? y.reason,
        rightSource: y.source.content
      });
    },
    [n, o]
  ), St = P(async () => {
    !I || !o || (o.createVersionBeforeDestructiveAction && await $("before-version-restore", "Before recovery restore"), b(I.draft.selectedSlideId), _(I.draft.source, "crash-recovery", I.draft.selectedSlideId), await Q(I.draft.source, I.draft.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), z(null));
  }, [$, n, _, I, Q, o]), Nt = P(() => {
    I && De({
      title: "Draft local",
      label: "Source YAML",
      source: I.draft.source.content
    });
  }, [I]), Ct = P(() => {
    var e;
    I && me({
      title: "Draft vs courant",
      leftLabel: "Draft local",
      leftSource: I.draft.source.content,
      rightLabel: "Courant",
      rightSource: ((e = I.current) == null ? void 0 : e.source.content) ?? g.content
    });
  }, [I, g.content]), Vt = P(async () => {
    I && (await ke(
      I.draft.source,
      "manual",
      "Copie du draft de recovery",
      I.draft.selectedSlideId
    ), we(!0), z(null));
  }, [ke, I]), It = P(
    async (e) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && (await ke(
        a.source,
        "manual",
        `Copie - ${a.label ?? a.reason}`,
        a.selectedSlideId
      ), we(!0), z(null));
    },
    [ke, n, o]
  ), At = P(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), z(null));
  }, [n, o]), xt = P(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), await Q(g, v == null ? void 0 : v.id), z(null));
  }, [n, Q, v == null ? void 0 : v.id, g, o]);
  function Pt(e) {
    se.current = e, b(e), T == null || T({ deckId: n, slideId: e });
  }
  function G(e, a, f = v == null ? void 0 : v.id) {
    _(e, a, f);
  }
  function Ye(e = "title-body") {
    const a = en(g, e, v == null ? void 0 : v.id);
    a.slideId && (se.current = a.slideId, le.includes("form") && Le("form"), b(a.slideId), T == null || T({ deckId: n, slideId: a.slideId })), G(a.source, "slide-add", a.slideId);
  }
  function Mt(e) {
    !H.allowAddSlide || w || !e.ctrlKey || e.altKey || e.key.toLowerCase() !== "m" || (e.preventDefault(), e.stopPropagation(), Ye(e.shiftKey && v ? v.layout.name : "title-body"));
  }
  function Tt() {
    v && (o != null && o.createVersionBeforeDestructiveAction && $("before-slide-delete", "Before slide delete"), G(nn(g, v.id), "slide-delete"));
  }
  function Rt(e, a) {
    !H.allowReorderSlides || w || (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("application/x-qastia-slide-id", a), e.dataTransfer.setData("text/plain", a), ae({ draggedSlideId: a }));
  }
  function Lt(e, a) {
    const f = A == null ? void 0 : A.draggedSlideId;
    !H.allowReorderSlides || w || !f || f === a || (e.preventDefault(), e.dataTransfer.dropEffect = "move", ae({
      draggedSlideId: f,
      targetSlideId: a,
      placement: at(e)
    }));
  }
  function Ft(e, a) {
    const f = (A == null ? void 0 : A.draggedSlideId) || e.dataTransfer.getData("application/x-qastia-slide-id") || e.dataTransfer.getData("text/plain");
    if (!H.allowReorderSlides || w || !f || f === a) {
      ae(null);
      return;
    }
    e.preventDefault();
    const y = (A == null ? void 0 : A.targetSlideId) === a && A.placement ? A.placement : at(e);
    ae(null), b(f), G(rn(g, f, a, y), "slide-reorder", f), T == null || T({ deckId: n, slideId: f });
  }
  const Ht = (k == null ? void 0 : k.diagnostics) ?? [], ie = le.includes(K) ? K : le[0], Ke = (V == null ? void 0 : V.theme.cssClassName) ?? "", Ge = V ? Yt(V.theme) : void 0, ce = (V == null ? void 0 : V.metadata.title) ?? "Deck";
  function Bt() {
    w || (pe(ce), Ne(!0));
  }
  function Ue() {
    const e = He.trim() || ce;
    Ne(!1), pe(e), e !== ce && G(Xt(g, e), "metadata-edit", v == null ? void 0 : v.id);
  }
  function Ot() {
    Ne(!1), pe(ce);
  }
  return Z(() => {
    if (!se.current || se.current !== (v == null ? void 0 : v.id))
      return;
    const e = $e.current, a = window.setTimeout(() => {
      const f = e == null ? void 0 : e.querySelector(
        ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main"
      ), y = f != null && f.matches("textarea") ? f : f == null ? void 0 : f.querySelector(
        "input:not([type='checkbox']):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])"
      );
      if (se.current = null, y) {
        y.focus();
        return;
      }
      e == null || e.focus();
    }, 0);
    return () => window.clearTimeout(a);
  }, [ie, v == null ? void 0 : v.id, g.content]), /* @__PURE__ */ c(
    "div",
    {
      className: "deck-studio-root",
      "data-density": O.density,
      "data-slide-rail": O.showSlideRail ? "visible" : "hidden",
      "data-inspector": O.showInspector ? "visible" : "hidden",
      onKeyDown: Mt,
      children: [
        O.showSlideRail ? /* @__PURE__ */ c("aside", { className: "deck-studio-rail", style: { width: O.slideRailWidthPx }, children: [
          /* @__PURE__ */ r("header", { children: mt ? /* @__PURE__ */ r(
            "input",
            {
              className: "deck-studio-title-input",
              "aria-label": "Titre du slideshow",
              value: He,
              autoFocus: !0,
              onFocus: (e) => e.currentTarget.select(),
              onChange: (e) => pe(e.currentTarget.value),
              onBlur: Ue,
              onKeyDown: (e) => {
                e.key === "Enter" && (e.preventDefault(), Ue()), e.key === "Escape" && (e.preventDefault(), Ot());
              }
            }
          ) : /* @__PURE__ */ r(
            "strong",
            {
              className: "deck-studio-title-label",
              title: w ? void 0 : "Double-cliquer pour modifier",
              onDoubleClick: Bt,
              children: ce
            }
          ) }),
          /* @__PURE__ */ r("nav", { "aria-label": "Slides", children: V == null ? void 0 : V.slides.map((e) => /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: e.id === (v == null ? void 0 : v.id) ? "is-active" : void 0,
              draggable: H.allowReorderSlides && !w,
              "data-drop-position": (A == null ? void 0 : A.targetSlideId) === e.id ? A.placement : void 0,
              "aria-grabbed": (A == null ? void 0 : A.draggedSlideId) === e.id ? "true" : void 0,
              onClick: () => Pt(e.id),
              onDragStart: (a) => Rt(a, e.id),
              onDragOver: (a) => Lt(a, e.id),
              onDragLeave: () => {
                (A == null ? void 0 : A.targetSlideId) === e.id && ae({ draggedSlideId: A.draggedSlideId });
              },
              onDrop: (a) => Ft(a, e.id),
              onDragEnd: () => ae(null),
              children: [
                /* @__PURE__ */ r("span", { children: e.index + 1 }),
                /* @__PURE__ */ r("span", { children: xn(e) }),
                /* @__PURE__ */ r("small", { children: e.layout.name })
              ]
            },
            e.id
          )) })
        ] }) : null,
        /* @__PURE__ */ c("main", { className: "deck-studio-main", ref: $e, tabIndex: -1, children: [
          /* @__PURE__ */ c("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ r("div", { className: "deck-studio-slide-heading", children: H.allowLayoutChange && v && ie !== "source" ? /* @__PURE__ */ r("label", { className: "deck-layout-select", children: /* @__PURE__ */ r(
              "select",
              {
                "aria-label": "Layout de la slide",
                value: v.layout.name,
                onChange: (e) => {
                  o != null && o.createVersionBeforeDestructiveAction && $("before-layout-change", "Before layout change"), G(
                    Zt(g, v.id, e.currentTarget.value, C.layouts),
                    "layout-change"
                  );
                },
                disabled: w,
                children: Array.from(C.layouts.values()).map((e) => /* @__PURE__ */ r("option", { value: e.name, children: e.displayName }, e.name))
              }
            ) }) : null }),
            /* @__PURE__ */ c("div", { className: "deck-studio-actions", children: [
              O.showSourceModeToggle && le.length > 1 ? /* @__PURE__ */ c("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ r("span", { children: "Editor view" }),
                /* @__PURE__ */ r(
                  "select",
                  {
                    value: ie,
                    onChange: (e) => Le(e.currentTarget.value),
                    children: le.map((e) => /* @__PURE__ */ r("option", { value: e, children: An(e) }, e))
                  }
                )
              ] }) : null,
              /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => Fe(!0),
                  disabled: w,
                  children: "Global"
                }
              ),
              H.allowAddSlide ? /* @__PURE__ */ r("button", { type: "button", onClick: () => Ye(), disabled: w, children: "Add" }) : null,
              H.allowDuplicateSlide && v ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => G(tn(g, v.id), "slide-duplicate"),
                  disabled: w,
                  children: "Duplicate"
                }
              ) : null,
              H.allowDeleteSlide && v ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: Tt,
                  disabled: w || ((V == null ? void 0 : V.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              o ? /* @__PURE__ */ c(Et, { children: [
                /* @__PURE__ */ r("button", { type: "button", onClick: gt, disabled: w || !be, children: "Save" }),
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
                /* @__PURE__ */ r("button", { type: "button", onClick: bt, disabled: w || !be, children: "Cancel" })
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
          ie === "source" ? /* @__PURE__ */ r(
            "textarea",
            {
              className: "deck-source-editor",
              value: g.content,
              onChange: (e) => G({ ...g, content: e.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: w
            }
          ) : ie === "preview" && v ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${Ke}`,
              "aria-label": "Slide preview",
              tabIndex: -1,
              style: Ge,
              children: /* @__PURE__ */ r(Ze, { slide: v, target: "screen" })
            }
          ) : v ? /* @__PURE__ */ r("div", { className: "deck-studio-editor", children: /* @__PURE__ */ r(
            dn,
            {
              source: g,
              slideId: v.id,
              fields: v.layout.definition.editor.fieldGroups.flatMap((e) => e.fields),
              inheritedMarkdownSlots: vt,
              readOnly: !!w,
              onUpdate: G
            }
          ) }) : (k == null ? void 0 : k.status) === "invalid" ? /* @__PURE__ */ r(Kt, { fallback: k.fallback }) : null,
          O.showActiveSlidePreview && ie !== "preview" && v ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview ${Ke}`,
              "aria-label": "Active slide preview",
              style: Ge,
              children: /* @__PURE__ */ r(Ze, { slide: v, target: "screen" })
            }
          ) : null
        ] }),
        O.showInspector ? /* @__PURE__ */ c("aside", { className: "deck-studio-inspector", style: { width: O.inspectorWidthPx }, children: [
          O.showDiagnosticsPanel ? /* @__PURE__ */ c("section", { children: [
            /* @__PURE__ */ r("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ r(ot, { diagnostics: Ht })
          ] }) : null,
          (O.showVersionHistory || ut) && o ? /* @__PURE__ */ r(
            Sn,
            {
              versions: ht,
              readOnly: !!w,
              canRestore: H.allowVersionRestore,
              canCompare: H.allowVersionCompare,
              onCreateManualVersion: (e) => {
                Q(g, v == null ? void 0 : v.id), $("manual", e ?? "Manual save");
              },
              onRestoreVersion: (e) => void je(e),
              onDeleteVersion: (e) => void kt(e),
              onRenameVersion: (e, a) => void yt(e, a),
              onCompareWithCurrent: (e) => void qe(e),
              onCompareVersions: (e, a) => void Dt(e, a)
            }
          ) : null
        ] }) : null,
        dt ? /* @__PURE__ */ r(
          vn,
          {
            source: g,
            readOnly: !!w,
            onUpdate: G,
            onClose: () => Fe(!1)
          }
        ) : null,
        I ? /* @__PURE__ */ r(
          gn,
          {
            draft: I.draft,
            current: I.current,
            versions: I.versions,
            onRestoreDraft: () => void St(),
            onRestoreVersion: (e) => {
              z(null), je(e);
            },
            onPreviewDraft: Nt,
            onPreviewVersion: (e) => void wt(e),
            onCompareDraftWithCurrent: Ct,
            onCompareVersionWithCurrent: (e) => void qe(e),
            onCreateCopyFromDraft: () => void Vt(),
            onCreateCopyFromVersion: (e) => void It(e),
            onDeleteDraft: () => void At(),
            onKeepCurrent: () => void xt(),
            onOpenVersionHistory: () => {
              we(!0), z(null);
            }
          }
        ) : null,
        re ? /* @__PURE__ */ r(
          bn,
          {
            title: re.title,
            leftLabel: re.leftLabel,
            leftSource: re.leftSource,
            rightLabel: re.rightLabel,
            rightSource: re.rightSource,
            onClose: () => me(null)
          }
        ) : null,
        he ? /* @__PURE__ */ r(
          Cn,
          {
            title: he.title,
            label: he.label,
            source: he.source,
            onClose: () => De(null)
          }
        ) : null,
        ft ? /* @__PURE__ */ r(Vn, { onClose: () => Se(!1) }) : null
      ]
    }
  );
}
function Vn({ onClose: t }) {
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
function In() {
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
function An(t) {
  return t === "source" ? "YAML" : t === "preview" ? "Preview" : "Form";
}
function xn(t) {
  const i = t.slots.get("title"), n = (i == null ? void 0 : i.content.kind) === "markdown" ? i.content.markdown : void 0;
  return (n == null ? void 0 : n.split(/\r?\n/).map((l) => l.replace(/^#{1,6}\s+/, "").trim()).find((l) => l.length > 0)) ?? `Slide ${t.index + 1}`;
}
function at(t) {
  const i = t.currentTarget.getBoundingClientRect();
  return i.height <= 0 || t.clientY > i.top + i.height / 2 ? "after" : "before";
}
export {
  Bn as D,
  Kt as a
};
