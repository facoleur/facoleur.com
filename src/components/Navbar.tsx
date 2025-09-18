"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

const leftLinks: NavLink[] = [
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
];

const rightLinks: NavLink[] = [
  { label: "GitHub", href: "https://github.com/facoleur", external: true },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/luca-ferro",
    external: true,
  },
];

const Navbar = () => {
  return (
    <header>
      <nav className="mx-auto grid w-full grid-cols-3 p-4">
        {/* Brand / Home */}
        <Link className="!text-sm font-semibold" href="/">
          Luca Ferro
        </Link>

        {/* Left links */}
        <div className="mx-auto flex space-x-6 text-slate-700 dark:text-slate-400">
          {leftLinks.map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="!text-sm transition-all duration-75 hover:translate-y-1 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right links + theme toggle */}
        <div className="sticky top-0 right-0 flex items-center justify-end space-x-6 text-slate-700 dark:text-slate-400">
          {rightLinks.map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="!text-sm transition-all duration-75 hover:translate-y-1 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      className="!text-sm transition-all duration-75 hover:translate-y-1 hover:text-slate-800 dark:hover:text-slate-200"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
