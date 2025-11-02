import { ContentWithFilters } from "@/app/work/page";
import { allPosts } from "contentlayer/generated";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { tech?: string };
}) {
  const projects = allPosts.filter((post) => post._type === "blog");
  const tech = searchParams.tech;

  return <ContentWithFilters projects={projects} tech={tech} />;
}

// export default function BlogPage() {
//   const blogPosts = allPosts.filter((post) => post._type === "blog");

//   const locale = useLocale();

//   const localeBlogPosts = blogPosts.filter((post) => post.url.endsWith(locale));

//   return (
//     <main className="prose mx-auto w-full max-w-2xl">
//       <Posts publications={localeBlogPosts} />
//     </main>
//   );
// }
