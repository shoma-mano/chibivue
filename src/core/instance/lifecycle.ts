import { Vue } from "../..";
import { Watcher } from "../observer/watcher";

export function mountComponent(vm: Vue, el: Element | null) {
  vm.$el = el;
  new Watcher(vm, vm.render, () => {});
}
