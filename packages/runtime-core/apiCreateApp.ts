import { Component } from "./component";
import { RootRenderFunction } from "./renderer";
import { createVNode } from "./vnode";

export interface App<HostElement = any> {
  mount(rootContainer: HostElement): void;
}

export type CreateAppFunction<HostElement> = (
  rootComponent: Component
) => App<HostElement>;

export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent) {
    const app: App = {
      mount(rootContainer: HostElement) {
        const vnode = createVNode(rootComponent as Component);
        render(vnode, rootContainer);
      },
    };

    return app;
  };
}
