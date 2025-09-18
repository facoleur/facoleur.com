import { MDXRenderer } from "@/components/MDXRenderer";
import PostCard from "@/components/PostCard";
import { PostToc } from "@/components/PostTOC";
import { allPosts, Post } from "contentlayer/generated";
import { useLocale, useTranslations } from "next-intl";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const Page = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const locale = await getLocale();

  const post = allPosts.find((post) => {
    const fileName = post._raw.sourceFileName.replace(/\.mdx?$/, "");
    const contentSlug = fileName.replace(`.${locale}`, "");

    return contentSlug === slug;
  }) as Post;

  if (!post) {
    return notFound();
  }
  return (
    <div className="grid grid-cols-[1fr_2fr_1fr] gap-12">
      <div className="sticky top-0 left-0 h-screen pt-4">
        <PostToc code={post.body.raw} />
      </div>
      <article className="mx-auto max-w-2xl pt-4">
        <div className="flex flex-col gap-2 !text-sm">
          <div className="flex flex-row items-center justify-between gap-2">
            <p className="!mb-0 !leading-none">
              {new Date(post.date).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="flex flex-row gap-1">
              {post.technologies &&
                post.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-slate-200 px-[4px] py-[1px] text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  >
                    {tech}
                  </span>
                ))}
            </div>
          </div>
          <h1 className="mb-8">{post.title}</h1>
        </div>
        <MDXRenderer content={post.body.code} />
        <SuggestedPosts type={post._type} />
      </article>
    </div>
  );
};

const SuggestedPosts = ({ type }: { type?: string }) => {
  const locale = useLocale();

  const localePost = allPosts.filter((post) => post.url.endsWith(locale));

  const post1 = localePost
    .filter((post) => !type || post._type === type)
    .sort(() => 0.5 - Math.random())
    .slice(0, 1);

  const post2 = localePost
    .filter((post) => !type || post._type === type)
    .filter((post) => post._id !== post1[0]._id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 1);

  const t = useTranslations();

  return (
    <div className="mt-20 flex flex-col">
      <h3 className="mt-12 mb-6">{t("suggestedPost")}</h3>
      {[post1[0], post2[0]].map((post) => (
        <PostCard key={post._id} url={post.url.slice(0, -3)} />
      ))}
    </div>
  );
};

export async function generateStaticParams() {
  const slugs = allPosts.map((post) =>
    post._raw.sourceFileName.replace(/\.mdx?$/, ""),
  );
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default Page;
