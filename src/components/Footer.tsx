import { useTranslations } from "next-intl";

// src/components/Footer.tsx

const Footer = () => {
  const t = useTranslations();

  const resources = t
    .raw("footer.resources")
    .map((item: { label: string; href: string }) => item);

  const tools = [
    { label: t("footer.tools.roiCalculator"), href: "/tools/roi" },
    { label: t("footer.tools.auditChecklist"), href: "/tools/audit" },
  ];

  return (
    <footer className="mt-[-16rem] w-full bg-[url('/homepage/bg_footer.png')] bg-[length:100%_auto] pt-96 pb-12 text-sm text-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="grid w-2/3 grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {t("footer.titles.resources")}
            </h3>
            <ul className="space-y-1 !p-0">
              {
                // @ts-expect-error suppress any warning
                resources.map((item, i) => (
                  <li key={i} className="!list-none">
                    <a
                      className="!list-none transition-colors hover:text-slate-900 dark:hover:text-white"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  </li>
                ))
              }
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {t("footer.titles.tools")}
            </h3>
            <ul className="space-y-1 !p-0">
              {tools.map((item) => (
                <li key={item.href} className="!list-none">
                  <a
                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="whitespace-nowrap text-slate-500 dark:text-slate-400">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
