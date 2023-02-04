// @ts-nocheck
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
      count: 0,
    };
  },
  methods: {
    changeMessage() {
      this.count++;
      this.message = `Hello chibi-vue! ${this.count} * 2 = ${this.countDouble}`;
    },
  },
  computed: {
    countDouble() {
      return this.count * 2;
    },
  },
});

App.mount("#app");
