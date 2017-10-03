<style lang="scss" module>
  .folder {
    span {
      color: #333;
      margin: 0 5px;
      padding: 3px 6px;
      border-radius: 4px;
      box-shadow: 2px 2px 2px #999;
      background-color: #ddd;
    }
  }
</style>

<template>
  <modal
    :active="modalActive"
    :title="creating ? text.FOLDER.NEW : text.FOLDER.DEL"
    @open="onOpenModal"
    @close="closeModal">
    <div slot="body">
      <div v-if="creating">
        <h5>{{ text.FOLDER.CREATION }}</h5>
        <my-path></my-path>
        <InputText
          v-model="creatingName"
          :label="text.FOLDER.NEW"
          :required="true"
          :minlength="1"
          :maxlength="20"
          :hasError="creatingHasError"
          :errorMsg="creatingError"
          @enter="submit" />
      </div>
      <div class="folder" v-else v-html="deleteMessage"></div>
    </div>
    <div slot="footer">
      <my-button
        classes="is-dark"
        type="submit"
        :disabled="creating && creatingHasError"
        @click.native="submit">
        {{ creating ? text.BUTTON.SUBMIT : text.BUTTON.CONFIRM }}
      </my-button>
      <my-button @click.native="closeModal">
        {{ text.BUTTON.CANCEL }}
      </my-button>
    </div>
  </modal>
</template>

<script>
import MyPath from 'Path';
import MyButton from 'Button';
import Modal from 'Modal';
import InputText from 'InputText';
import { folderStatistics } from 'helpers/folder';

export default {
  name: 'Folder',
  props: {
    creating: Boolean,
    removing: Boolean
  },
  components: { MyButton, Modal, InputText, MyPath },
  data() {
    return {
      text: this.$store.state.text,
      modalActive: false,
      creatingHasError: false,
      creatingError: '',
      creatingName: ''
    };
  },
  computed: {
    deleteMessage() {
      if (!this.$store.state.tree.ready) return '';

      const { folder } = this.$store.getters['tree/selectedFolder'];
      const statistics = folderStatistics(folder);
      const message = this.text.FOLDER.DELETION
        .replace('%1', folder.name)
        .replace('%2', statistics.files)
        .replace('%3', statistics.folders);

      return message;
    }
  },
  watch: {
    creating: function (val) {
      if (val) this.modalActive = true;
    },
    removing: function (val) {
      if (val) this.modalActive = true;
    },
    creatingName: function (val) {
      if (!val) {
        this.creatingHasError = true;
        this.creatingError = this.text.REQUIRED;
      } else {
        this.creatingHasError = !/^[a-zA-Z0-9\-_]{1,20}$/.test(val);
        this.creatingError = this.text.FOLDER.VALIDATION;
      }
    }
  },
  methods: {
    onOpenModal() {
      this.creatingName = '';
    },
    closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    submit() {
      const { dispatch } = this.$store;
      if (this.creating) {
        dispatch('folder/create', this.creatingName).then(this.closeModal);
      } else {
        dispatch('folder/remove').then(this.closeModal);
      }
    }
  }
};
</script>
