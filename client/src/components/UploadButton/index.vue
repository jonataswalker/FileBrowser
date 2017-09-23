<style lang="scss" module>
  .container {
    position: relative;
    overflow: hidden;

    [type=file] {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 15rem;
      opacity: 0;
      cursor: pointer;
    }
  }
</style>

<template>
  <div :class="$style.container">
    <my-button>
      <i class="material-icons">attach_file</i>
      <span>{{ text.BUTTON.CHOOSE }}</span>
    </my-button>
    <input
      ref="input"
      type="file"
      accept="image/*"
      multiple
      name="testsss"
      :disabled="isSaving"
      @change="filesChange">
  </div>
</template>

<script>
import FileType from 'file-type';
import MyButton from 'Button';
import { ID, safeFilename } from 'helpers/mix';
import { FILE_TYPES } from 'konstants';

export default {
  name: 'UploadButton',
  components: { MyButton },
  data() {
    return {
      isSaving: false,
      text: this.$store.state.text
    };
  },
  computed: {
    $style: function () {
      return this.$options.cssModules;
    }
  },
  methods: {
    filesChange(evt) {
      console.log('filesChange', evt.target.files);
      const targets = evt.target.files;

      this.$store.commit('upload/selected');

      Object.keys(targets).forEach(key => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(targets[key]);

        reader.onload = (e) => {
          const buffer = e.target.result;
          const type = FileType(new Uint8Array(buffer, 0, 4100));

          if (FILE_TYPES.includes(type.ext)) {
            this.$store.commit('upload/preview', {
              id: ID(),
              type: type.ext,
              mime: type.mime,
              blob: new Blob([buffer], { type: type.mime }),
              name: safeFilename(targets[key].name)
            });
          }
        };


        // img.onload = (e) => {
        //   console.log('onload', ID());
        //   this.$store.commit('upload/preview', {
        //     id: ID(),
        //     image: img,
        //     name: safeFilename(targets[key].name)
        //   });
        // };
      });
    },
    attach() {
      console.log(this.$refs.input);
      // this.$refs.input.focus();
    }
  }
};
</script>
