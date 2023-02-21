import { Component } from "./component";
import { RootRenderFunction } from "./renderer";

export interface App<HostElement = any> {
  mount(rootContainer: HostElement | string): void;
}

export type CreateAppFunction<HostElement> = (
  rootComponent: Component
) => App<HostElement>;

export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent) {
    const app: App = {
      mount(rootContainer: HostElement | string) {
        // TODO:
        // const vnode = createVNode(
        //   rootComponent as ConcreteComponent,
        //   rootProps
        // )
        // render(vnode, rootContainer)
        // // store app context on the root VNode.
        // // this will be set on the root instance on initial mount.
        // vnode.appContext = context
        // app._container = rootContainer
      },
    };

    return app;
  };
}
