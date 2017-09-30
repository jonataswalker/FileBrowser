<style lang="scss" module>
  .container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;

    canvas {
      margin: auto;
      max-height: max-content;
    }
  }
  .figure {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    width: 200px;
    height: 150px;
    margin: 8px;
    padding: 5px;
    overflow: hidden;
    border-radius: 3px;
    box-shadow: 0 3px 7px rgba(0, 0, 0, .6);
    background: linear-gradient(#f6f7fb, #ccdbd1);
  }
  .info {
    width: 50%;
  }
</style>

<template>
  <div class="container">
    <figure
      class="figure"
      v-for="(file, key) in $store.state.upload.files"
      :key="key">
      <upload-thumb
        :file="file"
        :id="key"
        @load="prepareUpload(file, key)"></upload-thumb>
      <figcaption class="info">
        <h5>{{ file.name}}</h5>
      </figcaption>
      <progress-bar
        :width="$store.getters['upload/progress'](key)"></progress-bar>
    </figure>
  </div>
</template>

<script>
import Pica from 'pica';
import UploadThumb from './components/Thumb';
import ProgressBar from './components/ProgressBar';
import { isImage, calcAspectRatio } from 'helpers/file';

export default {
  name: 'Upload',
  components: { UploadThumb, ProgressBar },
  data() {
    return { pica: Pica() };
  },
  methods: {
    prepareUpload(file, key) {
      file.id = key;
      if (isImage(file.type)) {
        const img = new Image();
        img.src = URL.createObjectURL(file.blob);
        img.onload = () => {
          const dimensions = calcAspectRatio(img.width, img.height, 1200, 800);
          const canvas = document.createElement('canvas');
          canvas.width  = dimensions.width;
          canvas.height = dimensions.height;
          canvas.getContext('2d').drawImage(img, 0, 0);

          this.pica.resize(img, canvas)
            .then(res => this.pica.toBlob(res, file.mime, 90))
            .then(_blob_ => {
              file.blob = _blob_;
              this.$store.dispatch('upload/send', file);
            });
        };
      } else {
        this.$store.dispatch('upload/send', file);
      }
    }
  }
};
</script>
