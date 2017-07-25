<template>
<header class="fb-header">
  <div class="fb-header-title">
    <span>{{ text.TITLE }}</span>
    <span class="close"></span>
  </div>
  <div class="fb-message"></div>
  <div class="fb-toolbar">
    <div class="fb-toolbar-items">
      <my-button>
        <i class="material-icons">attach_file</i>
        <span>{{ text.TOOLBAR.BTN_CHOOSE }}</span>
      </my-button>
      <my-button>
        <i class="material-icons">send</i>
        <span>{{ text.TOOLBAR.BTN_SEND }}</span>
      </my-button>
      <my-button>
        <i class="material-icons">delete_forever</i>
        <span>{{ text.TOOLBAR.BTN_DEL_FILE }}</span>
      </my-button>
      <my-button @click.native="openCreate = true">
        <i class="material-icons">create_new_folder</i>
        <span>{{ text.TOOLBAR.BTN_NEW_FOLDER }}</span>
      </my-button>
      <my-button>
        <i class="material-icons">delete_forever</i>
        <span>{{ text.TOOLBAR.BTN_DEL_FOLDER }}</span>
      </my-button>
      <my-button>
        <i class="material-icons">publish</i>
        <span>{{ text.TOOLBAR.BTN_SEND_EDITOR }}</span>
      </my-button>
    </div>
  </div>
  <folder
    :open-create="openCreate"
    @closeModal="openCreate = false" />
</header>
</template>

<script>
import MyButton from 'Button';
import Folder from 'Folder';

export default {
  name: 'Header',
  components: { MyButton, Folder },
  data() {
    return {
      openCreate: false,
      text: this.$store.state.text
    };
  }
};
</script>
