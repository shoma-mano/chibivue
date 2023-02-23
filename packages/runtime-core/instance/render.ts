import { ComponentPublicInstance } from "../componentPublicInstance";
import { VNode, cloneVNode } from "../vnode";

// export function renderMixin(Vue: typeof ComponentPublicInstance) {
//   Vue.prototype._render = function () {
//     const vm = this;
//     const { render } = vm.$options;
//     return render!.bind(vm)(function h(
//       tag: string,
//       data: Record<string, unknown>,
//       children: (VNode | string)[] | string
//     ) {
//       return cloneVNode(vm, tag, data, children);
//     });
//   };
// }
