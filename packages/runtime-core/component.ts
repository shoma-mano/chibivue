import { Watcher } from "../reactivity/watcher";
import { ComponentOptions } from "./componentOptions";
import { VNode } from "./vnode";

export class Component {
  // public properties
  public $options!: ComponentOptions;
  public $el!: Element;

  // public methods
  public $mount!: (el?: Element | string) => Component;

  // private properties
  _data!: Record<string, unknown>;
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
