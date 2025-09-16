import { PostMetadata } from "@/app/blog/page";
import Image from "next/image";
import Link from "next/link";

export const Posts = ({
  publications,
}: {
  publications: {
    slug: string;
    metadata: PostMetadata;
  }[];
}) => {
  const sortedPublications = [...publications].sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime(),
  );

  return (
    <>
      <div className="grid gap-1">
        {sortedPublications.map((p, index) => (
          <Link
            key={index}
            href={`/blog/${p.slug}`}
            className="flex items-center gap-4 rounded-lg p-2 transition-all duration-75 hover:translate-x-3 hover:bg-white"
          >
            {p.metadata.featured && (
              <Image
                src={p.metadata.featured}
                alt={p.metadata.title}
                width={200}
                height={200}
                className="h-40 w-56 rounded object-cover"
              />
            )}
            <div>
              <h4 className="!mb-0">{p.metadata.title}</h4>
              <p className="mt-1 !mb-1 !text-slate-600">{p.metadata.date}</p>
              <p>{p.metadata.snippet}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};
