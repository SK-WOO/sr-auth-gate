// src/SRAuthGate.jsx
import { useSheetACL } from "./useSheetACL";
import { AccessDenied } from "./AccessDenied";

export function SRAuthGate({
  appSlug,
  sheetId,
  userEmail,
  sheetName = "Sheet1",
  lang = "ko",
  appName,
  loading,
  denied,
  error,
  children,
}) {
  const status = useSheetACL({ sheetId, sheetName, userEmail, appSlug });

  if (status === "loading") {
    return loading || (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0D0D0E",
        color: "#aaa",
        fontFamily: "Pretendard, sans-serif",
      }}>
        <p>{lang === "ko" ? "권한 확인 중..." : "Checking access..."}</p>
      </div>
    );
  }

  if (status === "error") {
    return error || <AccessDenied lang={lang} userEmail={userEmail} appName={appName} isError />;
  }

  if (status === "denied") {
    return denied || <AccessDenied lang={lang} userEmail={userEmail} appName={appName} />;
  }

  return children;
}
