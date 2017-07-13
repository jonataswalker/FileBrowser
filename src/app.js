import Vue from 'vue';
import App from './App.vue';
import { OPTIONS } from './constants';

const app = new Vue({
  data: { options: OPTIONS, text: {}},
  render: h => h(App)
});

export { app };
