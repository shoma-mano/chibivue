import { Component } from "../component";
import { VNode, createElement } from "../vnode";

export function renderMixin(Vue: typeof Component) {
  Vue.prototype._render = function () {
    const vm = this;
    const { render } = vm.$options;
    return render!.bind(vm)(function h(
      tag: string,
      data: Record<string, unknown>,
      children: (VNode | string)[] | string
    ) {
      return createElement(vm, tag, data, children);
    });
  };
}
