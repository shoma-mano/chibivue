import { Watcher } from "../reactivity/effect";
import { ComponentInternalInstance } from "./component";
import { ComponentOptions } from "./componentOptions";
import { VNode } from "./vnode";

export class ComponentPublicInstance {
  $!: ComponentInternalInstance;

  // public properties
  $data!: Record<string, unknown>;
  $options!: ComponentOptions;
  $el!: Element;

  // public methods
  $mount!: (el?: Element | string) => ComponentPublicInstance;

  // private properties
  _computedWatchers!: { [key: string]: Watcher };

  // private methods
  // lifecycle
}
