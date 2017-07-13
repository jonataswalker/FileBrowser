<template>
  <div id="filebrowser-container">
    <div class="filebrowser-wrapper">
      <my-header></my-header>
      <my-body></my-body>
    </div>
  </div>
</template>

<script>
import MyHeader from './components/Header';
import MyBody from './components/Body';

export default {
  name: 'Layout',
  components: { MyHeader, MyBody }
};
</script>
