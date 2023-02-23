import { Watcher } from "../reactivity/watcher";
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
  _vnode?: VNode | null;

  // private methods
  // lifecycle
  _init!: Function;
  _update!: (vNode: VNode) => void;
  // rendering
  _render!: () => VNode;

  __patch__!: (
    a: Element | VNode | null,
    b: VNode | null,
    parentElm?: any,
    refElm?: any
  ) => Element;
}

export type Data = Record<string, unknown>;
