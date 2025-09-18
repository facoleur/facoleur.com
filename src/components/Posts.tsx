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
      <div className="grid gap-1">
        {sortedPosts.map((post, index) => (
          <Link
            key={index}
            href={post.url}
            className="light:hover:bg-white flex items-center gap-4 rounded-lg p-2 transition-all duration-75 hover:translate-x-3 hover:bg-white dark:hover:bg-gray-900"
          >
            {post.featured && (
              <Image
                src={post.featured}
                alt={post.title}
                width={200}
                height={200}
                className="h-40 w-52 rounded object-cover"
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
