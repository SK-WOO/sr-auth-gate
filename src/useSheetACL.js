// src/useSheetACL.js
import { useState, useEffect } from "react";

const SHEET_BASE = "https://docs.google.com/spreadsheets/d";
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

// 민감 정보(sheetId, email)를 평문으로 노출하지 않기 위해 SHA-256 해시로 키 생성
async function hashCacheKey(sheetId, sheetName, userEmail, appSlug) {
  const raw = `sr-acl:${sheetId}:${sheetName}:${userEmail}:${appSlug}`;
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

export function useSheetACL({ sheetId, sheetName = "Sheet1", userEmail, appSlug }) {
  const [status, setStatus] = useState("loading"); // "allowed" | "denied" | "loading" | "error"

  useEffect(() => {
    if (!sheetId) {
      // BYPASS 모드: sheetId가 비어있으면 모든 접근 허용
      setStatus("allowed");
      return;
    }
    if (!userEmail || !appSlug) {
      setStatus("denied");
      return;
    }

    let cancelled = false;

    hashCacheKey(sheetId, sheetName, userEmail, appSlug).then(cacheKey => {
      if (cancelled) return;

      const cached = getCached(cacheKey);
      if (cached) {
        setStatus(cached);
        return;
      }

      // sheetName에 한글 등 특수문자가 있을 경우 인코딩
      const url = `${SHEET_BASE}/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

      fetch(url)
        .then((res) => res.text())
        .then((csv) => {
          if (cancelled) return;
          const rows = csv.split("\n").filter((r) => r.trim());
          if (rows.length < 2) {
            setCached(cacheKey, "denied");
            setStatus("denied");
            return;
          }

          // ⚠️ parseCSVRow 사용 — split(",") 금지
          const headers = parseCSVRow(rows[0]).map((h) => h.toLowerCase());
          const emailColIdx = headers.indexOf("email");
          const slugIdx = headers.indexOf(appSlug.toLowerCase());

          if (emailColIdx === -1 || slugIdx === -1) {
            setCached(cacheKey, "denied");
            setStatus("denied");
            return;
          }

          const email = userEmail.toLowerCase();

          for (let i = 1; i < rows.length; i++) {
            const cells = parseCSVRow(rows[i]); // ⚠️ parseCSVRow 사용
            const rowEmail = (cells[emailColIdx] || "").toLowerCase().trim();
            const cellValue = (cells[slugIdx] || "").toUpperCase().trim();
            if (cellValue !== "O") continue;
            if (rowEmail === "all") {
              setCached(cacheKey, "allowed");
              setStatus("allowed");
              return;
            }
            if (rowEmail === email) {
              setCached(cacheKey, "allowed");
              setStatus("allowed");
              return;
            }
          }
          setCached(cacheKey, "denied");
          setStatus("denied");
        })
        .catch(() => { if (!cancelled) setStatus("error"); }); // error는 캐싱하지 않음 (일시적 네트워크 오류 가능)
    });

    return () => { cancelled = true; };
  }, [sheetId, sheetName, userEmail, appSlug]);

  return status;
}
