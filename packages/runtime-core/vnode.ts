import { ShapeFlags } from "../shared/shapeFlags";
import { isArray } from "../shared/utils";
import { Component, Data } from "./component";
import { currentRenderingInstance } from "./componentRenderContext";

export type VNodeTypes = VNode | typeof Text | Component;
export const Text = Symbol();

export interface VNode<HostNode = any> {
  __v_isVNode: true;
  type: VNodeTypes;
  props: VNodeProps | null;
  el: HostNode | undefined;
  children: VNodeNormalizedChildren;
  ctx: Component | null;
  shapeFlag: number;
}

export interface VNodeProps {
  [key: string]: any;
}

export type VNodeNormalizedChildren = string | VNodeArrayChildren;

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren;
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;
type VNodeChildAtom = VNode | string;

export function isVNode(value: unknown): value is VNode {
  return (
    typeof value === "object" &&
    value !== null &&
    "__v_isVNode" in value &&
    value.__v_isVNode === true
  );
}

export const createVNode = (
  type: VNodeTypes,
  props: VNodeProps | null = null,
  children: unknown = null
) => {
  return createBaseVNode(type, props, children);
};

function createBaseVNode(
  type: VNodeTypes,
  props: VNodeProps | null,
  children: unknown
): VNode {
  const vnode = {
    type,
    props,
    children,
    el: null,
    ctx: currentRenderingInstance,
    shapeFlag: ShapeFlags.ELEMENT,
  } as VNode;

  if (isVNode(type)) {
    normalizeChildren(vnode, children);
  }

  return vnode;
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    children = [createTextVNode(String(children))];
  }
  vnode.children = children as VNodeNormalizedChildren;
  vnode.shapeFlag |= type;
}

export function createTextVNode(text: string = " "): VNode {
  return createVNode(Text, null, text);
}
