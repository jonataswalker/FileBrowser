<style lang="scss" module>
  .body {
    display: flex;
    flex: 1;
    overflow: hidden;
    color: #333;
    background-color: #f5f5f5;
  }
  .tree-container {
    flex: 0 0 230px;
    order: -1;
    border: 1px solid #333;
    overflow: auto;
    background-color: #1d1f20;

    ol {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  }
  .thumb-container {
    flex: 1;
    overflow-y: auto;
  }
</style>

<template>
  <div class="body">
    <div class="tree-container">
      <tree></tree>
    </div>
    <div class="thumb-container">
      <upload v-if="$store.state.upload.pending"></upload>
      <thumb v-else></thumb>
    </div>
  </div>
</template>

<script>
import MyButton from 'Button';
import Tree from 'Tree';
import Thumb from 'Thumb';
import Upload from 'Upload';

export default {
  name: 'Body',
  components: { MyButton, Tree, Thumb, Upload }
};
</script>
