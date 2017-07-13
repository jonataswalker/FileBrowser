<template>
<button
  class="mdc-button mdc-button--raised mdc-button--primary mdc-button--dense"
  :class="classes"
  :type="type"
  :disabled="disabled">
  <slot></slot>
</button>
</template>

<script>
import { MDCRipple } from '@material/ripple';

export default {
  name: 'Button',
  props: {
    text: String,
    classes: String,
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false }
  },
  mounted() {
    new MDCRipple(this.$el);
  }
};
</script>
