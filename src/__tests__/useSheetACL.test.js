import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSheetACL } from "../useSheetACL";

function makeCsv(rows) {
  return rows.map((r) => r.join(",")).join("\n");
}

const SHEET_ID = "test-sheet-id";
const USER_EMAIL = "user@seoulrobotics.org";
const APP_SLUG = "hr-simulator";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  // sessionStorage 초기화
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

function mockFetch(csv) {
  fetch.mockResolvedValue({ text: () => Promise.resolve(csv) });
}

describe("useSheetACL — BYPASS 모드", () => {
  it("sheetId가 빈 문자열이면 즉시 allowed", async () => {
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: "", userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("allowed"));
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("useSheetACL — 필수 값 누락", () => {
  it("userEmail 없으면 denied", async () => {
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: "", appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("denied"));
  });

  it("appSlug 없으면 denied", async () => {
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: "" })
    );
    await waitFor(() => expect(result.current).toBe("denied"));
  });
});

describe("useSheetACL — ACL 매트릭스", () => {
  it("이메일이 일치하고 O이면 allowed", async () => {
    mockFetch(makeCsv([
      ["email", APP_SLUG],
      [USER_EMAIL, "O"],
    ]));
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("allowed"));
  });

  it("이메일이 일치해도 O가 아니면 denied", async () => {
    mockFetch(makeCsv([
      ["email", APP_SLUG],
      [USER_EMAIL, "X"],
    ]));
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("denied"));
  });

  it("email=all이고 O이면 allowed (와일드카드)", async () => {
    mockFetch(makeCsv([
      ["email", APP_SLUG],
      ["all", "O"],
    ]));
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("allowed"));
  });

  it("이메일 대소문자 무시", async () => {
    mockFetch(makeCsv([
      ["email", APP_SLUG],
      ["USER@SEOULROBOTICS.ORG", "O"],
    ]));
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("allowed"));
  });

  it("slug 열이 없으면 denied", async () => {
    mockFetch(makeCsv([
      ["email", "other-app"],
      [USER_EMAIL, "O"],
    ]));
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("denied"));
  });

  it("email 열이 없으면 denied", async () => {
    mockFetch(makeCsv([
      ["name", APP_SLUG],
      ["홍길동", "O"],
    ]));
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("denied"));
  });

  it("행이 1개 이하(헤더만)이면 denied", async () => {
    mockFetch(makeCsv([["email", APP_SLUG]]));
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("denied"));
  });
});

describe("useSheetACL — 네트워크 오류", () => {
  it("fetch 실패 시 error", async () => {
    fetch.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() =>
      useSheetACL({ sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("error"));
  });
});

describe("useSheetACL — 캐싱", () => {
  it("두 번 렌더링해도 fetch는 한 번만 호출", async () => {
    mockFetch(makeCsv([
      ["email", APP_SLUG],
      [USER_EMAIL, "O"],
    ]));

    const opts = { sheetId: SHEET_ID, userEmail: USER_EMAIL, appSlug: APP_SLUG };

    const { result: r1 } = renderHook(() => useSheetACL(opts));
    await waitFor(() => expect(r1.current).toBe("allowed"));

    const { result: r2 } = renderHook(() => useSheetACL(opts));
    await waitFor(() => expect(r2.current).toBe("allowed"));

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
