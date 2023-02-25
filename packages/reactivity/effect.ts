import { Component } from "../runtime-core";
import { isArray, isObject } from "../shared/utils";
import { Dep, DepTarget, _Dep, createDep } from "./dep";

let uid = 0;

export class Watcher implements DepTarget {
  id: number;
  value: unknown;
  cb: Function;
  getter: Function;
  newDepIds: Set<number>;
  vm?: Component | null;

  constructor(vm: Component | null, getter: Function, cb: Function) {
    this.id = uid++;
    this.vm = vm;
    this.cb = cb;
    this.getter = getter;
    this.newDepIds = new Set();
    this.value = this.get();
  }

  addDep(dep: Dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      dep.addSub(this);
    }
  }

  update() {
    this.run();
  }

  run() {
    const value = this.get();
    if (value !== this.value || isObject(value)) {
      const oldValue = this.value;
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }

  get() {
    Dep.target = this;
    this.value = this.getter.call(this.vm, this.vm);
    Dep.target = null;
  }
}

type KeyToDepMap = Map<any, _Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();

export let activeEffect: ReactiveEffect | undefined;

export const ITERATE_KEY = Symbol("");

export class ReactiveEffect<T = any> {
  public deps: _Dep[] = [];
  constructor(public fn: () => T) {}

  run() {
    activeEffect = this;
    this.fn();
  }
}

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
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

export function trackEffects(dep: _Dep) {
  dep.add(activeEffect!);
  activeEffect!.deps.push(dep);
}

export function trigger(target: object, key?: unknown) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    // never been tracked
    return;
  }

  let deps: (_Dep | undefined)[] = [];

  // object
  if (key !== void 0) {
    deps.push(depsMap.get(key));
  }
  deps.push(depsMap.get(ITERATE_KEY));

  if (deps.length === 1 && deps[0]) {
    triggerEffects(deps[0]);
  } else {
  }
}

export function triggerEffects(dep: _Dep | ReactiveEffect[]) {
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
