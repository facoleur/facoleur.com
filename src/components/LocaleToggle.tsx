"use client";

import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/lib/locale";
import { useLocale } from "next-intl";
import { useState } from "react";

function LocaleToggle() {
  const [locale, setLocale] = useState<"en" | "fr">(useLocale() as Locale);

  const changeLanguage = (value: Locale) => {
    setUserLocale(value);
    setLocale(value);
  };

  return (
    <button
      className="m-0 cursor-pointer p-2 !text-sm transition-all duration-75 hover:!translate-y-1 hover:text-slate-800 dark:hover:text-slate-200"
      onClick={() => changeLanguage(locale === "fr" ? "en" : "fr")}
    >
      {locale === "en" ? "Fr" : "En"}
    </button>
  );
}

export { LocaleToggle };
