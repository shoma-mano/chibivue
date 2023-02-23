import { ComponentPublicInstance } from "../componentPublicInstance";
import { ComponentOptions } from "../componentOptions";
import { initState } from "./state";

export function initMixin(Vue: typeof ComponentPublicInstance) {
  Vue.prototype._init = function (options: ComponentOptions) {
    const vm: ComponentPublicInstance = this;
    vm.$options = options;
    vm.$data = options.data?.() ?? {};
    initState(vm);
  };
}
