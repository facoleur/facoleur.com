import { load, type Cheerio, type CheerioAPI, type Element } from "cheerio";

import type {
  ContentAuditResult,
  ContentStructure,
  HeadingInfo,
  HeadingNode,
  KeywordAnalysis,
  KeywordStat,
  ReadabilityStats,
  SectionAnalysis,
  StructureIssues,
} from "./types";

const STOP_WORDS = new Set<string>([
  // French articles, pronouns, prepositions, conjunctions
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "du",
  "de",
  "d",
  "au",
  "aux",
  "ce",
  "cet",
  "cette",
  "ces",
  "mon",
  "ton",
  "son",
  "ma",
  "ta",
  "sa",
  "mes",
  "tes",
  "ses",
  "notre",
  "votre",
  "leur",
  "nos",
  "vos",
  "leurs",
  "je",
  "tu",
  "il",
  "elle",
  "on",
  "nous",
  "vous",
  "ils",
  "elles",
  "moi",
  "toi",
  "lui",
  "elle",
  "eux",
  "elles",
  "y",
  "en",
  "me",
  "te",
  "se",
  "s",
  "m",
  "t",
  "l",
  "leur",
  "lui",
  "quel",
  "quelle",
  "quels",
  "quelles",
  "qui",
  "que",
  "quoi",
  "dont",
  "où",
  "ou",
  "dans",
  "sur",
  "sous",
  "chez",
  "vers",
  "avec",
  "sans",
  "entre",
  "par",
  "pour",
  "avant",
  "apres",
  "après",
  "pendant",
  "depuis",
  "contre",
  "selon",
  "parmi",
  "afin",
  "ainsi",
  "alors",
  "aucun",
  "aucune",
  "autre",
  "autres",
  "car",
  "comme",
  "donc",
  "et",
  "ni",
  "mais",
  "or",
  "ou",
  "si",
  "tandis",
  "lorsque",
  "lorsqu",
  "quand",
  "desormais",
  "désormais",
  "toujours",
  "souvent",
  "rarement",
  "jamais",
  "tres",
  "très",
  "plus",
  "moins",
  "peu",
  "trop",
  "encore",
  "bien",
  "mal",
  "peut",
  "etre",
  "être",
  "serait",
  "sera",
  "suis",
  "es",
  "est",
  "sommes",
  "etes",
  "êtes",
  "sont",
  "été",
  "etait",
  "étaient",
  "avait",
  "avaient",
  "avoir",
  "aura",
  "aurait",
  "fut",
  "fût",
  "futurs",
  "fait",
  "faites",
  "fais",
  "faisait",
  "faisaient",
  "peut",
  "peux",
  "peutetre",
  "peut-être",
  "ne",
  "pas",
  "plus",
  "moins",
  "aucun",
  "aucune",
  "chaque",
  "quelque",
  "quelques",
  "tous",
  "tout",
  "toute",
  "toutes",
  "cela",
  "ca",
  "ça",
  "ceci",
  "celui",
  "celle",
  "ceux",
  "celles",
  "lors",
  "desquels",
  "desquelles",
  "auxquels",
  "auxquelles",
  "lesquels",
  "lesquelles",
  "ainsi",
  "autant",
  "davantage",
  "deja",
  "déjà",
  "ensemble",
  "hormis",
  "jusque",
  "jusqu",
  "malgre",
  "malgré",
  "meme",
  "même",
  "notamment",
  "ouest",
  "est",
  "nord",
  "sud",
  // English common stopwords
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "then",
  "than",
  "that",
  "this",
  "these",
  "those",
  "of",
  "for",
  "to",
  "from",
  "on",
  "in",
  "at",
  "by",
  "with",
  "about",
  "into",
  "after",
  "before",
  "during",
  "until",
  "within",
  "without",
  "over",
  "under",
  "up",
  "down",
  "out",
  "off",
  "as",
  "so",
  "such",
  "not",
  "no",
  "nor",
  "only",
  "just",
  "very",
  "too",
  "also",
  "can",
  "could",
  "should",
  "would",
  "may",
  "might",
  "must",
  "will",
  "shall",
  "do",
  "does",
  "did",
  "done",
  "doing",
  "be",
  "been",
  "being",
  "am",
  "is",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
  "having",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "them",
  "my",
  "your",
  "his",
  "its",
  "our",
  "their",
  "mine",
  "yours",
  "ours",
  "theirs",
  "any",
  "anyone",
  "anything",
  "anywhere",
  "some",
  "someone",
  "somebody",
  "something",
  "somewhere",
  "every",
  "everyone",
  "everything",
  "everywhere",
  "none",
  "nobody",
  "nothing",
  "nowhere",
  "all",
  "both",
  "either",
  "neither",
  "few",
  "many",
  "more",
  "most",
  "other",
  "another",
  "each",
  "per",
  "via",
  "etc",
  "etcetera",
  "vs",
  "versus",
]);
const NON_EDITORIAL_SELECTORS = [
  "nav",
  "header",
  "footer",
  "aside",
  "form",
  "button",
  "input",
  "select",
  "option",
  "textarea",
  "script",
  "style",
  "noscript",
  "svg",
  "canvas",
  "iframe",
  "video",
  "audio",
  "picture",
  "source",
  "[role='banner']",
  "[role='complementary']",
  "[role='navigation']",
  "[aria-label*='cookie' i]",
  "[class*='cookie' i]",
  "[id*='cookie' i]",
  ".advertisement",
  "[class*='ads' i]",
  "[class*='promo' i]",
];

const PASSIVE_PATTERNS = [
  /\b(has|have|had)\s+been\s+\w+ed\b/i,
  /\b(is|are|was|were|be|been|being)\s+\w+ed\b/i,
  /\b(got|gets|get)\s+\w+ed\b/i,
  /\b(est|sont|etait|étaient|été|etre)\s+\w+(é|ee|es|és|ées)\b/i,
  /\b(par|by)\s+[a-zà-ÿ-]+\b/i,
];

const isKeywordToken = (token: string) =>
  token.length >= 3 && !STOP_WORDS.has(token);

const filterKeywordTokens = (tokens: string[]) =>
  tokens.filter((token) => isKeywordToken(token));

export function normalizeInputUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Merci de fournir une URL d’article.");
  }
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const parsed = new URL(candidate);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Seules les URL http(s) sont supportées.");
  }
  return parsed.toString();
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ContentAuditBot/1.0 (+https://facoleur.com)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Impossible de charger la page (statut ${response.status}).`);
  }

  return response.text();
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  const normalized = text.toLowerCase().normalize("NFC");
  const matches = normalized.match(/[a-zà-ÿ0-9']+/gi);
  if (!matches) return [];
  return matches.map((token) => token.replace(/^'+|'+$/g, "")).filter(Boolean);
}

function countNgrams(tokens: string[], n: number): Record<string, number> {
  const counts: Record<string, number> = {};
  if (tokens.length < n) return counts;
  for (let i = 0; i <= tokens.length - n; i += 1) {
    const gram = tokens.slice(i, i + n).join(" ");
    counts[gram] = (counts[gram] || 0) + 1;
  }
  return counts;
}

function topKeywords(
  frequency: Record<string, number>,
  totalWords: number,
  limit: number,
): KeywordStat[] {
  return Object.entries(frequency)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term, count]) => ({
      term,
      count,
      density: totalWords
        ? Number(((count / totalWords) * 100).toFixed(2))
        : 0,
    }));
}

function stripNonEditorial($: CheerioAPI) {
  const selector = NON_EDITORIAL_SELECTORS.join(",");
  $(selector).remove();
}

function textLength($: CheerioAPI, element: Element): number {
  const text = cleanText($(element).text());
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function selectMainContent($: CheerioAPI) {
  const selectors = [
    "article",
    "main",
    "[role='main']",
    "[itemprop='articleBody']",
    "[class*='content']",
    "[class*='article']",
    "[class*='post']",
  ];
  const candidates = new Set<Element>();
  selectors.forEach((selector) => {
    $(selector).each((_, el) => candidates.add(el));
  });

  let best: Element | null = null;
  let bestScore = 0;
  candidates.forEach((element) => {
    const score = textLength($, element);
    if (score > bestScore) {
      best = element;
      bestScore = score;
    }
  });

  return best ? $(best) : $("body");
}

function extractTitle($: CheerioAPI): string {
  const ogTitle = $('meta[property="og:title"]').attr("content");
  if (ogTitle) return cleanText(ogTitle);
  const title = $("title").first().text();
  return cleanText(title || "Analyse de contenu");
}

function extractSections(
  $: CheerioAPI,
  root: Cheerio<Element>,
): { headings: HeadingInfo[]; sections: SectionAnalysis[] } {
  const headingElements = root.find("h1,h2,h3,h4,h5,h6").toArray();
  if (headingElements.length === 0) {
    const text = cleanText(root.text());
    const tokens = tokenize(text);
    const keywordTokens = filterKeywordTokens(tokens);
    const paragraphWordCounts = root
      .find("p")
      .toArray()
      .map((p) => tokenize(cleanText($(p).text())).length)
      .filter((len) => len > 0);
    return {
      headings: [],
      sections: [
        {
          heading: { level: 0, text: "Contenu principal" },
          text,
          wordCount: tokens.length,
          paragraphWordCounts,
          keywordFrequency: countNgrams(keywordTokens, 1),
        },
      ],
    };
  }

  const sections: SectionAnalysis[] = [];
  const headings: HeadingInfo[] = [];

  headingElements.forEach((el) => {
    const tagName = el.tagName || "";
    const level = Number(tagName.replace("h", ""));
    const headingText = cleanText($(el).text());
    if (!level || !headingText) return;

    const contentNodes = $(el).nextUntil("h1,h2,h3,h4,h5,h6");
    const fragments: string[] = [];
    const paragraphWordCounts: number[] = [];

    contentNodes.each((_, node) => {
      const textContent = cleanText($(node).text());
      if (!textContent) return;
      fragments.push(textContent);
      if ($(node).is("p,li,blockquote")) {
        paragraphWordCounts.push(tokenize(textContent).length);
      }
    });

    const sectionText = fragments.join(" ");
    const tokens = tokenize(sectionText);
    const keywordTokens = filterKeywordTokens(tokens);
    const heading: HeadingInfo = { level, text: headingText };
    headings.push(heading);
    sections.push({
      heading,
      text: sectionText,
      wordCount: tokens.length,
      paragraphWordCounts,
      keywordFrequency: countNgrams(keywordTokens, 1),
    });
  });

  return { headings, sections };
}

function buildHeadingTree(headings: HeadingInfo[]): HeadingNode[] {
  const root: HeadingNode[] = [];
  const stack: HeadingNode[] = [];

  headings.forEach((heading) => {
    const node: HeadingNode = { ...heading, children: [] };
    while (stack.length && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  });

  return root;
}

function detectHeadingIssues(headings: HeadingInfo[]): StructureIssues {
  const h1Count = headings.filter((h) => h.level === 1).length;
  const skippedLevels: Array<{ from: number; to: number; text: string }> = [];

  for (let i = 1; i < headings.length; i += 1) {
    const previous = headings[i - 1];
    const current = headings[i];
    if (current.level - previous.level > 1) {
      skippedLevels.push({
        from: previous.level,
        to: current.level,
        text: current.text,
      });
    }
  }

  const notes: string[] = [];
  if (headings.length === 0) {
    notes.push("Aucune structure de titres détectée.");
  }

  return {
    missingH1: h1Count === 0,
    multipleH1: h1Count > 1,
    skippedLevels,
    notes,
  };
}

function buildKeywordAnalysis(
  tokens: string[],
  sections: SectionAnalysis[],
): KeywordAnalysis {
  const totalWords = tokens.length;
  const keywordTokens = filterKeywordTokens(tokens);
  const unigrams = countNgrams(keywordTokens, 1);
  const bigrams = countNgrams(keywordTokens, 2);
  const trigrams = countNgrams(keywordTokens, 3);

  return {
    totalWords,
    frequencies: unigrams,
    topUnigrams: topKeywords(unigrams, totalWords, 15),
    topBigrams: topKeywords(bigrams, totalWords, 10),
    topTrigrams: topKeywords(trigrams, totalWords, 10),
    density: topKeywords(unigrams, totalWords, 15),
    distribution: sections.map((section) => ({
      heading: section.heading,
      totalWords: section.wordCount,
      topKeywords: topKeywords(
        section.keywordFrequency,
        section.wordCount || 1,
        5,
      ),
    })),
  };
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => cleanText(sentence))
    .filter(Boolean);
}

function detectRepeatedPhrases(tokens: string[]): Array<{ phrase: string; count: number }> {
  const lengths = [3, 4];
  const repeated: Record<string, number> = {};

  lengths.forEach((length) => {
    const grams = countNgrams(tokens, length);
    Object.entries(grams).forEach(([phrase, count]) => {
      if (count > 1) {
        repeated[phrase] = Math.max(repeated[phrase] || 0, count);
      }
    });
  });

  return Object.entries(repeated)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([phrase, count]) => ({ phrase, count }));
}

function detectPassiveVoice(sentences: string[]) {
  const matches: string[] = [];

  sentences.forEach((sentence) => {
    const normalized = sentence.toLowerCase();
    if (PASSIVE_PATTERNS.some((pattern) => pattern.test(normalized))) {
      matches.push(cleanText(sentence));
    }
  });

  const count = matches.length;
  const ratio = sentences.length
    ? Number(((count / sentences.length) * 100).toFixed(2))
    : 0;

  return {
    count,
    ratio,
    examples: matches.slice(0, 3),
  };
}

function buildReadabilityStats(
  text: string,
  sections: SectionAnalysis[],
  tokens: string[],
): ReadabilityStats {
  const sentences = splitSentences(text);
  const sentenceLengths = sentences
    .map((sentence) => tokenize(sentence).length)
    .filter((len) => len > 0);
  const averageSentenceLength = sentenceLengths.length
    ? Number(
        (
          sentenceLengths.reduce((sum, len) => sum + len, 0) /
          sentenceLengths.length
        ).toFixed(2),
      )
    : 0;

  const paragraphLengthDistribution = sections
    .flatMap((section) => section.paragraphWordCounts)
    .filter((len) => len > 0);

  return {
    sentences: sentenceLengths.length,
    averageSentenceLength,
    paragraphLengthDistribution,
    repeatedPhrases: detectRepeatedPhrases(tokens),
    passiveVoice: detectPassiveVoice(sentences),
  };
}

function buildStructure(
  $: CheerioAPI,
  root: Cheerio<Element>,
): ContentStructure {
  const { headings, sections } = extractSections($, root);
  const totalWordCount = sections.reduce(
    (sum, section) => sum + section.wordCount,
    0,
  );

  return {
    headings,
    headingTree: buildHeadingTree(headings),
    sections,
    totalWordCount,
    h1Count: headings.filter((heading) => heading.level === 1).length,
    issues: detectHeadingIssues(headings),
  };
}

export async function runContentAudit(
  inputUrl: string,
): Promise<ContentAuditResult> {
  const normalizedUrl = normalizeInputUrl(inputUrl);
  const html = await fetchHtml(normalizedUrl);
  const $ = load(html);

  stripNonEditorial($);
  const main = selectMainContent($);
  const structure = buildStructure($, main);

  const combinedText = structure.sections.map((s) => s.text).join(" ");
  const tokens = tokenize(combinedText);

  const keywords = buildKeywordAnalysis(tokens, structure.sections);
  const readability = buildReadabilityStats(combinedText, structure.sections, tokens);

  const language = $("html").attr("lang")?.trim() || null;

  return {
    metadata: {
      url: normalizedUrl,
      title: extractTitle($),
      language,
      fetchedAt: new Date().toISOString(),
      totalWordCount: structure.totalWordCount,
    },
    structure,
    keywords,
    readability,
  };
}
