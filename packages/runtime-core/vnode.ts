import { ShapeFlags } from "../shared/shapeFlags";
import { isArray, isObject, isString } from "../shared";
import { currentRenderingInstance } from "./componentRenderContext";
import { type ComponentInternalInstance } from "./component";
import { type ComponentPublicInstance } from "./componentPublicInstance";

export type VNodeTypes =
  | string // html element name
  | typeof Text // html text node
  | typeof Fragment // fragment
  | ComponentPublicInstance; // Vue Component

export const Fragment = Symbol.for("v-fgt") as any as {
  __isFragment: true;
  new (): {
    $props: VNodeProps;
  };
};

export const Text = Symbol.for("v-txt");

export interface VNode<HostNode = any> {
  __v_isVNode: true;
  type: VNodeTypes;
  props: VNodeProps | null;
  key: string | number | symbol | null;

  // DOM
  el: HostNode | undefined;
  anchor: HostNode | null; // fragment anchor

  children: VNodeNormalizedChildren;
  component: ComponentInternalInstance | null;
  ctx: ComponentPublicInstance | null;
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

export function isSameVNodeType(n1: VNode, n2: VNode): boolean {
  return n1.type === n2.type && n1.key === n2.key;
}

export const createVNode = (
  type: VNodeTypes,
  props: VNodeProps | null = null,
  children: unknown = null
) => {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.COMPONENT
    : 0;

  return createBaseVNode(type, props, children, shapeFlag);
};

function createBaseVNode(
  type: VNodeTypes,
  props: VNodeProps | null,
  children: unknown = null,
  shapeFlag: ShapeFlags | 0 = ShapeFlags.ELEMENT
): VNode {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    key: props && props.key,
    children,
    el: null,
    anchor: null,
    ctx: currentRenderingInstance,
    shapeFlag,
    component: null,
  } as VNode;

  normalizeChildren(vnode, children);

  if (children) {
    vnode.shapeFlag |= isString(children)
      ? ShapeFlags.TEXT_CHILDREN
      : ShapeFlags.ARRAY_CHILDREN;
  }

  return vnode;
}

export { createBaseVNode as createElementVNode };

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else if (typeof children === "object") {
    normalizeChildren(vnode, vnode.children);
    return;
  } else {
    children = String(children);
    type = ShapeFlags.TEXT_CHILDREN;
  }
  vnode.children = children as VNodeNormalizedChildren;
  vnode.shapeFlag |= type;
}

export function createTextVNode(text: string = " "): VNode {
  return createVNode(Text, null, text);
}

export function normalizeVNode(child: VNodeChild): VNode {
  if (typeof child === "object") {
    return cloneIfMounted(child as VNode);
  } else {
    return createVNode(Text, null, String(child));
  }
}

export function cloneIfMounted(child: VNode): VNode {
  return child.el === null ? child : cloneVNode(child);
}

export function cloneVNode<T>(vnode: VNode<T>): VNode<T> {
  const { props, children } = vnode;
  const cloned: VNode<T> = {
    __v_isVNode: true,
    type: vnode.type,
    props,
    key: vnode.key,
    children: isArray(children)
      ? (children as VNode[]).map(cloneVNode)
      : children,
    component: vnode.component,
    shapeFlag: vnode.shapeFlag,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
  };
  return cloned;
}

/**
 *
 * ----------- tests
 *
 */
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("test createVNode: element node", () => {
    {
      const vnode = createVNode("div", { id: "foo" }, "bar");
      expect(vnode).toStrictEqual({
        __v_isVNode: true,
        type: "div",
        props: { id: "foo" },
        el: null,
        children: "bar",
        component: null,
        ctx: null,
        shapeFlag: ShapeFlags.ELEMENT | ShapeFlags.TEXT_CHILDREN,
      });
    }
    {
      const vnode = createVNode("div", { id: "foo" }, ["bar"]);
      expect(vnode).toStrictEqual({
        __v_isVNode: true,
        type: "div",
        props: { id: "foo" },
        el: null,
        children: ["bar"],
        component: null,
        ctx: null,
        shapeFlag: ShapeFlags.ELEMENT | ShapeFlags.ARRAY_CHILDREN,
      });
    }
  });

  it("test createVNode: component node", () => {
    {
      const vnode = createVNode({} as any, { id: "foo" }, "bar");
      expect(vnode).toStrictEqual({
        __v_isVNode: true,
        type: {},
        props: { id: "foo" },
        el: null,
        children: "bar",
        component: null,
        ctx: null,
        shapeFlag: ShapeFlags.COMPONENT | ShapeFlags.TEXT_CHILDREN,
      });
    }
    {
      const vnode = createVNode({} as any, { id: "foo" }, ["bar"]);
      expect(vnode).toStrictEqual({
        __v_isVNode: true,
        type: {},
        props: { id: "foo" },
        el: null,
        children: ["bar"],
        component: null,
        ctx: null,
        shapeFlag: ShapeFlags.COMPONENT | ShapeFlags.ARRAY_CHILDREN,
      });
    }
  });

  it("test normalizeChildren", () => {
    {
      const vnode = {
        __v_isVNode: true,
        type: "div",
        props: { id: "foo" },
        key: null,
        el: null,
        anchor: null,
        children: "bar",
        component: null,
        ctx: null,
        shapeFlag: ShapeFlags.ELEMENT | ShapeFlags.TEXT_CHILDREN,
      } as VNode;
      normalizeChildren(vnode, "bar");
      expect(vnode.children).toStrictEqual([
        {
          __v_isVNode: true,
          children: "bar",
          component: null,
          ctx: null,
          el: null,
          props: null,
          shapeFlag: 8,
          type: Text,
        },
      ]);
    }
    {
      const vnode = {
        __v_isVNode: true,
        type: "div",
        props: { id: "foo" },
        key: null,
        el: null,
        anchor: null,
        children: ["bar"],
        component: null,
        ctx: null,
        shapeFlag: ShapeFlags.ELEMENT | ShapeFlags.TEXT_CHILDREN,
      } as VNode;
      normalizeChildren(vnode, "bar");
      expect(vnode.children).toStrictEqual([
        {
          __v_isVNode: true,
          children: "bar",
          component: null,
          ctx: null,
          el: null,
          props: null,
          shapeFlag: 8,
          type: Text,
        },
      ]);
    }
  });
}
