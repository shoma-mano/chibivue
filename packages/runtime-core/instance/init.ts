import { Component } from "../component";
import { ComponentOptions } from "../componentOptions";
import { initState } from "./state";

export function initMixin(Vue: typeof Component) {
  Vue.prototype._init = function (options: ComponentOptions) {
    const vm: Component = this;
    vm.$options = options;
    vm._data = options.data?.() ?? {};
    initState(vm);
  };
}
