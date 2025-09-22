import type { Plugin } from "unified";
import type { Node } from "unist";
import { visit } from "unist-util-visit";

interface DirectiveNode extends Node {
  type: "containerDirective" | "leafDirective" | "textDirective";
  name: string;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    [key: string]: unknown;
  };
  children?: Node[];
}

const remarkCaption: Plugin<[], Node> = () => {
  return (tree) => {
    visit(tree, (node: Node) => {
      const d = node as DirectiveNode;
      if (d.type === "containerDirective" && d.name === "caption") {
        d.data = d.data || {};
        d.data.hName = "figcaption";
      }
    });
  };
};

export default remarkCaption;
