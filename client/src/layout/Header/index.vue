<template>
<header class="fb-header">
  <div class="fb-header-title">
    <span>{{ $root.text.TITLE }}</span>
    <span class="close"></span>
  </div>
  <div class="fb-message"></div>
  <div class="fb-toolbar">
    <div class="fb-toolbar-items">
      <my-button>
        <i class="material-icons">attach_file</i>
        <span>{{ $root.text.TOOLBAR.BTN_CHOOSE }}</span>
      </my-button>
      <my-button>
        <i class="material-icons">send</i>
        <span>{{ $root.text.TOOLBAR.BTN_SEND }}</span>
      </my-button>
      <my-button>
        <i class="material-icons">delete_forever</i>
        <span>{{ $root.text.TOOLBAR.BTN_DEL_FILE }}</span>
      </my-button>
      <my-button>
        <i class="material-icons">create_new_folder</i>
        <span>{{ $root.text.TOOLBAR.BTN_NEW_FOLDER }}</span>
      </my-button>
      <my-button>
        <i class="material-icons">delete_forever</i>
        <span>{{ $root.text.TOOLBAR.BTN_DEL_FOLDER }}</span>
      </my-button>
      <my-button>
        <i class="material-icons">publish</i>
        <span>{{ $root.text.TOOLBAR.BTN_SEND_EDITOR }}</span>
      </my-button>
    </div>
  </div>
</header>
</template>

<script>
import MyButton from 'Button';

export default {
  name: 'Header',
  components: { MyButton }
};
</script>
