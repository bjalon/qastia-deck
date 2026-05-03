import { jsx as r, jsxs as i } from "react/jsx-runtime";
import { useId as g, useState as p, useEffect as R } from "react";
import N from "react-markdown";
function E(e) {
  return {
    "--deck-color-background": e.tokens.color.background,
    "--deck-color-foreground": e.tokens.color.foreground,
    "--deck-color-primary": e.tokens.color.primary,
    "--deck-color-muted": e.tokens.color.muted,
    "--deck-color-danger": e.tokens.color.danger,
    "--deck-color-warning": e.tokens.color.warning,
    "--deck-font-heading": e.tokens.font.heading,
    "--deck-font-body": e.tokens.font.body,
    "--deck-font-mono": e.tokens.font.mono,
    "--deck-slide-padding": e.tokens.spacing.slidePadding,
    "--deck-gap": e.tokens.spacing.gap
  };
}
function b({ node: e }) {
  return e.kind !== "markdown" || !("markdown" in e) ? /* @__PURE__ */ r(s, { node: e }) : /* @__PURE__ */ r(
    N,
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
      children: e.markdown
    }
  );
}
function w({ node: e }) {
  return e.kind !== "code" || !("code" in e) ? /* @__PURE__ */ r(s, { node: e }) : /* @__PURE__ */ r("pre", { className: "deck-code-block", children: /* @__PURE__ */ r("code", { children: e.code }) });
}
function h({ node: e }) {
  return e.kind !== "mermaid" || !("chart" in e) ? /* @__PURE__ */ r(s, { node: e }) : /* @__PURE__ */ r(y, { chart: e.chart });
}
function y({ chart: e }) {
  const n = g(), [d, a] = p({ status: "loading" });
  return R(() => {
    let o = !1;
    const m = `deck-mermaid-${n.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    return a({ status: "loading" }), import("mermaid").then(async (t) => {
      const c = t.default;
      c.initialize({
        startOnLoad: !1,
        securityLevel: "strict"
      });
      const { svg: f } = await c.render(m, e);
      o || a({ status: "rendered", svg: f });
    }).catch((t) => {
      o || a({
        status: "failed",
        message: t instanceof Error ? t.message : "Unable to render Mermaid diagram."
      });
    }), () => {
      o = !0;
    };
  }, [e, n]), d.status === "rendered" ? /* @__PURE__ */ r(
    "figure",
    {
      className: "deck-mermaid-block deck-mermaid-block-rendered",
      dangerouslySetInnerHTML: { __html: d.svg }
    }
  ) : d.status === "failed" ? /* @__PURE__ */ i("pre", { className: "deck-mermaid-block", "data-status": "failed", children: [
    d.message,
    `

`,
    e
  ] }) : /* @__PURE__ */ r("pre", { className: "deck-mermaid-block", "data-status": "loading", children: e });
}
function s({ node: e }) {
  return /* @__PURE__ */ i("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    e.kind
  ] });
}
const M = {
  kind: "markdown",
  render: b
}, v = {
  kind: "code",
  render: w
}, P = {
  kind: "mermaid",
  render: h
}, S = [
  M,
  v,
  P
], l = new Map(
  S.map((e) => [e.kind, e])
);
function K({ content: e, renderers: n }) {
  const d = n ?? l;
  if (e.kind === "image")
    return /* @__PURE__ */ r(
      "img",
      {
        className: "deck-slot-image",
        src: e.src ?? "",
        alt: e.alt ?? "",
        loading: "lazy"
      }
    );
  if (e.kind === "renderer") {
    const a = d.get(e.rendererKind);
    return a ? u(a, {
      kind: e.rendererKind,
      props: e.props
    }) : /* @__PURE__ */ r(k, { kind: e.rendererKind });
  }
  return /* @__PURE__ */ r("div", { className: "deck-markdown", children: e.nodes.map((a, o) => /* @__PURE__ */ r(C, { node: a, renderers: d }, `${a.kind}-${o}`)) });
}
function C({
  node: e,
  renderers: n
}) {
  const d = (n == null ? void 0 : n.get(e.kind)) ?? l.get(e.kind);
  return d ? u(d, e) : /* @__PURE__ */ r(k, { kind: e.kind });
}
function u(e, n) {
  const d = e.render;
  return /* @__PURE__ */ r(d, { node: n });
}
function k({ kind: e }) {
  return /* @__PURE__ */ i("pre", { className: "deck-unsupported-renderer", children: [
    "Renderer: ",
    e
  ] });
}
export {
  K as C,
  l as a,
  S as b,
  E as d
};
