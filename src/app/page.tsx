import { MDXRenderer } from "@/components/MDXRenderer";
import { Posts } from "@/components/Posts";
import { meComponents } from "@/mdx-components";
import { allPosts } from "contentlayer/generated";
import { Code, Database, SplinePointer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export default function Home() {
  const t = useTranslations();

  const locale = useLocale();

  const featured = [
    "athena",
    "themis",
    "swapbox-dapp",
    "mipasa",
    "alpesvivantes",
    "coaching",
  ];

  const featuredProjects = allPosts.filter(
    (post) =>
      post._type === "project" &&
      featured.includes(post._raw.sourceFileName.split(".")[0]) &&
      post.url.endsWith(locale),
  );

  featuredProjects.sort(
    (a, b) =>
      featured.indexOf(a._raw.sourceFileName.split(".")[0]) -
      featured.indexOf(b._raw.sourceFileName.split(".")[0]),
  );

  const me = allPosts.find(
    (post) => post.title === "me" && post.url.endsWith(locale),
  );

  return (
    <>
      <div className="grid sm:grid-cols-[1fr_2fr_1fr]">
        <div></div>
        <div className="space-y-24">
          <div>
            <h2 className="!font-normal">{t("rooted")}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { key: "uxuiDesign", Icon: SplinePointer },
              { key: "frontendDev", Icon: Code },
              { key: "data", Icon: Database },
            ].map(({ key, Icon }) => (
              <div key={key} className="flex flex-col gap-2">
                <Icon className="h-5 w-5 text-slate-600" />
                <h4 className="!m-0 text-lg font-semibold">
                  {t(`home.whatIDo.${key}.title`)}
                </h4>
                <p className="!m-0 text-sm text-gray-600">
                  {t(`home.whatIDo.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
            <div>
              {me && (
                <MDXRenderer content={me.body.code} components={meComponents} />
              )}
            </div>

            <Image
              width={800}
              height={800}
              src="/assets/me.jpg"
              alt="me"
              className="w-full rounded-lg"
            />
          </div>
          <div>
            <h3>{t("projects.title")}</h3>
            <Posts publications={featuredProjects} />
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
}
