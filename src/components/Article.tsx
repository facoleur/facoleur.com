import { MDXRenderer } from "@/components/MDXRenderer";
import { PostToc } from "@/components/PostTOC";
import { Blog } from "contentlayer/generated";
import { useLocale } from "next-intl";

export const Article = ({ post }: { post: Blog }) => {
  const locale = useLocale();

  return (
    <div className="grid grid-cols-[1fr_3fr] gap-0 sm:gap-12">
      <div className="invisible w-0 sm:visible sm:w-fit">
        <div className="sticky top-20 left-0 h-screen pt-4">
          <PostToc code={post.body.raw} />
        </div>
      </div>
      <article className="mx-auto max-w-2xl pt-4">
        <div className="flex flex-col gap-2 !text-sm">
          <div className="flex flex-row items-center justify-between gap-2">
            <p className="!mb-0 !leading-none">
              {new Date(post.publishedAt).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="flex flex-row gap-1">
              {post.tags &&
                post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white px-[4px] py-[1px] text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
          <h1 className="mt-6 mb-12">{post.title}</h1>
        </div>
        <MDXRenderer content={post.body.code} />
      </article>
    </div>
  );
};
