import { ReactiveEffect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createAppAPI } from "./apiCreateApp";
import {
  ComponentInternalInstance,
  createComponentInstance,
} from "./component";
import { applyOptions } from "./componentOptions";
import { Text, VNode, VNodeArrayChildren, normalizeVNode } from "./vnode";

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
> {
  insert(
    parentNode: HostNode,
    newNode: HostNode,
    referenceNode: HostNode
  ): void;
  remove(node: HostNode, child: HostNode): void;

  createElement(tagName: string): HostElement;
  createComment(text: string): HostNode;
  createText(text: string): Text;

  setText(node: HostNode, text: string): void;
  setElementText(node: HostElement, text: string): void;

  parentNode(node: HostNode): HostNode | null;
  nextSibling(node: HostNode): HostNode | null;
}

export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode | null,
  container: HostElement,
  isSVG?: boolean
) => void;

type PatchFn = (
  n1: VNode | null, // null means this is a mount
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

type ProcessTextOrCommentFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

type MountChildrenFn = (
  children: VNodeArrayChildren,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

type MountComponentFn = (
  initialVNode: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

export type SetupRenderEffectFn = (
  instance: ComponentInternalInstance,
  initialVNode: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

export function createRenderer<HostElement = RendererElement>(
  options: RendererOptions
) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = options;

  const patch: PatchFn = (n1, n2, container, anchor) => {
    const { type, shapeFlag } = n2;
    if (type === Text) {
      processText(n1, n2, container, anchor);
    } else if (shapeFlag & ShapeFlags.ELEMENT) {
      processElement(n1, n2, container, anchor);
    } else if (shapeFlag & ShapeFlags.COMPONENT) {
      processComponent(n1, n2, container, anchor);
    }
  };

  const processText: ProcessTextOrCommentFn = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        (n2.el = hostCreateText(n2.children as string)),
        container,
        anchor!
      );
    } else {
      // TODO: patch text
    }
  };

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null
  ) => {
    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
      // TODO: patch element
    }
  };

  const processComponent = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null
  ) => {
    if (n1 == null) {
      mountComponent(n2, container, anchor);
    } else {
      // TODO: patch component
    }
  };

  const mountElement = (
    vnode: VNode,
    container: RendererElement,
    anchor: RendererNode | null
  ) => {
    let el: RendererElement;
    const { type, props, shapeFlag } = vnode;

    el = vnode.el = hostCreateElement(type as string);
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children as string);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children as VNodeArrayChildren, el, null);
    }

    // TODO: props

    hostInsert(el, container, anchor!);
  };

  const mountChildren: MountChildrenFn = (children, container, anchor) => {
    for (let i = 0; i < children.length; i++) {
      const child = normalizeVNode(children[i]);
      patch(null, child, container, anchor);
    }
  };

  const mountComponent: MountComponentFn = (
    initialVNode,
    container,
    anchor
  ) => {
    // prettier-ignore
    const instance: ComponentInternalInstance = (initialVNode.component =createComponentInstance(initialVNode));
    applyOptions(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  };

  const setupRenderEffect: SetupRenderEffectFn = (
    instance,
    initialVNode,
    container,
    anchor
  ) => {
    const componentUpdateFn = () => {
      // TODO: patch only diff
      patch((container as any)._vnode || null, initialVNode, container, null);
    };

    const effect = (instance.effect = new ReactiveEffect(componentUpdateFn));
    const update = (instance.update = () => effect.run());
    update();
  };

  const render: RootRenderFunction = (vnode, container) => {
    if (vnode === null) {
      // TODO: unmount
    } else {
      patch((container as any)._vnode || null, vnode, container, null);
    }
    (container as any)._vnode = vnode;
  };

  return {
    render,
    createApp: createAppAPI(render),
  };
}
