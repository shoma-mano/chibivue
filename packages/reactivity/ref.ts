import { Dep, createDep } from "./dep";
import { trackEffects, triggerEffects } from "./effect";
import { toReactive } from "./reactive";

export interface Ref<T = any> {
  value: T;
}

type RefBase<T> = {
  dep?: Dep;
  value: T;
};

function trackRefValue(ref: RefBase<any>) {
  trackEffects(ref.dep || (ref.dep = createDep()));
}

function triggerRefValue(ref: RefBase<any>) {
  if (ref.dep) triggerEffects(ref.dep);
}

export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>;
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true);
}

export function ref<T = any>(): Ref<T | undefined>;
export function ref(value?: unknown) {
  return createRef(value, false);
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}

class RefImpl<T> {
  private _value: T;
  public dep?: Dep = undefined;
  public readonly __v_isRef = true;

  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._value = __v_isShallow ? value : toReactive(value);
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newVal) {
    this._value = toReactive(newVal);
    triggerRefValue(this);
  }
}
