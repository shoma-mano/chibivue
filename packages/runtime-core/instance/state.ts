import { observe } from "../../reactivity";
import { Watcher } from "../../reactivity/watcher";
import { Component } from "../component";

export function proxy(target: Object, sourceKey: string, key: string) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function proxyGetter() {
      return this[sourceKey][key];
    },
    set: function proxySetter(newVal) {
      this[sourceKey][key] = newVal;
    },
  });
}

export function initState(vm: Component) {
  const opts = vm.$options;
  if (opts.data) initData(vm);
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.methods) initMethods(vm, opts.methods);
}

function initMethods(vm: Component, methods: { [key: string]: Function }) {
  Object.keys(methods).forEach((key) => {
    (vm as any)[key] = methods[key].bind(vm);
  });
}

function initData(vm: Component) {
  Object.keys(vm._data!).forEach((key) => {
    proxy(vm, `_data`, key);
  });
  observe(vm._data);
}

function initComputed(vm: Component, computed: { [key: string]: Function }) {
  const watchers = (vm._computedWatchers = Object.create(null));

  Object.entries(computed).forEach(([key, getter]) => {
    watchers[key] = new Watcher(vm, getter, () => {});
    if (!(key in vm)) defineComputed(vm, key, getter);
  });
}

export function defineComputed(target: unknown, key: string, getter: Function) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: createGetterInvoker(getter),
  });
}

function createGetterInvoker(fn: Function) {
  return function computedGetter(this: Component) {
    return fn.call(this, this);
  };
}
