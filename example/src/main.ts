import { createApp } from "~/src/index";

const App = createApp({
	data() {
		return {
			message: "Hello chibi-vue!",
		};
	},
	methods: {
		changeMessage() {
			this.message = "Hello chibi-vue! (changed)";
		},
	},
});

App.mount("#app");
