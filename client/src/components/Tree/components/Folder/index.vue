<style lang="scss" module>
  @import "helpers";

  .folder {
    padding-left: 1rem;
    span { margin-left: 3px }
  }
  .root {
    padding-left: 0;
  }
  .collapsed {
    overflow: hidden;
    max-height: $folder-height !important;
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
    :class="classObj">
    <a class="link" @click="select">
      <i class="material-icons">
        {{ open && hasChildren ? 'folder_open' : 'folder' }}
      </i>
      <span>{{ tree.name }}</span>
    </a>
    <ol v-if="hasChildren">
      <folder
        v-for="folder in folders"
        :key="folder[0]"
        :id="folder[0]"
        :tree="tree.folders[folder[0]]"></folder>
    </ol>
  </li>
</template>

<script>
import { ROOT_ID } from 'konstants';

export default {
  name: 'Folder',
  props: {
    tree: Object,
    id: [Number, String],
    collapsed: { type: Boolean, default: true }
  },
  computed: {
    $style() { return this.$options.cssModules },
    hasChildren() { return Object.keys(this.tree.folders).length },
    folders() {
      return Object.keys(this.tree.folders)
        .map(id => [id, this.tree.folders[id].name])
        .sort((a, b) => {
          const v1 = a[1].toUpperCase();
          const v2 = b[1].toUpperCase();
          return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
        });
    },
    classObj() {
      return {
        [this.$style.folder]: true,
        [this.$style.root]: this.isRoot,
        [this.$style.collapsed]: !this.open,
        [this.$style.active]: this.id === this.$store.state.tree.selected.id
      };
    }
  },
  data() {
    return {
      isRoot: this.id === ROOT_ID,
      open: !this.collapsed
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
