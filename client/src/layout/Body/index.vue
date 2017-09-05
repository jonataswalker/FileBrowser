<template>
  <div class="fb-body">
    <div class="fb-tree-container">
      <tree></tree>
    </div>
    <div class="fb-thumb-container">
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
