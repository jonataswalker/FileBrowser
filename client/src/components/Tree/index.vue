<template>
  <div class="fb-tree-container">
    <ol>
      <item
        :tree="$store.state.tree.tree" />
    </ol>
  </div>
</template>

<script>
import Item from './components/Item';

export default {
  name: 'Tree',
  components: { Item },
  data() {
    return {
      text: this.$store.state.text
    };
  }
};
</script>
