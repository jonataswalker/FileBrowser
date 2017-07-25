<template>
<aside
  class="mdc-dialog"
  role="alertdialog"
  aria-labelledby="mdc-dialog-with-list-label"
  aria-describedby="mdc-dialog-with-list-description">
  <div class="mdc-dialog__surface">
    <header class="mdc-dialog__header">
      <h2 id="mdc-dialog-with-list-label" class="mdc-dialog__header__title">
        {{ title }}
      </h2>
    </header>
    <section
      id="mdc-dialog-with-list-description"
      class="mdc-dialog__body mdc-dialog__body--scrollable">
      <slot name="body"></slot>
    </section>
    <footer class="mdc-dialog__footer">
      <slot name="footer"></slot>
    </footer>
  </div>
  <div class="mdc-dialog__backdrop"></div>
</aside>
</template>

<script>
import { MDCDialog } from '@material/dialog';

export default {
  name: 'Modal',
  props: {
    title: String,
    active: { type: Boolean, default: false }
  },
  watch: {
    active: function (val) {
      val ? this.dialog.show() : this.dialog.close();
    }
  },
  data() { return { dialog: null }},
  mounted() {
    this.dialog = new MDCDialog(this.$el);
    this.dialog.listen('MDCDialog:cancel', () => this.$emit('close'));
  }
};
</script>
