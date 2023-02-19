import { Watcher } from "../core/observer/watcher";
import { VNode } from "../core/vdom/vnode";
import { ComponentOption } from "./option";

export class Component {
  // public properties
  public $options!: ComponentOption;
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
