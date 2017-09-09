<style lang="scss" module>
  @import "helpers";

  .folder {
    height: $folder-height;
    padding-left: 1rem;
    transition: height 200ms ease-in;

    span { margin-left: 3px }
  }
  .root {
    padding-left: 0;
  }
  .collapsed {
    overflow: hidden;
    height: $folder-height !important;
    transition: height 200ms ease-out;
  }
  .active {
    > a {
      @include folder-selected;
    }
  }
  .link {
    @include flex-center;
    @include unselectable;
    margin-bottom: 1px;
    padding: 2px 5px;
    color: #acacac;
    text-shadow: 0 1px 0 black;
    font-size: .875rem;
    width: fit-content;

    &:hover { @include folder-selected }
  }
</style>

<template>
  <li
    :style="folderStyle"
    :class="classObj">
    <a class="link" @click="select">
      <i class="material-icons">folder</i>
      <span>{{ tree.name }}</span>
    </a>
    <ol v-if="Object.keys(tree.folders)">
      <folder
        v-for="(folder, key) in tree.folders"
        :key="key"
        :id="key"
        :tree="folder"></folder>
    </ol>
  </li>
</template>

<script>
import { ROOT_ID } from 'konstants';

export default {
  name: 'Folder',
  props: {
    tree: Object,
    id: String,
    collapsed: { type: Boolean, default: true }
  },
  computed: {
    $style() { return this.$options.cssModules },
    classObj() {
      return {
        [this.$style.folder]: true,
        [this.$style.root]: this.isRoot,
        [this.$style.collapsed]: this.open,
        [this.$style.active]: this.id === this.$store.state.tree.selected.id
      };
    }
  },
  data() {
    return {
      isRoot: this.id === ROOT_ID,
      open: this.collapsed,
      folderStyle: {
        height: (Object.keys(this.tree.folders).length + 1) * 28 + 'px'
      }
    };
  },
  methods: {
    select() {
      if (!this.isRoot) this.open = !this.open;

      this.$store.dispatch('tree/select', {
        id: this.id,
        parents: this.tree.parents
      });
    }
  }
};
</script>
