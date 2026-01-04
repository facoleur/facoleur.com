"use client";

import Link from "next/link";
import { useState } from "react";

type NavLink = {
  label: string; // already translated
  href: string;
  external?: boolean;
};

type MobileMenuProps = {
  links: NavLink[];
};

export const MobileMenu = ({ links }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="col-span-2 flex items-center justify-end md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:hover:bg-slate-800"
        >
          {isOpen ? "Fermer" : "Menu"}
        </button>
      </div>

      {isOpen && (
        <div className="fixed top-0 left-0 z-[200] h-screen w-full space-y-2 bg-white px-4 py-4 md:hidden dark:bg-gray-900">
          {links.map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="block rounded-md p-2 !text-lg text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};
