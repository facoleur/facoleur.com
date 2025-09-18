import { MDXRenderer } from "@/components/MDXRenderer";
import { allPosts } from "contentlayer/generated";

export default function Page() {
  const resume = allPosts.find((post) => post._type === "resume");

  if (!resume) throw new Error("Resume not found");

  return (
    <div className="mx-auto max-w-2xl">
      <MDXRenderer content={resume.body.code} />;
    </div>
  );
}
