import { VNode } from "./vnode";

interface NodeOps {
  createElement(tagName: string): Element;
  createTextNode(text: string): Text;
  createComment(text: string): Comment;
  insertBefore(parentNode: Node, newNode: Node, referenceNode: Node): void;
  removeChild(node: Node, child: Node): void;
  appendChild(node: Node, child: Node): void;
  parentNode(node: Node): void;
  nextSibling(node: Node): void;
  tagName(node: Element): string;
  setTextContent(node: Node, text: string): void;
}

export function createPatchFunction({
  nodeOps,
}: {
  nodeOps: NodeOps;
}): (a: Element, b: VNode, parentElm?: any, refElm?: any) => Element {
  // TODO:
  return () => {};
}
