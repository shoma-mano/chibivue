import { isOn } from "../shared";
import { patchEvent } from "./modules/events";
import { type RendererOptions } from "../runtime-core";

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
  } else {
    // TODO: patch attrs
  }
};
