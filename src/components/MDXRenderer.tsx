import { mdxComponents } from "@/mdx-components";
import { MDXComponents } from "mdx/types";
import { useMDXComponent } from "next-contentlayer2/hooks";

export const MDXRenderer = ({
  content,
  components,
}: {
  content: string;
  components?: MDXComponents;
}) => {
  const MDXContent = useMDXComponent(content);

  return <MDXContent components={components ?? mdxComponents} />;
};
