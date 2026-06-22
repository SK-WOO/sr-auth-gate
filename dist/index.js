import { jsx as c, jsxs as g } from "react/jsx-runtime";
import { useState as y, useEffect as S } from "react";
const p = 300 * 1e3;
async function A(n, e, r) {
  var i;
  const o = `sr-acl:${n}:${e}:${r}`;
  if (typeof ((i = crypto == null ? void 0 : crypto.subtle) == null ? void 0 : i.digest) != "function")
    return "sr-acl:" + btoa(o).replace(/=/g, "");
  const s = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(o));
  return "sr-acl:" + Array.from(new Uint8Array(s)).map((a) => a.toString(16).padStart(2, "0")).join("");
}
function C(n) {
  try {
    const e = sessionStorage.getItem(n);
    if (!e) return null;
    const { status: r, ts: o } = JSON.parse(e);
    return Date.now() - o > p ? (sessionStorage.removeItem(n), null) : r;
  } catch {
    return null;
  }
}
function D(n, e) {
  try {
    sessionStorage.setItem(n, JSON.stringify({ status: e, ts: Date.now() }));
  } catch {
  }
}
function k({ proxyUrl: n, userEmail: e, appSlug: r, idToken: o }) {
  const [s, t] = y("loading");
  return S(() => {
    if (!n) {
      t("allowed");
      return;
    }
    if (!e || !r) {
      t("denied");
      return;
    }
    let i = !1;
    return A(n, e, r).then((a) => {
      if (i) return;
      const f = C(a);
      if (f) {
        t(f);
        return;
      }
      const h = `${n}?email=${encodeURIComponent(e)}&app=${encodeURIComponent(r)}`, d = o ? { headers: { Authorization: `Bearer ${o}` } } : {};
      console.log("[SRAuthGate] fetch", h, "hasToken:", !!o), fetch(h, d).then((l) => l.json()).then((l) => {
        if (i) return;
        console.log("[SRAuthGate] response:", JSON.stringify(l));
        const u = l.allowed === !0 ? "allowed" : "denied";
        D(a, u), t(u);
      }).catch((l) => {
        console.error("[SRAuthGate] fetch error:", l), i || t("error");
      });
    }), () => {
      i = !0;
    };
  }, [n, e, r, o]), s;
}
function m({ lang: n = "ko", userEmail: e, appName: r, isError: o = !1 }) {
  const s = {
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
  }, t = s[n] || s.ko;
  return /* @__PURE__ */ c("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#fff",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ g("div", { style: { textAlign: "center", maxWidth: 400, padding: 40 }, children: [
    /* @__PURE__ */ c("div", { style: { fontSize: 64, marginBottom: 24 }, children: o ? "⚠️" : "🔒" }),
    /* @__PURE__ */ c("h1", { style: { fontSize: 24, fontWeight: 700, marginBottom: 12 }, children: o ? t.errorTitle : t.title }),
    r && /* @__PURE__ */ c("p", { style: { fontSize: 14, color: "#999", marginBottom: 8 }, children: r }),
    /* @__PURE__ */ c("p", { style: { fontSize: 16, color: "#aaa", marginBottom: 8 }, children: o ? t.errorDesc : t.desc }),
    /* @__PURE__ */ c("p", { style: { fontSize: 14, color: "#888", marginBottom: 24 }, children: o ? t.errorContact : t.contact }),
    e && /* @__PURE__ */ g("p", { style: { fontSize: 13, color: "#666", marginBottom: 24 }, children: [
      t.loggedAs,
      " ",
      e
    ] }),
    /* @__PURE__ */ c(
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
function w({
  appSlug: n,
  proxyUrl: e,
  userEmail: r,
  idToken: o,
  lang: s = "ko",
  appName: t,
  loading: i,
  denied: a,
  error: f,
  children: h
}) {
  const d = k({ proxyUrl: e, userEmail: r, appSlug: n, idToken: o });
  return d === "loading" ? i || /* @__PURE__ */ c("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#aaa",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ c("p", { children: s === "ko" ? "권한 확인 중..." : "Checking access..." }) }) : d === "error" ? f || /* @__PURE__ */ c(m, { lang: s, userEmail: r, appName: t, isError: !0 }) : d === "denied" ? a || /* @__PURE__ */ c(m, { lang: s, userEmail: r, appName: t }) : h;
}
export {
  m as AccessDenied,
  w as SRAuthGate,
  k as useSheetACL
};
