import { jsx as s, jsxs as p } from "react/jsx-runtime";
import { useState as S, useEffect as k } from "react";
const B = "https://docs.google.com/spreadsheets/d";
function y(r) {
  const i = [];
  let e = "", n = !1;
  for (let t = 0; t < r.length; t++) {
    const o = r[t];
    o === '"' ? n = !n : o === "," && !n ? (i.push(e.trim()), e = "") : e += o;
  }
  return i.push(e.trim()), i;
}
function C({ sheetId: r, sheetName: i = "Sheet1", userEmail: e, appSlug: n }) {
  const [t, o] = S("loading");
  return k(() => {
    if (!r) {
      o("allowed");
      return;
    }
    if (!e || !n) {
      o("denied");
      return;
    }
    const f = `${B}/${r}/gviz/tq?tqx=out:csv&sheet=${i}`;
    fetch(f).then((d) => d.text()).then((d) => {
      const l = d.split(`
`).filter((c) => c.trim());
      if (l.length < 2) {
        o("denied");
        return;
      }
      const a = y(l[0]).map((c) => c.toLowerCase()), h = a.indexOf("email"), g = a.indexOf(n.toLowerCase());
      if (h === -1 || g === -1) {
        o("denied");
        return;
      }
      const x = e.toLowerCase();
      for (let c = 1; c < l.length; c++) {
        const u = y(l[c]), m = (u[h] || "").toLowerCase().trim();
        if ((u[g] || "").toUpperCase().trim() === "O") {
          if (m === "all") {
            o("allowed");
            return;
          }
          if (m === x) {
            o("allowed");
            return;
          }
        }
      }
      o("denied");
    }).catch(() => o("error"));
  }, [r, i, e, n]), t;
}
function v({ lang: r = "ko", userEmail: i, appName: e }) {
  const n = {
    ko: {
      title: "접근 권한이 없습니다",
      desc: "이 도구에 대한 접근 권한이 없습니다.",
      contact: "권한이 필요하시면 관리자에게 문의하세요.",
      loggedAs: "현재 로그인:",
      goBack: "SR-Gate로 돌아가기"
    },
    en: {
      title: "Access Restricted",
      desc: "You don't have permission to access this tool.",
      contact: "Please contact your administrator for access.",
      loggedAs: "Logged in as:",
      goBack: "Back to SR-Gate"
    }
  }, t = n[r] || n.ko;
  return /* @__PURE__ */ s("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#fff",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ p("div", { style: { textAlign: "center", maxWidth: 400, padding: 40 }, children: [
    /* @__PURE__ */ s("div", { style: { fontSize: 64, marginBottom: 24 }, children: "🔒" }),
    /* @__PURE__ */ s("h1", { style: { fontSize: 24, fontWeight: 700, marginBottom: 12 }, children: t.title }),
    e && /* @__PURE__ */ s("p", { style: { fontSize: 14, color: "#999", marginBottom: 8 }, children: e }),
    /* @__PURE__ */ s("p", { style: { fontSize: 16, color: "#aaa", marginBottom: 8 }, children: t.desc }),
    /* @__PURE__ */ s("p", { style: { fontSize: 14, color: "#888", marginBottom: 24 }, children: t.contact }),
    i && /* @__PURE__ */ p("p", { style: { fontSize: 13, color: "#666", marginBottom: 24 }, children: [
      t.loggedAs,
      " ",
      i
    ] }),
    /* @__PURE__ */ s(
      "a",
      {
        href: "https://sr-gate.vercel.app",
        style: {
          display: "inline-block",
          padding: "10px 24px",
          background: "#FFD65A",
          color: "#0D0D0E",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
          textDecoration: "none"
        },
        children: t.goBack
      }
    )
  ] }) });
}
function z({
  appSlug: r,
  sheetId: i,
  userEmail: e,
  sheetName: n = "Sheet1",
  lang: t = "ko",
  appName: o,
  loading: f,
  denied: d,
  children: l
}) {
  const a = C({ sheetId: i, sheetName: n, userEmail: e, appSlug: r });
  return a === "loading" ? f || /* @__PURE__ */ s("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#aaa",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ s("p", { children: t === "ko" ? "권한 확인 중..." : "Checking access..." }) }) : a === "denied" || a === "error" ? d || /* @__PURE__ */ s(v, { lang: t, userEmail: e, appName: o }) : l;
}
export {
  v as AccessDenied,
  z as SRAuthGate,
  C as useSheetACL
};
