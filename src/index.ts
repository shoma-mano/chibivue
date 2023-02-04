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
	_data?: Record<string, unknown>;
	$el?: HTMLElement;

	constructor(options: ComponentOption) {
		this.$options = options;
		this.initState(this);
	}

	mount(selector: string) {
		this.$el = document.querySelector(selector)!;
		this.$el.innerHTML = this._data!.message as string;

		// TODO: compile template and bind event listener
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
		const data = this.$options.data();
		const _data = { ...data };
		Object.keys(data).forEach((key) => {
			Object.defineProperty(data, key, {
				get() {
					return _data[key];
				},
				set(newVal) {
					_data[key] = newVal;
					vm.render();
				},
			});
		});
		vm._data = data;
	}

	render() {
		this.$el!.innerHTML = this._data!.message as string;
	}
}
