// src/useSheetACL.js
import { useState, useEffect } from "react";

const SHEET_BASE = "https://docs.google.com/spreadsheets/d";

// CSV 행을 올바르게 파싱 (따옴표 안의 쉼표 처리)
// HR-Master Name 열에 "Bae, Jaehyu" 같은 값이 있어서 단순 split(",")은 불가
function parseCSVRow(row) {
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

    const url = `${SHEET_BASE}/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    fetch(url)
      .then((res) => res.text())
      .then((csv) => {
        const rows = csv.split("\n").filter((r) => r.trim());
        if (rows.length < 2) {
          setStatus("denied");
          return;
        }

        // ⚠️ parseCSVRow 사용 — split(",") 금지
        const headers = parseCSVRow(rows[0]).map((h) => h.toLowerCase());
        const emailColIdx = headers.indexOf("email");
        const slugIdx = headers.indexOf(appSlug.toLowerCase());

        if (emailColIdx === -1 || slugIdx === -1) {
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
            setStatus("allowed");
            return;
          }
          if (rowEmail === email) {
            setStatus("allowed");
            return;
          }
        }
        setStatus("denied");
      })
      .catch(() => setStatus("error"));
  }, [sheetId, sheetName, userEmail, appSlug]);

  return status;
}
