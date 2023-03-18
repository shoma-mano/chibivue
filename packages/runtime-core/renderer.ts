import { ReactiveEffect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createAppAPI } from "./apiCreateApp";
import {
  type ComponentInternalInstance,
  createComponentInstance,
  setupComponent,
  Data,
} from "./component";
import { renderComponentRoot } from "./componentRenderUtils";
import {
  Text,
  normalizeVNode,
  type VNode,
  type VNodeArrayChildren,
  isSameVNodeType,
} from "./vnode";

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode | null,
  container: HostElement,
  isSVG?: boolean
) => void;

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
> {
  patchProp(el: HostElement, key: string, prevValue: any, nextValue: any): void;

  insert(
    parentNode: HostNode,
    newNode: HostNode,
    referenceNode: HostNode
  ): void;
  remove(child: HostNode): void;

  createElement(tagName: string): HostElement;
  createComment(text: string): HostNode;
  createText(text: string): Text;

  setText(node: HostNode, text: string): void;
  setElementText(node: HostElement, text: string): void;

  parentNode(node: HostNode): HostNode | null;
  nextSibling(node: HostNode): HostNode | null;
}

// Renderer Node can technically be any object in the context of core renderer
// logic - they are never directly operated on and always passed to the node op
// functions provided via options, so the internal constraint is really just
// a generic object.
export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}

// These functions are created inside a closure and therefore their types cannot
// be directly exported. In order to avoid maintaining function signatures in
// two places, we declare them once here and use them inside the closure.
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

type PatchChildrenFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

type MoveFn = (
  vnode: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

type MountComponentFn = (
  initialVNode: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

type NextFn = (vnode: VNode) => RendererNode | null;

type UnmountFn = (vnode: VNode) => void;
type RemoveFn = (vnode: VNode) => void;

type UnmountChildrenFn = (children: VNode[]) => void;

type SetupRenderEffectFn = (
  instance: ComponentInternalInstance,
  initialVNode: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => void;

// implementation
export function createRenderer(options: RendererOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
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
      const el = (n2.el = n1.el!);
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string);
      }
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
      patchElement(n1, n2);
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

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    hostInsert(el, container, anchor!);
  };

  const patchElement = (n1: VNode, n2: VNode) => {
    const el = (n2.el = n1.el!);

    const oldProps = n1.props ?? {};
    const newProps = n2.props ?? {};
    patchChildren(n1, n2, el, null);
    patchProps(el, oldProps, newProps);
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
      updateComponent(n1, n2);
    }
  };

  const patchProps = (el: RendererElement, oldProps: Data, newProps: Data) => {
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
    for (const key in newProps) {
      const next = newProps[key];
      const prev = oldProps[key];
      // defer patching value
      if (next !== prev) {
        hostPatchProp(el, key, prev, next);
      }
    }
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
    const instance: ComponentInternalInstance = (initialVNode.component = createComponentInstance(initialVNode));
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  };

  const updateComponent = (n1: VNode, n2: VNode) => {
    const instance = (n2.component = n1.component)!;
    instance.next = n2;
    instance.update();
  };

  const setupRenderEffect: SetupRenderEffectFn = (
    instance,
    initialVNode,
    container,
    anchor
  ) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const { m } = instance;
        const subTree = (instance.subTree = renderComponentRoot(instance));
        patch(null, subTree, container, anchor);
        initialVNode.el = subTree.el;

        // mounted hook
        // NOTE: scheduled on post-render
        Promise.resolve().then(() => m?.forEach((cb) => cb()));

        instance.isMounted = true;
      } else {
        let { next, vnode } = instance;

        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next);
        } else {
          next = vnode;
        }

        const prevTree = instance.subTree;
        const nextTree = renderComponentRoot(instance);
        instance.subTree = nextTree;

        patch(
          prevTree,
          nextTree,
          hostParentNode(prevTree.el!)!,
          getNextHostNode(prevTree)
        );
        next.el = nextTree.el;
      }
    };
    const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      instance.scope
    ));
    const update = (instance.update = () => effect.run());
    update();
  };

  const updateComponentPreRender = (
    instance: ComponentInternalInstance,
    nextVNode: VNode
  ) => {
    nextVNode.component = instance;
    instance.vnode = nextVNode;
    instance.next = null;
  };

  const patchChildren: PatchChildrenFn = (n1, n2, container, anchor) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { shapeFlag } = n2;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1 as VNode[]);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2 as string);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          patchKeyedChildren(c1 as VNode[], c2 as VNode[], container, anchor);
        } else {
          // no new children, just unmount old
          unmountChildren(c1 as VNode[]);
        }
      } else {
        // prev children was text OR null
        // new children is array OR null
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, "");
        }
        // mount new if array
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2 as VNodeArrayChildren, container, anchor);
        }
      }
    }
  };

  // can be all-keyed or mixed
  const patchKeyedChildren = (
    c1: VNode[],
    c2: VNode[],
    container: RendererElement,
    parentAnchor: RendererNode | null
  ) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1; // prev ending index
    let e2 = l2 - 1; // next ending index

    // 1. sync from start
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null);
      } else {
        break;
      }
      i++;
    }

    // 2. sync from end
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 3. common sequence + mount
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? (c2[nextPos] as VNode).el : parentAnchor;
        while (i <= e2) {
          patch(null, c2[i], container, anchor);
          i++;
        }
      }
    }

    // 4. common sequence + unmount
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }

    // 5. unknown sequence
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5
    else {
      const s1 = i; // prev starting index
      const s2 = i; // next starting index

      // 5.1 build key:index map for newChildren
      const keyToNewIndexMap: Map<string | number | symbol, number> = new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }

      // 5.2 loop through old children left to be patched and try to patch
      // matching nodes & remove nodes that are no longer present
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      // used to track whether any node has moved
      let maxNewIndexSoFar = 0;
      // works as Map<newIndex, oldIndex>
      // Note that oldIndex is offset by +1
      // and oldIndex = 0 is a special value indicating the new node has
      // no corresponding old node.
      // used for determining longest stable subsequence
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          // all new children have been patched so this can only be a removal
          unmount(prevChild);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // key-less node, try to locate a key-less node of the same type
          for (j = s2; j <= e2; j++) {
            if (
              newIndexToOldIndexMap[j - s2] === 0 &&
              isSameVNodeType(prevChild, c2[j] as VNode)
            ) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          unmount(prevChild);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(prevChild, c2[newIndex] as VNode, container, null);
          patched++;
        }
      }

      // 5.3 move and mount
      // generate longest stable subsequence only when nodes have moved
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      j = increasingNewIndexSequence.length - 1;
      // looping backwards so that we can use last patched node as anchor
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex] as VNode;
        const anchor =
          nextIndex + 1 < l2 ? (c2[nextIndex + 1] as VNode).el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          // mount new
          patch(null, nextChild, container, anchor);
        } else if (moved) {
          // move if:
          // There is no stable subsequence (e.g. a reverse)
          // OR current node is not among the stable sequence
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  };

  const move: MoveFn = (vnode, container, anchor) => {
    const { el, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.COMPONENT) {
      move(vnode.component!.subTree, container, anchor);
      return;
    }
    hostInsert(el!, container, anchor!);
  };

  const unmount: UnmountFn = (vnode) => {
    const { shapeFlag, children } = vnode;
    if (shapeFlag & ShapeFlags.COMPONENT) {
      unmountComponent(vnode.component!);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(children as VNode[]);
    }
    remove(vnode);
  };

  const remove: RemoveFn = (vnode) => {
    const { el } = vnode;
    hostRemove(el!);
  };

  const unmountComponent = (instance: ComponentInternalInstance) => {
    const { subTree } = instance;
    unmount(subTree);
  };

  const unmountChildren: UnmountChildrenFn = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };

  const getNextHostNode: NextFn = (vnode) => {
    if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
      return getNextHostNode(vnode.component!.subTree);
    }
    return hostNextSibling(vnode.el!);
  };

  const render: RootRenderFunction = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
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

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
