import Link from "next/link";

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

const links: NavLink[] = [
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
  {
    label: "Onchain",
    href: "https://debank.com/profile/0x3e184af75c982e16eeaf97c9a66cc607d8966f2d?chain=base",
  },
  { label: "GitHub", href: "https://github.com/facoleur", external: true },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/luca-ferro",
    external: true,
  },
];

const Navbar = () => (
  <header>
    <nav className="mx-auto flex items-center justify-between py-4">
      <Link className="!text-sm" href="/">
        Luca Ferro
      </Link>
      <div className="flex space-x-8 text-gray-700">
        {links.map(({ label, href, external }) => (
          <Link
            key={label}
            href={href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="!text-sm hover:text-blue-600"
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  </header>
);

export default Navbar;
