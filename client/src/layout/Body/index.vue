<template>
<div class="fb-body">
  <tree />
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
import Tree from 'Tree';

export default {
  name: 'Body',
  components: { MyButton, Tree }
};
</script>
