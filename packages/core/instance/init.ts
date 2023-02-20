import { Component } from "../../type/component";
import { ComponentOption } from "../../type/option";
import { initState } from "./state";

export function initMixin(Vue: typeof Component) {
  Vue.prototype._init = function (options: ComponentOption) {
    const vm: Component = this;
    vm.$options = options;
    vm._data = options.data?.() ?? {};
    initState(vm);
  };
}
