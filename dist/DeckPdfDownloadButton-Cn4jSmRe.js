import { jsx as l, jsxs as F, Fragment as y } from "react/jsx-runtime";
import { forwardRef as E, useRef as R, useState as g, useCallback as v } from "react";
import { d as N } from "./themeStyle-CyBLqMAf.js";
import { S as k } from "./SlideRenderer-iimFvRrx.js";
function _({ deck: e }) {
  return /* @__PURE__ */ l("div", { className: `deck-print-root ${e.theme.cssClassName}`, children: e.slides.map((t) => /* @__PURE__ */ l(
    "section",
    {
      className: `deck-print-page ${e.theme.cssClassName}`,
      "data-slide-id": t.id,
      style: N(e.theme),
      children: /* @__PURE__ */ l(k, { slide: t, target: "print" })
    },
    t.id
  )) });
}
const b = E(
  function({ className: t, deck: r }, o) {
    return /* @__PURE__ */ l(
      "div",
      {
        ref: o,
        className: ["deck-pdf-export-host", t].filter(Boolean).join(" "),
        "aria-hidden": "true",
        children: /* @__PURE__ */ l(_, { deck: r })
      }
    );
  }
);
async function S({
  filename: e,
  imageQuality: t = 0.96,
  pageHeight: r = 900,
  pageSelector: o = ".deck-print-page",
  pageWidth: n = 1600,
  root: u,
  scale: f = 2
}) {
  var i;
  const a = Array.from(u.querySelectorAll(o));
  if (a.length === 0)
    return h("PDF_NO_PRINT_PAGES", `No printable pages found with selector '${o}'.`);
  try {
    const [{ jsPDF: s }, P] = await Promise.all([
      import("jspdf"),
      import("html2canvas")
    ]), m = P.default;
    await ((i = document.fonts) == null ? void 0 : i.ready);
    const c = new s({
      orientation: "landscape",
      unit: "px",
      format: [n, r],
      compress: !0
    });
    for (const [d, p] of a.entries()) {
      const x = (await m(p, {
        backgroundColor: "#ffffff",
        scale: f,
        useCORS: !0,
        windowWidth: n,
        windowHeight: r
      })).toDataURL("image/jpeg", t);
      d > 0 && c.addPage([n, r], "landscape"), c.addImage(x, "JPEG", 0, 0, n, r);
    }
    return c.save(e), { status: "downloaded" };
  } catch (s) {
    return h(
      "PDF_EXPORT_FAILED",
      s instanceof Error ? s.message : "Unable to generate PDF."
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
  pageHeight: o,
  pageSelector: n,
  pageWidth: u,
  scale: f
}) {
  const a = R(null), [i, s] = g("idle"), [P, m] = g(), c = v(async () => {
    if (!a.current) {
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
      return s("failed"), m(p), p;
    }
    s("exporting");
    const d = await S({
      filename: t ?? `${A(e.metadata.title || "deck")}.pdf`,
      imageQuality: r,
      pageHeight: o,
      pageSelector: n,
      pageWidth: u,
      root: a.current,
      scale: f
    });
    return s(d.status === "failed" ? "failed" : "downloaded"), m(d), d;
  }, [
    e.metadata.title,
    t,
    r,
    o,
    n,
    u,
    f
  ]);
  return {
    exportHostRef: a,
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
  exportHostClassName: o,
  exportingChildren: n = "Export...",
  filename: u,
  imageQuality: f,
  onClick: a,
  onExportResult: i,
  pageHeight: s,
  pageSelector: P,
  pageWidth: m,
  scale: c,
  ...d
}) {
  const { exportHostRef: p, exportPdf: D, exporting: x } = j({
    deck: t,
    filename: u,
    imageQuality: f,
    pageHeight: s,
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
          a == null || a(w), !w.defaultPrevented && D().then(i);
        },
        children: x ? n : e
      }
    ),
    /* @__PURE__ */ l(b, { ref: p, deck: t, className: o })
  ] });
}
export {
  O as D,
  _ as P,
  b as a,
  S as d,
  j as u
};
