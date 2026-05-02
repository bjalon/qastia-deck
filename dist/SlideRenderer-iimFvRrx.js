import { jsx as o } from "react/jsx-runtime";
function d({ slide: t, target: a }) {
  const e = t.layout.definition.component;
  return /* @__PURE__ */ o(
    "section",
    {
      className: "deck-slide-frame",
      "data-slide-id": t.id,
      "data-layout": t.layout.name,
      "data-target": a,
      children: /* @__PURE__ */ o(e, { slide: t, target: a })
    }
  );
}
export {
  d as S
};
