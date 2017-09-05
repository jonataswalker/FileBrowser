<template>
  <div class="fl-input-container">
    <div class="mdc-textfield" ref="textfield">
      <input
        class="mdc-textfield__input"
        :type="type"
        :id="id"
        :class="inputClasses"
        :value="inputValue"
        :disabled="disabled"
        :required="required"
        :minlength="minlength"
        :maxlength="maxlength"
        @blur="$emit('blur')"
        @input="onInput">
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
    value: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    minlength: Number,
    maxlength: Number,
    label: String,
    errorMsg: String,
    hasError: { type: Boolean, default: false }
  },
  data() {
    return { hasValue: false, inputValue: this.value };
  },
  computed: {
    inputClasses: function () {
      return {
        'fb-input': true,
        'fb-valid': this.hasValue && !this.hasError,
        'fb-invalid': this.hasError
      };
    },
    errMsgClasses: function () {
      // console.log('errMsgClasses', this.hasError);
      return {
        'fb-error-msg': true,
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
    onInput(evt) {
      this.hasValue = Boolean(evt.target.value);
      this.inputValue = evt.target.value;
      this.$emit('input', evt.target.value);
    }
  }
};
</script>
