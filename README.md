# @sr/auth-gate

Seoul Robotics 내부 앱용 접근 제어 래퍼 컴포넌트.

sr-gate 프록시를 통해 Google Sheets 권한 매트릭스를 서버 사이드에서 확인하고,
허가되지 않은 직접 URL 접근을 차단합니다. 시트 원본 데이터는 클라이언트에 노출되지 않습니다.

## 설치

```bash
npm install github:SK-WOO/sr-auth-gate
```

## 사용법

```jsx
import { SRAuthGate } from "@sr/auth-gate";

function App() {
  const userEmail = "user@seoulrobotics.org"; // 인증된 사용자 이메일

  return (
    <SRAuthGate
      appSlug="hr-simulator"
      proxyUrl="https://sr-gate.vercel.app/api/check-access"
      userEmail={userEmail}
      lang="ko"
      appName="HR Simulator"
    >
      <YourAppContent />
    </SRAuthGate>
  );
}
```

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `appSlug` | string | ✅ | - | 시트 헤더의 앱 slug (예: `"hr-simulator"`) |
| `proxyUrl` | string | - | - | sr-gate 프록시 URL. 없으면 BYPASS (모든 접근 허용, 개발용) |
| `userEmail` | string | ✅ | - | 인증된 사용자의 이메일 |
| `lang` | string | - | `"ko"` | UI 언어 (`"ko"` 또는 `"en"`) |
| `appName` | string | - | - | 거부 화면에 표시할 앱 이름 |
| `loading` | ReactNode | - | 기본 로딩 UI | 커스텀 로딩 컴포넌트 |
| `denied` | ReactNode | - | 기본 AccessDenied | 커스텀 거부 화면 컴포넌트 |
| `error` | ReactNode | - | 기본 오류 UI | 커스텀 네트워크 오류 컴포넌트 |

## 개별 훅 사용

```jsx
import { useSheetACL } from "@sr/auth-gate";

function MyComponent() {
  const status = useSheetACL({
    proxyUrl: "https://sr-gate.vercel.app/api/check-access",
    userEmail: "user@seoulrobotics.org",
    appSlug: "hr-simulator",
  });
  // status: "loading" | "allowed" | "denied" | "error"
}
```

## BYPASS 모드

`proxyUrl`을 생략하면 권한 체크를 건너뛰고 모든 접근을 허용합니다. 개발 환경에서 유용합니다.

```jsx
<SRAuthGate appSlug="hr-simulator" userEmail={email}>
  <App />
</SRAuthGate>
```

## v1 → v2 마이그레이션

```jsx
// Before (v1)
<SRAuthGate
  sheetId="11yfJSCpTuX6aoxLDoAlqgCP74JhMm5ukjqPdfgLY3xo"
  sheetName="Sheet1"
  appSlug="hr-simulator"
  userEmail={email}
>

// After (v2)
<SRAuthGate
  proxyUrl="https://sr-gate.vercel.app/api/check-access"
  appSlug="hr-simulator"
  userEmail={email}
>
```
