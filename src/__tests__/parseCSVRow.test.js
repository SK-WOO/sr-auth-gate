import { describe, it, expect } from "vitest";
import { parseCSVRow } from "../useSheetACL";

describe("parseCSVRow", () => {
  it("기본 쉼표 구분", () => {
    expect(parseCSVRow("email,hr-simulator,foo")).toEqual(["email", "hr-simulator", "foo"]);
  });

  it("따옴표로 감싼 쉼표 포함 값", () => {
    expect(parseCSVRow('"Bae, Jaehyu",user@sr.org,O')).toEqual([
      "Bae, Jaehyu",
      "user@sr.org",
      "O",
    ]);
  });

  it("앞뒤 공백 trim", () => {
    expect(parseCSVRow(" a , b , c ")).toEqual(["a", "b", "c"]);
  });

  it("빈 셀 처리", () => {
    expect(parseCSVRow("a,,c")).toEqual(["a", "", "c"]);
  });

  it("따옴표 안에 따옴표 없는 경우 그대로 토글", () => {
    expect(parseCSVRow('"hello world",test')).toEqual(["hello world", "test"]);
  });

  it("단일 값", () => {
    expect(parseCSVRow("only")).toEqual(["only"]);
  });

  it("헤더 행 파싱", () => {
    expect(parseCSVRow("Email,hr-simulator,sr-gate,Name")).toEqual([
      "Email",
      "hr-simulator",
      "sr-gate",
      "Name",
    ]);
  });
});
