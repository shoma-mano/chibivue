import { initState } from "./core/instance/state";
import { mountComponent } from "./core/instance/lifecycle";
import { Watcher } from "./core/observer/watcher";
import { createElement } from "./core/vdom/create-element";
// import { compileToFunctions } from "./platforms/web/compiler";

type ComponentOption = {
  data?: () => Record<string, unknown>;
  methods?: { [key: string]: Function };
  computed?: { [key: string]: Function };
  render?: (
    h: (
      tag: string,
      data: Record<string, Function>,
      children: string
    ) => HTMLElement
  ) => HTMLElement;
};

export const createApp = (options: ComponentOption): Vue => {
  return new Vue(options);
};

export class Vue {
  $options: ComponentOption;
  $el: Element | null = null;
  _data?: Record<string, unknown>;
  _computedWatchers: { [key: string]: Watcher } | null = null;

  constructor(options: ComponentOption) {
    this.$options = options;
    this._data = options.data?.();
    initState(this);
  }

  mount(selector: string) {
    this.$el = document.querySelector(selector)!;
    mountComponent(this, this.$el);

    // initial render
    this.update(this._render());
  }

  update(newHTML: HTMLElement) {
    const child = this.$el!.firstChild;
    child && this.$el!.removeChild(child);
    this.$el!.appendChild(newHTML);
  }

  _render(): HTMLElement {
    const vm = this;
    const { render } = vm.$options;
    return render!.bind(vm)(function h(
      tag: string,
      data: Record<string, Function>,
      children: string
    ) {
      return createElement(vm, tag, data, children);
    });
  }
}
