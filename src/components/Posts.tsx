import { Post } from "contentlayer/generated";
import { getLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export const Posts = async ({ publications }: { publications: Post[] }) => {
  const sortedPosts = [...publications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const locale = await getLocale();

  return (
    <>
      <div className="flex flex-col gap-6 sm:gap-0">
        {sortedPosts.map((post, index) => (
          <Link
            key={index}
            href={post.url.slice(0, -3)}
            className="light:hover:bg-white ml-[calc(var(--spacing)*-2)] flex h-fit flex-col items-start gap-1 rounded-lg p-2 transition-all duration-75 hover:translate-x-3 hover:bg-white sm:flex-row sm:items-center sm:gap-4 dark:hover:bg-gray-900"
          >
            {post.featured && (
              <Image
                src={post.featured}
                alt={post.title}
                width={200}
                height={200}
                className="h-56 w-full rounded object-cover sm:h-40 sm:w-52"
              />
            )}
            <div>
              <p className="mt-1 !mb-1 !text-slate-600">
                {new Date(post.date).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h4 className="!mb-1.5">{post.title}</h4>
              <p>{post.snippet}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};
