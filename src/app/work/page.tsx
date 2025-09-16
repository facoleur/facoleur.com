"use client";

import { usePosts } from "@/app/blog/page";
import { Posts } from "@/components/Posts";
import { PROJECTS } from "@/content";

export default function BlogPage() {
  const { data: projects } = usePosts(PROJECTS);
  console.log(projects);

  if (!projects) return;

  return (
    <main className="prose w-full">
      <Posts
        publications={projects}
        title={"work.title"}
        description={"work.description"}
      />
    </main>
  );
}

