<style lang="scss" module>
  .header {

  }
</style>

<template>
  <header class="fb-header">
    <div class="fb-header-title">
      <span>{{ text.TITLE }}</span>
      <span class="close"></span>
    </div>
    <div :class="messageClasses">{{ $store.state.message.message }}</div>
    <div class="fb-toolbar">
      <div class="fb-toolbar-items">
        <upload-button></upload-button>
        <my-button>
          <i class="material-icons">send</i>
          <span>{{ text.BUTTON.SEND }}</span>
        </my-button>
        <my-button @click.native="openFolder = true">
          <i class="material-icons">create_new_folder</i>
          <span>{{ text.BUTTON.NEW_FOLDER }}</span>
        </my-button>
        <my-button v-if="$store.state.tree.selected.id !== rootFolder">
          <i class="material-icons">delete_forever</i>
          <span>{{ text.BUTTON.DELETE_FOLDER }}</span>
        </my-button>
        <my-button
          v-if="$store.state.file.selected.length"
          @click.native="openFile = true">
          <i class="material-icons">delete_forever</i>
          <span>
            {{ text.BUTTON.DELETE_FILE }}
            ({{ $store.state.file.selected.length }})
          </span>
        </my-button>
        <my-button v-if="$store.state.file.selected.length">
          <i class="material-icons">publish</i>
          <span>{{ text.BUTTON.SEND_EDITOR }}</span>
        </my-button>
      </div>
    </div>
    <folder
      :open-folder="openFolder"
      @closeModal="openFolder = false"></folder>
    <file
      :open-file="openFile"
      @closeModal="openFile = false"></file>
  </header>
</template>

<script>
import MyButton from 'Button';
import UploadButton from 'UploadButton';
import Folder from 'Folder';
import File from 'File';
import { ROOT_ID } from 'konstants';

export default {
  name: 'Header',
  components: { MyButton, UploadButton, Folder, File },
  computed: {
    $style: function () {
      return this.$options.cssModules;
    },
    messageClasses: function () {
      return {
        'fb-message': true,
        'fb-show': this.$store.state.message.show,
        'fb-alert': this.$store.state.message.class === 'alert',
        'fb-success': this.$store.state.message.class === 'success'
      };
    }
  },
  data() {
    return {
      openFolder: false,
      openFile: false,
      rootFolder: ROOT_ID,
      text: this.$store.state.text
    };
  },
  methods: {
    removeFile() {
      this.$store.dispatch('file/remove');
    }
  }
};
</script>
