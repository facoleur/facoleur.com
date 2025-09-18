"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

interface FiltersProps {
  allTechnologies: string[];
  selectedTech: string | null;
}

export default function Filters({
  allTechnologies,
  selectedTech,
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = useTranslations("filters");

  const handleFilterChange = (tech: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tech) {
      params.set("tech", tech);
    } else {
      params.delete("tech");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex h-fit flex-col gap-2">
      {
        <div className="mx-[calc(var(--spacing)*-3)] flex flex-wrap items-start px-4 lg:flex-col">
          <button
            onClick={() => handleFilterChange(null)}
            className={`w-fit rounded-xl px-3 py-1 text-left transition-all duration-75 hover:translate-x-3 lg:w-full ${
              !selectedTech && "!text-slate-800 dark:!text-slate-200"
            }`}
          >
            {t("all")}
          </button>
          {allTechnologies.map((tech) => (
            <button
              key={tech}
              onClick={() => handleFilterChange(tech)}
              className={`w-fit rounded-md px-3 py-1 text-left transition-all duration-75 hover:translate-x-3 lg:w-full ${selectedTech === tech && "!text-slate-800 dark:!text-slate-200"}`}
            >
              {tech}
            </button>
          ))}
        </div>
      }
    </div>
  );
}
