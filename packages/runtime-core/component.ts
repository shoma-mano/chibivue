import { ComponentOptions } from "./componentOptions";
import { VNode } from "./vnode";

export type ConcreteComponent = ComponentOptions;

export interface ComponentInternalInstance {
  type: ConcreteComponent;

  /**
   * Vnode representing this component in its parent's vdom tree
   */
  vnode: VNode;

  // TODO:
  // effect: ReactiveEffect
  // render: InternalRenderFunction | null
  // directives: Record<string, Directive> | null
  // proxy: ComponentPublicInstance | null
  // ctx: Data

  // state
  // data: Data
  // props: Data
  // attrs: Data
  // emit: EmitFn

  // [LifecycleHooks.BEFORE_CREATE]: LifecycleHook
  // [LifecycleHooks.CREATED]: LifecycleHook
  // [LifecycleHooks.BEFORE_MOUNT]: LifecycleHook
  // [LifecycleHooks.MOUNTED]: LifecycleHook
  // [LifecycleHooks.BEFORE_UPDATE]: LifecycleHook
  // [LifecycleHooks.UPDATED]: LifecycleHook
  // [LifecycleHooks.BEFORE_UNMOUNT]: LifecycleHook
  // [LifecycleHooks.UNMOUNTED]: LifecycleHook
  // [LifecycleHooks.RENDER_TRACKED]: LifecycleHook
  // [LifecycleHooks.RENDER_TRIGGERED]: LifecycleHook
  // [LifecycleHooks.ACTIVATED]: LifecycleHook
  // [LifecycleHooks.DEACTIVATED]: LifecycleHook
  // [LifecycleHooks.ERROR_CAPTURED]: LifecycleHook
  // [LifecycleHooks.SERVER_PREFETCH]: LifecycleHook<() => Promise<unknown>>
}

export function createComponentInstance(
  vnode: VNode
): ComponentInternalInstance {
  const type = vnode.type as ConcreteComponent;
  const instance: ComponentInternalInstance = { type, vnode };

  return instance;
}
