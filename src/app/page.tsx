"use client";

import { Posts } from "@/components/Posts";
import { PROJECTS } from "@/content/index";
import { useQuery } from "@tanstack/react-query";
import { BookUser, Braces, FlaskConical, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { getLocale } from "next-intl/server";

export type PostMetadata = {
  title: string;
  snippet: string;
  link: string;
  date: string;
  featured?: string;
};

const usePosts = (slugs: string[]) => {
  return useQuery({
    queryKey: ["posts", slugs],
    queryFn: async () => {
      const locale = await getLocale();

      const posts = await Promise.all(
        slugs.map(async (slug) => {
          const post = await import(`@/content/${slug}.mdx`);
          const metadata = post.metadata as PostMetadata;
          metadata.date = new Date(metadata.date).toLocaleDateString(locale);
          return { slug, metadata };
        }),
      );
      return posts;
    },
  });
};

export default function Home() {
  const t = useTranslations();

  const { data: projects } = usePosts(PROJECTS);

  if (!projects) return;

  return (
    <div className="">
      <h1>{t("home.title")}</h1>

      <div>
        <div className="grid grid-cols-2 gap-1">
          {[
            { key: "userResearch", Icon: BookUser },
            { key: "uxuiDesign", Icon: Palette },
            { key: "frontendDev", Icon: Braces },
            { key: "qa", Icon: FlaskConical },
          ].map(({ key, Icon }) => (
            <div
              key={key}
              className="flex flex-col gap-2 rounded-md bg-white p-4"
            >
              <Icon className="h-6 w-6 text-slate-600" />
              <h4 className="!m-0 text-lg font-semibold">
                {t(`home.whatIDo.${key}.title`)}
              </h4>
              <p className="!m-0 text-sm text-gray-600">
                {t(`home.whatIDo.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>

        <div>
          <h2>{t("rooted.title")}</h2>
          <div>{t("rooted.description1")}</div>
          <div>{t("rooted.description2")}</div>
        </div>

        <img src="/me.png" alt="me" />

        <div>
          <h2>{t("projects.title")}</h2>
          <Posts publications={projects} />
        </div>
      </div>
    </div>
  );
}
