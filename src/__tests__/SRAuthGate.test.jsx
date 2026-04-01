import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SRAuthGate } from "../SRAuthGate";

function makeCsv(rows) {
  return rows.map((r) => r.join(",")).join("\n");
}

const SHEET_ID = "test-sheet-id";
const USER_EMAIL = "user@seoulrobotics.org";
const APP_SLUG = "hr-simulator";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("SRAuthGate", () => {
  it("로딩 중에는 기본 로딩 UI 표시", () => {
    fetch.mockReturnValue(new Promise(() => {})); // 영원히 pending
    render(
      <SRAuthGate appSlug={APP_SLUG} sheetId={SHEET_ID} userEmail={USER_EMAIL} lang="ko">
        <div>protected</div>
      </SRAuthGate>
    );
    expect(screen.getByText("권한 확인 중...")).toBeDefined();
  });

  it("allowed이면 children 렌더링", async () => {
    fetch.mockResolvedValue({
      text: () => Promise.resolve(makeCsv([["email", APP_SLUG], [USER_EMAIL, "O"]])),
    });
    render(
      <SRAuthGate appSlug={APP_SLUG} sheetId={SHEET_ID} userEmail={USER_EMAIL}>
        <div>protected content</div>
      </SRAuthGate>
    );
    await waitFor(() => expect(screen.getByText("protected content")).toBeDefined());
  });

  it("denied이면 기본 AccessDenied 표시", async () => {
    fetch.mockResolvedValue({
      text: () => Promise.resolve(makeCsv([["email", APP_SLUG], [USER_EMAIL, ""]])),
    });
    render(
      <SRAuthGate appSlug={APP_SLUG} sheetId={SHEET_ID} userEmail={USER_EMAIL} lang="ko">
        <div>protected</div>
      </SRAuthGate>
    );
    await waitFor(() => expect(screen.getByText("접근 권한이 없습니다")).toBeDefined());
  });

  it("error이면 기본 오류 화면 표시 (denied와 별도)", async () => {
    fetch.mockRejectedValue(new Error("network error"));
    render(
      <SRAuthGate appSlug={APP_SLUG} sheetId={SHEET_ID} userEmail={USER_EMAIL} lang="ko">
        <div>protected</div>
      </SRAuthGate>
    );
    await waitFor(() => expect(screen.getByText("연결 오류")).toBeDefined());
  });

  it("커스텀 loading prop 사용", () => {
    fetch.mockReturnValue(new Promise(() => {}));
    render(
      <SRAuthGate
        appSlug={APP_SLUG}
        sheetId={SHEET_ID}
        userEmail={USER_EMAIL}
        loading={<div>custom loading</div>}
      >
        <div>protected</div>
      </SRAuthGate>
    );
    expect(screen.getByText("custom loading")).toBeDefined();
  });

  it("커스텀 denied prop 사용", async () => {
    fetch.mockResolvedValue({
      text: () => Promise.resolve(makeCsv([["email", APP_SLUG], [USER_EMAIL, ""]])),
    });
    render(
      <SRAuthGate
        appSlug={APP_SLUG}
        sheetId={SHEET_ID}
        userEmail={USER_EMAIL}
        denied={<div>custom denied</div>}
      >
        <div>protected</div>
      </SRAuthGate>
    );
    await waitFor(() => expect(screen.getByText("custom denied")).toBeDefined());
  });

  it("커스텀 error prop 사용", async () => {
    fetch.mockRejectedValue(new Error("fail"));
    render(
      <SRAuthGate
        appSlug={APP_SLUG}
        sheetId={SHEET_ID}
        userEmail={USER_EMAIL}
        error={<div>custom error</div>}
      >
        <div>protected</div>
      </SRAuthGate>
    );
    await waitFor(() => expect(screen.getByText("custom error")).toBeDefined());
  });

  it("BYPASS 모드: sheetId 빈 문자열이면 children 렌더링", async () => {
    render(
      <SRAuthGate appSlug={APP_SLUG} sheetId="" userEmail={USER_EMAIL}>
        <div>bypass content</div>
      </SRAuthGate>
    );
    await waitFor(() => expect(screen.getByText("bypass content")).toBeDefined());
    expect(fetch).not.toHaveBeenCalled();
  });

  it("en lang 로딩 텍스트", () => {
    fetch.mockReturnValue(new Promise(() => {}));
    render(
      <SRAuthGate appSlug={APP_SLUG} sheetId={SHEET_ID} userEmail={USER_EMAIL} lang="en">
        <div>protected</div>
      </SRAuthGate>
    );
    expect(screen.getByText("Checking access...")).toBeDefined();
  });
});
