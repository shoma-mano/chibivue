import { mutableHandlers } from "./baseHandler";

export interface Target {}

export const reactiveMap = new WeakMap<Target, any>();

export function reactive(target: Target) {
  const existingProxy = reactiveMap.get(target);

  if (existingProxy) {
    return existingProxy;
  }

  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);

  return proxy;
}
