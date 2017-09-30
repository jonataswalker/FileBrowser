<style lang="scss" module>
  .invalid + label,
  .error {
    color: #e74c3c;
  }
</style>

<template>
  <div class="fl-input-container">
    <div class="mdc-textfield" ref="textfield">
      <input
        class="mdc-textfield__input"
        :type="type"
        :id="id"
        :class="inputClasses"
        :value="value"
        :disabled="disabled"
        :required="required"
        :minlength="minlength"
        :maxlength="maxlength"
        @keyup.enter="$emit('enter')"
        @blur="$emit('blur')"
        @input="onInput($event.target.value)">
      <label :for="id" class="mdc-textfield__label">{{ label }}</label>
    </div>
    <p :class="errMsgClasses" v-html="errorMsg"></p>
  </div>
</template>

<script>
import { MDCTextfield } from '@material/textfield';
import { guid } from 'helpers/mix';

export default {
  name: 'InputText',
  props: {
    type: { type: String, default: 'text' },
    id: { type: String, default: `i-${guid()}` },
    value: [String, Number],
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    minlength: Number,
    maxlength: Number,
    label: String,
    errorMsg: String,
    hasError: { type: Boolean, default: false }
  },
  data() {
    return { hasValue: false };
  },
  computed: {
    $style() { return this.$options.cssModules },
    inputClasses: function () {
      return {
        [this.$style.valid]: this.hasValue && !this.hasError,
        [this.$style.invalid]: this.hasError
      };
    },
    errMsgClasses: function () {
      return {
        [this.$style.error]: true,
        'mdc-textfield-helptext': true,
        'mdc-textfield-helptext--validation-msg': true,
        'mdc-textfield-helptext--persistent': this.hasError
      };
    }
  },
  mounted() {
    new MDCTextfield(this.$refs.textfield);
  },
  methods: {
    onInput(value) {
      this.$emit('input', value);
      this.hasValue = Boolean(value);
    }
  }
};
</script>
