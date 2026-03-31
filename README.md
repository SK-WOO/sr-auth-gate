# @sr/auth-gate

Seoul Robotics 내부 앱용 접근 제어 래퍼 컴포넌트.

Google Sheets 기반 권한 매트릭스에서 사용자 이메일 × 앱 slug를 확인하여
허가되지 않은 직접 URL 접근을 차단합니다.

## 설치

```bash
# GitHub repo에서 직접 설치
npm install github:seoulrobotics/sr-auth-gate

# 또는 npm registry 배포 후
npm install @sr/auth-gate
```

## 사용법

```jsx
import { SRAuthGate } from "@sr/auth-gate";

function App() {
  const userEmail = "user@seoulrobotics.org"; // 인증된 사용자 이메일
  const lang = "ko"; // "ko" 또는 "en"

  return (
    <SRAuthGate
      appSlug="hr-simulator"
      sheetId="11yfJSCpTuX6aoxLDoAlqgCP74JhMm5ukjqPdfgLY3xo"
      userEmail={userEmail}
      lang={lang}
      appName="HR Simulator"
    >
      {/* 이 안의 콘텐츠는 권한이 있을 때만 렌더링됩니다 */}
      <YourAppContent />
    </SRAuthGate>
  );
}
```

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `appSlug` | string | ✅ | - | 시트 헤더의 앱 slug (예: `"hr-simulator"`) |
| `sheetId` | string | ✅ | - | Google Sheets ID. 빈 문자열이면 BYPASS (모든 접근 허용) |
| `userEmail` | string | ✅ | - | 인증된 사용자의 이메일 |
| `sheetName` | string | - | `"Sheet1"` | 시트 탭 이름 |
| `lang` | string | - | `"ko"` | UI 언어 (`"ko"` 또는 `"en"`) |
| `appName` | string | - | - | 거부 화면에 표시할 앱 이름 |
| `loading` | ReactNode | - | 기본 로딩 UI | 커스텀 로딩 컴포넌트 |
| `denied` | ReactNode | - | 기본 AccessDenied | 커스텀 거부 화면 컴포넌트 |

## 개별 훅 사용

```jsx
import { useSheetACL } from "@sr/auth-gate";

function MyComponent() {
  const status = useSheetACL({
    sheetId: "11yfJSCpTuX6aoxLDoAlqgCP74JhMm5ukjqPdfgLY3xo",
    userEmail: "user@seoulrobotics.org",
    appSlug: "hr-simulator",
  });
  // status: "loading" | "allowed" | "denied" | "error"
}
```

## BYPASS 모드

`sheetId`에 빈 문자열 `""` 을 전달하면 권한 체크를 건너뛰고 모든 접근을 허용합니다.
개발 환경에서 유용합니다.

```jsx
<SRAuthGate
  appSlug="hr-simulator"
  sheetId="" // ← BYPASS: 모든 접근 허용
  userEmail={email}
>
  <App />
</SRAuthGate>
```
