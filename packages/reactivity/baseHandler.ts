import { trigger } from "./effect";
import { Target } from "./reactive";

const get = /*#__PURE__*/ createGetter();
const set = /*#__PURE__*/ createSetter();

function createGetter() {
  return function get(target: Target, key: string | symbol, receiver: object) {
    return target;
  };
}

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

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
};
