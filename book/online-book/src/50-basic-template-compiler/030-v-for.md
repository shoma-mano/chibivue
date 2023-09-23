# v-for の実装

## 今回目指す開発者インターフェース

いつものように、目指すゴールから確認しておきます。

```ts
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

    <hr />

    <ul>
      <li v-for="fruit in FRUITS" :key="fruit.name">
        <li v-for="fruit2 in [...FRUITS].revers()" :key="fruit2.name">
          <span :style="{ color: fruit2.color }"> {{ fruit.name }} </span>
        </li>
      </li>
    </ul>
  </div>`,
});

const app = createApp(App);

app.mount("#app");
```

## AST と Parser の実装

v-for は実はただのディレクティブではありません。
