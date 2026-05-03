import { jsx as b } from "react/jsx-runtime";
import { d as g } from "./ContentRenderer-cNVb24xQ.js";
import { S as N } from "./SlideRenderer-DY_VRveh.js";
import { useState as w, useMemo as E, useCallback as f } from "react";
function L({
  activeIndex: e,
  deck: t,
  target: i = "screen"
}) {
  const n = t.slides[e] ?? t.slides[0];
  return n ? /* @__PURE__ */ b("div", { className: `deck-theme-surface ${t.theme.cssClassName}`, style: g(t.theme), children: /* @__PURE__ */ b(N, { slide: n, target: i, renderers: t.renderers }) }) : null;
}
function O(e) {
  if (e.isComposing)
    return !0;
  const t = e.target;
  return t instanceof HTMLElement ? !!t.closest(
    "input, textarea, select, button, [role='combobox'], [role='menu'], [contenteditable='true'], [contenteditable='']"
  ) : !1;
}
function v(e, t) {
  if (!t)
    return 0;
  const i = e.slides.findIndex((n) => n.id === t);
  return i === -1 ? 0 : i;
}
function R({
  deck: e,
  defaultSelectedSlideId: t,
  initialSlideId: i,
  onAction: n,
  onSlideChange: a,
  selectedSlideId: I
}) {
  const D = v(e, t ?? i), o = I ? e.slides.findIndex((r) => r.id === I) : -1, [h, x] = w(D), d = o >= 0 ? o : h, s = e.slides[d] ?? e.slides[0], c = E(
    () => ({
      activeSlideId: (s == null ? void 0 : s.id) ?? "",
      activeSlideIndex: d
    }),
    [d, s == null ? void 0 : s.id]
  ), m = f(
    (r) => {
      n == null || n(r, c);
    },
    [n, c]
  ), y = f(
    (r, T) => {
      const u = Math.min(Math.max(r, 0), e.slides.length - 1), p = s == null ? void 0 : s.id;
      o < 0 && x(u);
      const l = e.slides[u];
      l && l.id !== p && (a == null || a({
        previousSlideId: p,
        activeSlideId: l.id,
        activeSlideIndex: u
      })), m({
        type: u > d ? "next-slide" : "previous-slide",
        origin: T,
        slideId: l == null ? void 0 : l.id,
        createdAtIso: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    [d, s == null ? void 0 : s.id, o, e.slides, m, a]
  ), M = f(
    (r) => {
      o >= 0 || x(v(e, r));
    },
    [o, e]
  );
  return {
    activeIndex: d,
    activeSlide: s,
    emitAction: m,
    goTo: y,
    resetToSlideId: M,
    state: c
  };
}
export {
  L as D,
  O as s,
  R as u
};
