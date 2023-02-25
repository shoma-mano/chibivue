import { type ComponentInternalInstance } from "./component";
import { type ComponentOptions } from "./componentOptions";

export class ComponentPublicInstance {
  $!: ComponentInternalInstance;
  $data!: Record<string, unknown>;
  $options!: ComponentOptions;
  $el!: Element;

  $mount!: (el?: Element | string) => ComponentPublicInstance;
}
