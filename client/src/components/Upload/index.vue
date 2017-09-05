<template>
  <div class="fb-upload-preview">
    <figure
      class="fb-upload-preview-figure"
      v-for="(file, key) in $store.state.upload.previews">
      <img :src="file.image">
      <figcaption class="fb-upload-preview-info">
        <h5>{{ file.name}}</h5>
      </figcaption>
      <div class="fb-upload-preview-progress">
        <div class="fb-upload-preview-progress-bar"></div>
      </div>
    </figure>
  </div>
</template>

<script>
export default {
  name: 'Upload'
};
</script>
