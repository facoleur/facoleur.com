import { useTranslations } from "next-intl";
import Link from "next/link";

// src/components/Footer.tsx

const Footer = () => {
  const t = useTranslations();

  const resources = [
    {
      label: "AI Search et GEO : Guide complet pour optimiser votre contenu",
      href: "/aisearch",
    },
    {
      label: "Guide de création de contenu pour PME en Suisse",
      href: "/creationcontenu",
    },
    {
      label: "Attirer des clients sans publicité payante avec le SEO local",
      href: "/seolocal",
    },
    {
      label: "Structure d’une landing page qui convertit",
      href: "/structurelanding",
    },
  ];

  const tools = [
    { label: t("footer.tools.auditChecklist"), href: "free-audit" },
  ];

  return (
    <footer className="mt-auto w-full bg-[url('/homepage/bg_footer.png')] bg-[length:100%_auto] px-4 pt-36 text-sm text-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="grid w-full grid-cols-1 gap-6 md:w-2/3 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {t("footer.titles.resources")}
            </h3>
            <ul className="space-y-1 !p-0">
              {resources.map((item, i) => (
                <li
                  key={i}
                  className="!list-none transition-transform duration-75 hover:translate-x-4"
                >
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {t("footer.titles.tools")}
            </h3>
            <ul className="space-y-1 !p-0">
              {tools.map((item) => (
                <li
                  key={item.href}
                  className="!list-none transition-transform duration-75 hover:translate-x-4"
                >
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col pb-4 text-slate-500 md:mt-auto md:!h-full">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
