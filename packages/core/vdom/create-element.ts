import { Component } from "../../type/component";
import { VNodeData } from "../../type/vnode";
import { VNode, createTextVNode } from "./vnode";

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
