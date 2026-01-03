import type { AuditResult } from "./types";

export const exampleAudit: AuditResult = {
  url: "https://example.com",
  normalizedUrl: "https://example.com",
  fetchedAt: new Date().toISOString(),
  score: 82,
  stats: {
    htmlBytes: 120_000,
    scriptCount: 7,
    imageCount: 8,
    sampledRequests: 6,
    sitemapUrl: "https://example.com/sitemap.xml",
    robotsAccessible: true,
  },
  checks: [
    {
      id: "html_h1_unique",
      category: "HTML & balises",
      label: "H1 unique",
      status: "good",
      score: 100,
      explanation: "Un seul H1 présent et clairement identifié.",
      howToFix: "Garder un seul H1 et dégrader les autres titres en H2/H3.",
    },
    {
      id: "index_canonical",
      category: "Indexation",
      label: "Canonical auto-référent",
      status: "warning",
      score: 65,
      explanation: "La balise canonical pointe vers une variante avec paramètres.",
      howToFix:
        "Définir la canonical sur l’URL propre sans paramètres de tracking.",
    },
    {
      id: "performance_html_size",
      category: "Performance",
      label: "Taille HTML",
      status: "critical",
      score: 25,
      explanation: "Le document dépasse 300ko, ce qui ralentit le rendu.",
      howToFix:
        "Nettoyer le markup, différer les scripts et compresser le HTML.",
    },
  ],
};
