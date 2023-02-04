import { Vue } from "~/src";
import { observe } from "~/src/observer";

export function initState(vm: Vue) {
	const opts = vm.$options;
	initData(vm);
	if (opts.methods) initMethods(vm, opts.methods);
}

function initMethods(vm: Vue, methods: { [key: string]: Function }) {
	Object.keys(methods).forEach((key) => {
		(vm as any)[key] = methods[key].bind(vm._data);
	});
}

function initData(vm: Vue) {
	observe(vm._data);
}
