import LottiePlayer from "@/components/Lottie";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(
  components: MDXComponents = {},
): MDXComponents {
  return {
    h1: (props) => (
      <h1
        className="mt-8 mb-4 pb-2 text-4xl leading-tight font-medium"
        {...props}
      />
    ),
    h2: (props) => (
      <h2 className="mt-6 mb-3 text-3xl leading-snug font-medium" {...props} />
    ),
    h3: (props) => (
      <h3
        className="mt-5 mb-2 text-2xl leading-snug font-semibold"
        {...props}
      />
    ),
    h4: (props) => (
      <h4 className="mt-4 mb-2 text-xl leading-snug font-semibold" {...props} />
    ),
    p: (props) => <p className="my-4 text-lg leading-relaxed" {...props} />,
    a: (props) => (
      <a
        className="text-blue-600 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    ul: (props) => (
      <ul className="my-4 list-inside list-disc space-y-1 pl-4" {...props} />
    ),
    ol: (props) => (
      <ol className="my-4 list-inside list-decimal space-y-1 pl-4" {...props} />
    ),
    li: (props) => <li className="ml-2" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="my-4 border-l-4 border-gray-300 pl-4 text-gray-700 italic"
        {...props}
      />
    ),
    code: (props) => (
      <code
        className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="my-4 overflow-x-auto rounded bg-gray-900 p-4 font-mono text-sm text-gray-100"
        {...props}
      />
    ),
    hr: (props) => <hr className="my-8 border-gray-300" {...props} />,
    img: (props) => <img className="my-4 rounded-md" {...props} />,
    table: (props) => (
      <table className="my-6 w-full border-collapse" {...props} />
    ),
    th: (props) => (
      <th className="border bg-gray-100 px-3 py-2 text-left" {...props} />
    ),
    td: (props) => <td className="border px-3 py-2 align-top" {...props} />,
    ...components,
    LottiePlayer,
  };
}
