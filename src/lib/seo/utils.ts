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
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs ?? DEFAULT_TIMEOUT,
  );

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
  return text.trim().split(/\s+/).filter(Boolean).length;
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

const STOPWORDS = new Set([
  // French + EN basics
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "de",
  "du",
  "d",
  "en",
  "et",
  "ou",
  "au",
  "aux",
  "ce",
  "cet",
  "cette",
  "ces",
  "qui",
  "que",
  "quoi",
  "dont",
  "avec",
  "sans",
  "pour",
  "par",
  "sur",
  "sous",
  "dans",
  "chez",
  "son",
  "sa",
  "ses",
  "leur",
  "leurs",
  "nos",
  "notre",
  "vos",
  "votre",
  "a",
  "à",
  "est",
  "sont",
  "etre",
  "être",
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "by",
  "with",
  "without",
  "at",
  "from",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "is",
  "are",
  "be",
]);

export function uniqueWordRatio(text: string): number {
  const tokens = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^-+|-+$/g, ""))
    .filter(
      (w) =>
        w.length >= 2 && // ignore very short words
        !STOPWORDS.has(w) &&
        !/^\d+$/.test(w), // ignore pure numbers
    );

  if (!tokens.length) return 0;

  const unique = new Set(tokens);
  return unique.size / tokens.length;
}

export function isReadableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const hasLongSegments = segments.some((segment) => segment.length > 60);
    const hasManyParams = Array.from(parsed.searchParams.keys()).length > 3;
    const hasComplexParams = /[A-Z0-9]{10,}/.test(
      parsed.searchParams.toString(),
    );

    return !hasLongSegments && !hasManyParams && !hasComplexParams;
  } catch {
    return false;
  }
}
