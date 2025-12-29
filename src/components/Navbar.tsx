import { useTranslations } from "next-intl";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import Link from "next/link";

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const Navbar = ({ headers }: { headers: ReadonlyHeaders }) => {
  const t = useTranslations("nav");

  const fullUrl = headers.get("x-url") || headers.get("referer") || "";
  const hasFrontend = fullUrl.includes("frontend");

  let nav: NavLink[] = [
    { label: t("blog"), href: "/blog" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
  ];

  if (!hasFrontend) {
    nav = nav.filter((n) => n.href !== "/work");
  }

  return (
    <header className="fixed top-0 left-0 z-100 w-full bg-white/10 !whitespace-nowrap backdrop-blur-2xl">
      <nav className="mx-auto flex h-16 w-1/4 items-center">
        <Link
          href="/"
          className="p-2 px-16 text-sm font-medium transition-all duration-75 hover:translate-y-1"
        >
          Luca Ferro
        </Link>

        <div className="ml-auto flex items-center gap-4">
          {nav.map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="p-2 text-sm transition-all duration-75 hover:translate-y-1 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};
