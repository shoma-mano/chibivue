import { Vue } from "..";
import { isObject } from "../shared/utils";
import { Dep, DepTarget } from "./dep";

let uid = 0;

export class Watcher implements DepTarget {
  id: number;
  value: unknown;
  cb: Function;
  getter: Function;
  newDepIds: Set<number>;
  vm?: Vue | null;

  constructor(vm: Vue | null, getter: Function, cb: Function) {
    this.id = uid++;
    this.vm = vm;
    this.cb = cb;
    this.getter = getter;
    this.newDepIds = new Set();
    this.value = this.get();
  }

  addDep(dep: Dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      dep.addSub(this);
    }
  }

  update() {
    this.run();
  }

  run() {
    const value = this.get();
    if (value !== this.value || isObject(value)) {
      const oldValue = this.value;
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }

  get() {
    Dep.target = this;
    this.value = this.getter.call(this.vm, this.vm);
    Dep.target = null;
  }
}
