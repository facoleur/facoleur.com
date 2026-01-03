import type { CheerioAPI } from "cheerio";
import {
  CHECK_WEIGHTS,
  STATUS_SCORE,
  CATEGORY_ORDER,
} from "./constants";
import type {
  AuditCheck,
  AuditContext,
  CheckStatus,
} from "./types";
import {
  averageSentenceLength,
  fetchWithTimeout,
  getMainText,
  isReadableUrl,
  normalizeWhitespace,
  toAbsoluteUrl,
  uniqueWordRatio,
} from "./utils";

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const makeCheck = (
  input: Omit<AuditCheck, "score"> & { score?: number },
): AuditCheck => ({
  ...input,
  score: clampScore(input.score ?? STATUS_SCORE[input.status]),
});

const isValidUrl = (href: string | undefined | null) =>
  !!href &&
  !href.startsWith("#") &&
  !href.startsWith("javascript:") &&
  !href.startsWith("mailto:") &&
  !href.startsWith("tel:");

const hasProtocol = (url: string) => /^https?:\/\//i.test(url);

const hreflangPattern = /^(x-default|[a-z]{2}(?:-[A-Z]{2})?)$/i;

const statusFromThresholds = (
  value: number,
  goodMax: number,
  warningMax: number,
): CheckStatus => {
  if (value <= goodMax) return "good";
  if (value <= warningMax) return "warning";
  return "critical";
};

const compareUrls = (a?: string | null, b?: string | null) => {
  if (!a || !b) return false;
  try {
    const clean = (url: string) => {
      const parsed = new URL(url);
      parsed.hash = "";
      ["utm_source", "utm_medium", "utm_campaign", "gclid"].forEach((param) =>
        parsed.searchParams.delete(param),
      );
      return parsed.toString().replace(/\/$/, "");
    };
    return clean(a) === clean(b);
  } catch {
    return false;
  }
};

function getHeadingLevels($: CheerioAPI): number[] {
  return $("h1, h2, h3, h4, h5, h6")
    .toArray()
    .map((node) => Number(node.tagName.replace("h", "")));
}

function evaluateHeadingHierarchy(levels: number[]): {
  status: CheckStatus;
  detail: string;
} {
  if (!levels.length) {
    return {
      status: "critical",
      detail: "Aucun titre Hn détecté.",
    };
  }

  let anomalies = 0;
  let previous = levels[0];
  levels.slice(1).forEach((level) => {
    if (level - previous > 1) anomalies += 1;
    previous = level;
  });

  if (levels[0] !== 1) {
    anomalies += 1;
  }

  if (anomalies === 0) {
    return { status: "good", detail: "Hiérarchie logique des titres." };
  }

  if (anomalies === 1) {
    return {
      status: "warning",
      detail: "Des sauts de niveau Hn sont détectés.",
    };
  }

  return {
    status: "critical",
    detail: "Plusieurs ruptures dans la hiérarchie des titres.",
  };
}

function collectLinks($: CheerioAPI, baseUrl: string) {
  const anchors = $("a[href]").toArray();
  const baseHost = new URL(baseUrl).host;
  const internal = new Set<string>();
  const external = new Set<string>();

  anchors.forEach((node) => {
    const href = $(node).attr("href");
    if (!isValidUrl(href)) return;
    const resolved = toAbsoluteUrl(href!, baseUrl);
    if (!resolved) return;
    const host = new URL(resolved).host;
    if (host === baseHost) {
      internal.add(resolved);
    } else {
      external.add(resolved);
    }
  });

  return {
    internal: Array.from(internal),
    external: Array.from(external),
  };
}

function analyzeRobotsBlocking(robotsTxt?: string | null) {
  if (!robotsTxt) return { blocking: false, strict: false };

  const lines = robotsTxt
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let inAllAgents = false;
  let blocking = false;

  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (lower.startsWith("user-agent:")) {
      inAllAgents = lower.replace("user-agent:", "").trim() === "*";
    }
    if (inAllAgents && lower.startsWith("disallow:")) {
      const rule = lower.replace("disallow:", "").trim();
      if (rule === "/") blocking = true;
    }
  });

  return { blocking, strict: blocking && inAllAgents };
}

async function estimateImageWeight($: CheerioAPI, baseUrl: string) {
  const imageUrls: string[] = $("img")
    .toArray()
    .map((img) => $(img).attr("src"))
    .filter(Boolean)
    .map((src) => toAbsoluteUrl(src!, baseUrl))
    .filter(Boolean) as string[];

  const unique = Array.from(new Set(imageUrls)).slice(0, 5);
  let bytes = 0;
  let sampled = 0;

  await Promise.all(
    unique.map(async (url) => {
      if (url.startsWith("data:image")) {
        sampled += 1;
        const base64Data = url.split(",")[1] || "";
        bytes += Math.round((base64Data.length * 3) / 4);
        return;
      }

      const res = await fetchWithTimeout(url, {
        method: "HEAD",
        timeoutMs: 7000,
      });
      sampled += 1;
      if (res.ok) {
        const length = res.headers?.["content-length"];
        if (length) {
          bytes += Number(length);
        } else {
          // fallback estimation when header missing
          bytes += 150_000;
        }
      }
    }),
  );

  return { bytes, sampled };
}

async function checkExternalLinksHealth(urls: string[]) {
  const sample = urls.slice(0, 5);
  let broken = 0;
  let sampled = 0;

  await Promise.all(
    sample.map(async (url) => {
      const res = await fetchWithTimeout(url, {
        method: "HEAD",
        timeoutMs: 7000,
      });
      if (!res.ok || (res.status && res.status >= 400)) {
        broken += 1;
      }
      sampled += 1;
    }),
  );

  return { broken, sampled, total: urls.length };
}

function countJsonLdScripts($: CheerioAPI) {
  return $("script[type='application/ld+json']").toArray();
}

function checkShareImageUrl(image?: string | null) {
  if (!image) {
    return { status: "warning" as CheckStatus, valid: false };
  }
  if (!hasProtocol(image)) {
    return { status: "critical" as CheckStatus, valid: false };
  }
  return { status: "good" as CheckStatus, valid: true };
}

export async function runChecks(
  context: AuditContext,
): Promise<{ checks: AuditCheck[]; sampledRequests: number }> {
  const { $, normalizedUrl, htmlBytes, robotsTxt, sitemapUrl } = context;
  const checks: AuditCheck[] = [];
  let sampledRequests = 0;

  const h1Count = $("h1").length;
  const headingLevels = getHeadingLevels($);
  const title = normalizeWhitespace($("title").first().text() || "");
  const metaDescription =
    $("meta[name='description']").attr("content")?.trim() || "";
  const robotsMeta =
    $("meta[name='robots']").attr("content")?.toLowerCase() || "";
  const canonicalHref = $("link[rel='canonical']").attr("href") || "";
  const viewport =
    $("meta[name='viewport']").attr("content")?.toLowerCase() || "";
  const langAttr = $("html").attr("lang") || "";
  const charset =
    $("meta[charset]").attr("charset") ||
    $("meta[http-equiv='Content-Type']")
      .attr("content")
      ?.match(/charset=([^;]+)/i)?.[1] ||
    "";
  const ogTags = {
    title: $("meta[property='og:title']").attr("content"),
    desc: $("meta[property='og:description']").attr("content"),
    image: $("meta[property='og:image']").attr("content"),
    url: $("meta[property='og:url']").attr("content"),
  };
  const twitterTags = {
    card: $("meta[name='twitter:card']").attr("content"),
    title: $("meta[name='twitter:title']").attr("content"),
    description: $("meta[name='twitter:description']").attr("content"),
    image: $("meta[name='twitter:image']").attr("content"),
  };
  const scriptCount = $("script:not([type='application/ld+json'])").length;
  const images = $("img");
  const imageCount = images.length;
  const imagesWithAlt = images.filter(
    (_, img) => !!$(img).attr("alt")?.trim(),
  ).length;
  const lazyImages = images.filter(
    (_, img) => ($(img).attr("loading") || "").toLowerCase() === "lazy",
  ).length;
  const { text: mainText, words: mainWords } = getMainText($);
  const uniqueRatio = uniqueWordRatio(mainText);
  const avgSentence = averageSentenceLength(mainText);
  const linkSets = collectLinks($, normalizedUrl);
  const hreflangs = $("link[rel='alternate'][hreflang]").toArray();
  const doctypeOk = /^<!doctype html>/i.test(context.html.trim());

  const robotsResult = analyzeRobotsBlocking(robotsTxt);
  const imageWeight = await estimateImageWeight($, normalizedUrl);
  const externalHealth = await checkExternalLinksHealth(linkSets.external);
  sampledRequests += imageWeight.sampled + externalHealth.sampled;

  // HTML & BALISES
  checks.push(
    makeCheck({
      id: "html_h1_unique",
      category: "HTML & balises",
      label: "H1 unique",
      status:
        h1Count === 1 ? "good" : h1Count === 0 ? "critical" : "warning",
      score: h1Count === 1 ? 100 : h1Count === 0 ? 0 : 55,
      explanation:
        h1Count === 1
          ? "Un seul H1 détecté."
          : h1Count === 0
            ? "Aucun H1 trouvé dans la page."
            : `${h1Count} H1 détectés.`,
      howToFix:
        "Limiter la page à un seul H1 décrivant le sujet principal, convertir les autres titres en H2/H3.",
    }),
  );

  const headingEvaluation = evaluateHeadingHierarchy(headingLevels);
  checks.push(
    makeCheck({
      id: "html_heading_hierarchy",
      category: "HTML & balises",
      label: "Hiérarchie Hn",
      status: headingEvaluation.status,
      score:
        headingEvaluation.status === "good"
          ? 100
          : headingEvaluation.status === "warning"
            ? 60
            : 30,
      explanation: headingEvaluation.detail,
      howToFix:
        "Respecter la progression H1 > H2 > H3 sans saut de niveau. Corriger les titres sautant plus d’un niveau.",
    }),
  );

  const titleLength = title.length;
  const titleStatus =
    titleLength >= 50 && titleLength <= 60
      ? "good"
      : titleLength === 0
        ? "critical"
        : titleLength >= 30 && titleLength <= 65
          ? "warning"
          : "critical";
  checks.push(
    makeCheck({
      id: "html_title_length",
      category: "HTML & balises",
      label: "Title 50–60 caractères",
      status: titleStatus,
      score:
        titleStatus === "good"
          ? 100
          : titleStatus === "warning"
            ? 65
            : 25,
      explanation:
        titleLength === 0
          ? "Aucune balise <title> détectée."
          : `Longueur actuelle: ${titleLength} caractères.`,
      howToFix:
        "Rédiger un title entre 50 et 60 caractères incluant le mot-clé principal et la marque.",
    }),
  );

  const descriptionLength = metaDescription.length;
  const descriptionStatus =
    descriptionLength >= 140 && descriptionLength <= 160
      ? "good"
      : descriptionLength === 0
        ? "critical"
        : descriptionLength >= 100 && descriptionLength <= 180
          ? "warning"
          : "critical";
  checks.push(
    makeCheck({
      id: "html_meta_description",
      category: "HTML & balises",
      label: "Meta description 140–160 caractères",
      status: descriptionStatus,
      score:
        descriptionStatus === "good"
          ? 100
          : descriptionStatus === "warning"
            ? 65
            : 20,
      explanation:
        descriptionLength === 0
          ? "Aucune meta description."
          : `Longueur actuelle: ${descriptionLength} caractères.`,
      howToFix:
        "Rédiger une description entre 140 et 160 caractères incitant au clic et unique par page.",
    }),
  );

  // INDEXATION
  const robotsStatus = robotsMeta.includes("noindex")
    ? "critical"
    : robotsMeta.includes("nofollow")
      ? "warning"
      : robotsMeta
        ? "good"
        : "warning";
  checks.push(
    makeCheck({
      id: "index_robots_meta",
      category: "Indexation",
      label: "Meta robots index/follow",
      status: robotsStatus as CheckStatus,
      score:
        robotsStatus === "good"
          ? 100
          : robotsStatus === "warning"
            ? 55
            : 0,
      explanation:
        robotsStatus === "good"
          ? `Meta robots: ${robotsMeta || "index,follow"}.`
          : robotsStatus === "critical"
            ? `Meta robots contient "${robotsMeta}".`
            : "Meta robots absente ou incomplète.",
      howToFix:
        'S’assurer que la page est indexable: meta name="robots" content="index,follow". Éviter noindex/nofollow hors cas précis.',
    }),
  );

  const canonicalResolved = canonicalHref
    ? toAbsoluteUrl(canonicalHref, normalizedUrl)
    : null;
  let canonicalStatus: CheckStatus = "warning";
  if (!canonicalResolved) {
    canonicalStatus = "warning";
  } else if (compareUrls(canonicalResolved, normalizedUrl)) {
    canonicalStatus = "good";
  } else {
    canonicalStatus = "critical";
  }
  checks.push(
    makeCheck({
      id: "index_canonical",
      category: "Indexation",
      label: "Canonical auto-référent",
      status: canonicalStatus,
      score:
        canonicalStatus === "good"
          ? 100
          : canonicalStatus === "warning"
            ? 60
            : 25,
      explanation: canonicalResolved
        ? `Canonical détectée: ${canonicalResolved}`
        : "Aucune balise canonical détectée.",
      howToFix:
        "Ajouter <link rel=\"canonical\" href=\"URL propre\">. Aligner la canonical sur l’URL finale sans paramètres.",
    }),
  );

  const robotsAccessible = robotsTxt !== null && robotsTxt !== undefined;
  const robotsBlocking = robotsResult.blocking;
  const robotsStatusLabel = robotsBlocking
    ? "critical"
    : robotsAccessible
      ? "good"
      : "warning";
  checks.push(
    makeCheck({
      id: "index_robots_txt",
      category: "Indexation",
      label: "robots.txt accessible",
      status: robotsStatusLabel,
      score:
        robotsStatusLabel === "good"
          ? 100
          : robotsStatusLabel === "warning"
            ? 55
            : 0,
      explanation: robotsBlocking
        ? "robots.txt bloque User-agent * sur /."
        : robotsAccessible
          ? "robots.txt joignable."
          : "robots.txt non accessible.",
      howToFix:
        "Publier un robots.txt accessible (200) et vérifier que User-agent * n’interdit pas toute l’arborescence.",
    }),
  );

  checks.push(
    makeCheck({
      id: "index_sitemap",
      category: "Indexation",
      label: "Sitemap détectable",
      status: sitemapUrl ? "good" : "warning",
      score: sitemapUrl ? 100 : 60,
      explanation: sitemapUrl
        ? `Sitemap trouvée: ${sitemapUrl}`
        : "Pas de sitemap détectée via robots.txt ou /sitemap.xml.",
      howToFix:
        "Déclarer le sitemap dans robots.txt et publier /sitemap.xml accessible.",
    }),
  );

  // CONTENU
  const mainTextStatus =
    mainWords >= 150 ? "good" : mainWords >= 80 ? "warning" : "critical";
  checks.push(
    makeCheck({
      id: "content_main_text",
      category: "Contenu",
      label: "Texte principal présent",
      status: mainTextStatus,
      score:
        mainTextStatus === "good"
          ? 100
          : mainTextStatus === "warning"
            ? 60
            : 25,
      explanation: `${mainWords} mots utiles détectés dans le contenu principal.`,
      howToFix:
        "Placer le contenu textuel dans <main> ou dans le corps de page avec une structure claire.",
    }),
  );

  const lengthStatus =
    mainWords >= 500 ? "good" : mainWords >= 300 ? "warning" : "critical";
  checks.push(
    makeCheck({
      id: "content_min_length",
      category: "Contenu",
      label: "Longueur minimale",
      status: lengthStatus,
      score:
        lengthStatus === "good"
          ? 100
          : lengthStatus === "warning"
            ? 65
            : 30,
      explanation: `${mainWords} mots trouvés. Une page info devrait viser 500+ mots pertinents.`,
      howToFix:
        "Enrichir le contenu avec des sections supplémentaires (FAQ, preuves, données) sans bourrage de mots-clés.",
    }),
  );

  const duplicationStatus =
    uniqueRatio >= 0.45
      ? "good"
      : uniqueRatio >= 0.3
        ? "warning"
        : "critical";
  checks.push(
    makeCheck({
      id: "content_duplication",
      category: "Contenu",
      label: "Duplication évidente",
      status: duplicationStatus,
      score:
        duplicationStatus === "good"
          ? 100
          : duplicationStatus === "warning"
            ? 55
            : 20,
      explanation: `Ratio de mots uniques: ${(uniqueRatio * 100).toFixed(0)}%.`,
      howToFix:
        "Réécrire les passages répétitifs, ajouter des exemples originaux et différencier titres/meta.",
    }),
  );

  const readabilityStatus =
    avgSentence <= 20
      ? "good"
      : avgSentence <= 25
        ? "warning"
        : "critical";
  checks.push(
    makeCheck({
      id: "content_readability",
      category: "Contenu",
      label: "Lisibilité basique",
      status: readabilityStatus,
      score:
        readabilityStatus === "good"
          ? 95
          : readabilityStatus === "warning"
            ? 65
            : 30,
      explanation: `Longueur moyenne des phrases: ${avgSentence.toFixed(1)} mots.`,
      howToFix:
        "Raccourcir les phrases (>25 mots), utiliser des listes et des sous-titres pour aérer la lecture.",
    }),
  );

  // DONNÉES STRUCTURÉES
  const jsonLdScripts = countJsonLdScripts($);
  const hasJsonLd = jsonLdScripts.length > 0;
  checks.push(
    makeCheck({
      id: "structured_presence",
      category: "Données structurées",
      label: "Schema.org JSON-LD",
      status: hasJsonLd ? "good" : "warning",
      score: hasJsonLd ? 100 : 55,
      explanation: hasJsonLd
        ? `${jsonLdScripts.length} bloc(s) JSON-LD détecté(s).`
        : "Aucun JSON-LD Schema.org détecté.",
      howToFix:
        "Ajouter un script type=\"application/ld+json\" avec le schéma adapté (Article, Product, Organization...).",
    }),
  );

  let jsonValidity: CheckStatus = "warning";
  let jsonValidScore = 55;
  if (hasJsonLd) {
    const invalid = jsonLdScripts.some((node) => {
      const raw = $(node).contents().text();
      try {
        JSON.parse(raw);
        return false;
      } catch {
        return true;
      }
    });
    if (invalid) {
      jsonValidity = "critical";
      jsonValidScore = 25;
    } else {
      jsonValidity = "good";
      jsonValidScore = 95;
    }
  }
  checks.push(
    makeCheck({
      id: "structured_validity",
      category: "Données structurées",
      label: "Validation JSON-LD",
      status: jsonValidity,
      score: jsonValidScore,
      explanation:
        jsonValidity === "critical"
          ? "JSON-LD présent mais invalide (parse error)."
          : jsonValidity === "good"
            ? "JSON-LD valide au parse basique."
            : "Aucun JSON-LD à valider.",
      howToFix:
        "Valider le JSON-LD via l’outil Rich Results et corriger la syntaxe/typage.",
    }),
  );

  // SOCIAL
  const hasOg =
    !!ogTags.title && !!ogTags.desc && !!ogTags.image && !!ogTags.url;
  const ogStatus = hasOg ? "good" : ogTags.title || ogTags.desc ? "warning" : "critical";
  checks.push(
    makeCheck({
      id: "social_open_graph",
      category: "Social",
      label: "Balises Open Graph",
      status: ogStatus,
      score: ogStatus === "good" ? 100 : ogStatus === "warning" ? 60 : 25,
      explanation: hasOg
        ? "og:title, og:description, og:image, og:url présents."
        : "Balises Open Graph manquantes ou partielles.",
      howToFix:
        "Ajouter og:title, og:description, og:image (URL absolue) et og:url cohérents avec la page.",
    }),
  );

  const twitterStatus = twitterTags.card
    ? twitterTags.title && twitterTags.description
      ? "good"
      : "warning"
    : "critical";
  checks.push(
    makeCheck({
      id: "social_twitter_cards",
      category: "Social",
      label: "Twitter Cards",
      status: twitterStatus as CheckStatus,
      score:
        twitterStatus === "good"
          ? 95
          : twitterStatus === "warning"
            ? 55
            : 25,
      explanation: twitterTags.card
        ? `twitter:card=${twitterTags.card ?? "absent"}`
        : "Aucune meta Twitter détectée.",
      howToFix:
        "Ajouter twitter:card, twitter:title, twitter:description et twitter:image pour un partage correct.",
    }),
  );

  const shareImageCheck = checkShareImageUrl(
    ogTags.image || twitterTags.image,
  );
  checks.push(
    makeCheck({
      id: "social_share_image",
      category: "Social",
      label: "Image de partage",
      status: shareImageCheck.status,
      score:
        shareImageCheck.status === "good"
          ? 95
          : shareImageCheck.status === "warning"
            ? 60
            : 20,
      explanation: shareImageCheck.valid
        ? "Image de partage avec URL absolue détectée."
        : "Aucune image de partage valide.",
      howToFix:
        "Définir og:image (ou twitter:image) avec une URL HTTPS accessible et aux bonnes dimensions (1200x630).",
    }),
  );

  // IMAGES
  const altRatio = imageCount ? imagesWithAlt / imageCount : 1;
  const altStatus =
    altRatio >= 0.9 ? "good" : altRatio >= 0.6 ? "warning" : "critical";
  checks.push(
    makeCheck({
      id: "images_alt",
      category: "Images",
      label: "Attribut alt",
      status: altStatus,
      score:
        altStatus === "good"
          ? 100
          : altStatus === "warning"
            ? 60
            : 25,
      explanation: `${imagesWithAlt}/${imageCount || 0} images avec alt.`,
      howToFix:
        "Ajouter un alt descriptif sur chaque image décorative ou informative. Éviter le bourrage de mots-clés.",
    }),
  );

  const imageWeightStatus =
    imageWeight.bytes <= 1_500_000
      ? "good"
      : imageWeight.bytes <= 3_000_000
        ? "warning"
        : "critical";
  checks.push(
    makeCheck({
      id: "images_weight",
      category: "Images",
      label: "Poids images estimé",
      status: imageWeightStatus,
      score:
        imageWeightStatus === "good"
          ? 95
          : imageWeightStatus === "warning"
            ? 65
            : 25,
      explanation: imageCount
        ? `Échantillon: ${(imageWeight.bytes / 1024).toFixed(0)} Ko sur ${imageWeight.sampled} image(s).`
        : "Aucune image détectée.",
      howToFix:
        "Compresser les images (WebP/AVIF), fournir des srcset adaptés et éviter les images >150ko.",
    }),
  );

  const lazyRatio = imageCount ? lazyImages / imageCount : 1;
  const lazyStatus =
    lazyRatio >= 0.7 ? "good" : lazyRatio >= 0.4 ? "warning" : "critical";
  checks.push(
    makeCheck({
      id: "images_lazy",
      category: "Images",
      label: "Lazy loading",
      status: lazyStatus,
      score:
        lazyStatus === "good"
          ? 90
          : lazyStatus === "warning"
            ? 60
            : 30,
      explanation: `${lazyImages}/${imageCount || 0} images en lazy-loading.`,
      howToFix:
        "Ajouter loading=\"lazy\" sur les images non critiques et utiliser l’attribut decoding=\"async\".",
    }),
  );

  // PERFORMANCE
  const htmlSizeStatus = statusFromThresholds(
    htmlBytes,
    200_000,
    300_000,
  );
  checks.push(
    makeCheck({
      id: "performance_html_size",
      category: "Performance",
      label: "Taille HTML",
      status: htmlSizeStatus,
      score:
        htmlSizeStatus === "good"
          ? 95
          : htmlSizeStatus === "warning"
            ? 60
            : 25,
      explanation: `Taille HTML: ${(htmlBytes / 1024).toFixed(0)} Ko.`,
      howToFix:
        "Réduire le HTML (nettoyage des inlines, minification) et différer les scripts non critiques.",
    }),
  );

  const scriptStatus =
    scriptCount <= 10 ? "good" : scriptCount <= 20 ? "warning" : "critical";
  checks.push(
    makeCheck({
      id: "performance_script_count",
      category: "Performance",
      label: "Nombre de scripts",
      status: scriptStatus,
      score:
        scriptStatus === "good"
          ? 95
          : scriptStatus === "warning"
            ? 60
            : 25,
      explanation: `${scriptCount} scripts hors JSON-LD.`,
      howToFix:
        "Supprimer les scripts inutiles, mutualiser les bundles et charger en defer/async.",
    }),
  );

  const viewportStatus = viewport.includes("width=device-width")
    ? "good"
    : viewport
      ? "warning"
      : "critical";
  checks.push(
    makeCheck({
      id: "performance_viewport",
      category: "Performance",
      label: "Viewport mobile",
      status: viewportStatus as CheckStatus,
      score:
        viewportStatus === "good"
          ? 100
          : viewportStatus === "warning"
            ? 60
            : 20,
      explanation: viewport
        ? `Meta viewport actuelle: ${viewport}`
        : "Aucune meta viewport détectée.",
      howToFix:
        'Ajouter <meta name="viewport" content="width=device-width, initial-scale=1"> pour le rendu mobile.',
    }),
  );

  const isHttps = normalizedUrl.startsWith("https://");
  checks.push(
    makeCheck({
      id: "performance_https",
      category: "Performance",
      label: "HTTPS actif",
      status: isHttps ? "good" : "critical",
      score: isHttps ? 100 : 0,
      explanation: isHttps
        ? "Page servie en HTTPS."
        : "URL fournie en HTTP.",
      howToFix:
        "Forcer le HTTPS (301), corriger les liens mixtes et configurer HSTS.",
    }),
  );

  // ACCESSIBILITÉ
  const langStatus = langAttr ? "good" : "critical";
  checks.push(
    makeCheck({
      id: "accessibility_lang",
      category: "Accessibilité",
      label: "Attribut lang",
      status: langStatus,
      score: langStatus === "good" ? 100 : 20,
      explanation: langAttr
        ? `lang="${langAttr}".`
        : "Attribut lang manquant sur <html>.",
      howToFix:
        "Définir lang sur <html> (ex: fr, en). Revoir aussi les lang sur sections multilingues.",
    }),
  );

  checks.push(
    makeCheck({
      id: "accessibility_contrast_notice",
      category: "Accessibilité",
      label: "Contrastes à vérifier",
      status: "warning",
      score: 50,
      explanation:
        "Contraste non mesuré automatiquement. Vérifier manuellement (WCAG AA).",
      howToFix:
        "Tester les contrastes avec un outil (axe DevTools, Lighthouse) et ajuster couleurs/tailles.",
    }),
  );

  const focusable = $(
    "a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])",
  ).length;
  const hasSkipLink = $("a[href^='#']").toArray().some((node) => {
    const text = $(node).text().toLowerCase();
    return text.includes("skip") || text.includes("passer");
  });
  const keyboardStatus =
    hasSkipLink || focusable > 10
      ? "good"
      : focusable > 0
        ? "warning"
        : "critical";
  checks.push(
    makeCheck({
      id: "accessibility_keyboard_nav",
      category: "Accessibilité",
      label: "Navigation clavier",
      status: keyboardStatus,
      score:
        keyboardStatus === "good"
          ? 95
          : keyboardStatus === "warning"
            ? 60
            : 25,
      explanation: hasSkipLink
        ? "Lien d’évitement détecté."
        : focusable
          ? `${focusable} éléments focalisables détectés, pas de skip link identifié.`
          : "Navigation clavier non détectée.",
      howToFix:
        "Ajouter un lien d’évitement (#main), gérer les focus visibles et éviter tabindex négatif.",
    }),
  );

  // LIENS
  const internalStatus =
    linkSets.internal.length >= 3
      ? "good"
      : linkSets.internal.length > 0
        ? "warning"
        : "critical";
  checks.push(
    makeCheck({
      id: "links_internal",
      category: "Liens",
      label: "Liens internes",
      status: internalStatus,
      score:
        internalStatus === "good"
          ? 100
          : internalStatus === "warning"
            ? 60
            : 20,
      explanation: `${linkSets.internal.length} lien(s) interne(s) détecté(s).`,
      howToFix:
        "Ajouter des liens internes contextuels vers les pages piliers et mailler depuis le contenu principal.",
    }),
  );

  const brokenRatio =
    externalHealth.sampled > 0
      ? externalHealth.broken / externalHealth.sampled
      : 0;
  const externalStatus =
    externalHealth.sampled === 0
      ? "warning"
      : brokenRatio === 0
        ? "good"
        : brokenRatio <= 0.3
          ? "warning"
          : "critical";
  checks.push(
    makeCheck({
      id: "links_external",
      category: "Liens",
      label: "Liens externes",
      status: externalStatus,
      score:
        externalStatus === "good"
          ? 95
          : externalStatus === "warning"
            ? 60
            : 25,
      explanation:
        externalHealth.sampled === 0
          ? "Pas de liens externes échantillonnés."
          : `${externalHealth.broken}/${externalHealth.sampled} liens testés renvoient une erreur.`,
      howToFix:
        "Mettre à jour ou retirer les liens cassés, préférer des ressources HTTPS fiables.",
    }),
  );

  // INTERNATIONAL
  let hreflangStatus: CheckStatus = "good";
  let hreflangExplanation = "Aucun hreflang détecté (OK pour site monolingue).";
  let hreflangScore = 95;
  if (hreflangs.length) {
    const invalid = hreflangs.filter((node) => {
      const code = $(node).attr("hreflang") || "";
      const href = $(node).attr("href") || "";
      const absolute = toAbsoluteUrl(href, normalizedUrl);
      return !hreflangPattern.test(code) || !absolute;
    });
    const missingDefault = !hreflangs.some(
      (node) => ($(node).attr("hreflang") || "").toLowerCase() === "x-default",
    );
    if (invalid.length) {
      hreflangStatus = "critical";
      hreflangScore = 25;
      hreflangExplanation = `${invalid.length} hreflang invalide(s) ou sans URL absolue.`;
    } else if (missingDefault) {
      hreflangStatus = "warning";
      hreflangScore = 60;
      hreflangExplanation =
        "Hreflang présent mais x-default absent. Ajouter une version par défaut.";
    } else {
      hreflangStatus = "good";
      hreflangScore = 95;
      hreflangExplanation = `${hreflangs.length} balises hreflang valides.`;
    }
  }
  checks.push(
    makeCheck({
      id: "international_hreflang",
      category: "International",
      label: "Hreflang cohérent",
      status: hreflangStatus,
      score: hreflangScore,
      explanation: hreflangExplanation,
      howToFix:
        "Déclarer des hreflang par locale avec URL absolue + x-default. Vérifier cohérence avec la canonical.",
    }),
  );

  // TECHNIQUE
  const readableUrl = isReadableUrl(normalizedUrl);
  checks.push(
    makeCheck({
      id: "technical_url_readable",
      category: "Technique",
      label: "URL lisible",
      status: readableUrl ? "good" : "warning",
      score: readableUrl ? 95 : 55,
      explanation: readableUrl
        ? "URL courte et descriptive."
        : "URL contient des paramètres ou segments longs.",
      howToFix:
        "Simplifier l’URL (kebab-case), supprimer les paramètres inutiles et éviter les identifiants opaques.",
    }),
  );

  checks.push(
    makeCheck({
      id: "technical_doctype",
      category: "Technique",
      label: "Doctype HTML5",
      status: doctypeOk ? "good" : "critical",
      score: doctypeOk ? 100 : 25,
      explanation: doctypeOk
        ? "Doctype HTML5 détecté."
        : "Doctype manquant ou non HTML5.",
      howToFix:
        "Commencer le document par <!doctype html> pour un rendu standard.",
    }),
  );

  const encodingStatus = charset
    ? /utf-?8/i.test(charset)
      ? "good"
      : "warning"
    : "critical";
  checks.push(
    makeCheck({
      id: "technical_encoding",
      category: "Technique",
      label: "Encodage UTF-8",
      status: encodingStatus as CheckStatus,
      score:
        encodingStatus === "good"
          ? 100
          : encodingStatus === "warning"
            ? 60
            : 25,
      explanation: charset
        ? `charset détecté: ${charset}.`
        : "Aucun charset détecté.",
      howToFix:
        'Ajouter <meta charset="utf-8"> ou charset=utf-8 dans l’en-tête HTTP.',
    }),
  );

  const orderedChecks = checks.sort((a, b) => {
    const categoryIndexA = CATEGORY_ORDER.indexOf(a.category);
    const categoryIndexB = CATEGORY_ORDER.indexOf(b.category);
    if (categoryIndexA === categoryIndexB) {
      return (CHECK_WEIGHTS[b.id] ?? 0) - (CHECK_WEIGHTS[a.id] ?? 0);
    }
    return categoryIndexA - categoryIndexB;
  });

  return { checks: orderedChecks, sampledRequests };
}
