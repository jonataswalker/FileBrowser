<template>
  <modal
    :active="modalActive"
    :title="text.FOLDER.NEW"
    @open="onOpenModal"
    @close="closeModal">
    <div slot="body">
      <h5>{{ text.FOLDER.CREATION }}</h5>
      <my-path></my-path>
      <input-text
        v-model="creatingName"
        :label="text.FOLDER.NEW"
        :required="true"
        :minlength="1"
        :maxlength="20"
        :hasError="creatingHasError"
        :errorMsg="creatingError"
        @enter="submit"></input-text>
    </div>
    <div slot="footer">
      <my-button
        classes="is-dark"
        type="submit"
        :disabled="creatingHasError"
        @click.native="submit">Submit</my-button>
      <my-button @click.native="closeModal">Cancel</my-button>
    </div>
  </modal>
</template>

<script>
import MyPath from 'Path';
import MyButton from 'Button';
import Modal from 'Modal';
import InputText from 'InputText';

export default {
  name: 'Folder',
  props: ['openFolder'],
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
  watch: {
    openFolder: function (val, oldVal) {
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
      this.$store.dispatch('folder/create', this.creatingName)
        .then(res => {
          this.closeModal();
          this.$store.dispatch('message/show', {
            message: res,
            type: 'success'
          });
        }).catch(res => {
          console.log('catch submit Folder', res);
          this.closeModal();
          this.$store.dispatch('message/show', {
            message: res,
            type: 'alert'
          });
        });
    }
  }
};
</script>
