import { createVNode } from "./vnode";
import { type ComponentPublicInstance } from "./componentPublicInstance";
import { type RootRenderFunction } from "./renderer";

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
