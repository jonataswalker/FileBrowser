<template>
  <div class="fb-thumb">
    <figure
      class="fb-thumb-figure"
      v-for="(file, key) in $store.state.tree.selected.files"
      :class="{ 'fb-selected': isSelected(key) }"
      @click="toggleSelect(key)">
      <i
        class="material-icons fb-thumb-checked"
        v-show="isSelected(key)">check_box</i>
      <img :src="file.path + '/' + file.name">
      <figcaption class="fb-thumb-info">
        <h5>{{ file.name}}</h5>
        <h5>{{ fileSize(file.size) }}</h5>
      </figcaption>
    </figure>
  </div>
</template>

<script>
import { bytesToSize } from 'helpers/mix';

export default {
  name: 'Thumb',
  computed: {},
  methods: {
    toggleSelect(idx) {
      this.$store.commit('file/toggleSelect', idx);
    },
    isSelected(key) {
      return this.$store.state.file.selected.includes(key);
    },
    fileSize(bytes) {
      return bytesToSize(bytes);
    }
  }
};
</script>
