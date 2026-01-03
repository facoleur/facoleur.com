import type { CheerioAPI } from "cheerio";
import { FetchOutcome } from "./types";

const DEFAULT_TIMEOUT = 10000;

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const url = new URL(candidate);
  url.hash = "";
  return url.toString();
}

export function toAbsoluteUrl(target: string, base: string): string | null {
  if (!target) return null;
  try {
    const absolute = new URL(target, base);
    return absolute.toString();
  } catch {
    return null;
  }
}

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<FetchOutcome> {
  const { timeoutMs, ...rest } = init || {};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs ?? DEFAULT_TIMEOUT);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      ...rest,
      signal: controller.signal,
    });

    const body =
      rest?.method && rest.method.toUpperCase() === "HEAD"
        ? undefined
        : await res.text();

    return {
      ok: res.ok,
      status: res.status,
      url: res.url,
      headers: Object.fromEntries(res.headers.entries()),
      body,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown fetch error";
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getMainText($: CheerioAPI): { text: string; words: number } {
  const mainText = $("main").text() || $("body").text();
  const cleaned = normalizeWhitespace(mainText);
  return { text: cleaned, words: countWords(cleaned) };
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function averageSentenceLength(text: string): number {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!sentences.length) return 0;

  const totalWords = sentences.reduce(
    (sum, sentence) => sum + countWords(sentence),
    0,
  );

  return totalWords / sentences.length;
}

export function uniqueWordRatio(text: string): number {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\sÀ-ÖØ-öø-ÿ-]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 0;

  const unique = new Set(words);
  return unique.size / words.length;
}

export function isReadableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const hasLongSegments = segments.some((segment) => segment.length > 60);
    const hasManyParams = Array.from(parsed.searchParams.keys()).length > 3;
    const hasComplexParams = /[A-Z0-9]{10,}/.test(parsed.searchParams.toString());

    return !hasLongSegments && !hasManyParams && !hasComplexParams;
  } catch {
    return false;
  }
}
