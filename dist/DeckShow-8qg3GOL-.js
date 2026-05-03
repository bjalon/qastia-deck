import { jsxs as u, jsx as o } from "react/jsx-runtime";
import { useRef as M, useCallback as A, useEffect as L } from "react";
import { u as E, D as T, s as S } from "./useDeckNavigation-DROuWEZG.js";
function U({
  activeIndex: l,
  onNext: i,
  onOpenPresentation: m,
  onPresentationControlsModeChange: g,
  onPrevious: k,
  placement: s,
  presentationButtonLabel: b,
  presentationControlsMode: d,
  presentationDisabled: h,
  presentationUnavailableLabel: y,
  showCounter: t,
  showPresentationButton: n,
  showPresentationControlsModeSelect: c,
  showPreviousNext: r,
  slideCount: e
}) {
  return /* @__PURE__ */ u("div", { className: "deck-show-toolbar", "data-placement": s, "aria-label": "Deck navigation", children: [
    n ? /* @__PURE__ */ o(
      "button",
      {
        type: "button",
        onClick: m,
        disabled: h,
        title: h ? y : b,
        children: b
      }
    ) : null,
    n && c ? /* @__PURE__ */ u("label", { className: "deck-presentation-mode-select", children: [
      /* @__PURE__ */ o("span", { children: "Presentation controls" }),
      /* @__PURE__ */ u(
        "select",
        {
          value: d,
          onChange: (D) => g(D.currentTarget.value),
          children: [
            /* @__PURE__ */ o("option", { value: "visible", children: "Boutons visibles" }),
            /* @__PURE__ */ o("option", { value: "hidden", children: "Boutons hidden" }),
            /* @__PURE__ */ o("option", { value: "auto", children: "Auto" })
          ]
        }
      )
    ] }) : null,
    r ? /* @__PURE__ */ o("button", { type: "button", onClick: k, disabled: l === 0, children: "Previous" }) : null,
    t ? /* @__PURE__ */ u("span", { children: [
      l + 1,
      " / ",
      e
    ] }) : null,
    r ? /* @__PURE__ */ o("button", { type: "button", onClick: i, disabled: l >= e - 1, children: "Next" }) : null
  ] });
}
function $({
  controls: l,
  deck: i,
  defaultSelectedSlideId: m,
  initialSlideId: g,
  keyboardNavigation: k,
  mode: s = "viewer",
  onAction: b,
  onRequestPresentation: d,
  onSlideChange: h,
  selectedSlideId: y
}) {
  const { activeIndex: t, activeSlide: n, emitAction: c, goTo: r } = E({
    deck: i,
    defaultSelectedSlideId: m,
    initialSlideId: g,
    onAction: b,
    onSlideChange: h,
    selectedSlideId: y
  }), e = l === !1 ? void 0 : l, D = l !== !1, p = (e == null ? void 0 : e.showPreviousNext) ?? !0, I = (e == null ? void 0 : e.showCounter) ?? !0, x = !!(e != null && e.showPresentationButton), v = M(null), f = k ?? (s === "embedded" ? "focus-within" : "global"), B = A(() => {
    e != null && e.presentationDisabled || (d == null || d({
      type: "presentation-requested",
      slideId: n == null ? void 0 : n.id,
      activeSlideIndex: t,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }), c({
      type: "toggle-fullscreen",
      origin: "mouse",
      slideId: n == null ? void 0 : n.id,
      createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }, [t, n == null ? void 0 : n.id, e == null ? void 0 : e.presentationDisabled, c, d]);
  L(() => {
    if (f === !1)
      return;
    function w(a) {
      var P;
      S(a) || f === "focus-within" && (!(a.target instanceof Node) || !((P = v.current) != null && P.contains(a.target))) || ((a.key === "ArrowRight" || a.key === "PageDown" || a.key === " ") && (a.preventDefault(), r(t + 1, "keyboard")), (a.key === "ArrowLeft" || a.key === "PageUp") && (a.preventDefault(), r(t - 1, "keyboard")));
    }
    return window.addEventListener("keydown", w), () => window.removeEventListener("keydown", w);
  }, [t, r, f]);
  const C = (e == null ? void 0 : e.placement) ?? "top", N = D ? /* @__PURE__ */ o(
    U,
    {
      activeIndex: t,
      slideCount: i.slides.length,
      placement: C,
      showPreviousNext: p,
      showCounter: I,
      showPresentationButton: x,
      presentationDisabled: !!(e != null && e.presentationDisabled),
      showPresentationControlsModeSelect: !!(e != null && e.showPresentationControlsModeSelect),
      presentationControlsMode: (e == null ? void 0 : e.presentationControlsMode) ?? "auto",
      presentationButtonLabel: (e == null ? void 0 : e.presentationButtonLabel) ?? "Presentation",
      presentationUnavailableLabel: (e == null ? void 0 : e.presentationUnavailableLabel) ?? "Presentation is unavailable",
      onOpenPresentation: B,
      onPresentationControlsModeChange: (w) => {
        var a;
        return (a = e == null ? void 0 : e.onPresentationControlsModeChange) == null ? void 0 : a.call(e, w);
      },
      onPrevious: () => r(t - 1, "mouse"),
      onNext: () => r(t + 1, "mouse")
    }
  ) : null;
  return /* @__PURE__ */ u(
    "div",
    {
      ref: v,
      className: `deck-screen-root ${i.theme.cssClassName}`,
      "data-mode": s,
      tabIndex: f === "focus-within" ? 0 : void 0,
      children: [
        C === "top" ? N : null,
        /* @__PURE__ */ o(T, { deck: i, activeIndex: t }),
        C === "bottom" ? N : null
      ]
    }
  );
}
export {
  U as D,
  $ as a
};
