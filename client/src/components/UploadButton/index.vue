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
import MyButton from 'Button';
import { safeFilename } from 'helpers/mix';

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
      const files = evt.target.files;

      this.$store.commit('upload/selected');

      Object.keys(files).forEach(key => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.$store.commit('upload/preview', {
            name: safeFilename(files[key].name),
            image: e.target.result
          });
        };
        reader.readAsDataURL(files[key]);
      });
    },
    attach() {
      console.log(this.$refs.input);
      // this.$refs.input.focus();
    }
  }
};
</script>
