import { POSTS } from "@/content";
import Image from "next/image";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { default: Post, metadata } = await import(`@/content/${slug}.mdx`);

  console.log(metadata);

  return (
    <article>
      <div className="mt-6 flex flex-row gap-4">
        <p>{metadata.date}</p>
        <p>{metadata.type}</p>
      </div>
      <h1 className="mb-8">{metadata.title}</h1>
      {metadata?.featured && (
        <Image
          width={800}
          height={600}
          src={metadata.featured}
          alt={metadata.title || "Featured image"}
          className="mb-6 h-auto w-full rounded-xl"
        />
      )}
      <Post />
    </article>
  );
}

export async function generateStaticParams() {
  const slugs = POSTS;
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;
