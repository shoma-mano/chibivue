import { Component } from "~/src/type/component";
import { Watcher } from "../observer/watcher";

export function mountComponent(vm: Component, el: Element): Component {
  vm.$el = el;
  const updateComponent = () => {
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent, () => {});

  return vm;
}

export function lifecycleMixin(Vue: typeof Component) {
  Vue.prototype._update = function (newHTML: HTMLElement) {
    const child = this.$el!.firstChild;
    child && this.$el!.removeChild(child);
    this.$el!.appendChild(newHTML);
  };
}
