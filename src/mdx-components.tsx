import LottiePlayer from "@/components/Lottie";
import PostCard from "@/components/PostCard";
import "katex/dist/katex.min.css";
import type { MDXComponents } from "mdx/types";
import { BlockMath, InlineMath } from "react-katex";

export const mdxComponents: MDXComponents = {
  figcaption: (props) => (
    <figcaption
      className="mb-6 text-center text-sm text-slate-400 italic dark:!text-slate-500 [&>p]:!text-inherit"
      {...props}
    />
  ),
  // Tables
  table: (props) => (
    <div className="my-6 w-[calc(100vw-2rem)] overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table
          className="border-collapse text-sm"
          style={{ minWidth: "600px" }} // <-- pick a sensible min width
          {...props}
        />
      </div>
    </div>
  ),
  th: (props) => (
    <th
      className="border-b border-slate-400 px-3 py-2 text-left font-medium whitespace-nowrap dark:border-slate-600"
      {...props}
    />
  ),
  td: (props) => (
    <td
      className="border-b border-slate-300 px-3 py-1 whitespace-nowrap text-slate-600 dark:border-slate-800 dark:text-slate-300"
      {...props}
    />
  ),

  // Headings
  h1: (props) => (
    <h1
      className="!mt-12 !mb-8 text-3xl leading-[1.3] font-medium"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="!mt-12 !mb-8 text-2xl leading-[1.35] font-medium"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="!mt-10 !mb-6 text-xl leading-[1.4] font-medium" {...props} />
  ),
  h4: (props) => (
    <h4 className="!mb-2 text-lg leading-[1.45] font-medium" {...props} />
  ),

  // Paragraphs
  p: (props) => (
    <p
      className="mb-[1.1em] !leading-8 text-slate-700 dark:!text-slate-300"
      {...props}
    />
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
      className="list-inside list-disc text-base font-normal !text-slate-600 dark:!text-slate-300 [&>*]:inline"
      {...props}
    />
  ),
  // eslint-disable-next-line
  img: (props) => <img className="mt-8 rounded-lg" {...props} />,
  PostCard,
  LottiePlayer,
  BlockMath: (props) => (
    <div className="my-6">
      <BlockMath {...props} />
    </div>
  ),
  InlineMath,
};
