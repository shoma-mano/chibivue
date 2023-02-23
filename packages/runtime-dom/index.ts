import Vue from "../runtime-core/instance";
import { mountComponent } from "../runtime-core/instance/lifecycle";
import {
  ComponentPublicInstance,
  ComponentOptions,
  createRenderer,
} from "../runtime-core";
import { nodeOps } from "./nodeOps";

// install platform patch function
Vue.prototype.__patch__ = createRenderer(nodeOps);

// public mount method
Vue.prototype.$mount = function (
  el?: string | Element
): ComponentPublicInstance {
  if (el) {
    this.$el = typeof el === "string" ? document.querySelector(el) : el;
  }
  return mountComponent(this, this.$el);
};

export interface App {
  mount(el: string | Element): void;
}

export function createApp(options: ComponentOptions): App {
  // @ts-expect-error
  const vm: ComponentPublicInstance = new Vue(options);

  return {
    mount(el: string | Element) {
      vm.$mount(el);
    },
  };
}
