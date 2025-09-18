// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
var Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    _type: {
      type: "enum",
      options: ["blog", "project", "resume"],
      required: false
    },
    snippet: { type: "string", required: false },
    featured: { type: "string", required: false },
    category: { type: "list", of: { type: "string" }, required: false },
    technologies: { type: "list", of: { type: "string" }, required: false }
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/${post._raw.flattenedPath}`
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [Post],
  mdx: {
    rehypePlugins: [remarkGfm, rehypeSlug]
  }
});
export {
  Post,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-64LKUMEF.mjs.map
