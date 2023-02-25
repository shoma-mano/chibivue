import { ReactiveEffect } from "../reactivity/effect";
import { EffectScope } from "../reactivity/effectScope";
import { ComponentOptions, applyOptions } from "./componentOptions";
import { ComponentPublicInstance } from "./componentPublicInstance";
import { VNode } from "./vnode";

export type ConcreteComponent = ComponentOptions;

export interface ComponentInternalInstance {
  type: ConcreteComponent;

  /**
   * Vnode representing this component in its parent's vdom tree
   */
  vnode: VNode;
  proxy: ComponentPublicInstance | null;
  effect: ReactiveEffect;
  scope: EffectScope;

  // TODO:
  // directives: Record<string, Directive> | null

  render: () => VNode;
  update: (vNode: VNode) => void;

  /**
   * This is the target for the public instance proxy. It also holds properties
   * injected by user options (computed, methods etc.) and user-attached
   * custom properties (via `this.x = ...`)
   * @internal
   */
  ctx: Data;

  // state
  data: Data;

  // TODO:
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

export type Data = Record<string, unknown>;

export function createComponentInstance(
  vnode: VNode
): ComponentInternalInstance {
  const type = vnode.type as ConcreteComponent;
  const instance: ComponentInternalInstance = {
    type,
    vnode,
    proxy: null,
    update: null!,
    render: null!,
    effect: null!,
    scope: new EffectScope(),
    ctx: {},
    data: {},
  };

  return instance;
}

export let currentInstance: ComponentInternalInstance | null = null;

export const setCurrentInstance = (instance: ComponentInternalInstance) => {
  currentInstance = instance;
  instance.scope.on();
};

export const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  currentInstance = null;
};

export const setupComponent = (instance: ComponentInternalInstance) => {
  setCurrentInstance(instance);
  applyOptions(instance);
  unsetCurrentInstance();
};
