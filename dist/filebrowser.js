/*!
 * FileBrowser - v1.3.0
 * ${description}
 * ${homepage}
 * Built: Tue Jul 25 2017 15:34:15 GMT-0300 (-03)
 */

var FileBrowser = (function (Vue,_material_ripple,_material_dialog,_material_textfield,Vuex) {
'use strict';

Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue;
Vuex = Vuex && Vuex.hasOwnProperty('default') ? Vuex['default'] : Vuex;

var MyButton = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('button',{staticClass:"mdc-button mdc-button--raised mdc-button--primary mdc-button--dense",class:_vm.classes,attrs:{"type":_vm.type,"disabled":_vm.disabled}},[_vm._t("default")],2)},staticRenderFns: [],
  name: 'Button',
  props: {
    text: String,
    classes: String,
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false }
  },
  mounted: function mounted() {
    new _material_ripple.MDCRipple(this.$el);
  }
};

var Modal = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('aside',{staticClass:"mdc-dialog",attrs:{"role":"alertdialog","aria-labelledby":"mdc-dialog-with-list-label","aria-describedby":"mdc-dialog-with-list-description"}},[_c('div',{staticClass:"mdc-dialog__surface"},[_c('header',{staticClass:"mdc-dialog__header"},[_c('h2',{staticClass:"mdc-dialog__header__title",attrs:{"id":"mdc-dialog-with-list-label"}},[_vm._v(_vm._s(_vm.title))])]),_c('section',{staticClass:"mdc-dialog__body mdc-dialog__body--scrollable",attrs:{"id":"mdc-dialog-with-list-description"}},[_vm._t("body")],2),_c('footer',{staticClass:"mdc-dialog__footer"},[_vm._t("footer")],2)]),_c('div',{staticClass:"mdc-dialog__backdrop"})])},staticRenderFns: [],
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
  data: function data() { return { dialog: null }},
  mounted: function mounted() {
    var this$1 = this;

    this.dialog = new _material_dialog.MDCDialog(this.$el);
    this.dialog.listen('MDCDialog:cancel', function () { return this$1.$emit('close'); });
  }
};

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
  const _p8 = function (s) {
    const p = (Math.random().toString(16) + '000000000').substr(2,8);
    return s ? ("-" + (p.substr(0,4)) + "-" + (p.substr(4,4))) : p;
  };
  return _p8() + _p8(true) + _p8(true) + _p8();
}

var InputText = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fl-input-container"},[_c('div',{ref:"textfield",staticClass:"mdc-textfield"},[_c('input',{staticClass:"mdc-textfield__input",class:_vm.inputClasses,attrs:{"type":_vm.type,"id":_vm.id,"disabled":_vm.disabled,"required":_vm.required},domProps:{"value":_vm.inputValue},on:{"blur":function($event){_vm.$emit('blur');},"input":_vm.onInput}}),_c('label',{staticClass:"mdc-textfield__label",attrs:{"for":_vm.id}},[_vm._v(_vm._s(_vm.label))])]),_c('p',{directives:[{name:"show",rawName:"v-show",value:(_vm.hasError),expression:"hasError"}],staticClass:"mdc-textfield-helptext mdc-textfield-helptext--persistent mdc-textfield-helptext--validation-msg"},[_vm._v(_vm._s(_vm.errorMsg))])])},staticRenderFns: [],
  name: 'InputText',
  props: {
    type: { type: String, default: 'text' },
    id: { type: String, default: ("i-" + (guid())) },
    value: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    label: String,
    errorMsg: String,
    hasError: { type: Boolean, default: false }
  },
  data: function data() {
    return { hasValue: false, inputValue: this.value };
  },
  computed: {
    inputClasses: function () {
      return {
        'fl-input': true,
        'fl-valid': this.hasValue && !this.hasError,
        'fl-invalid': this.hasError
      };
    },
    errMsgClasses: function () {
      return {
        'fl-error-msg': true,
        'fl-error-show': this.hasError
      };
    }
  },
  mounted: function mounted() {
    new _material_textfield.MDCTextfield(this.$refs.textfield);
  },
  methods: {
    onInput: function onInput(evt) {
      this.hasValue = Boolean(evt.target.value);
      this.inputValue = evt.target.value;
      this.$emit('input', evt.target.value);
    }
  }
};

var Folder = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('modal',{attrs:{"active":_vm.modalActive,"title":_vm.text.FOLDER.NEW},on:{"close":_vm.closeModal}},[_c('div',{slot:"body"},[_c('input-text',{attrs:{"label":_vm.text.FOLDER.NEW,"required":true,"hasError":_vm.creatingHasError,"errorMsg":"Fill..."},on:{"input":_vm.onInputNew}})],1),_c('div',{slot:"footer"},[_c('my-button',{attrs:{"classes":"is-dark","type":"submit"},nativeOn:{"click":function($event){_vm.onSubmit($event);}}},[_vm._v("Submit")]),_c('my-button',{nativeOn:{"click":function($event){_vm.closeModal($event);}}},[_vm._v("Cancel")])],1)])},staticRenderFns: [],
  name: 'Folder',
  props: ['openCreate'],
  components: { MyButton: MyButton, Modal: Modal, InputText: InputText },
  data: function data() {
    return {
      text: this.$store.state.text,
      modalActive: false,
      creatingHasError: false,
      creatingName: ''
    };
  },
  watch: {
    openCreate: function (val, oldVal) {
      if (val) { this.modalActive = true; }
    }
  },
  methods: {
    createFolder: function createFolder() {
      this.modalActive = true;
    },
    onInputNew: function onInputNew(value) {
      // this.creatingHasError = !value;
      console.log('onInputNew', value, this.creatingHasError);
    },
    closeModal: function closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    onSubmit: function onSubmit() {
      console.log('onSubmit');
    }
  }
};

var AppHeader = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('header',{staticClass:"fb-header"},[_c('div',{staticClass:"fb-header-title"},[_c('span',[_vm._v(_vm._s(_vm.text.TITLE))]),_vm._v(" "),_c('span',{staticClass:"close"})]),_c('div',{staticClass:"fb-message"}),_c('div',{staticClass:"fb-toolbar"},[_c('div',{staticClass:"fb-toolbar-items"},[_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("attach_file")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_CHOOSE))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("send")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_SEND))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_DEL_FILE))])]),_c('my-button',{nativeOn:{"click":function($event){_vm.openCreate = true;}}},[_c('i',{staticClass:"material-icons"},[_vm._v("create_new_folder")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_NEW_FOLDER))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_DEL_FOLDER))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("publish")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_SEND_EDITOR))])])],1)]),_c('folder',{attrs:{"open-create":_vm.openCreate},on:{"closeModal":function($event){_vm.openCreate = false;}}})],1)},staticRenderFns: [],
  name: 'Header',
  components: { MyButton: MyButton, Folder: Folder },
  data: function data() {
    return {
      openCreate: false,
      text: this.$store.state.text
    };
  }
};

var AppBody = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-body"},[_c('div',{staticClass:"fb-tree-container"},[_c('ol',{attrs:{"id":"fb-tree"}},[_c('li',{staticClass:"active open",attrs:{"id":"fb-tree-folder-root"}},[_c('a',[_c('i',{staticClass:"icomoon-folder"}),_vm._v(" "),_c('span',{attrs:{"id":"folder-root-desc"}},[_vm._v(_vm._s(_vm.text.ROOT_FOLDER))])])])])]),_vm._m(0)])},staticRenderFns: [function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-thumb-container"},[_c('ul',{staticClass:"fb-thumb",attrs:{"id":"fb-thumb"}}),_c('div',{staticClass:"js-fileapi-wrapper"},[_c('input',{staticClass:"input-file",attrs:{"id":"upload-input","name":"files","type":"file","multiple":"multiple"}})]),_c('ul',{staticClass:"fb-upload-thumb",attrs:{"id":"upload-thumb","data-label":"\n      lang.preview\n    "}})])}],
  name: 'Body',
  components: { MyButton: MyButton },
  data: function data() {
    return { text: this.$store.state.text };
  }
};

var AppFooter = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('footer',{staticClass:"fb-footer"})},staticRenderFns: [],
  name: 'Footer'
};

var App = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"filebrowser-container"}},[_c('div',{staticClass:"filebrowser-wrapper"},[_c('app-header'),_c('app-body'),_c('app-footer')],1)])},staticRenderFns: [],
  name: 'App',
  components: { AppHeader: AppHeader, AppBody: AppBody, AppFooter: AppFooter }
};

const LANG = {
  EN: 'en',
  BR: 'pt-br'
};

const OPTIONS = {
  lang: 'en'
};

const TEXT = {
  TITLE: 'Image Browser',
  ROOT_FOLDER: 'Root Folder',
  PREVIEW: 'Sending Preview',
  SEND_TO_EDITOR: 'Send to Editor',
  TOOLBAR: {
    BTN_CHOOSE: 'Choose',
    BTN_SEND: 'Send',
    BTN_DEL_FILE: 'Delete File',
    BTN_NEW_FOLDER: 'New Folder',
    BTN_DEL_FOLDER: 'Delete Folder',
    BTN_SEND_EDITOR: 'Send to Editor'
  },
  FILE: {
    TOTAL: 'Total Files:',
    DEL: 'Delete File',
    DELS: 'Delete Files'
  },
  FOLDER: {
    NEW: 'New Folder',
    DEL: 'Delete Folder',
    CREATION: 'This folder will be created inside:',
    MINIMUM: [
      '<p>Min-length: 1 - Max-length: 10',
      '<br>Only <span class="strong">letters</span>, ',
      '<span class="strong">numbers</span> ',
      'and the following characters: <span class="highlight">. - _</span></p>'
    ].join(''),
    DELETION: [
      '<p class="folder-path">This folder <span>%1</span>',
      ' will be removed with all its contents: </p>',
      '<p>Total Files: <span class="destaque">%2</span>',
      ' &mdash; Total Subfolders: <span class="destaque">%3</span></p>'
    ].join('')
  },
  ALERT: {
    BTN_OK: 'OK',
    BTN_CANCEL: 'Cancel',
    IMAGE: {
      NOT_MIN_SIZE: 'Only images with minimum %1 x %2!'
    },
    UPLOAD: {
      SENDING: 'An upload is already in progress!',
      NONE: 'No file!',
      SENT: 'All done!'
    }
  }
};

const text = Object.assign({}, TEXT);

text.TITLE = 'Image Browser';
text.ROOT_FOLDER = 'Root Folder';
text.PREVIEW = 'Sending Preview';
text.SEND_TO_EDITOR = 'Send to Editor';
text.TOOLBAR.BTN_CHOOSE = 'Escolha';
text.TOOLBAR.BTN_SEND = 'Envie';



/*
 * Language specific
 */
// FB.lang['pt-br'] = {
//   title: 'Image Browser',
//   root_folder: 'Root Folder',
//   preview: 'Sending Preview',
//   send_to_editor: 'Send to Editor',
//   toolbar: {
//     bt_choose: 'Escolha',
//     bt_send: 'Envie',
//     bt_del_file: 'Remover Arquivo',
//     bt_new_folder: 'Nova Pasta',
//     bt_del_folder: 'Remover Pasta',
//     bt_send_editor: 'Enviar para o Editor'
//   },
//   file: {
//     total: 'Total de Arquivos:',
//     del: 'Remover Arquivo',
//     dels: 'Remover Arquivos'
//   },
//   folder: {
//     new_: 'Nova Pasta',
//     del: 'Remover Pasta',
//     creation: 'Esta pasta será criada em:',
//     minimum: [
//       '<p>Preenchimento mínimo: 1 - máximo: 10',
//       '<br>Apenas <span class="strong">letras</span>, ',
//       '<span class="strong">números</span>',
//       ' e os seguintes caracteres: <span class="highlight">. - _</span></p>'
//     ].join(''),
//     deletion: [
//       '<p class="folder-path">Esta pasta <span>%1</span>',
//       ' será removida juntamente com todo seu conteúdo: </p>',
//       '<p>Total de Arquivos: <span class="destaque">%2</span>',
//       ' &mdash; Total de Sub-Pastas: <span class="destaque">%3</span></p>'
//     ].join('')
//   },
//   alert: {
//     bt_ok: 'OK',
//     bt_cancel: 'Cancelar',
//     image: {
//       not_min_size: 'Apenas imagens com no mínimo %1 x %2!'
//     },
//     upload: {
//       sending: 'Um envio já está em andamento!',
//       none: 'Nenhum arquivo foi selecionado!',
//       sent: 'Todos os arquivos já foram enviados!'
//     }
//   }
// };

var store = new Vuex.Store({
  state: {
    options: OPTIONS,
    text: {},
    tree: {},
    folderSelected: null
  },
  actions: {
    getTree: function getTree(ref) {
      var commit = ref.commit;
      var state = ref.state;

      const config = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      fetch(state.options.server + '/files', config)
        .then(function (res) { return res.json(); })
        .then(function (tree) {
          console.log('getTree', tree);
          commit('changeTree', tree);
        })
        .catch(console.error);
    }
  },
  mutations: {
    changeTree: function changeTree(state, tree) {
      state.tree = tree;
    },
    mergeOptions: function mergeOptions(state, opts) {
      state.options = Object.assign(state.options, opts);
      switch (state.options.lang) {
        case LANG.BR:
          state.text = text;
          break;
        default:
          state.text = TEXT;
      }
    }
  }
});

const app = new Vue({
  store: store,
  render: function (h) { return h(App); }
});

var FileBrowser = function FileBrowser(el, options) {
  if ( options === void 0 ) options = {};

  store.commit('mergeOptions', options);
  store.dispatch('getTree');
  app.$mount(el);
};

return FileBrowser;

}(Vue,mdc.ripple,mdc.dialog,mdc.textfield,Vuex));
