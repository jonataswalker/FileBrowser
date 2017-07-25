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
  components: { AppHeader, AppBody, AppFooter }
};
</script>
