// components/PostCard.tsx
import { allPosts } from "contentlayer/generated";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

type Post = {
  title: string;
  description?: string;
  date?: string;
  url: string;
};

export default function PostCard({ url }: { url: string }) {
  const locale = useLocale();

  const post = allPosts.find((p) => p.url === `${url}.${locale}`);

  if (!post) {
    return null;
  }

  return (
    <Link href={post.url.slice(0, -3)} className="block">
      <div className="mb-4 rounded-lg bg-white transition-all duration-75 hover:translate-x-3 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 p-2 md:flex-row">
          {post.featured && (
            <Image
              src={post.featured}
              alt={post.title}
              width={100}
              height={80}
              className="h-20 w-28 rounded-sm"
            />
          )}
          <div className="flex flex-col gap-0">
            <p className="!mb-0 !text-xs text-slate-600">
              {new Date(post.date).toLocaleDateString()}
            </p>
            <h2 className="mb-2 !text-lg font-medium">{post.title}</h2>
          </div>
        </div>
      </div>
    </Link>
  );
}
