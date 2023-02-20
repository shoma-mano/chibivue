import { VNode } from "../../runtime-core";
import { isUndef } from "../../shared/utils";

let target: any;

function updateDOMListeners(oldVnode: VNode, vnode: VNode) {
  if (isUndef(oldVnode.data!.on) && isUndef(vnode.data!.on)) {
    return;
  }
  const on = vnode.data?.on || {};
  const oldOn = oldVnode.data?.on || {};
  // vnode is empty when removing all listeners,
  // and use old vnode dom element
  target = vnode.elm || oldVnode.elm;
  // TODO:
  // updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context);
  target = undefined;
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners,
};
