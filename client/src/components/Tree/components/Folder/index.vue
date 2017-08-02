<template>
  <li
    :style="folderStyle"
    :class="classObj"
    @click.stop="select">
    <a>
      <i class="material-icons">folder</i>
      <span>{{ tree.name }}</span>
    </a>
    <ol v-if="Object.keys(tree.folders)">
      <folder
        v-for="(folder, key) in tree.folders"
        :id="key"
        :tree="folder" />
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
        collapse: this.open,
        active: this.id === this.$store.state.tree.selected.id
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
  mounted() {
    console.log('tree', this.tree);
  },
  methods: {
    select() {

      // console.log(this.$store.state.tree.tree);

      if (!this.isRoot) {
        this.open = !this.open;
      }

      // console.log('select', this.tree, this.id);

      this.$store.dispatch('tree/select', {
        id: this.id,
        parents: this.tree.parents
      }).then(files => {
        console.log('res files', files);
      }).catch(console.error);
    }
  }
};
</script>
