"use client";

import { Button } from "@/components/ui/button";
import type {
  ContentAuditResult,
  HeadingNode,
  KeywordStat,
} from "@/lib/content-audit/types";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

const formatPercent = (value: number) =>
  Number.isFinite(value) ? `${value.toFixed(2)}%` : "0%";

const summarizeNumbers = (values: number[]) => {
  if (values.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2))
      : sorted[mid];
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    average: Number((sum / values.length).toFixed(2)),
    median,
  };
};

const HeadingTreeList = ({
  nodes,
  depth = 0,
}: {
  nodes: HeadingNode[];
  depth?: number;
}) => (
  <ul className="space-y-2">
    {nodes.map((node, index) => (
      <li
        key={`${node.text}-${node.level}-${depth}-${index}`}
        className="rounded-md border border-slate-200 bg-white/60 px-3 py-2 shadow-sm"
        style={{ marginLeft: depth * 12 }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-800">
            {node.text || "Sans titre"}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{`H${node.level}`}</span>
        </div>
        {node.children.length > 0 ? (
          <div className="mt-2">
            <HeadingTreeList nodes={node.children} depth={depth + 1} />
          </div>
        ) : null}
      </li>
    ))}
  </ul>
);

const KeywordTable = ({
  title,
  data,
}: {
  title: string;
  data: KeywordStat[];
}) => (
  <div className="rounded-lg border border-slate-200 bg-white/70 p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <span className="text-xs uppercase tracking-wide text-slate-500">
        {data.length} entrées
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-slate-700">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="py-1 pr-4 font-medium">Terme</th>
            <th className="py-1 pr-4 font-medium">Occurrences</th>
            <th className="py-1 font-medium">Densité</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.term} className="border-b border-slate-100 last:border-0">
              <td className="py-1 pr-4">{item.term}</td>
              <td className="py-1 pr-4">{item.count}</td>
              <td className="py-1">{formatPercent(item.density)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

export default function ContentAuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContentAuditResult | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    const targetUrl = url.trim();
    if (!targetUrl) {
      setError("Merci d’indiquer une URL d’article.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/content-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec de l’audit.");
      }
      setResult(data as ContentAuditResult);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur inconnue pendant l’audit.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const paragraphSummary = useMemo(() => {
    if (!result) return null;
    return summarizeNumbers(result.readability.paragraphLengthDistribution);
  }, [result]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-12">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-slate-900">
          Audit SEO éditorial
        </h1>
        <p className="max-w-3xl text-base text-slate-600">
          Analyse déterministe des articles pour vérifier la structure, la
          lisibilité et la répartition des mots clés. Aucune IA, uniquement des
          règles mesurables côté serveur.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur md:flex-row md:items-center"
        >
          <input
            type="url"
            name="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/article"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          <Button
            type="submit"
            disabled={loading}
            className="min-w-40 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-2px] hover:bg-slate-800"
          >
            {loading ? "Analyse en cours..." : "Lancer l’audit"}
          </Button>
        </form>
        {error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : null}
      </header>

      {result ? (
        <div className="space-y-6">
          <SectionCard title="Métadonnées">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  URL analysée
                </p>
                <p className="break-words text-sm font-semibold text-slate-900">
                  {result.metadata.url}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Titre de page
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {result.metadata.title}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Langue
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {result.metadata.language || "Non spécifiée"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Date d’analyse
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(result.metadata.fetchedAt).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Volume éditorial
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {result.metadata.totalWordCount} mots
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Phrases détectées
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {result.readability.sentences}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Structure éditoriale">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  H1 détectés
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {result.structure.h1Count}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {result.structure.headings
                    .filter((h) => h.level === 1)
                    .map((h) => (
                      <li key={h.text}>{h.text}</li>
                    ))}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Hiérarchie
                </p>
                <p className="text-sm text-slate-700">
                  {result.structure.headings.length} titres
                </p>
                <p className="text-sm text-slate-700">
                  {result.structure.totalWordCount} mots dans le corps
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Problèmes détectés
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {result.structure.issues.missingH1 ? (
                    <li>H1 manquant</li>
                  ) : null}
                  {result.structure.issues.multipleH1 ? (
                    <li>Plusieurs H1 présents</li>
                  ) : null}
                  {result.structure.issues.skippedLevels.length > 0 ? (
                    result.structure.issues.skippedLevels.map((issue, index) => (
                      <li key={`${issue.text}-${index}`}>
                        Niveau sauté: H{issue.from} → H{issue.to} ({issue.text})
                      </li>
                    ))
                  ) : (
                    <li>Aucun niveau sauté</li>
                  )}
                  {result.structure.issues.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Arborescence des titres
              </h3>
              {result.structure.headingTree.length > 0 ? (
                <HeadingTreeList nodes={result.structure.headingTree} />
              ) : (
                <p className="text-sm text-slate-700">
                  Aucun titre structurant détecté.
                </p>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Découpe par section
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {result.structure.sections.map((section, index) => (
                  <div
                    key={`${section.heading.text}-${section.heading.level}-${index}`}
                    className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {`H${section.heading.level}`}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {section.heading.text}
                        </p>
                      </div>
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {section.wordCount} mots
                      </span>
                    </div>
                    {section.paragraphWordCounts.length > 0 ? (
                      <p className="mt-2 text-xs text-slate-600">
                        Paragraphes: min{" "}
                        {Math.min(...section.paragraphWordCounts)} / max{" "}
                        {Math.max(...section.paragraphWordCounts)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Mots clés">
            <div className="grid gap-4 md:grid-cols-3">
              <KeywordTable
                title="Top unigrams"
                data={result.keywords.topUnigrams}
              />
              <KeywordTable
                title="Top bigrams"
                data={result.keywords.topBigrams}
              />
              <KeywordTable
                title="Top trigrams"
                data={result.keywords.topTrigrams}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Densité des mots clés
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white/60 p-3 shadow-sm">
                <table className="min-w-full text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-1 pr-4 font-medium">Terme</th>
                      <th className="py-1 pr-4 font-medium">Occurrences</th>
                      <th className="py-1 font-medium">Densité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.keywords.density.map((item) => (
                      <tr
                        key={`density-${item.term}`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-1 pr-4">{item.term}</td>
                        <td className="py-1 pr-4">{item.count}</td>
                        <td className="py-1">{formatPercent(item.density)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Répartition par section
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {result.keywords.distribution.map((distribution, index) => (
                  <div
                    key={`${distribution.heading.text}-${distribution.heading.level}-${index}`}
                    className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">
                        {distribution.heading.text}
                      </p>
                      <span className="text-xs text-slate-600">
                        {distribution.totalWords} mots
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {distribution.topKeywords.map((keyword) => (
                        <li key={`${distribution.heading.text}-${keyword.term}`}>
                          {keyword.term} — {keyword.count} (
                          {formatPercent(keyword.density)})
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Lisibilité">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Longueur moyenne des phrases
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {result.readability.averageSentenceLength} mots
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Longueur des paragraphes
                </p>
                {paragraphSummary ? (
                  <div className="text-sm text-slate-800">
                    <p>
                      Médiane: {paragraphSummary.median} mots · Moyenne:{" "}
                      {paragraphSummary.average} mots
                    </p>
                    <p>
                      Min: {paragraphSummary.min} — Max: {paragraphSummary.max}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700">Aucun paragraphe.</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Voix passive (approx.)
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {result.readability.passiveVoice.count}
                </p>
                <p className="text-sm text-slate-700">
                  {formatPercent(result.readability.passiveVoice.ratio)} des
                  phrases
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">
                  Phrases répétées
                </p>
                {result.readability.repeatedPhrases.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {result.readability.repeatedPhrases.map((item) => (
                      <li key={item.phrase}>
                        {item.phrase} — {item.count}x
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-700">
                    Aucune répétition notable.
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">
                  Exemples en voix passive
                </p>
                {result.readability.passiveVoice.examples.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {result.readability.passiveVoice.examples.map((sentence) => (
                      <li key={sentence} className="leading-snug">
                        {sentence}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-700">
                    Aucun exemple identifié.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
