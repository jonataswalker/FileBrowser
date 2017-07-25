<template>
<div class="fb-body">
  <div class="fb-tree-container">
    <ol id="fb-tree">
      <li id="fb-tree-folder-root" class="active open">
        <a>
          <i class="icomoon-folder"></i>
          <span id="folder-root-desc">
            {{ text.ROOT_FOLDER }}
          </span>
        </a>
      </li>
    </ol>
  </div>
  <div class="fb-thumb-container">
    <ul id="fb-thumb" class="fb-thumb"></ul>
    <!-- "js-fileapi-wrapper" -- required class -->
    <div class="js-fileapi-wrapper">
      <input id="upload-input" class="input-file" name="files"
        type="file" multiple />
    </div>
    <ul id="upload-thumb" class="fb-upload-thumb" data-label="
      lang.preview
    "></ul>
  </div>
</div>
</template>

<script>
import MyButton from 'Button';

export default {
  name: 'Body',
  components: { MyButton },
  data() {
    return { text: this.$store.state.text };
  }
};
</script>
