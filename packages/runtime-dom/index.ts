import { createRenderer, CreateAppFunction } from "../runtime-core";
import { nodeOps } from "./nodeOps";

const renderer = createRenderer(nodeOps);

export const createApp: CreateAppFunction<Element> = (...args) => {
  const app = renderer.createApp(...args);
  return app;
};

// NOTE: unused
export const render = renderer.render;
