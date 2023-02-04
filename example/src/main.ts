import { createApp } from "~/src/index";

/**
 * implicit
 *
 * <template>
 *  <div id="app" v-on:click="changeMessage">{{ message }}</div>
 * <template>
 */
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
