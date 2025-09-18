import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  // Tables
  table: (props) => (
    <table
      className="my-6 w-full border-collapse overflow-hidden text-sm"
      {...props}
    />
  ),
  th: (props) => (
    <th
      className="border-b border-slate-400 px-3 py-2 text-left font-medium dark:border-slate-600"
      {...props}
    />
  ),
  td: (props) => (
    <td
      className="border-b border-slate-300 px-3 py-1 text-slate-400 dark:border-slate-800"
      {...props}
    />
  ),

  // Headings
  h1: (props) => (
    <h1 className="mb-[0.75em] text-3xl leading-[1.3] font-medium" {...props} />
  ),
  h2: (props) => (
    <h2
      className="mb-[0.65em] text-2xl leading-[1.35] font-medium"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="mb-[0.6em] text-xl leading-[1.4] font-medium" {...props} />
  ),
  h4: (props) => (
    <h4 className="mb-[0.5em] text-lg leading-[1.45] font-medium" {...props} />
  ),

  // Paragraphs
  p: (props) => (
    <p className="mb-[1.1em] leading-[1.65] text-slate-700" {...props} />
  ),

  // Links
  a: (props) => (
    <a
      className="text-base text-slate-950 underline underline-offset-3 hover:no-underline dark:text-slate-200"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),

  // Lists
  ul: (props) => (
    <ul className="mb-[1.25em] list-inside list-disc pl-[1em]" {...props} />
  ),
  li: (props) => (
    <li
      className="mb-[0.5em] text-base leading-[1.4] font-normal !text-slate-400"
      {...props}
    />
  ),
  // eslint-disable-next-line
  img: (props) => <img className="my-2 rounded-lg" {...props} />,
  PostCard,
};

import PostCard from "@/components/PostCard";
