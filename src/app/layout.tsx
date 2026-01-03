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
