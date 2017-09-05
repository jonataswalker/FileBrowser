<template>
  <modal
    :active="modalActive"
    :title="text.FILE.DEL"
    @open="onOpenModal"
    @close="closeModal">
    <div slot="body">
      <h5>{{ text.FILE.DEL }}</h5>
      <p class="fb-folder-path" v-html="hierarchy"></p>
      <ul>
        <li v-for="idx in $store.state.file.selected" :key="idx">
          {{ $store.state.tree.selected.files[idx].name }}
        </li>
      </ul>
    </div>
    <div slot="footer">
      <my-button
        classes="is-dark"
        type="submit"
        @click.native="onSubmit">{{ text.BUTTON.CONFIRM }}</my-button>
      <my-button @click.native="closeModal">
        {{ text.BUTTON.CANCEL }}
      </my-button>
    </div>
  </modal>
</template>

<script>
import MyButton from 'Button';
import Modal from 'Modal';

export default {
  name: 'Folder',
  props: ['openFile'],
  components: { MyButton, Modal },
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
      modalActive: false
    };
  },
  watch: {
    openFile: function (val, oldVal) {
      if (val) this.modalActive = true;
    }
  },
  methods: {
    onOpenModal() {
    },
    closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    onSubmit() {
      this.$store.dispatch('file/remove').then(res => {
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
