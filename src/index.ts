import { initState } from "./core/instance/state";
import { mountComponent } from "./core/instance/lifecycle";
import { Watcher } from "./core/observer/watcher";
import { compileToFunctions } from "./platforms/web/compiler";

type ComponentOption = {
  data?: () => Record<string, unknown>;
  methods?: { [key: string]: Function };
  computed?: { [key: string]: Function };
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
    const render = compileToFunctions(this.$el!.outerHTML);
    mountComponent(this, this.$el);

    // TODO: compile template and bind event listener
    this.$el!.innerHTML = this._data!.message as string;
    this.$el!.addEventListener("click", () => {
      (this as any).changeMessage();
    });
  }

  render() {
    this.$el!.innerHTML = this._data!.message as string;
  }
}
