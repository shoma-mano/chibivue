import { Dep } from "./dep";
import { ReactiveEffect } from "./effect";
import { Ref, trackRefValue } from "./ref";

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T;
}

interface WritableComputedRef<T> extends Ref<T> {
  readonly effect: ReactiveEffect<T>;
}

type ComputedGetter<T> = (...args: any[]) => T;

export class ComputedRefImpl<T> {
  public dep?: Dep = undefined;
  private _value!: T;
  public readonly effect: ReactiveEffect<T>;
  public readonly __v_isRef = true;

  constructor(getter: ComputedGetter<T>) {
    this.effect = new ReactiveEffect(getter);
    this.effect.computed = this;
  }

  get value() {
    trackRefValue(this);
    this._value = this.effect.run()!;
    return this._value;
  }

  set value(_: T) {
    // readonly
    return;
  }
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>;
export function computed<T>(getter: ComputedGetter<T>) {
  return new ComputedRefImpl(getter);
}
