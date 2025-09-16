// export default function Page() {
//   return <div>Blog Page</div>;
// }
"use client";

import { Posts } from "@/components/Posts";
import { POSTS } from "@/content";

export default function BlogPage() {
  const { data: posts } = usePosts(POSTS);

  if (!posts) return;

  return (
    <main className="prose w-full">
      <Posts publications={posts} />
    </main>
  );
}

import { useQuery } from "@tanstack/react-query";

export type PostMetadata = {
  title: string;
  snippet: string;
  link: string;
  date: string;
  featured?: string;
};

export const usePosts = (slugs: string[]) => {
  return useQuery({
    queryKey: ["posts", slugs],
    queryFn: async () => {
      const posts = await Promise.all(
        slugs.map(async (slug) => {
          const post = await import(`../../content/${slug}.mdx`);
          const metadata = post.metadata as PostMetadata;
          return { slug, metadata };
        }),
      );
      return posts;
    },
  });
};
