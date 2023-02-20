import { Component } from "./component";

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
    this.elm = elm;
    this.context = context;
  }
}

export interface VNodeData {
  on?: { [key: string]: Function };
  attrs?: { [key: string]: string };
  [key: string]: any;
}

export function createTextVNode(val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val));
}

export function createElement(
  context: Component,
  tag: string,
  data: Record<string, unknown>,
  children: (VNode | string)[] | string
): VNode {
  const _children =
    typeof children === "string"
      ? [createTextVNode(children)]
      : children.map((it) =>
          typeof it === "string" ? createTextVNode(it) : it
        );

  return _createElement(context, tag, data, _children);
}

function _createElement(
  context: Component,
  tag?: string,
  data?: Record<string, unknown>,
  children?: Array<VNode>
): VNode {
  const vNodeData = Object.entries(data ?? {}).reduce((acc, [key, value]) => {
    const on = acc.on ?? {};
    const attr = acc.attrs ?? {};

    if (key.match(/^on(.+)/)) {
      return typeof value === "function"
        ? {
            ...acc,
            on: {
              ...on,
              [key.slice(2).toLowerCase()]: value,
            },
          }
        : acc;
    }

    return {
      ...acc,
      attrs: {
        ...attr,
        [key]: String(value),
      },
    };
  }, {} as VNodeData);

  return new VNode(tag, vNodeData, children, undefined, undefined, context);
}
