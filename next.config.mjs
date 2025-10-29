// next.config.mjs
import createMDX from "@next/mdx";
import { withContentlayer } from "next-contentlayer2";
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  experimental: {
    mdxRs: false,
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      "remark-frontmatter",
      ["remark-mdx-frontmatter", { name: "metadata" }],
      "remarkMath",
    ],
    rehypePlugins: ["rehypeKatex"],
  },
});
const withNextIntl = createNextIntlPlugin();

export default withContentlayer(withNextIntl(withMDX(nextConfig)));
