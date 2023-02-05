import { Vue } from "../..";
import { Watcher } from "../observer/watcher";

export function mountComponent(vm: Vue, el: Element | null) {
  vm.$el = el;
  const updateComponent = () => {
    vm.update(vm._render());
  };
  new Watcher(vm, updateComponent, () => {});
}
