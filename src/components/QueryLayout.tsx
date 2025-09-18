"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";

export const Providers = ({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) => {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider locale={locale} onError={() => {}}>
        <div>{children}</div>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
};
