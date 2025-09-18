import { Posts } from "@/components/Posts";
import { allPosts } from "contentlayer/generated";

export default function BlogPage() {
  return (
    <main className="prose w-full mx-auto max-w-2xl">
      <Posts publications={allPosts} />
    </main>
  );
}
