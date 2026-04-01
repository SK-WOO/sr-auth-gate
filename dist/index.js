import { jsx as i, jsxs as u } from "react/jsx-runtime";
import { useState as g, useEffect as m } from "react";
const y = 300 * 1e3;
async function p(n, t, o) {
  var s;
  const r = `sr-acl:${n}:${t}:${o}`;
  if (typeof ((s = crypto == null ? void 0 : crypto.subtle) == null ? void 0 : s.digest) != "function")
    return "sr-acl:" + btoa(r).replace(/=/g, "");
  const c = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(r));
  return "sr-acl:" + Array.from(new Uint8Array(c)).map((l) => l.toString(16).padStart(2, "0")).join("");
}
function S(n) {
  try {
    const t = sessionStorage.getItem(n);
    if (!t) return null;
    const { status: o, ts: r } = JSON.parse(t);
    return Date.now() - r > y ? (sessionStorage.removeItem(n), null) : o;
  } catch {
    return null;
  }
}
function C(n, t) {
  try {
    sessionStorage.setItem(n, JSON.stringify({ status: t, ts: Date.now() }));
  } catch {
  }
}
function D({ proxyUrl: n, userEmail: t, appSlug: o }) {
  const [r, c] = g("loading");
  return m(() => {
    if (!n) {
      c("allowed");
      return;
    }
    if (!t || !o) {
      c("denied");
      return;
    }
    let e = !1;
    return p(n, t, o).then((s) => {
      if (e) return;
      const l = S(s);
      if (l) {
        c(l);
        return;
      }
      const d = `${n}?email=${encodeURIComponent(t)}&app=${encodeURIComponent(o)}`;
      fetch(d).then((a) => a.json()).then((a) => {
        if (e) return;
        const f = a.allowed === !0 ? "allowed" : "denied";
        C(s, f), c(f);
      }).catch(() => {
        e || c("error");
      });
    }), () => {
      e = !0;
    };
  }, [n, t, o]), r;
}
function h({ lang: n = "ko", userEmail: t, appName: o, isError: r = !1 }) {
  const c = {
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
  }, e = c[n] || c.ko;
  return /* @__PURE__ */ i("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#fff",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ u("div", { style: { textAlign: "center", maxWidth: 400, padding: 40 }, children: [
    /* @__PURE__ */ i("div", { style: { fontSize: 64, marginBottom: 24 }, children: r ? "⚠️" : "🔒" }),
    /* @__PURE__ */ i("h1", { style: { fontSize: 24, fontWeight: 700, marginBottom: 12 }, children: r ? e.errorTitle : e.title }),
    o && /* @__PURE__ */ i("p", { style: { fontSize: 14, color: "#999", marginBottom: 8 }, children: o }),
    /* @__PURE__ */ i("p", { style: { fontSize: 16, color: "#aaa", marginBottom: 8 }, children: r ? e.errorDesc : e.desc }),
    /* @__PURE__ */ i("p", { style: { fontSize: 14, color: "#888", marginBottom: 24 }, children: r ? e.errorContact : e.contact }),
    t && /* @__PURE__ */ u("p", { style: { fontSize: 13, color: "#666", marginBottom: 24 }, children: [
      e.loggedAs,
      " ",
      t
    ] }),
    /* @__PURE__ */ i(
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
function x({
  appSlug: n,
  proxyUrl: t,
  userEmail: o,
  lang: r = "ko",
  appName: c,
  loading: e,
  denied: s,
  error: l,
  children: d
}) {
  const a = D({ proxyUrl: t, userEmail: o, appSlug: n });
  return a === "loading" ? e || /* @__PURE__ */ i("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#aaa",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ i("p", { children: r === "ko" ? "권한 확인 중..." : "Checking access..." }) }) : a === "error" ? l || /* @__PURE__ */ i(h, { lang: r, userEmail: o, appName: c, isError: !0 }) : a === "denied" ? s || /* @__PURE__ */ i(h, { lang: r, userEmail: o, appName: c }) : d;
}
export {
  h as AccessDenied,
  x as SRAuthGate,
  D as useSheetACL
};
