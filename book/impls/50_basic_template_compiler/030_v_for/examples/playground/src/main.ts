import { createApp, defineComponent } from "chibivue";

const App = defineComponent({
  setup() {
    const FRUITS = [
      {
        name: "Apple",
        color: "red",
      },
      {
        name: "Banana",
        color: "yellow",
      },
      {
        name: "Orange",
        color: "orange",
      },
    ];

    return { FRUITS };
  },

  template: `<div>
    <ul>
      <li v-for="fruit in FRUITS" :key="fruit.name">
        <span :style="{ color: fruit.color }"> {{ fruit.name }} </span>
      </li>
    </ul>
  </div>`,
});

const app = createApp(App);

app.mount("#app");
