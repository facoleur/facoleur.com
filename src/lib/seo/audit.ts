import { load } from "cheerio";
import { CHECK_WEIGHTS } from "./constants";
import { runChecks } from "./checks";
import type { AuditResult, AuditCheck, AuditContext } from "./types";
import { fetchWithTimeout, normalizeUrl } from "./utils";

const USER_AGENT =
  "Mozilla/5.0 (compatible; LucaFerroSEOAudit/1.0; +https://lucaferro.ch)";

function computeGlobalScore(checks: AuditCheck[]): number {
  const { totalWeight, weightedScore } = checks.reduce(
    (acc, check) => {
      const weight = CHECK_WEIGHTS[check.id] ?? 1;
      acc.totalWeight += weight;
      acc.weightedScore += check.score * weight;
      return acc;
    },
    { totalWeight: 0, weightedScore: 0 },
  );

  if (!totalWeight) return 0;

  return Math.round(weightedScore / totalWeight);
}

async function fetchPage(url: string) {
  const response = await fetchWithTimeout(url, {
    headers: { "User-Agent": USER_AGENT },
    timeoutMs: 12000,
  });

  if (!response.ok || !response.body) {
    throw new Error(
      `Impossible de récupérer la page (${response.status ?? "?"}).`,
    );
  }

  return response;
}

async function fetchRobots(url: string) {
  try {
    const robotsUrl = new URL("/robots.txt", url).toString();
    const res = await fetchWithTimeout(robotsUrl, {
      headers: { "User-Agent": USER_AGENT },
      timeoutMs: 8000,
    });
    return { content: res.body ?? null, ok: !!res.ok, status: res.status };
  } catch {
    return { content: null, ok: false, status: undefined };
  }
}

async function detectSitemap(baseUrl: string, robotsTxt?: string | null) {
  if (robotsTxt) {
    const match = robotsTxt
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.toLowerCase().startsWith("sitemap:"));
    if (match) {
      const sitemapUrl = match.slice(match.indexOf(":") + 1).trim();
      if (sitemapUrl) {
        try {
          return new URL(sitemapUrl, baseUrl).toString();
        } catch {
          // ignore invalid sitemap URL
        }
      }
    }
  }

  try {
    const fallback = new URL("/sitemap.xml", baseUrl).toString();
    const res = await fetchWithTimeout(fallback, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      timeoutMs: 6000,
    });
    if (res.ok && res.status && res.status < 400) {
      return fallback;
    }
  } catch {
    // ignore
  }

  return null;
}

export async function auditUrl(targetUrl: string): Promise<AuditResult> {
  const normalized = normalizeUrl(targetUrl);
  const page = await fetchPage(normalized);
  const html = page.body!;
  const finalUrl = page.url ?? normalized;
  const htmlBytes = Buffer.byteLength(html, "utf8");
  const $ = load(html);

  const robotsOutcome = await fetchRobots(finalUrl);
  const sitemapUrl = await detectSitemap(finalUrl, robotsOutcome.content);

  const context: AuditContext = {
    url: targetUrl,
    normalizedUrl: finalUrl,
    html,
    htmlBytes,
    $,
    robotsTxt: robotsOutcome.content,
    sitemapUrl,
  };

  const { checks, sampledRequests } = await runChecks(context);

  const score = computeGlobalScore(checks);

  return {
    url: targetUrl,
    normalizedUrl: finalUrl,
    fetchedAt: new Date().toISOString(),
    score,
    checks,
    stats: {
      htmlBytes,
      scriptCount: $("script:not([type='application/ld+json'])").length,
      imageCount: $("img").length,
      sampledRequests,
      sitemapUrl,
      robotsAccessible: robotsOutcome.ok ?? false,
    },
  };
}
