<style lang="scss" module>
  .path {
    span {
      color: #333;
      margin: 0 5px;
      padding: 3px 6px;
      border-radius: 4px;
      box-shadow: 2px 2px 2px #999;
      background-color: #eee;
    }
  }
</style>

<template>
  <modal
    :active="modalActive"
    :title="text.FOLDER.NEW"
    @open="onOpenModal"
    @close="closeModal">
    <div slot="body">
      <h5>{{ text.FOLDER.CREATION }}</h5>
      <p class="path" v-html="hierarchy"></p>
      <input-text
        :value="value"
        :label="text.FOLDER.NEW"
        :required="true"
        :minlength="1"
        :maxlength="20"
        :hasError="creatingHasError"
        :errorMsg="creatingError"
        @enter="submit"
        @input="onInputNew"></input-text>
    </div>
    <div slot="footer">
      <my-button
        classes="is-dark"
        type="submit"
        @click.native="submit">Submit</my-button>
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
  props: ['openFolder'],
  components: { MyButton, Modal, InputText },
  computed: {
    hierarchy: function () {
      return this.$store.state.tree.hierarchy.map(each => {
        return `<span>${each}</span>`;
      }).join('→');
    }
  },
  data() {
    return {
      text: this.$store.state.text,
      modalActive: false,
      creatingHasError: false,
      creatingError: '',
      creatingName: '',
      value: ''
    };
  },
  watch: {
    openFolder: function (val, oldVal) {
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
    },
    onOpenModal() {
      this.creatingName = '';
      this.value = '';
    },
    closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    submit() {
      this.value = this.creatingName;
      this.$store.dispatch('folder/create', this.creatingName).then(res => {
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
