import { observe } from "../../reactivity";
import { Watcher } from "../../reactivity/watcher";
import { ComponentPublicInstance } from "../componentPublicInstance";

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

export function initState(vm: ComponentPublicInstance) {
  const opts = vm.$options;
  if (opts.data) initData(vm);
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.methods) initMethods(vm, opts.methods);
}

function initMethods(vm: ComponentPublicInstance, methods: { [key: string]: Function }) {
  Object.keys(methods).forEach((key) => {
    (vm as any)[key] = methods[key].bind(vm);
  });
}

function initData(vm: ComponentPublicInstance) {
  Object.keys(vm.$data!).forEach((key) => {
    proxy(vm, `_data`, key);
  });
  observe(vm.$data);
}

function initComputed(vm: ComponentPublicInstance, computed: { [key: string]: Function }) {
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
  return function computedGetter(this: ComponentPublicInstance) {
    return fn.call(this, this);
  };
}
