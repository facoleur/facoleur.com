import { MDXRenderer } from "@/components/MDXRenderer";
import { allLegals } from "contentlayer/generated";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Politique de confidentialité - Facoleur",
  description:
    "Politique de confidentialité détaillant comment nous collectons, utilisons et protégeons vos données personnelles.",
};

export default async function Page() {
  console.log(allLegals);

  const post = allLegals.find((post) => {
    const fileName = post._raw.sourceFileName.replace(/\.mdx?$/, "");

    return fileName.startsWith("terms");
  });

  if (!post) {
    return notFound();
  }

  return (
    <article className="mx-auto max-w-3xl pt-4">
      <div className="flex flex-col gap-2 !text-sm">
        <div className="flex flex-row items-center justify-between gap-2">
          <p className="!mb-0 !leading-none"></p>
          <div className="flex flex-row gap-1"></div>
        </div>
        <h1 className="mt-6 mb-12">{post.title}</h1>
      </div>
      <MDXRenderer content={post.body.code} />
    </article>
  );
}
