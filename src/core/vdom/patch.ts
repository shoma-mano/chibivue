import { isArray, isDef, isPrimitive } from "~/src/shared/utils";
import { VNode } from "./vnode";

interface NodeOps {
  createElement(tagName: string): Element;
  createTextNode(text: string): Text;
  createComment(text: string): Comment;
  insertBefore(parentNode: Node, newNode: Node, referenceNode: Node): void;
  removeChild(node: Node, child: Node): void;
  appendChild(node: Node, child: Node): void;
  parentNode(node: Node): ParentNode | null;
  nextSibling(node: Node): ChildNode | null;
  tagName(node: Element): string;
  setTextContent(node: Node, text: string): void;
}

export function createPatchFunction(backend: {
  nodeOps: NodeOps;
}): (oldVnode: VNode, vnode: VNode, parentElm?: Node) => Node | void {
  const { nodeOps } = backend;

  function emptyNodeAt(elm: Element) {
    return new VNode(
      nodeOps.tagName(elm).toLowerCase(),
      {},
      [],
      undefined,
      elm
    );
  }

  function removeNode(el: Node) {
    const parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function createElm(
    vnode: VNode,
    insertedVnodeQueue: VNode[],
    parentElm?: Node | null,
    refElm?: Node | null
  ) {
    // TODO:
    // const data = vnode.data;
    const children = vnode.children;
    const tag = vnode.tag;
    if (isDef(tag)) {
      vnode.elm = nodeOps.createElement(tag);
      createChildren(vnode, children, insertedVnodeQueue);
      // TODO:
      // if (isDef(data)) {
      //   invokeCreateHooks(vnode, insertedVnodeQueue);
      // }
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text!);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createChildren(
    vnode: VNode,
    children: VNode["children"],
    insertedVnodeQueue: VNode[]
  ) {
    if (isArray(children)) {
      for (let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(
        vnode.elm!,
        nodeOps.createTextNode(String(vnode.text))
      );
    }
  }

  function insert(parent: Node | null | undefined, elm: Node, ref?: any) {
    if (isDef(parent)) {
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function removeVnodes(vnodes: VNode[], startIdx: number, endIdx: number) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      if (isDef(ch)) {
        removeNode(ch.elm!);
      }
    }
  }

  return function patch(oldVnode: VNode | Node, vnode: VNode): Node | void {
    const insertedVnodeQueue: VNode[] = [];

    const isRealElement = isDef((oldVnode as Node).nodeType);
    if (isRealElement) {
      // mounting to a real element
      oldVnode = emptyNodeAt(oldVnode as Element);
    }

    // replacing existing element
    const oldElm = (oldVnode as VNode).elm!;
    const parentElm = nodeOps.parentNode(oldElm);

    // create new node
    createElm(
      vnode,
      insertedVnodeQueue,
      parentElm,
      nodeOps.nextSibling(oldElm)
    );

    // destroy old node
    if (isDef(parentElm)) {
      removeVnodes([oldVnode as VNode], 0, 0);
    }

    return vnode.elm!;
  };
}
