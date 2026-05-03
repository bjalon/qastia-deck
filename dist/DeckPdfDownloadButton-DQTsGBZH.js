import { jsx as l, jsxs as F, Fragment as y } from "react/jsx-runtime";
import { forwardRef as E, useRef as R, useState as g, useCallback as v } from "react";
import { d as N } from "./ContentRenderer-cNVb24xQ.js";
import { S as _ } from "./SlideRenderer-DY_VRveh.js";
function b({ deck: e }) {
  return /* @__PURE__ */ l("div", { className: `deck-print-root ${e.theme.cssClassName}`, children: e.slides.map((t) => /* @__PURE__ */ l(
    "section",
    {
      className: `deck-print-page ${e.theme.cssClassName}`,
      "data-slide-id": t.id,
      style: N(e.theme),
      children: /* @__PURE__ */ l(_, { slide: t, target: "print", renderers: e.renderers })
    },
    t.id
  )) });
}
const k = E(
  function({ className: t, deck: r }, n) {
    return /* @__PURE__ */ l(
      "div",
      {
        ref: n,
        className: ["deck-pdf-export-host", t].filter(Boolean).join(" "),
        "aria-hidden": "true",
        children: /* @__PURE__ */ l(b, { deck: r })
      }
    );
  }
);
async function S({
  filename: e,
  imageQuality: t = 0.96,
  pageHeight: r = 900,
  pageSelector: n = ".deck-print-page",
  pageWidth: o = 1600,
  root: u,
  scale: f = 2
}) {
  var i;
  const s = Array.from(u.querySelectorAll(n));
  if (s.length === 0)
    return h("PDF_NO_PRINT_PAGES", `No printable pages found with selector '${n}'.`);
  try {
    const [{ jsPDF: a }, P] = await Promise.all([
      import("jspdf"),
      import("html2canvas")
    ]), m = P.default;
    await ((i = document.fonts) == null ? void 0 : i.ready);
    const c = new a({
      orientation: "landscape",
      unit: "px",
      format: [o, r],
      compress: !0
    });
    for (const [d, p] of s.entries()) {
      const x = (await m(p, {
        backgroundColor: "#ffffff",
        scale: f,
        useCORS: !0,
        windowWidth: o,
        windowHeight: r
      })).toDataURL("image/jpeg", t);
      d > 0 && c.addPage([o, r], "landscape"), c.addImage(x, "JPEG", 0, 0, o, r);
    }
    return c.save(e), { status: "downloaded" };
  } catch (a) {
    return h(
      "PDF_EXPORT_FAILED",
      a instanceof Error ? a.message : "Unable to generate PDF."
    );
  }
}
function h(e, t) {
  return {
    status: "failed",
    diagnostics: [
      {
        code: e,
        severity: "error",
        message: t
      }
    ]
  };
}
function j({
  deck: e,
  filename: t,
  imageQuality: r,
  pageHeight: n,
  pageSelector: o,
  pageWidth: u,
  scale: f
}) {
  const s = R(null), [i, a] = g("idle"), [P, m] = g(), c = v(async () => {
    if (!s.current) {
      const p = {
        status: "failed",
        diagnostics: [
          {
            code: "PDF_EXPORT_FAILED",
            severity: "error",
            message: "PDF export host is not mounted."
          }
        ]
      };
      return a("failed"), m(p), p;
    }
    a("exporting");
    const d = await S({
      filename: t ?? `${A(e.metadata.title || "deck")}.pdf`,
      imageQuality: r,
      pageHeight: n,
      pageSelector: o,
      pageWidth: u,
      root: s.current,
      scale: f
    });
    return a(d.status === "failed" ? "failed" : "downloaded"), m(d), d;
  }, [
    e.metadata.title,
    t,
    r,
    n,
    o,
    u,
    f
  ]);
  return {
    exportHostRef: s,
    status: i,
    exporting: i === "exporting",
    lastResult: P,
    exportPdf: c
  };
}
function A(e) {
  return e.normalize("NFD").replace(/[\u0300-\u036f]/gu, "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "") || "deck";
}
function O({
  children: e = "Télécharger PDF",
  deck: t,
  disabled: r,
  exportHostClassName: n,
  exportingChildren: o = "Export...",
  filename: u,
  imageQuality: f,
  onClick: s,
  onExportResult: i,
  pageHeight: a,
  pageSelector: P,
  pageWidth: m,
  scale: c,
  ...d
}) {
  const { exportHostRef: p, exportPdf: D, exporting: x } = j({
    deck: t,
    filename: u,
    imageQuality: f,
    pageHeight: a,
    pageSelector: P,
    pageWidth: m,
    scale: c
  });
  return /* @__PURE__ */ F(y, { children: [
    /* @__PURE__ */ l(
      "button",
      {
        ...d,
        type: d.type ?? "button",
        disabled: r || x,
        onClick: (w) => {
          s == null || s(w), !w.defaultPrevented && D().then(i);
        },
        children: x ? o : e
      }
    ),
    /* @__PURE__ */ l(k, { ref: p, deck: t, className: n })
  ] });
}
export {
  O as D,
  b as P,
  k as a,
  S as d,
  j as u
};
