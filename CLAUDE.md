# CLAUDE.md

This file provides guidance to Claude Code when working with the sr-auth-gate package.

## Commands

```bash
npm run build         # Vite library build → dist/index.js (ESM) + dist/index.cjs (CJS)
npm test              # Run all tests (vitest run)
npm run test:watch    # Watch mode
npm publish           # npm registry 배포 (prepublishOnly가 자동으로 build 실행)
```

## What is this package?

`@sr/auth-gate`는 Seoul Robotics 내부 개별 앱(HR Simulator, ATI-ROI 등)에서 **URL 직접 접근을 차단**하는 공유 React 컴포넌트 패키지다.

## Access Control Architecture (중요)

이 패키지는 **2단계 접근 제어 시스템**의 일부다. 반드시 이 구조를 이해한 후 작업할 것.

```
Google Sheets 권한 매트릭스 (11yfJSCpTuX6aoxLDoAlqgCP74JhMm5ukjqPdfgLY3xo)
         │
         ├──→ sr-gate (별도 웹앱) — 포털에서 앱 카드 🔒 잠금 + 클릭 차단
         │
         └──→ sr-auth-gate (이 패키지) — 개별 앱에서 URL 직접 접근 차단
```

**sr-gate의 역할**: 포털(sr-gate.vercel.app)에서 권한 없는 앱 카드에 자물쇠를 표시하고 클릭을 막는다. 하지만 사용자가 URL을 직접 입력하면 포털을 우회할 수 있다.

**이 패키지(sr-auth-gate)의 역할**: 각 개별 앱의 루트 컴포넌트를 `SRAuthGate`로 감싸면, 앱 내부에서 같은 Google Sheet를 확인하여 권한 없는 사용자의 접근을 차단한다.

**두 프로젝트는 코드 의존성이 전혀 없다.** 같은 Google Sheet를 독립적으로 읽을 뿐이다. sr-auth-gate를 수정할 때 sr-gate는 건드리지 않는다.

## Package structure

```
sr-auth-gate/
├── src/
│   ├── index.js          # export { SRAuthGate, useSheetACL, AccessDenied }
│   ├── SRAuthGate.jsx    # 메인 래퍼 컴포넌트
│   ├── useSheetACL.js    # Google Sheets fetch + CSV 파싱 + 권한 판정 훅
│   └── AccessDenied.jsx  # 접근 거부 화면 (SR 브랜드)
├── index.d.ts            # TypeScript 타입 선언
├── package.json
├── vite.config.js        # 라이브러리 모드 빌드 + vitest 설정
└── CLAUDE.md             # 이 파일
```

## CSV 파싱 규칙 (절대 준수)

HR-Master Name 열에 `"Bae, Jaehyu"` 같이 쉼표가 포함된 값이 있다. Google Sheets CSV export는 이런 셀을 따옴표로 감싼다.

**`row.split(",")` 사용 금지. 반드시 `useSheetACL.js` 내부의 `parseCSVRow()` 헬퍼를 사용.**

## 앱 slug 목록 (시트 헤더와 일치해야 함)

```
sr-pass  hr-simulator  ati-roi  ext-project  rev-pipeline
purchase-mgt  sr-strategy  ga-support  corpcard-mgt
```

## 사용법 (개별 앱에서)

```jsx
import { SRAuthGate } from "@sr/auth-gate";

<SRAuthGate
  appSlug="hr-simulator"
  sheetId="11yfJSCpTuX6aoxLDoAlqgCP74JhMm5ukjqPdfgLY3xo"
  userEmail={loggedInUserEmail}
  lang="ko"
  appName="HR Simulator"
>
  <App />
</SRAuthGate>
```

## SR brand tokens

```css
--sr-black: #0D0D0E
--sr-yellow: #FFD65A
--sr-white: #FFFFFF
```

Font: Pretendard. AccessDenied 컴포넌트에서 사용.

## 주의사항

- `sheetId`가 빈 문자열이면 BYPASS 모드 (모든 접근 허용, 개발용)
- `peerDependencies`: React 18+ 필수
- 이 패키지는 **UI 레벨 차단**이다. 백엔드 보안이 아님.
- ACL 결과는 `sessionStorage`에 5분 TTL로 캐싱됨. 에러 상태는 캐싱 안 함 (일시적 네트워크 오류 고려).
- `status === "error"` (네트워크 실패)와 `status === "denied"` (권한 없음)는 별도 처리. `error` prop으로 커스텀 오류 UI 주입 가능.
