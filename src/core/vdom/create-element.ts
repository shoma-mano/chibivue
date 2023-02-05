import { Vue } from "~/src";

// TODO: create vnode
export function createElement(
  context: Vue,
  tag: string,
  data: Record<string, Function>,
  children: string
): HTMLElement {
  const el = document.createElement(tag);
  Object.entries(data).forEach(([key, value]) => {
    if (key.match(/^on(.+)/)) {
      el.addEventListener(key.slice(2).toLowerCase(), () =>
        value.apply(context)
      );
    }
  });
  el.textContent = children;
  return el;
}
