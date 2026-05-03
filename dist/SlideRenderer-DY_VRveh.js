import { jsx as a } from "react/jsx-runtime";
import { a as r } from "./ContentRenderer-cNVb24xQ.js";
function m({ slide: e, target: t, renderers: o = r }) {
  const n = e.layout.definition.component;
  return /* @__PURE__ */ a(
    "section",
    {
      className: "deck-slide-frame",
      "data-slide-id": e.id,
      "data-layout": e.layout.name,
      "data-target": t,
      children: /* @__PURE__ */ a(n, { slide: e, target: t, renderers: o })
    }
  );
}
export {
  m as S
};
