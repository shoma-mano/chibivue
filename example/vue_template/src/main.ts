import { createApp } from "vue/dist/vue.esm-bundler";

const app = createApp({
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
  template: '<div @click="changeMessage">{{ message }}</div>',
});

app.mount("#app");
