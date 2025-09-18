import { LocaleToggle } from "@/components/LocaleToggle";
import { MobileMenu } from "@/components/MobileMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslations } from "next-intl";
import Link from "next/link";

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const Navbar = () => {
  const t = useTranslations("nav");

  const leftLinks: NavLink[] = [
    { label: t("work"), href: "/work" },
    { label: t("blog"), href: "/blog" },
    { label: t("resume"), href: "/resume" },
    {
      label: t("github"),
      href: "https://github.com/facoleur",
      external: true,
    },
    {
      label: t("linkedin"),
      href: "https://linkedin.com/in/luca-ferro",
      external: true,
    },
  ];

  return (
    <header>
      <nav className="mx-auto grid w-full grid-cols-3 items-center p-4 px-0 md:px-4">
        <Link
          className="w-fit py-2 !text-center !text-sm font-medium transition-all duration-75 hover:translate-y-1"
          href="/"
        >
          Luca Ferro
        </Link>

        {/* Desktop links */}
        <div className="mx-auto hidden space-x-2 text-slate-700 md:flex dark:text-slate-400">
          {leftLinks.map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="p-2 !text-sm transition-all duration-75 hover:translate-y-1 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop toggles */}
        <div className="hidden items-center justify-end space-x-2 text-slate-700 md:flex dark:text-slate-400">
          <LocaleToggle />
          <ThemeToggle />
        </div>

        {/* Mobile menu trigger */}
        <MobileMenu links={leftLinks} />
      </nav>
    </header>
  );
};
