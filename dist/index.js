import { jsx as c, jsxs as x } from "react/jsx-runtime";
import { useState as k, useEffect as v } from "react";
const B = "https://docs.google.com/spreadsheets/d", b = 300 * 1e3;
function w(r) {
  const n = [];
  let e = "", o = !1;
  for (let i = 0; i < r.length; i++) {
    const t = r[i];
    t === '"' ? o = !o : t === "," && !o ? (n.push(e.trim()), e = "") : e += t;
  }
  return n.push(e.trim()), n;
}
async function z(r, n, e, o) {
  var s;
  const i = `sr-acl:${r}:${n}:${e}:${o}`;
  if (typeof ((s = crypto == null ? void 0 : crypto.subtle) == null ? void 0 : s.digest) != "function")
    return "sr-acl:" + btoa(i).replace(/=/g, "");
  const t = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(i));
  return "sr-acl:" + Array.from(new Uint8Array(t)).map((f) => f.toString(16).padStart(2, "0")).join("");
}
function L(r) {
  try {
    const n = sessionStorage.getItem(r);
    if (!n) return null;
    const { status: e, ts: o } = JSON.parse(n);
    return Date.now() - o > b ? (sessionStorage.removeItem(r), null) : e;
  } catch {
    return null;
  }
}
function u(r, n) {
  try {
    sessionStorage.setItem(r, JSON.stringify({ status: n, ts: Date.now() }));
  } catch {
  }
}
function R({ sheetId: r, sheetName: n = "Sheet1", userEmail: e, appSlug: o }) {
  const [i, t] = k("loading");
  return v(() => {
    if (!r) {
      t("allowed");
      return;
    }
    if (!e || !o) {
      t("denied");
      return;
    }
    let a = !1;
    return z(r, n, e, o).then((s) => {
      if (a) return;
      const f = L(s);
      if (f) {
        t(f);
        return;
      }
      const h = `${B}/${r}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(n)}`;
      fetch(h).then((l) => l.text()).then((l) => {
        if (a) return;
        const g = l.split(`
`).filter((d) => d.trim());
        if (g.length < 2) {
          u(s, "denied"), t("denied");
          return;
        }
        const m = w(g[0]).map((d) => d.toLowerCase()), p = m.indexOf("email"), y = m.indexOf(o.toLowerCase());
        if (p === -1 || y === -1) {
          u(s, "denied"), t("denied");
          return;
        }
        const D = e.toLowerCase();
        for (let d = 1; d < g.length; d++) {
          const S = w(g[d]), C = (S[p] || "").toLowerCase().trim();
          if ((S[y] || "").toUpperCase().trim() === "O") {
            if (C === "all") {
              u(s, "allowed"), t("allowed");
              return;
            }
            if (C === D) {
              u(s, "allowed"), t("allowed");
              return;
            }
          }
        }
        u(s, "denied"), t("denied");
      }).catch(() => {
        a || t("error");
      });
    }), () => {
      a = !0;
    };
  }, [r, n, e, o]), i;
}
function A({ lang: r = "ko", userEmail: n, appName: e, isError: o = !1 }) {
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
  }, t = i[r] || i.ko;
  return /* @__PURE__ */ c("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#fff",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ x("div", { style: { textAlign: "center", maxWidth: 400, padding: 40 }, children: [
    /* @__PURE__ */ c("div", { style: { fontSize: 64, marginBottom: 24 }, children: o ? "⚠️" : "🔒" }),
    /* @__PURE__ */ c("h1", { style: { fontSize: 24, fontWeight: 700, marginBottom: 12 }, children: o ? t.errorTitle : t.title }),
    e && /* @__PURE__ */ c("p", { style: { fontSize: 14, color: "#999", marginBottom: 8 }, children: e }),
    /* @__PURE__ */ c("p", { style: { fontSize: 16, color: "#aaa", marginBottom: 8 }, children: o ? t.errorDesc : t.desc }),
    /* @__PURE__ */ c("p", { style: { fontSize: 14, color: "#888", marginBottom: 24 }, children: o ? t.errorContact : t.contact }),
    n && /* @__PURE__ */ x("p", { style: { fontSize: 13, color: "#666", marginBottom: 24 }, children: [
      t.loggedAs,
      " ",
      n
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
function F({
  appSlug: r,
  sheetId: n,
  userEmail: e,
  sheetName: o = "Sheet1",
  lang: i = "ko",
  appName: t,
  loading: a,
  denied: s,
  error: f,
  children: h
}) {
  const l = R({ sheetId: n, sheetName: o, userEmail: e, appSlug: r });
  return l === "loading" ? a || /* @__PURE__ */ c("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0E",
    color: "#aaa",
    fontFamily: "Pretendard, sans-serif"
  }, children: /* @__PURE__ */ c("p", { children: i === "ko" ? "권한 확인 중..." : "Checking access..." }) }) : l === "error" ? f || /* @__PURE__ */ c(A, { lang: i, userEmail: e, appName: t, isError: !0 }) : l === "denied" ? s || /* @__PURE__ */ c(A, { lang: i, userEmail: e, appName: t }) : h;
}
export {
  A as AccessDenied,
  F as SRAuthGate,
  R as useSheetACL
};
