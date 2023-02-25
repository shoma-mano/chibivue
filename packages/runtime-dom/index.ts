import { createRenderer, CreateAppFunction } from "../runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const renderer = createRenderer({ ...nodeOps, patchProp });

export const createApp: CreateAppFunction<Element> = (...args) => {
  const app = renderer.createApp(...args);
  return app;
};

// NOTE: unused
export const render = renderer.render;
