import Vue from "../../../core/instance";
import { mountComponent } from "../../../core/instance/lifecycle";
import { Component } from "../../../type/component";
import { patch } from "./patch";

// install platform patch function
Vue.prototype.__patch__ = patch;

// public mount method
Vue.prototype.$mount = function (el?: string | Element): Component {
  if (el) {
    this.$el = typeof el === "string" ? document.querySelector(el) : el;
  }
  return mountComponent(this, this.$el);
};

export default Vue;
