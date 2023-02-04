import { Vue } from "~/src";
import { observe } from "~/src/observer";
import { Watcher } from "~/src/observer/watcher";

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

export function initState(vm: Vue) {
  const opts = vm.$options;
  if (opts.data) initData(vm);
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.methods) initMethods(vm, opts.methods);
}

function initMethods(vm: Vue, methods: { [key: string]: Function }) {
  Object.keys(methods).forEach((key) => {
    (vm as any)[key] = methods[key].bind(vm);
  });
}

function initData(vm: Vue) {
  Object.keys(vm._data!).forEach((key) => {
    proxy(vm, `_data`, key);
  });
  observe(vm._data);
}

function initComputed(vm: Vue, computed: { [key: string]: Function }) {
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
  return function computedGetter(this: Vue) {
    return fn.call(this, this);
  };
}
