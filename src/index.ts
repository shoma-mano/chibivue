type ComponentOption = {
	data(): Record<string, unknown>;
	methods?: { [key: string]: Function };
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
		this.initState(options.data());
		console.log(this);
	}

	mount(selector: string) {
		this.$el = document.querySelector(selector)!;
		this.$el.innerHTML = this._data!.message as string;

		this.$el.addEventListener("click", () => {
			this.$options.methods?.changeMessage.apply(this._data);
		});
	}

	initState(data: Record<string, unknown>) {
		const vm = this;

		const _data = { ...data };
		Object.keys(data).forEach((key) => {
			Object.defineProperty(data, key, {
				get() {
					return _data[key];
				},
				set(newVal) {
					console.log("set", newVal);
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
