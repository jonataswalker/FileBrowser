<template>
  <canvas></canvas>
</template>

<script>
import Pica from 'pica';
import { calcAspectRatio, isImage } from 'helpers/file';

export default {
  name: 'Thumb',
  props: { file: Object, id: String },
  data() {
    return { pica: Pica() };
  },
  mounted() {
    const { type, blob } = this.file;

    if (isImage(type)) {
      const thumb = document.createElement('canvas');
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const dimensions = calcAspectRatio(img.width, img.height, 120, 80);

        this.$el.width = thumb.width = dimensions.width;
        this.$el.height = thumb.height = dimensions.height;
        thumb.getContext('2d').drawImage(img, 0, 0);

        this.pica.resize(img, thumb)
          .then(result => this.pica.toBlob(result, 'image/jpeg', 90))
          .then(_blob_ => {
            this.$store.commit('upload/addThumb', {
              id: this.id,
              thumb: _blob_
            });

            this.$el.getContext('2d').drawImage(thumb, 0, 0);
            this.$emit('load');
          });
      };
    }
  }
};
</script>
