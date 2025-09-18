import { mdxComponents } from "@/mdx-components";
import { useMDXComponent } from "next-contentlayer2/hooks";

export const MDXRenderer = ({ content }: { content: string }) => {
  const MDXContent = useMDXComponent(content);

  return <MDXContent components={mdxComponents} />;
};
