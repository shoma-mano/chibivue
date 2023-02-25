import { track, trigger } from "./effect";
import { type Target } from "./reactive";

const get = createGetter();
function createGetter() {
  return function get(target: Target, key: string | symbol, receiver: object) {
    track(target, key);
    return Reflect.get(target, key, receiver);
  };
}

const set = createSetter();
function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ) {
    const result = Reflect.set(target, key, value, receiver);
    trigger(target, key);
    return result;
  };
}

export const mutableHandlers: ProxyHandler<object> = { get, set };
