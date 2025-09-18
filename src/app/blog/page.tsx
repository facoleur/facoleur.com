import { Posts } from "@/components/Posts";
import { allPosts } from "contentlayer/generated";

export default function BlogPage() {
  const blogPosts = allPosts.filter((post) => post._type === "blog");

  return (
    <main className="prose mx-auto w-full max-w-2xl">
      <Posts publications={blogPosts} />
    </main>
  );
}
