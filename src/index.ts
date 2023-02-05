import { Component } from "./type/component";
import { ComponentOption } from "./type/option";
import Vue from "./platforms/web/runtime";

export interface App {
  mount(el: string | Element): void;
}

export function createApp(options: ComponentOption): App {
  // @ts-expect-error
  const vm: Component = new Vue(options);

  return {
    mount(el: string | Element) {
      vm.$mount(el);
      vm._update(vm._render()); // initial render
    },
  };
}

export default Vue;
