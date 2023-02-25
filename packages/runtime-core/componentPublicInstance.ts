import { hasOwn } from "../shared";
import { type ComponentInternalInstance } from "./component";
import { type ComponentOptions } from "./componentOptions";

export class ComponentPublicInstance {
  $!: ComponentInternalInstance;
  $data!: Record<string, unknown>;
  $options!: ComponentOptions;
  $el!: Element;

  $mount!: (el?: Element | string) => ComponentPublicInstance;
}

export interface ComponentRenderContext {
  [key: string]: any;
  _: ComponentInternalInstance;
}

export const PublicInstanceProxyHandlers: ProxyHandler<any> = {
  get({ _: instance }: ComponentRenderContext, key: string) {
    const { ctx, data, type } = instance;
    if (hasOwn(data, key)) {
      return data[key];
    } else if (hasOwn(ctx, key)) {
      return ctx[key];
    }
  },
};
