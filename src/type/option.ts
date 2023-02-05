export type ComponentOption = {
  data?: () => Record<string, unknown>;
  methods?: { [key: string]: Function };
  computed?: { [key: string]: Function };
  render?: (
    h: (
      tag: string,
      data: Record<string, Function>,
      children: string
    ) => HTMLElement
  ) => HTMLElement;
};
