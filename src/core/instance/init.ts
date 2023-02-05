import { Component } from "~/src/type/component";
import { initState } from "./state";
import { ComponentOption } from "~/src/type/option";

export function initMixin(Vue: typeof Component) {
  Vue.prototype._init = function (options: ComponentOption) {
    const vm: Component = this;
    vm.$options = options;
    vm._data = options.data?.() ?? {};
    initState(vm);
  };
}
