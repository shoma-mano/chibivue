let uid = 0;
export class Dep {
	static target?: DepTarget | null;
	id: number;
	subs: Array<DepTarget | null>;

	constructor() {
		this.id = uid++;
		this.subs = [];
	}

	depend() {
		if (Dep.target) {
			Dep.target.addDep(this);
		}
	}

	notify() {
		const subs = this.subs.filter((s): s is DepTarget => Boolean(s));
		subs.forEach((sub) => {
			sub.update();
		});
	}
}

interface DepTarget {
	id: number;
	addDep(dep: Dep): void;
	update(): void;
}
