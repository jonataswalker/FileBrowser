<template>
  <modal
    :active="modalActive"
    :title="text.FOLDER.NEW"
    @open="onOpenModal"
    @close="closeModal">
    <div slot="body">
      <h5>{{ text.FOLDER.CREATION }}</h5>
      <p class="fb-folder-path" v-html="hierarchy"></p>
      <input-text
        :label="text.FOLDER.NEW"
        :required="true"
        :minlength="1"
        :maxlength="20"
        :hasError="creatingHasError"
        :errorMsg="creatingError"
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
      creatingError: '',
      creatingName: '',
      hierarchy: ''
    };
  },
  watch: {
    openCreate: function (val, oldVal) {
      if (val) this.modalActive = true;
    }
  },
  methods: {
    onInputNew(value) {
      this.creatingName = value;

      if (!value) {
        this.creatingHasError = true;
        this.creatingError = this.text.REQUIRED;
      } else {
        this.creatingHasError = !/^[a-zA-Z0-9\-_]{1,20}$/.test(value);
        this.creatingError = this.text.FOLDER.VALIDATION;
      }
      console.log('onInputNew', value, this.creatingHasError);
    },
    onOpenModal() {
      this.creatingName = '';
      this.hierarchy = `<span>${this.text.ROOT_FOLDER}</span>`;
    },
    closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    onSubmit() {
      console.log('onSubmit', this.creatingName);
      this.$store.dispatch('folder/create', this.creatingName).then(res => {
        this.closeModal();
        this.$store.dispatch('message/show', {
          message: res,
          type: 'success'
        });
      }).catch(res => {
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
