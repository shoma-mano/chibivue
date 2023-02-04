import { createApp } from "~/src/index";

const App = createApp({
	data() {
		return {
			message: "Hello chibi-vue!",
		};
	},
});

App.mount("#app");
