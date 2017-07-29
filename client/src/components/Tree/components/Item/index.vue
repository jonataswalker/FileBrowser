<template>
  <li
    class="active open"
    :style="folderStyle"
    :class="{ 'collapse': open }"
    :data-folders="tree.folders.length"
    :data-files="tree.files.length"
    @click.stop="collapse">
    <a>
      <i class="material-icons">folder</i>
      <span id="folder-root-desc">{{ tree.name }}</span>
    </a>
    <ol v-if="tree.folders.length">
      <item
        :collapsed="true"
        :isRoot="false"
        v-for="folder in tree.folders"
        :tree="folder" />
    </ol>
  </li>
</template>

<script>
export default {
  name: 'Item',
  props: {
    tree: Object,
    isRoot: { type: Boolean, default: true },
    collapsed: Boolean
  },
  computed: {},
  data() {
    return {
      open: this.collapsed,
      folderStyle: {
        height: (this.tree.folders.length + 1) * 34 + 'px'
      }
    };
  },
  mounted() {
    console.log('tree', this.tree.name, this.folderStyle);
  },
  methods: {
    collapse() {
      console.log('collapse', this.tree.name, this.isRoot);
      if (this.isRoot) return;
      this.open = !this.open;
    }
  }
};
</script>
