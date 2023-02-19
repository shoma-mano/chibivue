import { Component } from "~/src/type/component";
import { VNodeData } from "~/src/type/vnode";

export class VNode {
  tag?: string;
  data?: VNodeData;
  children?: Array<VNode> | null;
  text?: string;
  elm: Node | undefined;
  parent: VNode | undefined | null;
  context?: Component;

  constructor(
    tag?: string,
    data?: VNodeData,
    children?: Array<VNode> | null,
    text?: string,
    elm?: Node,
    context?: Component
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm
    this.context = context;
  }
}

export function createTextVNode(val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val));
}
