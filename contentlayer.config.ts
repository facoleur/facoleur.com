import remarkCaption from "@/lib/remark";
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.{en,fr}.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    _type: {
      type: "enum",
      options: ["blog", "project", "resume"],
      required: false,
    },
    snippet: { type: "string", required: false },
    featured: { type: "string", required: false },
    category: { type: "list", of: { type: "string" }, required: false },
    technologies: { type: "list", of: { type: "string" }, required: false },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/${post._raw.flattenedPath}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Post],
  mdx: {
    rehypePlugins: [rehypeSlug],
    remarkPlugins: [remarkDirective, remarkGfm, remarkCaption],
  },
});
