import { ReactiveEffect } from "./effect";

let activeEffectScope: EffectScope | undefined;

export class EffectScope {
  effects: ReactiveEffect[] = [];
  parent: EffectScope | undefined;

  constructor() {
    this.parent = activeEffectScope;
  }

  run<T>(fn: () => T): T | undefined {
    const currentEffectScope = activeEffectScope;
    try {
      activeEffectScope = this;
      return fn();
    } finally {
      activeEffectScope = currentEffectScope;
    }
  }

  on() {
    activeEffectScope = this;
  }

  off() {
    activeEffectScope = this.parent;
  }
}

export function recordEffectScope(
  effect: ReactiveEffect,
  scope: EffectScope | undefined = activeEffectScope
) {
  if (scope) {
    scope.effects.push(effect);
  }
}
