// src/AccessDenied.jsx
export function AccessDenied({ lang = "ko", userEmail, appName }) {
  const text = {
    ko: {
      title: "접근 권한이 없습니다",
      desc: "이 도구에 대한 접근 권한이 없습니다.",
      contact: "권한이 필요하시면 관리자에게 문의하세요.",
      loggedAs: "현재 로그인:",
      goBack: "SR-Gate로 돌아가기",
    },
    en: {
      title: "Access Restricted",
      desc: "You don't have permission to access this tool.",
      contact: "Please contact your administrator for access.",
      loggedAs: "Logged in as:",
      goBack: "Back to SR-Gate",
    },
  };
  const t = text[lang] || text.ko;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0D0D0E",
      color: "#fff",
      fontFamily: "Pretendard, sans-serif",
    }}>
      <div style={{ textAlign: "center", maxWidth: 400, padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🔒</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{t.title}</h1>
        {appName && (
          <p style={{ fontSize: 14, color: "#999", marginBottom: 8 }}>{appName}</p>
        )}
        <p style={{ fontSize: 16, color: "#aaa", marginBottom: 8 }}>{t.desc}</p>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>{t.contact}</p>
        {userEmail && (
          <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>
            {t.loggedAs} {userEmail}
          </p>
        )}
        <a
          href="https://sr-gate.vercel.app"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "#FFD65A",
            color: "#0D0D0E",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          {t.goBack}
        </a>
      </div>
    </div>
  );
}
