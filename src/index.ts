type ComponentOption = {
	data(): Record<string, unknown>;
	methods?: { [key: string]: Function };
};

export const createApp = (options: ComponentOption): Vue => {
	return new Vue(options);
};

class Vue {
	$options: ComponentOption;
	_data: Record<string, unknown>;
	$el: HTMLElement | null = null;

	constructor(options: ComponentOption) {
		this.$options = options;
		this._data = options.data();
		console.log(this._data);
	}

	mount(selector: string) {
		this.$el = document.querySelector(selector)!;
		this.$el.innerHTML = this._data.message as string;

		this.$el.addEventListener("click", () => {
			this.$options.methods?.changeMessage.apply(this._data);
			this.render();
		});
	}

	render() {
		this.$el!.innerHTML = this._data.message as string;
	}
}
