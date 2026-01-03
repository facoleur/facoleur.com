import type { CheerioAPI } from "cheerio";

export type CheckStatus = "good" | "warning" | "critical";

export type CheckCategory =
  | "HTML & balises"
  | "Indexation"
  | "Contenu"
  | "Données structurées"
  | "Social"
  | "Images"
  | "Performance"
  | "Accessibilité"
  | "Liens"
  | "International"
  | "Technique";

export interface AuditCheck {
  id: string;
  category: CheckCategory;
  label: string;
  status: CheckStatus;
  score: number;
  explanation: string;
  howToFix: string;
}

export interface AuditStats {
  htmlBytes: number;
  scriptCount: number;
  imageCount: number;
  sampledRequests: number;
  sitemapUrl?: string | null;
  robotsAccessible: boolean;
}

export interface AuditResult {
  url: string;
  normalizedUrl: string;
  fetchedAt: string;
  score: number;
  checks: AuditCheck[];
  stats: AuditStats;
}

export interface AuditContext {
  url: string;
  normalizedUrl: string;
  html: string;
  htmlBytes: number;
  $: CheerioAPI;
  robotsTxt?: string | null;
  sitemapUrl?: string | null;
}

export interface FetchOutcome {
  ok: boolean;
  status?: number;
  url?: string;
  body?: string;
  error?: string;
  headers?: Record<string, string>;
}
