import Filters from "@/components/Filters";
import { Posts } from "@/components/Posts";
import { allPosts } from "contentlayer/generated";
import { useLocale, useTranslations } from "next-intl";

function WorkContent({
  projects,
  tech,
}: {
  projects: typeof allPosts;
  tech?: string;
}) {
  const t = useTranslations("filters");
  const locale = useLocale();

  const localeProjects = projects.filter((post) => post.url.endsWith(locale));

  const allTechnologies = Array.from(
    new Set(localeProjects.flatMap((post) => post.technologies || [])),
  );

  const filteredProjects = tech
    ? localeProjects.filter((post) => post.technologies?.includes(tech))
    : localeProjects;

  return (
    <main className="prose mx-auto grid w-full grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]">
      <div className="sticky top-0 left-0 bg-slate-100 pt-4 lg:h-screen dark:bg-gray-950">
        <Filters
          allMsg={t("all")}
          allTechnologies={allTechnologies}
          selectedTech={tech || null}
        />
      </div>
      <Posts publications={filteredProjects} />
    </main>
  );
}

export default async function Work({
  searchParams,
}: {
  searchParams: { tech?: string };
}) {
  const projects = allPosts.filter((post) => post._type === "project");
  const tech = searchParams.tech;

  return <WorkContent projects={projects} tech={tech} />;
}
