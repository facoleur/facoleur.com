"use client";

import { CallBanner } from "@/components/CallBanner";
import { AuditUnlockForm } from "@/components/free-audit/AuditUnlockForm";
import { Button } from "@/components/ui/button";
import { CATEGORY_ORDER } from "@/lib/seo/constants";
import type { AuditCheck, AuditResult, CheckCategory } from "@/lib/seo/types";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type StatusColor = "good" | "warning" | "critical";

const STATUS_STYLES: Record<StatusColor, string> = {
  good: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-700",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const statusFromScore = (score: number): StatusColor => {
  if (score >= 85) return "good";
  if (score >= 65) return "warning";
  return "critical";
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const groupByCategory = (checks: AuditCheck[]) => {
  const groups = new Map<CheckCategory, AuditCheck[]>();
  checks.forEach((check) => {
    if (!groups.has(check.category)) {
      groups.set(check.category, []);
    }
    groups.get(check.category)!.push(check);
  });
  return Array.from(groups.entries()).sort(
    ([categoryA], [categoryB]) =>
      CATEGORY_ORDER.indexOf(categoryA) - CATEGORY_ORDER.indexOf(categoryB),
  );
};

export default function ToolsPage() {
  const t = useTranslations();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockSubmitting, setUnlockSubmitting] = useState(false);

  const groupedChecks = useMemo(() => {
    if (!result) return [];
    return groupByCategory(result.checks);
  }, [result]);

  const overallStatus: StatusColor = result
    ? statusFromScore(result.score)
    : "warning";

  const splitChecks = useMemo(() => {
    if (!result) return { visible: [], locked: [] };
    const visibleCount = Math.max(1, Math.ceil(result.checks.length * 0.25));
    return {
      visible: result.checks.slice(0, visibleCount),
      locked: result.checks.slice(visibleCount),
    };
  }, [result]);

  const statusCounts = useMemo(() => {
    const base: Record<StatusColor, number> = {
      good: 0,
      warning: 0,
      critical: 0,
    };
    if (!result) return base;
    result.checks.forEach((check) => {
      base[check.status] += 1;
    });
    return base;
  }, [result]);

  const actionPlan = useMemo(() => {
    if (!result) return [];
    const priority: Record<StatusColor, number> = {
      critical: 0,
      warning: 1,
      good: 2,
    };
    return result.checks
      .filter((check) => check.status !== "good")
      .sort((a, b) => {
        if (priority[a.status] !== priority[b.status]) {
          return priority[a.status] - priority[b.status];
        }
        return a.score - b.score;
      })
      .slice(0, 5);
  }, [result]);

  const runAudit = async (targetUrl: string) => {
    setLoading(true);
    setError(null);
    setUnlocked(false);
    setUnlockError(null);
    try {
      const response = await fetch("/api/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec du scan.");
      }
      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur inconnue pendant l’audit.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url) {
      setError("Merci de saisir une URL.");
      return;
    }
    await runAudit(url);
  };

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "seo-audit.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleUnlock = async () => {
    setUnlockError(null);

    if (unlockSubmitting) return;

    if (!result) {
      setUnlockError("Merci de lancer un audit avant de déverrouiller.");
      return;
    }

    const normalizedEmail = email.trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setUnlockError("Email invalide. Exemple: prenom@domaine.com");
      return;
    }

    try {
      setUnlockSubmitting(true);

      const response = await fetch("/api/audit-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          auditedSite: result.normalizedUrl,
          auditScore: result.score,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          (data as { error?: string }).error ||
          "Impossible d’enregistrer cet email.";
        throw new Error(message);
      }

      setUnlocked(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Impossible de déverrouiller.";
      setUnlockError(message);
    } finally {
      setUnlockSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mb-16 w-3/4 space-y-6 text-center">
      <h1 className="font-medium">
        Correctifs SEO que vous pouvez appliquer aujourd&apos;hui
      </h1>
      <p className="text-slate-500">
        Collez votre URL et obtenez en quelques secondes une liste prioritaire
        des problèmes SEO ayant un impact important.
      </p>

      <section className="mx-auto flex gap-1">
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex w-full flex-row justify-between rounded-xl border border-slate-300 bg-white p-2 pl-4 text-base text-slate-900 ring-2 ring-transparent transition outline-none focus:border-slate-400 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-800"
        >
          <input
            required
            placeholder="exemple.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
          />
          <Button type="submit" disabled={loading} className="!h-10 shrink-0">
            {loading ? "Scan en cours..." : "Lancer l’audit"}
          </Button>
        </form>
        {error ? (
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        ) : null}
      </section>

      {result ? (
        <section className="space-y-6">
          <div className="grid gap-1 md:grid-cols-3">
            {/* chart and summary  */}
            <div className="flex flex-col justify-between gap-3 border border-slate-200 bg-white p-4 md:col-span-2 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Score global
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-semibold text-slate-900 dark:text-slate-100">
                      {result.score}
                    </span>
                    <span className="text-sm text-slate-500">/100</span>
                  </div>
                </div>
                <div
                  className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[overallStatus]}`}
                >
                  {overallStatus === "good"
                    ? "Sain"
                    : overallStatus === "warning"
                      ? "À améliorer"
                      : "Critique"}
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={`h-3 rounded-full transition-all ${STATUS_STYLES[overallStatus]}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <div className="rounded-sm bg-emerald-50 px-2 py-1 text-emerald-800 dark:bg-emerald-900/30">
                  OK: {statusCounts.good}
                </div>
                <div className="rounded-sm bg-amber-50 px-2 py-1 text-amber-800 dark:bg-amber-900/30">
                  Alertes: {statusCounts.warning}
                </div>
                <div className="rounded-sm bg-red-50 px-2 py-1 text-red-800 dark:bg-red-900/30">
                  Critiques: {statusCounts.critical}
                </div>
              </div>
              <a
                href={result.normalizedUrl}
                target="_blank"
                rel="noreferrer"
                className="!text-xs font-semibold text-slate-700 underline decoration-dotted underline-offset-2 transition hover:text-slate-900 dark:text-slate-100 dark:hover:text-white"
              >
                {result.normalizedUrl}
              </a>
            </div>

            {/* quick stats */}
            <div className="flex flex-col gap-2 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Statistiques rapides
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportJson}
                  className="text-xs"
                >
                  Exporter JSON
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <Stat
                  label="HTML"
                  value={formatBytes(result.stats.htmlBytes)}
                />
                <Stat label="Scripts" value={`${result.stats.scriptCount}`} />
                <Stat label="Images" value={`${result.stats.imageCount}`} />
                <Stat
                  label="Échantillons"
                  value={`${result.stats.sampledRequests}`}
                />
                <Stat
                  label="robots.txt"
                  value={result.stats.robotsAccessible ? "OK" : "Absent"}
                />
                <Stat
                  label="Sitemap"
                  value={result.stats.sitemapUrl ? "Détecté" : "Non trouvé"}
                />
              </div>
            </div>
          </div>

          {/* plan action unlocked */}
          {unlocked ? (
            <section className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="!m-0 text-xl font-semibold text-slate-900 dark:text-slate-50">
                    Plan d’action prioritaire
                  </h2>
                  <p className="text-left text-sm text-slate-500">
                    Top 5 des actions concrètes avant le détail.
                  </p>
                </div>
                <span className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Basé sur l’audit complet
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {actionPlan.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-200">
                    Aucun blocage prioritaire détecté sur l’audit complet.
                  </p>
                ) : (
                  actionPlan.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1 border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="!text-md !text-left font-semibold text-slate-900 dark:text-slate-50">
                          {item.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[item.status]}`}
                        >
                          {item.status === "critical" ? "Critique" : "Alerte"}
                        </span>
                      </div>
                      <p className="!m-0 !text-left text-slate-700 dark:text-slate-200">
                        {item.explanation}
                      </p>
                      <p className="!m-0 !text-left text-slate-900 dark:text-slate-100">
                        <span className="!text-left font-semibold">
                          Action:
                        </span>{" "}
                        {item.howToFix}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          ) : (
            /* plan action locked */
            <section className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="!m-0 text-xl font-semibold text-slate-900 dark:text-slate-50">
                    Plan d’action prioritaire
                  </h2>
                </div>
              </div>

              <div className="relative dark:border-slate-800">
                {/* email capture form (action plan) */}
                <div className="sticky top-20 z-30 flex flex-col items-center gap-3 p-6 text-center">
                  <p className="!text-md !mb-0 text-slate-900 dark:text-slate-50">
                    Consultez les actions prioritaires à fort impact identifiées
                    pour votre site.
                  </p>

                  <AuditUnlockForm
                    email={email}
                    onEmailChange={setEmail}
                    onSubmit={handleUnlock}
                    buttonLabel="Accéder aux actions prioritaires"
                    error={unlockError}
                    disabled={unlockSubmitting}
                  />
                </div>

                {/* action plan blurred */}
                <div className="pointer-events-none mt-[-6rem] space-y-2 blur-md select-none">
                  {actionPlan.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-200">
                      Aucun blocage prioritaire détecté sur l’audit complet.
                    </p>
                  ) : (
                    actionPlan.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-1 border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-50">
                            {item.label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[item.status]}`}
                          >
                            {item.status === "critical" ? "Critique" : "Alerte"}
                          </span>
                        </div>
                        <p className="!m-0 text-slate-700 dark:text-slate-200">
                          {item.explanation}
                        </p>
                        <p className="!m-0 text-slate-900 dark:text-slate-100">
                          <span className="font-semibold">Action:</span>{" "}
                          {item.howToFix}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          <div className="grid gap-1">
            {/* unlocked checks */}
            {(unlocked
              ? groupedChecks
              : groupByCategory(splitChecks.visible)
            ).map(([category, checks]) => (
              <CategoryBlock
                key={category}
                category={category}
                checks={checks}
              />
            ))}

            {!unlocked && splitChecks.locked.length ? (
              <div className="relative dark:border-slate-800">
                {/* email capture form (checks) */}
                <div className="sticky top-20 z-30 flex flex-col items-center gap-3 p-6 text-center">
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    75% de l’audit sont masqués. Débloque tout en laissant ton
                    email.
                  </p>

                  <AuditUnlockForm
                    email={email}
                    onEmailChange={setEmail}
                    onSubmit={handleUnlock}
                    buttonLabel="Déverrouiller l’audit complet"
                    error={unlockError}
                    helperText="Aucun spam. Email utilisé uniquement pour délivrer le reste de l’audit."
                    disabled={unlockSubmitting}
                  />
                </div>

                {/* blured checks */}
                <div className="pointer-events-none mt-[-10rem] blur-md select-none">
                  {groupByCategory(splitChecks.locked).map(
                    ([category, checks]) => (
                      <CategoryBlock
                        key={category}
                        category={category}
                        checks={checks}
                      />
                    ),
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <CallBanner
            title={t("homepage.cta1.title")}
            subtitle={t("homepage.cta1.subtitle")}
            buttonLabel={t("homepage.cta1.button")}
          />
        </section>
      ) : null}
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-slate-100 px-3 py-2 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
    <p className="text-xs tracking-[0.1em] text-slate-500 uppercase">{label}</p>
    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
      {value}
    </p>
  </div>
);

const CategoryBlock = ({
  category,
  checks,
}: {
  category: CheckCategory;
  checks: AuditCheck[];
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const categoryScore = checks.length
    ? Math.round(
        checks.reduce((sum, check) => sum + check.score, 0) / checks.length,
      )
    : 0;

  return (
    <section className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="mb-3 flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={isOpen}
      >
        <h2 className="!m-0 !text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {category}
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            Score {categoryScore}/100
          </span>
          <span className="rounded-sm bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {isOpen ? "Masquer" : "Afficher"}
          </span>
        </div>
      </button>

      {isOpen ? (
        <div className="space-y-1">
          {checks.map((check) => (
            <article
              key={check.id}
              className="bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-md !m-0 font-semibold text-slate-900 dark:text-slate-100">
                    {check.label}
                  </p>
                  <span
                    className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[check.status]}`}
                  >
                    {check.status === "good"
                      ? "OK"
                      : check.status === "warning"
                        ? "Alerte"
                        : "Critique"}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  Score {check.score}/100
                </div>
              </div>
              <p className="!mb-1 text-left text-sm text-slate-700 dark:text-slate-200">
                {check.explanation}
              </p>
              <div className="mt-2 bg-white p-3 text-left text-sm text-slate-800 dark:text-slate-100">
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  Correctifs:
                </span>{" "}
                {check.howToFix}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};
