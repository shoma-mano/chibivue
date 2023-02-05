import { Component } from "~/src/type/component";
import { createElement } from "../vdom/create-element";

export function renderMixin(Vue: typeof Component) {
  Vue.prototype._render = function () {
    const vm = this;
    const { render } = vm.$options;
    return render!.bind(vm)(function h(
      tag: string,
      data: Record<string, Function>,
      children: string
    ) {
      return createElement(vm, tag, data, children);
    });
  };
}
