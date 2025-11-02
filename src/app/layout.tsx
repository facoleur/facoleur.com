import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/QueryLayout";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luca Ferro",
  description:
    "Personal website of Luca Ferro, a UX/UI designer and frontend developer.",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-slate-100 dark:bg-gray-950"
    >
      <body className={`${inter.className} antialiased`}>
        <Providers locale={locale}>
          <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 md:px-0">
            <Navbar headers={await headers()} />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
