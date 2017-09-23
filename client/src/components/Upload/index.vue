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
      v-for="(file, key) in $store.state.upload.files">
      <upload-thumb
        :file="file"
        :id="key"
        @load="prepareUpload(file, key)"></upload-thumb>
      <figcaption class="info">
        <h5>{{ file.name}}</h5>
      </figcaption>
      <progress-bar :width="progressWidth[key]"></progress-bar>
    </figure>
  </div>
</template>

<script>
import axios from 'axios';
import Pica from 'pica';
import UploadThumb from './components/Thumb';
import ProgressBar from './components/ProgressBar';
import { ROUTES } from 'konstants';
import { isImage, calcAspectRatio } from 'helpers/mix';

export default {
  name: 'Upload',
  components: { UploadThumb, ProgressBar },
  data() {
    return { pica: Pica(), progressWidth: [] };
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
              this.upload(file);
            });
        };
      } else {
        this.upload(file);
      }
    },
    upload(file) {
      const dir = this.$store.state.tree.hierarchy.slice(1).join('/');
      const data = new FormData();
      data.append('id', file.id);
      data.append('name', file.name);
      data.append('file', file.blob);
      data.append('directory', dir);

      const config = {
        onUploadProgress: (e) => {
          const progress = Math.round((e.loaded * 100) / e.total);
          this.$set(this.progressWidth, file.id, progress);
        }
      };

      axios.post(ROUTES.FILES.UPLOAD, data, config)
        .then(res => {
          console.log('uploaded', res.data);
          this.$store.commit('upload/done', file.id);
        })
        .catch(console.error);
    }
  }
};
</script>
