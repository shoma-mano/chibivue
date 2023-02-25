import { ComponentPublicInstance } from "./componentPublicInstance";
import { RootRenderFunction } from "./renderer";
import { createVNode } from "./vnode";

export interface App<HostElement = any> {
  mount(rootContainer: HostElement | string): void;
}

export type CreateAppFunction<HostElement> = (
  rootComponent: ComponentPublicInstance
) => App<HostElement>;

export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent) {
    const app: App = {
      mount(rootContainer: HostElement) {
        const vnode = createVNode(rootComponent as ComponentPublicInstance);
        render(vnode, rootContainer);
      },
    };

    return app;
  };
}
