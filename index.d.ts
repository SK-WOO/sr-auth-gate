import { ReactNode } from "react";

// useSheetACL
export type ACLStatus = "loading" | "allowed" | "denied" | "error";

export interface UseSheetACLOptions {
  sheetId: string;
  sheetName?: string;
  userEmail: string;
  appSlug: string;
}

export function useSheetACL(options: UseSheetACLOptions): ACLStatus;

// AccessDenied
export interface AccessDeniedProps {
  lang?: "ko" | "en";
  userEmail?: string;
  appName?: string;
  isError?: boolean;
}

export function AccessDenied(props: AccessDeniedProps): JSX.Element;

// SRAuthGate
export interface SRAuthGateProps {
  appSlug: string;
  /** Google Sheets ID. 빈 문자열("")이면 BYPASS — 모든 접근 허용 */
  sheetId: string;
  userEmail: string;
  sheetName?: string;
  lang?: "ko" | "en";
  appName?: string;
  /** 커스텀 로딩 UI */
  loading?: ReactNode;
  /** 커스텀 접근 거부 UI */
  denied?: ReactNode;
  /** 커스텀 네트워크 오류 UI */
  error?: ReactNode;
  children: ReactNode;
}

export function SRAuthGate(props: SRAuthGateProps): JSX.Element;
