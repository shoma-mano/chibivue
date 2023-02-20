import { RendererOptions } from "../runtime-core";

export const nodeOps: RendererOptions = {
  createElement: (tagName: string): Element => {
    return document.createElement(tagName);
  },

  createTextNode: (text: string): Text => {
    return document.createTextNode(text);
  },

  createComment: (text: string): Comment => {
    return document.createComment(text);
  },

  insertBefore: (parentNode: Node, newNode: Node, referenceNode: Node) => {
    parentNode.insertBefore(newNode, referenceNode);
  },

  removeChild: (node: Node, child: Node) => {
    node.removeChild(child);
  },

  appendChild: (node: Node, child: Node) => {
    node.appendChild(child);
  },

  parentNode: (node: Node) => {
    return node.parentNode;
  },

  nextSibling: (node: Node) => {
    return node.nextSibling;
  },

  tagName: (node: Element): string => {
    return node.tagName;
  },

  setTextContent: (node: Node, text: string) => {
    node.textContent = text;
  },
};
