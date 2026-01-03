import Filters from "@/components/Filters";
import { Posts } from "@/components/Posts";
import { allBlogs } from "contentlayer/generated";
import { useTranslations } from "next-intl";

export default async function Page({
  searchParams,
}: {
  searchParams: { tech?: string };
}) {
  const projects = allBlogs;
  const tech = searchParams.tech;

  return <ContentWithFilters projects={projects} tech={tech} />;
}

export function ContentWithFilters({
  projects,
  tech,
}: {
  projects: typeof allBlogs;
  tech?: string;
}) {
  const t = useTranslations("filters");

  const allTags = Array.from(
    new Set(projects.flatMap((post) => post.tags || [])),
  );

  const filteredProjects = tech
    ? projects.filter((post) => post.tags?.includes(tech))
    : projects;

  return (
    <main className="prose mx-auto grid w-full grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]">
      <div className="sticky top-0 left-0 bg-slate-100 pt-4 lg:h-screen dark:bg-gray-950">
        <Filters
          allMsg={t("all")}
          allTechnologies={allTags}
          selectedTech={tech || null}
        />
      </div>
      <Posts publications={filteredProjects} />
    </main>
  );
}
