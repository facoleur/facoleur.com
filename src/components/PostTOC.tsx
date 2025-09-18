"use client";

import React, { useEffect, useMemo, useState } from "react";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function extractTocFromMdx(code: string): TocItem[] {
  const lines = code.split("\n");
  const toc: TocItem[] = [];
  const headingRegex = /^(#{2,4})\s+(.*)/;
  for (const line of lines) {
    const match = line.match(headingRegex);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w]+/g, "-")
        .replace(/^-+|-+$/g, "");
      toc.push({ id, text, level });
    }
  }
  return toc;
}

export const PostToc: React.FC<{ code: string }> = ({ code }) => {
  const toc = useMemo(() => extractTocFromMdx(code), [code]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: [0, 1.0] }, // tweak offset
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <nav className="mb-4">
      <ul className="flex flex-col gap-0.5">
        {toc.map((item) => (
          <a
            style={{ marginLeft: (item.level - 2) * 12 }}
            key={item.id}
            href={`#${item.id}`}
            className={`w-full py-1 !text-sm !leading-[1.4] text-slate-600 transition-all duration-75 hover:translate-x-3 dark:text-slate-400 ${
              activeId === item.id
                ? "font-medium !text-slate-800 dark:!text-slate-200"
                : ""
            }`}
          >
            {item.text}
          </a>
        ))}
      </ul>
    </nav>
  );
};
