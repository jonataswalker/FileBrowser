<template>
  <li
    :style="folderStyle"
    :class="classObj">
    <a class="fb-tree-folder-link" @click="select">
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
    classObj: function () {
      return {
        'fb-tree-folder': true,
        'fb-tree-root-folder': this.isRoot,
        'fb-tree-folder-collapsed': this.open,
        'fb-tree-folder-active': this.id === this.$store.state.tree.selected.id
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
