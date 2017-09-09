<style lang="scss" module>
  .thumb {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  .figure {
    position: relative;
    width: 160px;
    height: 160px;
    margin: 8px;
    overflow: hidden;
    border: 5px solid #c6c6c6;
    transition: border-color 300ms;

    &:hover {
      cursor: pointer;
      border-color: #949494;

      .info {
        opacity: .9;
        color: #111;
      }
    }

    &.selected {
      border-color: #1d1f20;

      .info {
        opacity: .9;
        color: #111;
      }
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 3px;
    opacity: .6;
    background-color: #e9e9e9;
    transition: opacity 300ms;

    :first-child {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      font-size: .75rem;
      font-weight: 700;
    }

    :last-child {
      font-weight: 400;
    }
  }

  .checked {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>

<template>
  <div class="thumb">
    <figure
      class="figure"
      v-for="(file, key) in $store.state.tree.selected.files"
      :class="{ [$style.selected]: isSelected(key) }"
      @click="toggleSelect(key)">
      <i
        class="material-icons checked"
        v-show="isSelected(key)">check_box</i>
      <img :src="file.path + '/' + file.name">
      <figcaption class="info">
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
  computed: {
    $style() { return this.$options.cssModules }
  },
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
