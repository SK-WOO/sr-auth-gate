// src/useSheetACL.js
import { useState, useEffect } from "react";

const CACHE_TTL = 5 * 60 * 1000; // 5분

// CSV 행을 올바르게 파싱 (따옴표 안의 쉼표 처리)
// HR-Master Name 열에 "Bae, Jaehyu" 같은 값이 있어서 단순 split(",")은 불가
export function parseCSVRow(row) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

// 민감 정보(email, appSlug)를 평문으로 노출하지 않기 위해 SHA-256 해시로 키 생성
async function hashCacheKey(proxyUrl, userEmail, appSlug) {
  const raw = `sr-acl:${proxyUrl}:${userEmail}:${appSlug}`;
  if (typeof crypto?.subtle?.digest !== "function") {
    // SubtleCrypto 미지원 환경 fallback (테스트 등)
    return "sr-acl:" + btoa(raw).replace(/=/g, "");
  }
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  return "sr-acl:" + hex;
}

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { status, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return status;
  } catch {
    return null;
  }
}

function setCached(key, status) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ status, ts: Date.now() }));
  } catch {
    // sessionStorage 사용 불가 환경 (SSR 등) 무시
  }
}

// proxyUrl: "https://sr-gate.vercel.app/api/check-access"
// proxyUrl이 없으면 BYPASS 모드 (개발용, sheetId 방식 제거됨)
export function useSheetACL({ proxyUrl, userEmail, appSlug }) {
  const [status, setStatus] = useState("loading"); // "allowed" | "denied" | "loading" | "error"

  useEffect(() => {
    if (!proxyUrl) {
      // BYPASS 모드: proxyUrl이 없으면 모든 접근 허용 (개발 환경)
      setStatus("allowed");
      return;
    }
    if (!userEmail || !appSlug) {
      setStatus("denied");
      return;
    }

    let cancelled = false;

    hashCacheKey(proxyUrl, userEmail, appSlug).then(cacheKey => {
      if (cancelled) return;

      const cached = getCached(cacheKey);
      if (cached) {
        setStatus(cached);
        return;
      }

      const url = `${proxyUrl}?email=${encodeURIComponent(userEmail)}&app=${encodeURIComponent(appSlug)}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          const result = data.allowed === true ? "allowed" : "denied";
          setCached(cacheKey, result);
          setStatus(result);
        })
        .catch(() => { if (!cancelled) setStatus("error"); }); // error는 캐싱하지 않음
    });

    return () => { cancelled = true; };
  }, [proxyUrl, userEmail, appSlug]);

  return status;
}
