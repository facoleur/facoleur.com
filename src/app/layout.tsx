import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/QueryLayout";
import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Agence CRO & SEO | Optimisez le trafic et les conversions | facoleur.com",
  description:
    "Facoleur.com est une agence SEO et CRO en Suisse romande, spécialisée en création de contenu SEO et sites web performants orientés conversion.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_CH",
    url: "https://example.ch",
    siteName: "Agence CRO & SEO Suisse",
    title: "Agence CRO & SEO pour PME en Suisse",
    description:
      "Optimisation SEO, CRO et AI search. Plus de visibilité, plus de conversions, plus de clients.",
    images: [
      {
        url: "https://example.ch/og/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Agence CRO et SEO pour PME en Suisse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agence CRO & SEO pour PME en Suisse",
    description: "SEO, CRO et AI search pour générer des leads et des ventes.",
    images: ["https://example.ch/og/og-home.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-slate-100 bg-[url('/homepage/bg.png')] bg-[length:100%_auto] bg-no-repeat filter dark:bg-gray-950"
    >
      <body className={`${inter.className} antialiased`}>
        <Providers locale={locale} messages={messages}>
          <div className="min-h-screen bg-[url('/homepage/bg.png')] bg-[length:100%_auto] bg-no-repeat">
            <div className="mx-auto flex max-w-5xl flex-1 flex-col gap-12 px-4 md:px-0">
              <Navbar />
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
