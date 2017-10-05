import Vue from 'vue';
import App from './App.vue';
import store from './store';
import { draggable } from './directives';

Vue.directive('draggable', draggable);

const app = new Vue({
  store,
  mounted() {
    console.log('app mounted', this.$el);
  },
  render: h => h(App)
});

export { app, store };
