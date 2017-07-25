<template>
  <modal
    :active="modalActive"
    :title="text.FOLDER.NEW"
    @close="closeModal">
    <div slot="body">
      <input-text
        :label="text.FOLDER.NEW"
        :required="true"
        :hasError="creatingHasError"
        errorMsg="Fill..."
        @input="onInputNew" />
    </div>
    <div slot="footer">
      <my-button
        classes="is-dark"
        type="submit"
        @click.native="onSubmit">Submit</my-button>
      <my-button @click.native="closeModal">Cancel</my-button>
    </div>
  </modal>
</template>

<script>
import MyButton from 'Button';
import Modal from 'Modal';
import InputText from 'InputText';

export default {
  name: 'Folder',
  props: ['openCreate'],
  components: { MyButton, Modal, InputText },
  data() {
    return {
      text: this.$store.state.text,
      modalActive: false,
      creatingHasError: false,
      creatingName: ''
    };
  },
  watch: {
    openCreate: function (val, oldVal) {
      if (val) this.modalActive = true;
    }
  },
  methods: {
    createFolder() {
      this.modalActive = true;
    },
    onInputNew(value) {
      // this.creatingHasError = !value;
      console.log('onInputNew', value, this.creatingHasError);
    },
    closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    onSubmit() {
      console.log('onSubmit');
    }
  }
};
</script>
