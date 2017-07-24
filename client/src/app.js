import Vue from 'vue';
import App from './App.vue';
import { OPTIONS } from 'konstants';

const app = new Vue({
  data: { options: OPTIONS, text: {}},
  render: h => h(App)
});

export { app };
