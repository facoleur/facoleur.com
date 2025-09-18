import { Posts } from "@/components/Posts";
import { allPosts } from "contentlayer/generated";
import { BookUser, Braces, FlaskConical, Palette } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();

  const projects = allPosts.filter((post) => post._type === "project");

  return (
    <div className="mx-auto max-w-2xl">
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
              className="flex flex-col gap-2 rounded-md bg-white p-4 dark:bg-gray-900"
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
          <p>{t("rooted.description1")}</p>
          <p>{t("rooted.description2")}</p>
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
