import { isArray } from "../shared";
import { Dep, createDep } from "./dep";
import { EffectScope, recordEffectScope } from "./effectScope";

type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();

export let activeEffect: ReactiveEffect | undefined;

export const ITERATE_KEY = Symbol("");

export class ReactiveEffect<T = any> {
  public deps: Dep[] = [];
  constructor(public fn: () => T, scope?: EffectScope) {
    recordEffectScope(this, scope);
  }

  run() {
    activeEffect = this;
    this.fn();
  }
}

export function track(target: object, key: unknown) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = createDep()));
  }

  trackEffects(dep);
}

export function trackEffects(dep: Dep) {
  dep.add(activeEffect!);
  activeEffect!.deps.push(dep);
}

export function trigger(target: object, key?: unknown) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  let deps: (Dep | undefined)[] = [];
  if (key !== void 0) {
    deps.push(depsMap.get(key));
  }
  deps.push(depsMap.get(ITERATE_KEY));

  if (deps.length === 1 && deps[0]) {
    triggerEffects(deps[0]);
  }
}

export function triggerEffects(dep: Dep | ReactiveEffect[]) {
  const effects = isArray(dep) ? dep : [...dep];

  // TODO: computed
  // for (const effect of effects) {
  //   if (effect.computed) {
  //     triggerEffect(effect);
  //   }
  // }

  for (const effect of effects) {
    // if (!effect.computed) {
    triggerEffect(effect);
    // }
  }
}

function triggerEffect(effect: ReactiveEffect) {
  if (effect !== activeEffect) {
    effect.run();
  }
}
