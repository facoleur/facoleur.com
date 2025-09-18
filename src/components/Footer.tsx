import React from "react";

const Footer: React.FC = () => (
  <footer className="h-20 w-full p-4 text-sm text-slate-600 dark:text-slate-400">
    © {new Date().getFullYear()} Luca Ferro
  </footer>
);

export default Footer;
