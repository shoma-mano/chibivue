import { isOn } from "../shared";
import { patchEvent } from "./modules/events";
import { type RendererOptions } from "../runtime-core";
import { patchDOMProp } from "./modules/props";
import { patchAttr } from "./modules/attrs";

type DOMRendererOptions = RendererOptions<Node, Element>;

export const patchProp: DOMRendererOptions["patchProp"] = (
  el,
  key,
  prevValue,
  nextValue
) => {
  if (key === "class") {
    // TODO: patch class
  } else if (key === "style") {
    // TODO: patch style
  } else if (isOn(key)) {
    patchEvent(el, key, nextValue);
  } else if (!["type", "placeholder"].includes(key)) {
    patchDOMProp(el, key, nextValue);
  } else {
    patchAttr(el, key, nextValue);
  }
};
