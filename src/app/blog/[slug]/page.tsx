import { Article } from "@/components/Article";
import { allPosts, Post } from "contentlayer/generated";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const Page = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const locale = await getLocale();

  console.log(locale);

  const post = allPosts.find((post) => {
    const fileName = post._raw.sourceFileName.replace(/\.mdx?$/, "");
    const contentSlug = fileName.replace(`.${locale}`, "");

    return contentSlug === slug;
  }) as Post;

  if (!post) {
    return notFound();
  }

  return <Article post={post} />;
};

export async function generateStaticParams() {
  const slugs = allPosts.map((post) => {
    const fileName = post._raw.sourceFileName.replace(/\.mdx?$/, ""); // e.g. why42.en
    return fileName.replace(/\.(en|fr)$/, ""); // strip locale
  });

  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default Page;
