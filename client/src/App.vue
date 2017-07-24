<template>
  <div id="filebrowser-container">
    <div class="filebrowser-wrapper">
      <app-header></app-header>
      <app-body></app-body>
      <app-footer></app-footer>
    </div>
  </div>
</template>

<script>
import AppHeader from './layout/Header';
import AppBody from './layout/Body';
import AppFooter from './layout/Footer';

export default {
  name: 'App',
  components: { AppHeader, AppBody, AppFooter },
  mounted() {
    console.log('fetching ... ', this.$root.options);

    const { options } = this.$root;

    const config = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    fetch(options.server + '/files', config)
      .then(res => res.json())
      .then(jsonData => { console.log(jsonData) })
      .catch(console.error);
  }
};
</script>
