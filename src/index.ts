import { observe } from "./observer";

type ComponentOption = {
	data(): Record<string, unknown>;
	methods?: { [key: string]: Function };
	computed?: { [key: string]: Function };
};

export const createApp = (options: ComponentOption): Vue => {
	return new Vue(options);
};

class Vue {
	$options: ComponentOption;
	$el?: HTMLElement;
	_data?: Record<string, unknown>;

	constructor(options: ComponentOption) {
		this.$options = options;
		this._data = options.data();
		this.initState(this);
	}

	mount(selector: string) {
		this.$el = document.querySelector(selector)!;

		// TODO: compile template and bind event listener
		this.$el.innerHTML = this._data!.message as string;
		this.$el.addEventListener("click", () => {
			(this as any).changeMessage();
		});
	}

	initState(vm: Vue) {
		const opts = vm.$options;
		this.initData(vm);
		if (opts.methods) this.initMethods(vm, opts.methods);
	}

	initMethods(vm: Vue, methods: { [key: string]: Function }) {
		Object.keys(methods).forEach((key) => {
			(vm as any)[key] = methods[key].bind(vm._data);
		});
	}

	initData(vm: Vue) {
		observe(vm._data);
	}

	render() {
		this.$el!.innerHTML = this._data!.message as string;
	}
}
