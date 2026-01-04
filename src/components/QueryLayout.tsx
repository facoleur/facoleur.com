"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";

export const Providers = ({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}) => {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={() => {}}
    >
      <div>{children}</div>
    </NextIntlClientProvider>
  );
};
