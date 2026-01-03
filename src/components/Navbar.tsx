"use client";

import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/MobileMenu";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav: NavLink[] = [
    { label: "Solutions", href: "#solutions" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Ressources gratuites", href: "/blog" },
  ];
  const mobileLinks: NavLink[] = [...nav, { label: "Audit SEO en 1 clic", href: "/free-audit" }];

  return (
    <header
      className={[
        "sticky top-2 z-50 w-full whitespace-nowrap transition-all duration-200",
        scrolled
          ? "border border-slate-300 bg-white/10 backdrop-blur-2xl"
          : "backdrop-blur-0 border-transparent bg-transparent",
      ].join(" ")}
    >
      <nav className="flex items-center justify-between gap-3 p-4">
        <Link
          href="/"
          className="p-2 text-sm font-medium transition-transform duration-75 hover:-translate-y-2"
        >
          Facoleur
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {nav.map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="p-2 text-sm transition-transform duration-75 hover:-translate-y-2"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <Link href="/free-audit">
            <Button>Audit SEO en 1 clic</Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/free-audit">
            <Button size="sm">Audit</Button>
          </Link>
          <MobileMenu links={mobileLinks} />
        </div>
      </nav>
    </header>
  );
};
