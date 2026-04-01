import { jsx as s, jsxs as S } from "react/jsx-runtime";
import { useState as k, useEffect as v } from "react";
const A = "https://docs.google.com/spreadsheets/d", B = 300 * 1e3;
function x(r) {
  const o = [];
  let t = "", n = !1;
  for (let i = 0; i < r.length; i++) {
    const e = r[i];
    e === '"' ? n = !n : e === "," && !n ? (o.push(t.trim()), t = "") : t += e;
  }
  return o.push(t.trim()), o;
}
function z(r) {
  try {
    const o = sessionStorage.getItem(r);
    if (!o) return null;
    const { status: t, ts: n } = JSON.parse(o);
    return Date.now() - n > B ? (sessionStorage.removeItem(r), null) : t;
  } catch {
    return null;
  }
}
function f(r, o) {
  try {
    sessionStorage.setItem(r, JSON.stringify({ status: o, ts: Date.now() }));
  } catch {
  }
}
function L({ sheetId: r, sheetName: o = "Sheet1", userEmail: t, appSlug: n }) {
  const [i, e] = k("loading");
  return v(() => {
    if (!r) {
      e("allowed");
      return;
    }
    if (!t || !n) {
      e("denied");
      return;
    }
    const c = `sr-acl:${r}:${o}:${t}:${n}`, u = z(c);
    if (u) {
      e(u);
      return;
    }
    const h = `${A}/${r}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(o)}`;
    fetch(h).then((d) => d.text()).then((d) => {
      const l = d.split(`
`).filter((a) => a.trim());
      if (l.length < 2) {
        f(c, "denied"), e("denied");
        return;
      }
      const g = x(l[0]).map((a) => a.toLowerCase()), m = g.indexOf("email"), y = g.indexOf(n.toLowerCase());
      if (m === -1 || y === -1) {
        f(c, "denied"), e("denied");
        return;
      }
      const D = t.toLowerCase();
      for (let a = 1; a < l.length; a++) {
        const p = x(l[a]), C = (p[m] || "").toLowerCase().trim();
        if ((p[y] || "").toUpperCase().trim() === "O") {
          if (C === "all") {
            f(c, "allowed"), e("allowed");
            return;
          }
          if (C === D) {
            f(c, "allowed"), e("allowed");
            return;
          }
        }
      }
      f(c, "denied"), e("denied");
    }).catch(() => e("error"));
  }, [r, o, t, n]), i;
}
function w({ lang: r = "ko", userEmail: o, appName: t, isError: n = !1 }) {
  const i = {
    ko: {
      title: "접근 권한이 없습니다",
      desc: "이 도구에 대한 접근 권한이 없습니다.",
      contact: "권한이 필요하시면 관리자에게 문의하세요.",
      errorTitle: "연결 오류",
      errorDesc: "권한 정보를 불러오는 중 오류가 발생했습니다.",
      errorContact: "잠시 후 다시 시도하거나 관리자에게 문의하세요.",
      loggedAs: "현재 로그인:",
      goBack: "SR-Gate로 돌아가기"
    },
    en: {
      title: "Access Restricted",
      desc: "You don't have permission to access this tool.",
      contact: "Please contact your administrator for access.",
      errorTitle: "Connection Error",
      errorDesc: "Failed to load permission data.",
      errorContact: "Please try again later or contact your administrator.",
      loggedAs: "Logged in as:",
      goBack: "Back to SR-Gate"
    }
  }, e = i[r] || i.ko;
  return /* @__PURE__ */ s("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#fff",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ S("div", { style: { textAlign: "center", maxWidth: 400, padding: 40 }, children: [
    /* @__PURE__ */ s("div", { style: { fontSize: 64, marginBottom: 24 }, children: n ? "⚠️" : "🔒" }),
    /* @__PURE__ */ s("h1", { style: { fontSize: 24, fontWeight: 700, marginBottom: 12 }, children: n ? e.errorTitle : e.title }),
    t && /* @__PURE__ */ s("p", { style: { fontSize: 14, color: "#999", marginBottom: 8 }, children: t }),
    /* @__PURE__ */ s("p", { style: { fontSize: 16, color: "#aaa", marginBottom: 8 }, children: n ? e.errorDesc : e.desc }),
    /* @__PURE__ */ s("p", { style: { fontSize: 14, color: "#888", marginBottom: 24 }, children: n ? e.errorContact : e.contact }),
    o && /* @__PURE__ */ S("p", { style: { fontSize: 13, color: "#666", marginBottom: 24 }, children: [
      e.loggedAs,
      " ",
      o
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
        children: e.goBack
      }
    )
  ] }) });
}
function b({
  appSlug: r,
  sheetId: o,
  userEmail: t,
  sheetName: n = "Sheet1",
  lang: i = "ko",
  appName: e,
  loading: c,
  denied: u,
  error: h,
  children: d
}) {
  const l = L({ sheetId: o, sheetName: n, userEmail: t, appSlug: r });
  return l === "loading" ? c || /* @__PURE__ */ s("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#aaa",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ s("p", { children: i === "ko" ? "권한 확인 중..." : "Checking access..." }) }) : l === "error" ? h || /* @__PURE__ */ s(w, { lang: i, userEmail: t, appName: e, isError: !0 }) : l === "denied" ? u || /* @__PURE__ */ s(w, { lang: i, userEmail: t, appName: e }) : d;
}
export {
  w as AccessDenied,
  b as SRAuthGate,
  L as useSheetACL
};
