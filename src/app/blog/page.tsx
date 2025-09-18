import { Posts } from "@/components/Posts";
import { allPosts } from "contentlayer/generated";
import { useLocale } from "next-intl";

export default function BlogPage() {
  const blogPosts = allPosts.filter((post) => post._type === "blog");

  const locale = useLocale();

  const localeBlogPosts = blogPosts.filter((post) => post.url.endsWith(locale));

  return (
    <main className="prose mx-auto w-full max-w-2xl">
      <Posts publications={localeBlogPosts} />
    </main>
  );
}
