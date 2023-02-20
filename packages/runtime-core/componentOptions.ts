import { VNode } from "./vnode";

export type ComponentOptions = {
  data?: () => Record<string, unknown>;
  methods?: { [key: string]: Function };
  computed?: { [key: string]: Function };
  render?: (
    h: (
      tag: string,
      data: Record<string, unknown>,
      children: (VNode | string)[] | string
    ) => VNode
  ) => VNode;
};
