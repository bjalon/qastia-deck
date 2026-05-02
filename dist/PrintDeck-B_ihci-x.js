import { jsx as r } from "react/jsx-runtime";
import { d as s } from "./themeStyle-CyBLqMAf.js";
import { S as a } from "./SlideRenderer-iimFvRrx.js";
function o({ deck: e }) {
  return /* @__PURE__ */ r("div", { className: `deck-print-root ${e.theme.cssClassName}`, children: e.slides.map((t) => /* @__PURE__ */ r(
    "section",
    {
      className: `deck-print-page ${e.theme.cssClassName}`,
      "data-slide-id": t.id,
      style: s(e.theme),
      children: /* @__PURE__ */ r(a, { slide: t, target: "print" })
    },
    t.id
  )) });
}
export {
  o as P
};
