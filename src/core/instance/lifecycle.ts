import { Component } from "~/src/type/component";
import { Watcher } from "../observer/watcher";
import { VNode } from "../vdom/vnode";

export function mountComponent(vm: Component, el: Element): Component {
  vm.$el = el;
  const updateComponent = () => {
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent, () => {});

  return vm;
}

export function lifecycleMixin(Vue: typeof Component) {
  Vue.prototype._update = function (vnode: VNode) {
    const vm: Component = this;
    vm.$el = vm.__patch__(vm.$el, vnode);
  };
}
