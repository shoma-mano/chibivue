import { initMixin } from "./init";
import { renderMixin } from "./render";
import { lifecycleMixin } from "./lifecycle";
import { Component } from "~/packages/type/component";
import { ComponentOption } from "~/packages/type/option";

function Vue(this: Component, options: ComponentOption) {
  this._init(options);
}

// @ts-expect-error
initMixin(Vue);
// @ts-expect-error
renderMixin(Vue);
// @ts-expect-error
lifecycleMixin(Vue);

export default Vue;
