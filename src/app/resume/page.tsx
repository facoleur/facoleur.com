import { MDXRenderer } from "@/components/MDXRenderer";
import { allPosts } from "contentlayer/generated";
import { useLocale } from "next-intl";

export default function Page() {
  const locale = useLocale();

  const resume = allPosts.find(
    (post) => post._type === "resume" && post.url.endsWith(locale),
  );

  if (!resume) throw new Error("Resume not found");

  return (
    <div className="mx-auto max-w-2xl">
      <MDXRenderer content={resume.body.code} />
    </div>
  );
}
