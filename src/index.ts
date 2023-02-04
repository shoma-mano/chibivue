type ComponentOption = {
	data(): Record<string, unknown>;
};

export const createApp = (options: ComponentOption): Vue => {
	return new Vue(options);
};

class Vue {
	$options: ComponentOption;
	_data: Record<string, unknown>;

	constructor(options: ComponentOption) {
		this.$options = options;
		this._data = options.data();
		console.log(this._data);
	}

	mount(selector: string) {
		const root = document.querySelector(selector)!;
		root.innerHTML = this._data.message as string;
	}
}
