import { jsxs as c, jsx as r } from "react/jsx-runtime";
import { useState as A, useMemo as J, useRef as ie, useCallback as x, useEffect as _ } from "react";
import { h as G, c as $e, s as We } from "./hash-BGAdcMpD.js";
import { L as Ct, d as Vt } from "./defaultDeckRuntime-CO0C-Lgd.js";
import { d as It } from "./themeStyle-CyBLqMAf.js";
import { S as Ee } from "./SlideRenderer-iimFvRrx.js";
import Ye from "yaml";
function Nt({ fallback: t }) {
  return /* @__PURE__ */ c("section", { className: "deck-debug-fallback", children: [
    /* @__PURE__ */ r("header", { children: /* @__PURE__ */ r("h2", { children: t.title }) }),
    /* @__PURE__ */ r(Ke, { diagnostics: t.diagnostics }),
    /* @__PURE__ */ r("pre", { children: t.source.content })
  ] });
}
function Ke({
  diagnostics: t
}) {
  return t.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucun diagnostic." }) : /* @__PURE__ */ r("ul", { className: "deck-diagnostics-list", children: t.map((i, n) => /* @__PURE__ */ c("li", { "data-severity": i.severity, children: [
    /* @__PURE__ */ r("strong", { children: i.code }),
    /* @__PURE__ */ r("span", { children: i.message }),
    i.hint ? /* @__PURE__ */ r("small", { children: i.hint }) : null
  ] }, `${i.code}-${n}`)) });
}
const xt = {
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
}, At = {
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
  adapter: new Ct(),
  namespace: "deck-runtime",
  maxVersionsPerDeck: 50,
  maxAutosaveVersionsPerDeck: 20,
  maxBytesPerDeck: 4e6,
  saveDraftOnChange: !0,
  createVersionOnManualSave: !0,
  createVersionBeforeDestructiveAction: !0,
  recoverOnMount: !0
}, Pt = {
  draftDebounceMs: 800,
  versionIntervalMs: 3e5,
  minChangeDistanceForVersion: 500,
  createVersionOnValidDeckOnly: !1
};
function Y(t) {
  try {
    const i = Ye.parse(t.content);
    return F(i) ? i : null;
  } catch {
    return null;
  }
}
function X(t, i) {
  return {
    ...t,
    content: Ye.stringify(i, { lineWidth: 0 })
  };
}
function Q(t) {
  return Array.isArray(t.slides) || (t.slides = []), t.slides.filter(F);
}
function De(t, i, n, s) {
  return ge(t, i, (l) => {
    const u = ze(l);
    u[n] = { markdown: s };
  });
}
function Mt(t, i, n) {
  return ge(t, i, (s) => {
    F(s.slots) && (delete s.slots[n], Object.keys(s.slots).length === 0 && delete s.slots);
  });
}
function Rt(t, i, n) {
  return Ne(t, i, n) !== void 0;
}
function Ve(t, i) {
  const n = Ue(t, i);
  return F(n) && typeof n.markdown == "string" ? n.markdown : "";
}
function Tt(t, i) {
  return Ue(t, i) !== void 0;
}
function qe(t, i, n) {
  const s = Y(t);
  if (!s)
    return t;
  const l = qt(s);
  return l[i] = { markdown: n }, X(t, s);
}
function Lt(t, i) {
  const n = Y(t);
  return n ? (F(n.metadata) || (n.metadata = {}), n.metadata.title = i, X(t, n)) : t;
}
function Ce(t, i, n, s) {
  return ge(t, i, (l) => {
    const u = ze(l);
    u[n] = {
      image: Gt({
        assetId: s.assetId,
        src: s.src,
        alt: s.alt
      })
    };
  });
}
function Ft(t, i, n, s) {
  return ge(t, i, (l) => {
    s && l.layout && l.layout !== n && (l.slots = jt(l, n, s)), l.layout = n;
  });
}
function Ht(t, i = "title-body", n) {
  const s = Y(t);
  if (!s)
    return { source: t };
  const l = Q(s), u = _e(l, "slide"), m = {
    id: u,
    layout: i,
    slots: {
      title: { markdown: "New slide" },
      body: { markdown: "" }
    }
  }, S = n ? l.findIndex((D) => D.id === n) : -1;
  return l.splice(S >= 0 ? S + 1 : l.length, 0, m), s.slides = l, { source: X(t, s), slideId: u };
}
function Bt(t, i) {
  const n = Y(t);
  if (!n)
    return t;
  const s = Q(n), l = s.findIndex((m) => m.id === i);
  if (l < 0)
    return t;
  const u = structuredClone(s[l]);
  return u.id = _e(s, `${i}-copy`), s.splice(l + 1, 0, u), n.slides = s, X(t, n);
}
function Ot(t, i) {
  const n = Y(t);
  if (!n)
    return t;
  const s = Q(n).filter((l) => l.id !== i);
  return n.slides = s.length > 0 ? s : Q(n), X(t, n);
}
function $t(t, i, n, s) {
  if (i === n)
    return t;
  const l = Y(t);
  if (!l)
    return t;
  const u = Q(l), m = u.findIndex((P) => P.id === i), S = u.findIndex((P) => P.id === n);
  if (m < 0 || S < 0)
    return t;
  const [D] = u.splice(m, 1), R = u.findIndex((P) => P.id === n), f = s === "after" ? R + 1 : R;
  return u.splice(f, 0, D), l.slides = u, X(t, l);
}
function Wt(t, i, n) {
  const s = Ne(t, i, n);
  return F(s) && typeof s.markdown == "string" ? s.markdown : "";
}
function Et(t, i, n) {
  const s = Ne(t, i, n), l = F(s) && F(s.image) ? s.image : {};
  return {
    assetId: typeof l.assetId == "string" ? l.assetId : "",
    src: typeof l.src == "string" ? l.src : "",
    alt: typeof l.alt == "string" ? l.alt : ""
  };
}
function ge(t, i, n) {
  const s = Y(t);
  if (!s)
    return t;
  const l = Q(s), u = l.find((m) => m.id === i);
  return u ? (n(u), s.slides = l, X(t, s)) : t;
}
function Ne(t, i, n) {
  var u;
  const s = Y(t);
  if (!s)
    return;
  const l = Q(s).find((m) => m.id === i);
  return (u = l == null ? void 0 : l.slots) == null ? void 0 : u[n];
}
function Ue(t, i) {
  var s;
  const n = Y(t);
  if (n)
    return F((s = n.defaults) == null ? void 0 : s.slots) ? n.defaults.slots[i] : void 0;
}
function ze(t) {
  return F(t.slots) || (t.slots = {}), t.slots;
}
function qt(t) {
  return F(t.defaults) || (t.defaults = {}), F(t.defaults.slots) || (t.defaults.slots = {}), t.defaults.slots;
}
function jt(t, i, n) {
  var m, S;
  const s = F(t.slots) ? t.slots : {}, l = t.layout ? (S = (m = n.get(i)) == null ? void 0 : m.migrateFrom) == null ? void 0 : S[t.layout] : void 0;
  if (!l)
    return s;
  const u = {};
  for (const D of l.operations)
    D.kind === "move-slot" && D.from in s && (u[D.to] = s[D.from]);
  return u;
}
function _e(t, i) {
  const n = new Set(t.map((u) => u.id).filter((u) => !!u));
  let s = je(i), l = 2;
  for (; n.has(s); )
    s = `${je(i)}-${l}`, l += 1;
  return s;
}
function je(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "slide";
}
function Gt(t) {
  return Object.fromEntries(
    Object.entries(t).filter((i) => !!i[1])
  );
}
function F(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function Yt({
  fields: t,
  inheritedMarkdownSlots: i,
  onUpdate: n,
  readOnly: s,
  slideId: l,
  source: u
}) {
  return /* @__PURE__ */ r("form", { className: "deck-slide-form", children: t.map((m) => /* @__PURE__ */ r(
    Kt,
    {
      source: u,
      slideId: l,
      field: m,
      inheritedMarkdownSlots: i,
      readOnly: s,
      onUpdate: n
    },
    `${m.kind}-${"slotName" in m ? m.slotName : m.label}`
  )) });
}
function Kt({
  source: t,
  slideId: i,
  field: n,
  inheritedMarkdownSlots: s,
  readOnly: l,
  onUpdate: u
}) {
  if (n.kind === "markdown") {
    const m = n.blockKind === "heading" || n.slotName === "title", S = Ut(n.slotName) ? s == null ? void 0 : s.get(n.slotName) : void 0, D = S !== void 0, R = D && Rt(t, i, n.slotName), f = D && !R ? S : Wt(t, i, n.slotName), P = m || zt(n), T = P ? _t(f, m) : f, M = l || D && !R, y = P ? /* @__PURE__ */ r(
      "input",
      {
        "aria-label": n.label,
        className: "deck-form-input",
        placeholder: " ",
        value: T,
        onChange: (w) => u(
          De(t, i, n.slotName, w.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: M
      }
    ) : /* @__PURE__ */ r(
      "textarea",
      {
        "aria-label": n.label,
        className: "deck-form-textarea",
        placeholder: " ",
        rows: n.minRows ?? 4,
        value: T,
        onChange: (w) => u(
          De(t, i, n.slotName, w.currentTarget.value),
          "slide-field-edit"
        ),
        readOnly: M
      }
    );
    return /* @__PURE__ */ c(
      "div",
      {
        className: "deck-form-field",
        "data-inherited": D && !R ? "true" : void 0,
        children: [
          /* @__PURE__ */ r("span", { children: n.label }),
          /* @__PURE__ */ c("div", { className: "deck-form-field__control", children: [
            y,
            D ? /* @__PURE__ */ r("label", { className: "deck-inherited-slot-toggle", title: "Override global", children: /* @__PURE__ */ r(
              "input",
              {
                "aria-label": `Override ${n.label} global`,
                title: `Override ${n.label} global`,
                type: "checkbox",
                checked: R,
                onChange: (w) => u(
                  w.currentTarget.checked ? De(t, i, n.slotName, S) : Mt(t, i, n.slotName),
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
    const m = Et(t, i, n.slotName);
    return /* @__PURE__ */ c("fieldset", { className: "deck-form-fieldset", children: [
      /* @__PURE__ */ r("legend", { children: n.label }),
      /* @__PURE__ */ c("label", { className: "deck-form-field", children: [
        /* @__PURE__ */ r("span", { children: "Asset id" }),
        /* @__PURE__ */ r(
          "input",
          {
            placeholder: " ",
            value: m.assetId,
            onChange: (S) => u(
              Ce(t, i, n.slotName, {
                ...m,
                assetId: S.currentTarget.value
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
            value: m.src,
            onChange: (S) => u(
              Ce(t, i, n.slotName, {
                ...m,
                src: S.currentTarget.value
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
            value: m.alt,
            onChange: (S) => u(
              Ce(t, i, n.slotName, {
                ...m,
                alt: S.currentTarget.value
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
function Ut(t) {
  return t === "eyebrow" || t === "footer";
}
function zt(t) {
  return t.kind !== "markdown" ? !1 : t.minRows === 1 || t.slotName === "eyebrow" || t.slotName === "subtitle" || t.slotName === "footer";
}
function _t(t, i) {
  return (i ? t.replace(/^(\s*)#{1,6}\s+/u, "$1") : t).replace(/\s*\n\s*/gu, " ").trim();
}
function Jt({
  onClose: t,
  onUpdate: i,
  readOnly: n,
  source: s
}) {
  const l = Ve(s, "eyebrow"), u = Ve(s, "footer");
  return /* @__PURE__ */ r("div", { className: "deck-global-defaults-backdrop", role: "presentation", onMouseDown: t, children: /* @__PURE__ */ c(
    "section",
    {
      "aria-labelledby": "deck-global-defaults-title",
      className: "deck-global-defaults-dialog",
      role: "dialog",
      "aria-modal": "true",
      onMouseDown: (m) => m.stopPropagation(),
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
                onChange: (m) => i(
                  qe(s, "eyebrow", m.currentTarget.value),
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
                onChange: (m) => i(
                  qe(s, "footer", m.currentTarget.value),
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
function Qt({
  draft: t,
  current: i,
  versions: n,
  onRestoreDraft: s,
  onRestoreVersion: l,
  onPreviewDraft: u,
  onPreviewVersion: m,
  onCompareDraftWithCurrent: S,
  onCompareVersionWithCurrent: D,
  onCreateCopyFromDraft: R,
  onCreateCopyFromVersion: f,
  onDeleteDraft: P,
  onKeepCurrent: T,
  onOpenVersionHistory: M
}) {
  const y = n.slice(0, 4);
  return /* @__PURE__ */ r("div", { className: "deck-modal-backdrop", role: "presentation", children: /* @__PURE__ */ c(
    "section",
    {
      "aria-labelledby": "deck-crash-recovery-title",
      "aria-modal": "true",
      className: "deck-modal-dialog deck-recovery-dialog",
      role: "dialog",
      children: [
        /* @__PURE__ */ c("header", { children: [
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ r("p", { children: "Recovery" }),
            /* @__PURE__ */ r("h3", { id: "deck-crash-recovery-title", children: "Une version locale plus récente existe" })
          ] }),
          /* @__PURE__ */ r("button", { type: "button", onClick: T, children: "Ignorer" })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-recovery-summary", children: [
          /* @__PURE__ */ c("article", { children: [
            /* @__PURE__ */ r("strong", { children: "Draft local" }),
            /* @__PURE__ */ c("small", { children: [
              new Date(t.updatedAtIso).toLocaleString(),
              " - ",
              t.compilerStatus
            ] }),
            /* @__PURE__ */ r("span", { children: t.sourceHash.slice(0, 8) })
          ] }),
          /* @__PURE__ */ c("article", { children: [
            /* @__PURE__ */ r("strong", { children: "Version courante" }),
            /* @__PURE__ */ r("small", { children: i ? new Date(i.updatedAtIso).toLocaleString() : "Non sauvegardée" }),
            /* @__PURE__ */ r("span", { children: i ? i.sourceHash.slice(0, 8) : "Aucun hash" })
          ] })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-modal-actions", children: [
          /* @__PURE__ */ r("button", { type: "button", onClick: s, children: "Restaurer cette version" }),
          /* @__PURE__ */ r("button", { type: "button", onClick: u, children: "Ouvrir en lecture seule" }),
          /* @__PURE__ */ r("button", { type: "button", onClick: S, children: "Comparer avec la version actuelle" }),
          /* @__PURE__ */ r("button", { type: "button", onClick: R, children: "Créer une copie" }),
          /* @__PURE__ */ r("button", { type: "button", onClick: T, children: "Garder la version courante" }),
          /* @__PURE__ */ r("button", { type: "button", onClick: P, children: "Supprimer le draft" }),
          /* @__PURE__ */ r("button", { type: "button", onClick: M, children: "Voir l'historique" })
        ] }),
        y.length > 0 ? /* @__PURE__ */ c("div", { className: "deck-recovery-versions", children: [
          /* @__PURE__ */ r("strong", { children: "Versions récentes" }),
          /* @__PURE__ */ r("ul", { className: "deck-version-list", children: y.map((w) => /* @__PURE__ */ c("li", { children: [
            /* @__PURE__ */ r("strong", { children: w.label ?? w.reason }),
            /* @__PURE__ */ c("small", { children: [
              new Date(w.createdAtIso).toLocaleString(),
              " - ",
              w.compilerStatus
            ] }),
            /* @__PURE__ */ c("span", { children: [
              w.sourceHash.slice(0, 8),
              " - ",
              w.sizeBytes,
              " octets"
            ] }),
            /* @__PURE__ */ c("div", { className: "deck-version-actions", children: [
              /* @__PURE__ */ r("button", { type: "button", onClick: () => l(w.id), children: "Restaurer cette version" }),
              /* @__PURE__ */ r("button", { type: "button", onClick: () => m(w.id), children: "Ouvrir" }),
              /* @__PURE__ */ r("button", { type: "button", onClick: () => D(w.id), children: "Comparer" }),
              /* @__PURE__ */ r("button", { type: "button", onClick: () => f(w.id), children: "Créer copie" })
            ] })
          ] }, w.id)) })
        ] }) : null
      ]
    }
  ) });
}
function Xt({
  title: t,
  leftLabel: i,
  leftSource: n,
  rightLabel: s,
  rightSource: l,
  onClose: u
}) {
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
            /* @__PURE__ */ r("h3", { id: "deck-version-compare-title", children: t })
          ] }),
          /* @__PURE__ */ r("button", { type: "button", onClick: u, children: "Fermer" })
        ] }),
        /* @__PURE__ */ c("div", { className: "deck-version-compare-grid", children: [
          /* @__PURE__ */ c("label", { children: [
            /* @__PURE__ */ r("span", { children: i }),
            /* @__PURE__ */ r("textarea", { readOnly: !0, value: n })
          ] }),
          /* @__PURE__ */ c("label", { children: [
            /* @__PURE__ */ r("span", { children: s }),
            /* @__PURE__ */ r("textarea", { readOnly: !0, value: l })
          ] })
        ] })
      ]
    }
  ) });
}
const Zt = [
  "before-layout-change",
  "before-slide-delete",
  "before-version-restore"
];
function en({
  versions: t,
  readOnly: i,
  canRestore: n,
  canCompare: s,
  onCreateManualVersion: l,
  onRestoreVersion: u,
  onDeleteVersion: m,
  onRenameVersion: S,
  onCompareWithCurrent: D,
  onCompareVersions: R
}) {
  const [f, P] = A("all"), [T, M] = A(""), [y, w] = A(null), [v, H] = A(""), [W, se] = A(null), le = J(
    () => t.filter((h) => f === "all" ? !0 : f === "safety" ? Zt.includes(h.reason) : h.reason === f),
    [f, t]
  );
  function g() {
    l(T.trim() || void 0), M("");
  }
  function b(h) {
    w(h.id), H(h.label ?? h.reason);
  }
  function ce() {
    if (!y)
      return;
    const h = v.trim();
    h && S(y, h), w(null), H("");
  }
  function L(h) {
    if (!W) {
      se(h);
      return;
    }
    W !== h && R(W, h), se(null);
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
            value: f,
            onChange: (h) => P(h.currentTarget.value),
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
          value: T,
          placeholder: "Nom de version",
          onChange: (h) => M(h.currentTarget.value),
          disabled: i
        }
      ),
      /* @__PURE__ */ r("button", { type: "button", onClick: g, disabled: i, children: "Créer version" })
    ] }),
    W ? /* @__PURE__ */ r("p", { className: "deck-version-compare-hint", children: "Choisir une seconde version à comparer." }) : null,
    /* @__PURE__ */ r("ul", { className: "deck-version-list", children: le.map((h) => /* @__PURE__ */ c("li", { children: [
      y === h.id ? /* @__PURE__ */ c("div", { className: "deck-version-rename", children: [
        /* @__PURE__ */ r(
          "input",
          {
            "aria-label": "Renommer version",
            value: v,
            onChange: (q) => H(q.currentTarget.value),
            onKeyDown: (q) => {
              q.key === "Enter" && (q.preventDefault(), ce()), q.key === "Escape" && (q.preventDefault(), w(null));
            }
          }
        ),
        /* @__PURE__ */ r("button", { type: "button", onClick: ce, children: "OK" })
      ] }) : /* @__PURE__ */ r("strong", { children: h.label ?? h.reason }),
      /* @__PURE__ */ c("small", { children: [
        tn(h.reason),
        " - ",
        new Date(h.createdAtIso).toLocaleString(),
        " -",
        " ",
        h.compilerStatus
      ] }),
      /* @__PURE__ */ c("div", { className: "deck-version-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => u(h.id),
            disabled: !n || i,
            children: "Restaurer"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => D(h.id),
            disabled: !s,
            children: "Comparer actuel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            onClick: () => L(h.id),
            disabled: !s,
            "aria-pressed": W === h.id,
            children: "Comparer A/B"
          }
        ),
        h.reason === "manual" ? /* @__PURE__ */ r("button", { type: "button", onClick: () => b(h), disabled: i, children: "Renommer" }) : null,
        /* @__PURE__ */ r("button", { type: "button", onClick: () => m(h.id), disabled: i, children: "Supprimer" })
      ] })
    ] }, h.id)) }),
    le.length === 0 ? /* @__PURE__ */ r("div", { className: "deck-diagnostics-empty", role: "status", children: "Aucune version." }) : null
  ] });
}
function tn(t) {
  return t === "autosave" ? "Autosave" : t === "manual" ? "Manuelle" : t === "crash-recovery" ? "Recovery" : t.startsWith("before-") ? "Sécurité" : t === "external-save" ? "Externe" : "Import";
}
function nn({
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
function hn(t) {
  var Oe;
  const {
    autosave: i,
    deckId: n,
    features: s,
    initialSelectedSlideId: l,
    layout: u,
    locale: m = "fr-FR",
    namespace: S,
    onChange: D,
    onCompile: R,
    onError: f,
    onRestoreVersion: P,
    onSave: T,
    onSelectedSlideChange: M,
    readOnly: y,
    storage: w
  } = t, v = t.options, H = t.runtime ?? Vt, W = t.mode === "controlled", [se, le] = A(
    W ? t.value : t.initialValue
  ), g = W ? t.value : se, [b, ce] = A(null), [L, h] = A(
    l
  ), [q, Je] = A(
    ((Oe = v == null ? void 0 : v.editing) == null ? void 0 : Oe.defaultMode) ?? "form"
  ), [Qe, xe] = A(!1), [Xe, be] = A(!1), [V, K] = A(null), [Z, de] = A(null), [ue, we] = A(null), [Ze, ke] = A(!1), [Ae, fe] = A(""), [I, ee] = A(null), [et, tt] = A([]), Pe = ie(null), me = ie(R), he = ie(f), ye = ie(!1), Me = ie(!1), Re = ie(null);
  me.current = R, he.current = f;
  const O = J(() => {
    var d;
    const e = { ...xt, ...u }, a = v == null ? void 0 : v.panels;
    return (a == null ? void 0 : a.slideRail) === !1 ? e.showSlideRail = !1 : a != null && a.slideRail && (e.showSlideRail = a.slideRail.visibleDefault ?? e.showSlideRail, e.slideRailWidthPx = a.slideRail.widthPx ?? e.slideRailWidthPx), (a == null ? void 0 : a.inspector) === !1 ? e.showInspector = !1 : a != null && a.inspector && (e.showInspector = a.inspector.visibleDefault ?? e.showInspector, e.inspectorWidthPx = a.inspector.widthPx ?? e.inspectorWidthPx), (a == null ? void 0 : a.diagnostics) === !1 ? e.showDiagnosticsPanel = !1 : a != null && a.diagnostics && (e.showDiagnosticsPanel = a.diagnostics.visibleDefault ?? e.showDiagnosticsPanel), (a == null ? void 0 : a.activeSlidePreview) === !1 ? e.showActiveSlidePreview = !1 : a != null && a.activeSlidePreview && (e.showActiveSlidePreview = a.activeSlidePreview.visibleDefault ?? e.showActiveSlidePreview), (a == null ? void 0 : a.versionHistory) === !1 ? e.showVersionHistory = !1 : a != null && a.versionHistory && (e.showVersionHistory = a.versionHistory.visibleDefault ?? e.showVersionHistory), ((d = v == null ? void 0 : v.editing) == null ? void 0 : d.allowSourceMode) === !1 && (e.showSourceModeToggle = !1), e;
  }, [u, v]), B = J(() => {
    var a, d, k, N;
    const e = { ...At, ...s };
    return ((a = v == null ? void 0 : v.editing) == null ? void 0 : a.allowSourceMode) !== void 0 && (e.allowRawSourceEdit = v.editing.allowSourceMode), ((d = v == null ? void 0 : v.editing) == null ? void 0 : d.allowLayoutChange) !== void 0 && (e.allowLayoutChange = v.editing.allowLayoutChange), ((k = v == null ? void 0 : v.layoutSelector) == null ? void 0 : k.enabled) !== void 0 && (e.allowLayoutChange = v.layoutSelector.enabled), (N = v == null ? void 0 : v.panels) != null && N.slideRail && (v.panels.slideRail.allowReorder !== void 0 && (e.allowReorderSlides = v.panels.slideRail.allowReorder), v.panels.slideRail.allowAddDelete !== void 0 && (e.allowAddSlide = v.panels.slideRail.allowAddDelete, e.allowDeleteSlide = v.panels.slideRail.allowAddDelete)), e;
  }, [s, v]), pe = J(() => {
    var k;
    const d = (((k = v == null ? void 0 : v.editing) == null ? void 0 : k.viewModes) ?? ["form", "source", "preview"]).filter(
      (N, ae, re) => (N === "form" || N === "source" || N === "preview") && re.indexOf(N) === ae
    ).filter((N) => N !== "source" || B.allowRawSourceEdit);
    return d.length > 0 ? d : ["form"];
  }, [B.allowRawSourceEdit, v]), o = J(
    () => w === !1 ? void 0 : {
      ...Se,
      namespace: S ?? (w == null ? void 0 : w.namespace) ?? Se.namespace,
      adapter: (w == null ? void 0 : w.adapter) ?? H.storage ?? Se.adapter,
      ...w
    },
    [S, H.storage, w]
  ), U = J(
    () => i === !1 ? void 0 : { ...Pt, ...i },
    [i]
  ), C = (b == null ? void 0 : b.status) === "valid" || (b == null ? void 0 : b.status) === "degraded" ? b.deck : void 0, p = (C == null ? void 0 : C.slides.find((e) => e.id === L)) ?? (C == null ? void 0 : C.slides[0]), nt = J(() => {
    const e = /* @__PURE__ */ new Map();
    for (const a of ["eyebrow", "footer"])
      Tt(g, a) && e.set(a, Ve(g, a));
    return e;
  }, [g]), te = x(
    (e, a, d) => {
      const k = {
        reason: a,
        deckId: n,
        selectedSlideId: d ?? L,
        sourceHash: G(e.content),
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      };
      W || le(e), D == null || D(e, k);
    },
    [W, n, D, L]
  );
  _(() => {
    let e = !1;
    return $e(g, {
      runtime: H,
      mode: "editor"
    }).then((a) => {
      var d;
      e || (ce(a), (d = me.current) == null || d.call(me, a));
    }).catch((a) => {
      var d;
      (d = he.current) == null || d.call(he, {
        message: a instanceof Error ? a.message : "Deck compilation failed.",
        cause: a
      });
    }), () => {
      e = !0;
    };
  }, [m, H, g]), _(() => {
    if (!C || L)
      return;
    const e = C.slides[0];
    e && h(e.id);
  }, [C, L]), _(() => {
    !(o != null && o.recoverOnMount) || Me.current || (Me.current = !0, Promise.all([
      o.adapter.loadCurrent({ deckId: n, namespace: o.namespace }),
      o.adapter.loadDraft({ deckId: n, namespace: o.namespace }),
      o.adapter.listVersions({ deckId: n, namespace: o.namespace })
    ]).then(([e, a, d]) => {
      if (!a)
        return;
      const k = G(g.content), N = a.sourceHash !== k, ae = !e || a.sourceHash !== e.sourceHash, re = !e || a.updatedAtIso > e.updatedAtIso;
      !N || !ae || !re || K({
        draft: a,
        current: e,
        versions: d
      });
    }).catch((e) => {
      f == null || f({
        message: e instanceof Error ? e.message : "Unable to inspect deck recovery state.",
        cause: e
      });
    }));
  }, [n, f, te, g.content, o]), _(() => {
    if (!o || !U || !o.saveDraftOnChange)
      return;
    const e = window.setTimeout(() => {
      o.adapter.saveDraft({
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: an(),
        source: g,
        sourceHash: G(g.content),
        selectedSlideId: L,
        compilerStatus: (b == null ? void 0 : b.status) ?? "invalid"
      });
    }, U.draftDebounceMs);
    return () => window.clearTimeout(e);
  }, [U, b, n, L, g, o]);
  const E = x(() => {
    o && o.adapter.listVersions({ deckId: n, namespace: o.namespace }).then(tt).catch((e) => {
      f == null || f({
        message: e instanceof Error ? e.message : "Unable to list deck versions.",
        cause: e
      });
    });
  }, [n, f, o]);
  _(() => {
    E();
  }, [E]);
  const $ = x(
    async (e, a) => {
      var N;
      if (!o)
        return;
      const d = (b == null ? void 0 : b.diagnostics) ?? [], k = await o.adapter.createVersion({
        id: Ie(),
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: a,
        reason: e,
        source: g,
        sourceHash: G(g.content),
        selectedSlideId: L,
        compilerStatus: (b == null ? void 0 : b.status) ?? "invalid",
        diagnosticsSummary: We(d),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      k.status !== "success" && (f == null || f({ message: ((N = k.diagnostics[0]) == null ? void 0 : N.message) ?? "Unable to save deck version." })), E();
    },
    [b, n, f, E, L, g, o]
  ), ve = x(
    async (e, a, d, k) => {
      var re;
      if (!o)
        return;
      const N = await $e(e, {
        runtime: H,
        mode: "editor"
      }), ae = await o.adapter.createVersion({
        id: Ie(),
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        label: d,
        reason: a,
        source: e,
        sourceHash: G(e.content),
        selectedSlideId: k,
        compilerStatus: N.status,
        diagnosticsSummary: We(N.diagnostics),
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      ae.status !== "success" && (f == null || f({ message: ((re = ae.diagnostics[0]) == null ? void 0 : re.message) ?? "Unable to save deck version." })), E();
    },
    [n, m, f, E, H, o]
  );
  _(() => {
    if (!o || !U || !o.saveDraftOnChange || U.createVersionOnValidDeckOnly && (b == null ? void 0 : b.status) === "invalid")
      return;
    const e = window.setTimeout(() => {
      const a = G(g.content);
      Re.current !== a && (Re.current = a, $("autosave", "Autosave"));
    }, U.versionIntervalMs);
    return () => window.clearTimeout(e);
  }, [U, b == null ? void 0 : b.status, $, g.content, o]);
  const at = x(() => {
    o && (o.adapter.saveCurrent({
      deckId: n,
      namespace: o.namespace,
      schemaVersion: 1,
      updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
      source: g,
      sourceHash: G(g.content),
      selectedSlideId: L
    }), o.createVersionOnManualSave && $("manual", "Manual save"), T == null || T({
      deckId: n,
      sourceHash: G(g.content),
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [$, n, T, L, g, o]), z = x(
    async (e, a) => {
      var k;
      if (!o)
        return;
      const d = await o.adapter.saveCurrent({
        deckId: n,
        namespace: o.namespace,
        schemaVersion: 1,
        updatedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
        source: e,
        sourceHash: G(e.content),
        selectedSlideId: a
      });
      d.status !== "success" && (f == null || f({ message: ((k = d.diagnostics[0]) == null ? void 0 : k.message) ?? "Unable to save current deck." }));
    },
    [n, f, o]
  ), Te = x(
    async (e) => {
      if (!o)
        return;
      o.createVersionBeforeDestructiveAction && await $("before-version-restore", "Before restore");
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && (h(a.selectedSlideId), te(a.source, "version-restore", a.selectedSlideId), await z(a.source, a.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), P == null || P({
        deckId: n,
        versionId: e,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      }));
    },
    [$, n, P, te, z, o]
  ), rt = x(
    async (e) => {
      var d;
      if (!o)
        return;
      const a = await o.adapter.deleteVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a.status !== "success" && (f == null || f({ message: ((d = a.diagnostics[0]) == null ? void 0 : d.message) ?? "Unable to delete deck version." })), E();
    },
    [n, f, E, o]
  ), it = x(
    async (e, a) => {
      var N;
      if (!o)
        return;
      const d = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      if (!d)
        return;
      const k = await o.adapter.createVersion({
        ...d,
        label: a,
        limits: {
          maxVersionsPerDeck: o.maxVersionsPerDeck,
          maxAutosaveVersionsPerDeck: o.maxAutosaveVersionsPerDeck,
          maxBytesPerDeck: o.maxBytesPerDeck
        }
      });
      k.status !== "success" && (f == null || f({ message: ((N = k.diagnostics[0]) == null ? void 0 : N.message) ?? "Unable to rename deck version." })), E();
    },
    [n, f, E, o]
  ), Le = x(
    async (e) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && de({
        title: "Version vs courant",
        leftLabel: a.label ?? a.reason,
        leftSource: a.source.content,
        rightLabel: "Courant",
        rightSource: g.content
      });
    },
    [n, g.content, o]
  ), ot = x(
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
  ), st = x(
    async (e, a) => {
      if (!o)
        return;
      const [d, k] = await Promise.all([
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
      !d || !k || de({
        title: "Comparaison de versions",
        leftLabel: d.label ?? d.reason,
        leftSource: d.source.content,
        rightLabel: k.label ?? k.reason,
        rightSource: k.source.content
      });
    },
    [n, o]
  ), lt = x(async () => {
    !V || !o || (o.createVersionBeforeDestructiveAction && await $("before-version-restore", "Before recovery restore"), h(V.draft.selectedSlideId), te(V.draft.source, "crash-recovery", V.draft.selectedSlideId), await z(V.draft.source, V.draft.selectedSlideId), await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), K(null));
  }, [$, n, te, V, z, o]), ct = x(() => {
    V && we({
      title: "Draft local",
      label: "Source YAML",
      source: V.draft.source.content
    });
  }, [V]), dt = x(() => {
    var e;
    V && de({
      title: "Draft vs courant",
      leftLabel: "Draft local",
      leftSource: V.draft.source.content,
      rightLabel: "Courant",
      rightSource: ((e = V.current) == null ? void 0 : e.source.content) ?? g.content
    });
  }, [V, g.content]), ut = x(async () => {
    V && (await ve(
      V.draft.source,
      "manual",
      "Copie du draft de recovery",
      V.draft.selectedSlideId
    ), be(!0), K(null));
  }, [ve, V]), ft = x(
    async (e) => {
      if (!o)
        return;
      const a = await o.adapter.loadVersion({
        deckId: n,
        namespace: o.namespace,
        versionId: e
      });
      a && (await ve(
        a.source,
        "manual",
        `Copie - ${a.label ?? a.reason}`,
        a.selectedSlideId
      ), be(!0), K(null));
    },
    [ve, n, o]
  ), mt = x(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), K(null));
  }, [n, o]), ht = x(async () => {
    o && (await o.adapter.clearDraft({ deckId: n, namespace: o.namespace }), await z(g, p == null ? void 0 : p.id), K(null));
  }, [n, z, p == null ? void 0 : p.id, g, o]);
  function pt(e) {
    ye.current = !0, h(e), M == null || M({ deckId: n, slideId: e });
  }
  function j(e, a, d = p == null ? void 0 : p.id) {
    te(e, a, d);
  }
  function vt() {
    const e = Ht(g, "title-body", p == null ? void 0 : p.id);
    e.slideId && (h(e.slideId), M == null || M({ deckId: n, slideId: e.slideId })), j(e.source, "slide-add", e.slideId);
  }
  function gt() {
    p && (o != null && o.createVersionBeforeDestructiveAction && $("before-slide-delete", "Before slide delete"), j(Ot(g, p.id), "slide-delete"));
  }
  function bt(e, a) {
    !B.allowReorderSlides || y || (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("application/x-qastia-slide-id", a), e.dataTransfer.setData("text/plain", a), ee({ draggedSlideId: a }));
  }
  function wt(e, a) {
    const d = I == null ? void 0 : I.draggedSlideId;
    !B.allowReorderSlides || y || !d || d === a || (e.preventDefault(), e.dataTransfer.dropEffect = "move", ee({
      draggedSlideId: d,
      targetSlideId: a,
      placement: Ge(e)
    }));
  }
  function kt(e, a) {
    const d = (I == null ? void 0 : I.draggedSlideId) || e.dataTransfer.getData("application/x-qastia-slide-id") || e.dataTransfer.getData("text/plain");
    if (!B.allowReorderSlides || y || !d || d === a) {
      ee(null);
      return;
    }
    e.preventDefault();
    const k = (I == null ? void 0 : I.targetSlideId) === a && I.placement ? I.placement : Ge(e);
    ee(null), h(d), j($t(g, d, a, k), "slide-reorder", d), M == null || M({ deckId: n, slideId: d });
  }
  const yt = (b == null ? void 0 : b.diagnostics) ?? [], ne = pe.includes(q) ? q : pe[0], Fe = (C == null ? void 0 : C.theme.cssClassName) ?? "", He = C ? It(C.theme) : void 0, oe = (C == null ? void 0 : C.metadata.title) ?? "Deck";
  function St() {
    y || (fe(oe), ke(!0));
  }
  function Be() {
    const e = Ae.trim() || oe;
    ke(!1), fe(e), e !== oe && j(Lt(g, e), "metadata-edit", p == null ? void 0 : p.id);
  }
  function Dt() {
    ke(!1), fe(oe);
  }
  return _(() => {
    if (!ye.current)
      return;
    ye.current = !1;
    const e = Pe.current, a = e == null ? void 0 : e.querySelector(
      ".deck-studio-editor, .deck-source-editor, .deck-studio-preview-main"
    ), d = a != null && a.matches("textarea") ? a : a == null ? void 0 : a.querySelector(
      "input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]), button:not([disabled])"
    );
    if (d) {
      d.focus();
      return;
    }
    e == null || e.focus();
  }, [ne, p == null ? void 0 : p.id]), /* @__PURE__ */ c(
    "div",
    {
      className: "deck-studio-root",
      "data-density": O.density,
      "data-slide-rail": O.showSlideRail ? "visible" : "hidden",
      "data-inspector": O.showInspector ? "visible" : "hidden",
      children: [
        O.showSlideRail ? /* @__PURE__ */ c("aside", { className: "deck-studio-rail", style: { width: O.slideRailWidthPx }, children: [
          /* @__PURE__ */ r("header", { children: Ze ? /* @__PURE__ */ r(
            "input",
            {
              className: "deck-studio-title-input",
              "aria-label": "Titre du slideshow",
              value: Ae,
              autoFocus: !0,
              onFocus: (e) => e.currentTarget.select(),
              onChange: (e) => fe(e.currentTarget.value),
              onBlur: Be,
              onKeyDown: (e) => {
                e.key === "Enter" && (e.preventDefault(), Be()), e.key === "Escape" && (e.preventDefault(), Dt());
              }
            }
          ) : /* @__PURE__ */ r(
            "strong",
            {
              className: "deck-studio-title-label",
              title: y ? void 0 : "Double-cliquer pour modifier",
              onDoubleClick: St,
              children: oe
            }
          ) }),
          /* @__PURE__ */ r("nav", { "aria-label": "Slides", children: C == null ? void 0 : C.slides.map((e) => /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: e.id === (p == null ? void 0 : p.id) ? "is-active" : void 0,
              draggable: B.allowReorderSlides && !y,
              "data-drop-position": (I == null ? void 0 : I.targetSlideId) === e.id ? I.placement : void 0,
              "aria-grabbed": (I == null ? void 0 : I.draggedSlideId) === e.id ? "true" : void 0,
              onClick: () => pt(e.id),
              onDragStart: (a) => bt(a, e.id),
              onDragOver: (a) => wt(a, e.id),
              onDragLeave: () => {
                (I == null ? void 0 : I.targetSlideId) === e.id && ee({ draggedSlideId: I.draggedSlideId });
              },
              onDrop: (a) => kt(a, e.id),
              onDragEnd: () => ee(null),
              children: [
                /* @__PURE__ */ r("span", { children: e.index + 1 }),
                /* @__PURE__ */ r("span", { children: on(e) }),
                /* @__PURE__ */ r("small", { children: e.layout.name })
              ]
            },
            e.id
          )) })
        ] }) : null,
        /* @__PURE__ */ c("main", { className: "deck-studio-main", ref: Pe, tabIndex: -1, children: [
          /* @__PURE__ */ c("header", { className: "deck-studio-header", children: [
            /* @__PURE__ */ r("div", { className: "deck-studio-slide-heading", children: B.allowLayoutChange && p && ne !== "source" ? /* @__PURE__ */ r("label", { className: "deck-layout-select", children: /* @__PURE__ */ r(
              "select",
              {
                "aria-label": "Layout de la slide",
                value: p.layout.name,
                onChange: (e) => {
                  o != null && o.createVersionBeforeDestructiveAction && $("before-layout-change", "Before layout change"), j(
                    Ft(g, p.id, e.currentTarget.value, H.layouts),
                    "layout-change"
                  );
                },
                disabled: y,
                children: Array.from(H.layouts.values()).map((e) => /* @__PURE__ */ r("option", { value: e.name, children: e.displayName }, e.name))
              }
            ) }) : null }),
            /* @__PURE__ */ c("div", { className: "deck-studio-actions", children: [
              O.showSourceModeToggle && pe.length > 1 ? /* @__PURE__ */ c("label", { className: "deck-view-mode-select", children: [
                /* @__PURE__ */ r("span", { children: "Editor view" }),
                /* @__PURE__ */ r(
                  "select",
                  {
                    value: ne,
                    onChange: (e) => Je(e.currentTarget.value),
                    children: pe.map((e) => /* @__PURE__ */ r("option", { value: e, children: rn(e) }, e))
                  }
                )
              ] }) : null,
              /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => xe(!0),
                  disabled: y,
                  children: "Global"
                }
              ),
              B.allowAddSlide ? /* @__PURE__ */ r("button", { type: "button", onClick: vt, disabled: y, children: "Add" }) : null,
              B.allowDuplicateSlide && p ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: () => j(Bt(g, p.id), "slide-duplicate"),
                  disabled: y,
                  children: "Duplicate"
                }
              ) : null,
              B.allowDeleteSlide && p ? /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  onClick: gt,
                  disabled: y || ((C == null ? void 0 : C.slides.length) ?? 0) <= 1,
                  children: "Delete"
                }
              ) : null,
              o ? /* @__PURE__ */ r("button", { type: "button", onClick: at, disabled: y, children: "Save" }) : null
            ] })
          ] }),
          ne === "source" ? /* @__PURE__ */ r(
            "textarea",
            {
              className: "deck-source-editor",
              value: g.content,
              onChange: (e) => j({ ...g, content: e.currentTarget.value }, "raw-source-edit"),
              spellCheck: !1,
              readOnly: y
            }
          ) : ne === "preview" && p ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview deck-studio-preview-main ${Fe}`,
              "aria-label": "Slide preview",
              tabIndex: -1,
              style: He,
              children: /* @__PURE__ */ r(Ee, { slide: p, target: "screen" })
            }
          ) : p ? /* @__PURE__ */ r("div", { className: "deck-studio-editor", children: /* @__PURE__ */ r(
            Yt,
            {
              source: g,
              slideId: p.id,
              fields: p.layout.definition.editor.fieldGroups.flatMap((e) => e.fields),
              inheritedMarkdownSlots: nt,
              readOnly: !!y,
              onUpdate: j
            }
          ) }) : (b == null ? void 0 : b.status) === "invalid" ? /* @__PURE__ */ r(Nt, { fallback: b.fallback }) : null,
          O.showActiveSlidePreview && ne !== "preview" && p ? /* @__PURE__ */ r(
            "section",
            {
              className: `deck-studio-preview ${Fe}`,
              "aria-label": "Active slide preview",
              style: He,
              children: /* @__PURE__ */ r(Ee, { slide: p, target: "screen" })
            }
          ) : null
        ] }),
        O.showInspector ? /* @__PURE__ */ c("aside", { className: "deck-studio-inspector", style: { width: O.inspectorWidthPx }, children: [
          O.showDiagnosticsPanel ? /* @__PURE__ */ c("section", { children: [
            /* @__PURE__ */ r("h3", { children: "Diagnostics" }),
            /* @__PURE__ */ r(Ke, { diagnostics: yt })
          ] }) : null,
          (O.showVersionHistory || Xe) && o ? /* @__PURE__ */ r(
            en,
            {
              versions: et,
              readOnly: !!y,
              canRestore: B.allowVersionRestore,
              canCompare: B.allowVersionCompare,
              onCreateManualVersion: (e) => {
                z(g, p == null ? void 0 : p.id), $("manual", e ?? "Manual save");
              },
              onRestoreVersion: (e) => void Te(e),
              onDeleteVersion: (e) => void rt(e),
              onRenameVersion: (e, a) => void it(e, a),
              onCompareWithCurrent: (e) => void Le(e),
              onCompareVersions: (e, a) => void st(e, a)
            }
          ) : null
        ] }) : null,
        Qe ? /* @__PURE__ */ r(
          Jt,
          {
            source: g,
            readOnly: !!y,
            onUpdate: j,
            onClose: () => xe(!1)
          }
        ) : null,
        V ? /* @__PURE__ */ r(
          Qt,
          {
            draft: V.draft,
            current: V.current,
            versions: V.versions,
            onRestoreDraft: () => void lt(),
            onRestoreVersion: (e) => {
              K(null), Te(e);
            },
            onPreviewDraft: ct,
            onPreviewVersion: (e) => void ot(e),
            onCompareDraftWithCurrent: dt,
            onCompareVersionWithCurrent: (e) => void Le(e),
            onCreateCopyFromDraft: () => void ut(),
            onCreateCopyFromVersion: (e) => void ft(e),
            onDeleteDraft: () => void mt(),
            onKeepCurrent: () => void ht(),
            onOpenVersionHistory: () => {
              be(!0), K(null);
            }
          }
        ) : null,
        Z ? /* @__PURE__ */ r(
          Xt,
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
          nn,
          {
            title: ue.title,
            label: ue.label,
            source: ue.source,
            onClose: () => we(null)
          }
        ) : null
      ]
    }
  );
}
function an() {
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
function rn(t) {
  return t === "source" ? "YAML" : t === "preview" ? "Preview" : "Form";
}
function on(t) {
  const i = t.slots.get("title"), n = (i == null ? void 0 : i.content.kind) === "markdown" ? i.content.markdown : void 0;
  return (n == null ? void 0 : n.split(/\r?\n/).map((l) => l.replace(/^#{1,6}\s+/, "").trim()).find((l) => l.length > 0)) ?? `Slide ${t.index + 1}`;
}
function Ge(t) {
  const i = t.currentTarget.getBoundingClientRect();
  return i.height <= 0 || t.clientY > i.top + i.height / 2 ? "after" : "before";
}
export {
  hn as D,
  Nt as a
};
