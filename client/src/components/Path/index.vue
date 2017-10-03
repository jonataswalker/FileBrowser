<style lang="scss" module>
  .path {
    span {
      position: relative;
      color: #333;
      margin: 0 5px;
      padding: 3px 6px;
      border-radius: 4px;
      box-shadow: 2px 2px 2px #999;
      background-color: #ddd;
    }
  }
</style>
<template>
  <p class="path">
    <span
      v-for="(folder, index) in $store.state.tree.hierarchy"
      :key="index">
      {{ folder }}
    </span>
  </p>
</template>
<script>
export default {
  name: 'Path'
};
</script>
