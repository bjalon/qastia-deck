import { jsx as b } from "react/jsx-runtime";
import { d as g } from "./themeStyle-CyBLqMAf.js";
import { S as N } from "./SlideRenderer-iimFvRrx.js";
import { useState as w, useMemo as E, useCallback as f } from "react";
function L({
  activeIndex: e,
  deck: s,
  target: r = "screen"
}) {
  const n = s.slides[e] ?? s.slides[0];
  return n ? /* @__PURE__ */ b("div", { className: `deck-theme-surface ${s.theme.cssClassName}`, style: g(s.theme), children: /* @__PURE__ */ b(N, { slide: n, target: r }) }) : null;
}
function O(e) {
  if (e.isComposing)
    return !0;
  const s = e.target;
  return s instanceof HTMLElement ? !!s.closest(
    "input, textarea, select, button, [role='combobox'], [role='menu'], [contenteditable='true'], [contenteditable='']"
  ) : !1;
}
function v(e, s) {
  if (!s)
    return 0;
  const r = e.slides.findIndex((n) => n.id === s);
  return r === -1 ? 0 : r;
}
function R({
  deck: e,
  defaultSelectedSlideId: s,
  initialSlideId: r,
  onAction: n,
  onSlideChange: a,
  selectedSlideId: I
}) {
  const D = v(e, s ?? r), o = I ? e.slides.findIndex((i) => i.id === I) : -1, [h, x] = w(D), d = o >= 0 ? o : h, t = e.slides[d] ?? e.slides[0], c = E(
    () => ({
      activeSlideId: (t == null ? void 0 : t.id) ?? "",
      activeSlideIndex: d
    }),
    [d, t == null ? void 0 : t.id]
  ), m = f(
    (i) => {
      n == null || n(i, c);
    },
    [n, c]
  ), y = f(
    (i, T) => {
      const u = Math.min(Math.max(i, 0), e.slides.length - 1), p = t == null ? void 0 : t.id;
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
    [d, t == null ? void 0 : t.id, o, e.slides, m, a]
  ), M = f(
    (i) => {
      o >= 0 || x(v(e, i));
    },
    [o, e]
  );
  return {
    activeIndex: d,
    activeSlide: t,
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
