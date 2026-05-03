import { jsx as e, jsxs as c } from "react/jsx-runtime";
import l from "react-markdown";
function y(r) {
  return {
    "--deck-color-background": r.tokens.color.background,
    "--deck-color-foreground": r.tokens.color.foreground,
    "--deck-color-primary": r.tokens.color.primary,
    "--deck-color-muted": r.tokens.color.muted,
    "--deck-color-danger": r.tokens.color.danger,
    "--deck-color-warning": r.tokens.color.warning,
    "--deck-font-heading": r.tokens.font.heading,
    "--deck-font-body": r.tokens.font.body,
    "--deck-font-mono": r.tokens.font.mono,
    "--deck-slide-padding": r.tokens.spacing.slidePadding,
    "--deck-gap": r.tokens.spacing.gap
  };
}
function u({ node: r }) {
  return r.kind !== "markdown" || !("markdown" in r) ? /* @__PURE__ */ e(i, { node: r }) : /* @__PURE__ */ e(
    l,
    {
      allowedElements: [
        "p",
        "strong",
        "em",
        "a",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "br"
      ],
      urlTransform: (n) => /^(https?:|mailto:|\/|#)/i.test(n) ? n : "",
      children: r.markdown
    }
  );
}
function p({ node: r }) {
  return r.kind !== "code" || !("code" in r) ? /* @__PURE__ */ e(i, { node: r }) : /* @__PURE__ */ e("pre", { className: "deck-code-block", children: /* @__PURE__ */ e("code", { children: r.code }) });
}
function m({ node: r }) {
  return r.kind !== "mermaid" || !("chart" in r) ? /* @__PURE__ */ e(i, { node: r }) : /* @__PURE__ */ e("pre", { className: "deck-mermaid-block", children: r.chart });
}
function i({ node: r }) {
  return /* @__PURE__ */ c("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    r.kind
  ] });
}
const f = {
  kind: "markdown",
  render: u
}, g = {
  kind: "code",
  render: p
}, R = {
  kind: "mermaid",
  render: m
}, w = [
  f,
  g,
  R
], a = new Map(
  w.map((r) => [r.kind, r])
);
function P({ content: r, renderers: n }) {
  const d = n ?? a;
  if (r.kind === "image")
    return /* @__PURE__ */ e(
      "img",
      {
        className: "deck-slot-image",
        src: r.src ?? "",
        alt: r.alt ?? "",
        loading: "lazy"
      }
    );
  if (r.kind === "renderer") {
    const o = d.get(r.rendererKind);
    return o ? t(o, {
      kind: r.rendererKind,
      props: r.props
    }) : /* @__PURE__ */ e(k, { kind: r.rendererKind });
  }
  return /* @__PURE__ */ e("div", { className: "deck-markdown", children: r.nodes.map((o, s) => /* @__PURE__ */ e(N, { node: o, renderers: d }, `${o.kind}-${s}`)) });
}
function N({
  node: r,
  renderers: n
}) {
  const d = (n == null ? void 0 : n.get(r.kind)) ?? a.get(r.kind);
  return d ? t(d, r) : /* @__PURE__ */ e(k, { kind: r.kind });
}
function t(r, n) {
  const d = r.render;
  return /* @__PURE__ */ e(d, { node: n });
}
function k({ kind: r }) {
  return /* @__PURE__ */ c("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    r
  ] });
}
export {
  P as C,
  a,
  w as b,
  y as d
};
