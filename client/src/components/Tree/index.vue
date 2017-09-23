<template>
  <ol>
    <folder
      v-if="$store.state.tree.ready"
      :id="root"
      :collapsed="false"
      :tree="$store.state.tree.tree[root]"></folder>
  </ol>
</template>

<script>
import Folder from './components/Folder';
import { ROOT_ID } from 'konstants';

export default {
  name: 'Tree',
  components: { Folder },
  data() {
    return {
      text: this.$store.state.text,
      root: ROOT_ID
    };
  }
};
</script>
