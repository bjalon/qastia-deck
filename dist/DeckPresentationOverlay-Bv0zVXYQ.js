import { jsxs as N, jsx as u } from "react/jsx-runtime";
import { useRef as C, useState as K, useCallback as b, useEffect as k } from "react";
import { u as Y, D as Z, s as _ } from "./useDeckNavigation-rlGDMr8A.js";
function p({
  activeIndex: l,
  onClose: w,
  onNext: a,
  onPrevious: v,
  slideCount: o
}) {
  return /* @__PURE__ */ N("div", { className: "deck-presentation-controls", "aria-label": "Navigation presentation", children: [
    /* @__PURE__ */ u("button", { type: "button", onClick: v, disabled: l === 0, "aria-label": "Slide precedente", children: "Previous" }),
    /* @__PURE__ */ N("span", { children: [
      l + 1,
      " / ",
      o
    ] }),
    /* @__PURE__ */ u(
      "button",
      {
        type: "button",
        onClick: a,
        disabled: l >= o - 1,
        "aria-label": "Slide suivante",
        children: "Next"
      }
    ),
    /* @__PURE__ */ u("button", { type: "button", onClick: w, children: "Quitter" })
  ] });
}
function ne({
  deck: l,
  defaultOpen: w = !1,
  initialSlideId: a,
  onAction: v,
  onOpenChange: o,
  onSlideChange: U,
  open: g,
  options: e,
  selectedSlideId: W
}) {
  var R, M, V, q, O, S, j;
  const E = C(null), d = C(void 0), H = C(void 0), [Q, $] = K(w), [z, P] = K(!0), { activeIndex: c, activeSlide: n, emitAction: I, goTo: f, resetToSlideId: x } = Y({
    deck: l,
    initialSlideId: a,
    onAction: v,
    onSlideChange: U,
    selectedSlideId: W
  }), s = g ?? Q, D = ((R = e == null ? void 0 : e.fullscreen) == null ? void 0 : R.strategy) ?? "browser-fullscreen", T = ((M = e == null ? void 0 : e.fullscreen) == null ? void 0 : M.closeOnEscape) ?? !0, i = ((V = e == null ? void 0 : e.controls) == null ? void 0 : V.visibility) ?? "auto", F = ((q = e == null ? void 0 : e.controls) == null ? void 0 : q.visibility) === "auto" ? e.controls.autoHideDelayMs ?? 1800 : 1800, B = ((O = e == null ? void 0 : e.hint) == null ? void 0 : O.showWhenControlsHidden) ?? !0, G = ((S = e == null ? void 0 : e.hint) == null ? void 0 : S.text) ?? "Fleches gauche/droite: precedent/suivant. Escape: quitter.", J = ((j = e == null ? void 0 : e.hint) == null ? void 0 : j.position) ?? "bottom-right";
  H.current = n == null ? void 0 : n.id;
  const y = b(
    (r, t) => {
      g === void 0 && $(r), o == null || o({
        open: r,
        origin: t,
        slideId: H.current,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [o, g]
  ), A = b(
    (r = "mouse") => {
      const t = E.current;
      document.fullscreenElement === t && document.exitFullscreen().catch(() => {
      }), y(!1, r), I({
        type: "toggle-fullscreen",
        origin: r,
        slideId: n == null ? void 0 : n.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [n == null ? void 0 : n.id, I, y]
  ), m = b(() => {
    d.current !== void 0 && (window.clearTimeout(d.current), d.current = void 0);
  }, []), h = b(() => {
    i === "auto" && (P(!0), m(), d.current = window.setTimeout(() => {
      P(!1), d.current = void 0;
    }, F));
  }, [F, m, i]);
  if (k(() => {
    s && x(a);
  }, [a, s, x]), k(() => {
    if (s) {
      if (i === "auto")
        return h(), m;
      P(i === "visible"), m();
    }
  }, [m, i, s, h]), k(() => {
    if (!s)
      return;
    const r = E.current;
    D === "browser-fullscreen" && (r != null && r.requestFullscreen) && r.requestFullscreen().catch(() => {
    });
    function t() {
      D === "browser-fullscreen" && document.fullscreenElement === null && y(!1, "keyboard");
    }
    return document.addEventListener("fullscreenchange", t), () => {
      document.removeEventListener("fullscreenchange", t), document.fullscreenElement === r && document.exitFullscreen().catch(() => {
      });
    };
  }, [D, s, y]), k(() => {
    if (!s)
      return;
    function r(t) {
      _(t) || ((t.key === "Escape" || t.key === "ArrowRight" || t.key === "PageDown" || t.key === " " || t.key === "ArrowLeft" || t.key === "PageUp") && (t.preventDefault(), t.stopImmediatePropagation()), t.key === "Escape" && T && A("keyboard"), (t.key === "ArrowRight" || t.key === "PageDown" || t.key === " ") && f(c + 1, "keyboard"), (t.key === "ArrowLeft" || t.key === "PageUp") && f(c - 1, "keyboard"));
    }
    return window.addEventListener("keydown", r, !0), () => window.removeEventListener("keydown", r, !0);
  }, [c, T, A, f, s]), !s || !n)
    return null;
  const L = i === "visible" || i === "auto" && z, X = B && !L;
  return /* @__PURE__ */ N(
    "section",
    {
      ref: E,
      className: `deck-presentation-overlay ${l.theme.cssClassName}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Presentation plein ecran",
      onMouseMove: h,
      onPointerMove: h,
      children: [
        /* @__PURE__ */ u("div", { className: "deck-presentation-stage", children: /* @__PURE__ */ u(Z, { deck: l, activeIndex: c }) }),
        L ? /* @__PURE__ */ u(
          p,
          {
            activeIndex: c,
            slideCount: l.slides.length,
            onPrevious: () => f(c - 1, "mouse"),
            onNext: () => f(c + 1, "mouse"),
            onClose: () => A("mouse")
          }
        ) : null,
        X ? /* @__PURE__ */ u("p", { className: "deck-presentation-hint", "data-position": J, children: G }) : null
      ]
    }
  );
}
export {
  ne as D
};
