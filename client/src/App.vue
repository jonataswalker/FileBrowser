<style lang="scss" module>
  @import 'helpers';
  @import "@material/theme/mdc-theme";

  .container {
    position: absolute;
    z-index: 111;
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    flex-flow: column;
    min-width: 450px;
    width: $container-width;
    height: 100%;
    min-height: 250px;
    max-height: calc(100vh - 10px);
    margin: auto;
    overflow: hidden;
    background-color: #fff;
    border: 1px solid rgb(170, 170, 170);
    box-shadow: rgba(0, 0, 0, .3) 1px 1px 3px;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
    box-sizing: border-box;

    *,
    *:before,
    *:after { box-sizing: inherit }

    h1, h2, h3, h4, h5, h6 { margin: 0 }

    button {
      font-family: inherit;

      i, span { vertical-align: middle }
    }

    &.modal { overflow: visible }
  }

  .wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

</style>

<template>
  <div
    class="container"
    :class="{ [$style.modal]: $store.state.modal.active }">
    <div class="wrapper">
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
  computed: {
    $style() { return this.$options.cssModules }
  }

};
</script>
