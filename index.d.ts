import { ReactNode } from "react";

// useSheetACL
export type ACLStatus = "loading" | "allowed" | "denied" | "error";

export interface UseSheetACLOptions {
  /** 프록시 URL (예: "https://sr-gate.vercel.app/api/check-access"). 없으면 BYPASS 모드 */
  proxyUrl?: string;
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
  /** 프록시 URL (예: "https://sr-gate.vercel.app/api/check-access"). 없으면 BYPASS 모드 */
  proxyUrl?: string;
  userEmail: string;
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
