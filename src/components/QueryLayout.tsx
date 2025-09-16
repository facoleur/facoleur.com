"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";

export const QueryLayout = ({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) => {
  const queryClient = new QueryClient();

  return (
    <NextIntlClientProvider locale={locale} onError={() => {}}>
      <QueryClientProvider client={queryClient}>
        <div>{children}</div>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
};
