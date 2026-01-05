import remarkCaption from "@/lib/remark";
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";

/*
Bare-minimum SEO schema.
Only fields that actually control routing and SERP.
Everything else lives in MDX.
*/

const prettyCodeOptions = {
  theme: "dark-plus", // or any Shiki theme
  keepBackground: false,
};

export const Page = defineDocumentType(() => ({
  name: "Blog",
  filePathPattern: `**/*.{en,fr}.mdx`,
  contentType: "mdx",

  fields: {
    // Page classification
    type: {
      type: "enum",
      options: ["page", "blog", "service", "case-study"],
      required: true,
    },

    // Publishing
    publishedAt: { type: "date", required: true },

    // SEO
    title: { type: "string", required: true }, // H1
    metaTitle: { type: "string", required: true }, // <title>
    metaDescription: { type: "string", required: true }, // SERP
    tags: { type: "list", of: { type: "string" }, required: false },
    featuredImage: { type: "string", required: false },

    // Indexing control
    canonical: { type: "string", required: false },
    noindex: { type: "boolean", required: false },
  },

  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Page],
  mdx: {
    remarkPlugins: [remarkDirective, remarkGfm, remarkCaption],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
  },
});
