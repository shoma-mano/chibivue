import { isArray, isPlainObject } from "../../shared/utils";
import { Dep } from "./dep";

export function observe(value: unknown): Observer | void {
  if (isObserved(value)) return value.__ob__;

  if ((isArray(value) || isPlainObject(value)) && Object.isExtensible(value)) {
    return new Observer(value);
  }
}

class Observer {
  dep: Dep;

  constructor(value: unknown) {
    this.dep = new Dep();
    Object.defineProperty(value, "__ob__", {
      value: this,
      enumerable: false,
      configurable: false,
    });

    if (typeof value === "object" && value !== null) {
      if (isArray(value)) {
        this.observeArray(value);
      } else {
        const keys = Object.keys(value);
        keys.forEach((key) => {
          defineReactive(value, key);
        });
      }
    }
  }

  observeArray(array: Array<unknown>) {
    array.forEach((item) => observe(item));
  }
}

function defineReactive(obj: object, key: string): Dep | undefined {
  const dep = new Dep();

  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) return;
  const getter = property?.get;
  const setter = property?.set;

  let val: unknown;
  if (!getter || setter) {
    val = (obj as any)[key];
  }
  let childOb = observe(val);

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      const value = getter?.call(obj) ?? val;

      // depends
      if (Dep.target) dep.depend();
      childOb?.dep.depend();
      if (isArray(value)) dependArray(value);

      return value;
    },

    set(newVal) {
      if (setter) {
        setter.call(obj, newVal);
      } else if (getter) {
        return;
      } else {
        val = newVal;
      }
      childOb = observe(newVal);

      dep.notify();
    },
  });

  return dep;
}

function dependArray(array: Array<unknown>) {
  array.forEach((item) => {
    if (isObserved(item)) {
      item.__ob__.dep.depend();
      if (isArray(item)) dependArray(item);
    }
  });
}

function isObserved(value: unknown): value is { __ob__: Observer } {
  return (
    typeof value === "object" &&
    value !== null &&
    "__ob__" in value &&
    value.__ob__ instanceof Observer
  );
}
