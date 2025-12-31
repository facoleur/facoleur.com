"use client";

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
    { label: "Blog SEO", href: "/blog" },
    { label: "Tarifs", href: "#pricing" },
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={[
        "sticky top-2 z-50 w-full whitespace-nowrap transition-all duration-200",
        scrolled
          ? "border border-slate-300 bg-white/10 backdrop-blur-2xl"
          : "backdrop-blur-0 border-transparent bg-transparent",
      ].join(" ")}
    >
      <nav className="flex justify-between p-4">
        <Link href="/" className="p-2 text-sm font-medium">
          Luca Ferro
        </Link>

        <div className="flex gap-2">
          {nav.map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="p-2 text-sm"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};
