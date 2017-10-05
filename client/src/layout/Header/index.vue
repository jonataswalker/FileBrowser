<style lang="scss" module>
  .header {
    display: flex;
    flex-flow: column;
  }
  .title {
    width: 100%;
    height: 35px;
    line-height: 35px;
    padding: 0 10px;
    vertical-align: middle;
    cursor: grab;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-bottom: 1px solid #c9c9c9;
    background: linear-gradient(#f0f0f0, #b0b0b0);

    span:first-child { font-weight: 700 }
  }
  .toolbar {
    display: flex;
    width: 100%;
    padding: 5px;
    margin-top: -1px;
    background-color: #e9e9e9;
    border: 1px solid #9e9e9e;
    border-right: 0;
    border-left: 0;
  }
  .toolbar-items {
    display: flex;

    >*:not(:last-child) {
      margin-right: 2px;
    }
  }
  .message {
    height: 0;
    overflow: hidden;
    color: #444;
    transition: all 200ms cubic-bezier(0, 0, 1, 1);
  }
  .alert { background-color: rgba(237, 212, 0, 0.95) }
  .success { background-color: #8ae234 }
  .show {
    border: 1px solid transparent;
    padding: 5px;
    height: 35px;
  }
</style>

<template>
  <header class="header">
    <div class="title" v-draggable>
      <span>{{ text.TITLE }}</span>
      <span class="close"></span>
    </div>
    <div class="message" :class="messageClasses">
      {{ $store.state.message.message }}
    </div>
    <div class="toolbar">
      <div class="toolbar-items">
        <upload-button></upload-button>
        <my-button @click.native="createFolder = true">
          <i class="material-icons">create_new_folder</i>
          <span>{{ text.BUTTON.NEW_FOLDER }}</span>
        </my-button>
        <my-button
          v-if="$store.state.tree.selected.id !== rootFolder"
          @click.native="removeFolder = true">
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
        <my-button
          v-if="$store.state.file.selected.length"
          @click.native="sendEditor">
          <i class="material-icons">publish</i>
          <span>{{ text.BUTTON.SEND_EDITOR }}</span>
        </my-button>
      </div>
    </div>
    <folder
      :creating="createFolder"
      :removing="removeFolder"
      @closeModal="createFolder = removeFolder = false"></folder>
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
import { isImage } from 'helpers/file';

export default {
  name: 'Header',
  components: { MyButton, UploadButton, Folder, File },
  computed: {
    $style() { return this.$options.cssModules },
    messageClasses() {
      return {
        [this.$style.show]: this.$store.state.message.show,
        [this.$style.alert]: this.$store.state.message.class === 'alert',
        [this.$style.success]: this.$store.state.message.class === 'success'
      };
    }
  },
  data() {
    return {
      createFolder: false,
      removeFolder: false,
      openFile: false,
      rootFolder: ROOT_ID,
      text: this.$store.state.text
    };
  },
  methods: {
    sendEditor() {
      const { editor } = this.$store.state.options;

      this.$store.state.file.selected.forEach(idx => {
        const file = this.$store.state.tree.selected.files[idx];
        console.log('sendEditor', idx, file);

        if (isImage(file.extension)) {
          const img = `<img src="${file.path}/${file.name}">`;
          editor.insertHtml(img);
        }
      });
    }
  }
};
</script>
