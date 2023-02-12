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

  // private methods
  // lifecycle
  _init!: Function;
  _update!: Function;
  // rendering
  _render!: () => VNode;
}
