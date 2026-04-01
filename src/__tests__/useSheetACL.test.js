import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSheetACL } from "../useSheetACL";

const PROXY_URL = "https://sr-gate.vercel.app/api/check-access";
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

function mockProxy(allowed) {
  fetch.mockResolvedValue({ json: () => Promise.resolve({ allowed }) });
}

describe("useSheetACL — BYPASS 모드", () => {
  it("proxyUrl이 없으면 즉시 allowed", async () => {
    const { result } = renderHook(() =>
      useSheetACL({ userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("allowed"));
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("useSheetACL — 필수 값 누락", () => {
  it("userEmail 없으면 denied", async () => {
    const { result } = renderHook(() =>
      useSheetACL({ proxyUrl: PROXY_URL, userEmail: "", appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("denied"));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("appSlug 없으면 denied", async () => {
    const { result } = renderHook(() =>
      useSheetACL({ proxyUrl: PROXY_URL, userEmail: USER_EMAIL, appSlug: "" })
    );
    await waitFor(() => expect(result.current).toBe("denied"));
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("useSheetACL — 프록시 응답", () => {
  it("allowed: true이면 allowed", async () => {
    mockProxy(true);
    const { result } = renderHook(() =>
      useSheetACL({ proxyUrl: PROXY_URL, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("allowed"));
  });

  it("allowed: false이면 denied", async () => {
    mockProxy(false);
    const { result } = renderHook(() =>
      useSheetACL({ proxyUrl: PROXY_URL, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("denied"));
  });

  it("프록시 URL에 email, app 파라미터 포함해서 호출", async () => {
    mockProxy(true);
    const { result } = renderHook(() =>
      useSheetACL({ proxyUrl: PROXY_URL, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("allowed"));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`email=${encodeURIComponent(USER_EMAIL)}`)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`app=${encodeURIComponent(APP_SLUG)}`)
    );
  });
});

describe("useSheetACL — 네트워크 오류", () => {
  it("fetch 실패 시 error", async () => {
    fetch.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() =>
      useSheetACL({ proxyUrl: PROXY_URL, userEmail: USER_EMAIL, appSlug: APP_SLUG })
    );
    await waitFor(() => expect(result.current).toBe("error"));
  });
});

describe("useSheetACL — 캐싱", () => {
  it("두 번 렌더링해도 fetch는 한 번만 호출", async () => {
    mockProxy(true);
    const opts = { proxyUrl: PROXY_URL, userEmail: USER_EMAIL, appSlug: APP_SLUG };

    const { result: r1 } = renderHook(() => useSheetACL(opts));
    await waitFor(() => expect(r1.current).toBe("allowed"));

    const { result: r2 } = renderHook(() => useSheetACL(opts));
    await waitFor(() => expect(r2.current).toBe("allowed"));

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
