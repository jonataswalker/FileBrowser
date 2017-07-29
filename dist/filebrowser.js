/*!
 * FileBrowser - v1.3.0
 * ${description}
 * ${homepage}
 * Built: Sat Jul 29 2017 09:17:35 GMT-0300 (-03)
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

var Modal = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('aside',{staticClass:"mdc-dialog",attrs:{"role":"alertdialog","aria-labelledby":"mdc-dialog-with-list-label","aria-describedby":"mdc-dialog-with-list-description"}},[_c('div',{staticClass:"mdc-dialog__surface"},[_c('header',{staticClass:"mdc-dialog__header"},[_c('h2',{staticClass:"mdc-dialog__header__title",attrs:{"id":"mdc-dialog-with-list-label"}},[_vm._v(_vm._s(_vm.title))])]),_c('section',{staticClass:"mdc-dialog__body mdc-dialog__body--scrollable",attrs:{"id":"mdc-dialog-with-list-description"}},[_vm._t("body")],2),_c('footer',{staticClass:"fb-dialog-footer mdc-dialog__footer"},[_vm._t("footer")],2)]),_c('div',{staticClass:"mdc-dialog__backdrop"})])},staticRenderFns: [],
  name: 'Modal',
  props: {
    title: String,
    active: { type: Boolean, default: false }
  },
  watch: {
    active: function (val) {
      if (val) {
        this.$emit('open');
        this.dialog.show();
      } else {
        this.$emit('close');
        this.dialog.close();
      }
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

var InputText = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fl-input-container"},[_c('div',{ref:"textfield",staticClass:"mdc-textfield"},[_c('input',{staticClass:"mdc-textfield__input",class:_vm.inputClasses,attrs:{"type":_vm.type,"id":_vm.id,"disabled":_vm.disabled,"required":_vm.required,"minlength":_vm.minlength,"maxlength":_vm.maxlength},domProps:{"value":_vm.inputValue},on:{"blur":function($event){_vm.$emit('blur');},"input":_vm.onInput}}),_c('label',{staticClass:"mdc-textfield__label",attrs:{"for":_vm.id}},[_vm._v(_vm._s(_vm.label))])]),_c('p',{class:_vm.errMsgClasses,domProps:{"innerHTML":_vm._s(_vm.errorMsg)}})])},staticRenderFns: [],
  name: 'InputText',
  props: {
    type: { type: String, default: 'text' },
    id: { type: String, default: ("i-" + (guid())) },
    value: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    minlength: Number,
    maxlength: Number,
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
        'fb-input': true,
        'fb-valid': this.hasValue && !this.hasError,
        'fb-invalid': this.hasError
      };
    },
    errMsgClasses: function () {
      console.log('errMsgClasses', this.hasError);
      return {
        'fb-error-msg': true,
        'mdc-textfield-helptext': true,
        'mdc-textfield-helptext--validation-msg': true,
        'mdc-textfield-helptext--persistent': this.hasError
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

var Folder = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('modal',{attrs:{"active":_vm.modalActive,"title":_vm.text.FOLDER.NEW},on:{"open":_vm.onOpenModal,"close":_vm.closeModal}},[_c('div',{slot:"body"},[_c('h5',[_vm._v(_vm._s(_vm.text.FOLDER.CREATION))]),_c('p',{staticClass:"fb-folder-path",domProps:{"innerHTML":_vm._s(_vm.hierarchy)}}),_c('input-text',{attrs:{"label":_vm.text.FOLDER.NEW,"required":true,"minlength":1,"maxlength":20,"hasError":_vm.creatingHasError,"errorMsg":_vm.creatingError},on:{"input":_vm.onInputNew}})],1),_c('div',{slot:"footer"},[_c('my-button',{attrs:{"classes":"is-dark","type":"submit"},nativeOn:{"click":function($event){_vm.onSubmit($event);}}},[_vm._v("Submit")]),_c('my-button',{nativeOn:{"click":function($event){_vm.closeModal($event);}}},[_vm._v("Cancel")])],1)])},staticRenderFns: [],
  name: 'Folder',
  props: ['openCreate'],
  components: { MyButton: MyButton, Modal: Modal, InputText: InputText },
  data: function data() {
    return {
      text: this.$store.state.text,
      modalActive: false,
      creatingHasError: false,
      creatingError: '',
      creatingName: '',
      hierarchy: ''
    };
  },
  watch: {
    openCreate: function (val, oldVal) {
      if (val) { this.modalActive = true; }
    }
  },
  methods: {
    onInputNew: function onInputNew(value) {
      this.creatingName = value;

      if (!value) {
        this.creatingHasError = true;
        this.creatingError = this.text.REQUIRED;
      } else {
        this.creatingHasError = !/^[a-zA-Z0-9\-_]{1,20}$/.test(value);
        this.creatingError = this.text.FOLDER.VALIDATION;
      }
      console.log('onInputNew', value, this.creatingHasError);
    },
    onOpenModal: function onOpenModal() {
      this.creatingName = '';
      this.hierarchy = "<span>" + (this.text.ROOT_FOLDER) + "</span>";
    },
    closeModal: function closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    onSubmit: function onSubmit() {
      var this$1 = this;

      console.log('onSubmit', this.creatingName);
      this.$store.dispatch('folder/create', this.creatingName).then(function (res) {
        this$1.closeModal();
        this$1.$store.dispatch('message/show', {
          message: res,
          type: 'success'
        });
      }).catch(function (res) {
        this$1.closeModal();
        this$1.$store.dispatch('message/show', {
          message: res,
          type: 'alert'
        });
      });
    }
  }
};

var AppHeader = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('header',{staticClass:"fb-header"},[_c('div',{staticClass:"fb-header-title"},[_c('span',[_vm._v(_vm._s(_vm.text.TITLE))]),_vm._v(" "),_c('span',{staticClass:"close"})]),_c('div',{class:_vm.messageClasses},[_vm._v(_vm._s(_vm.$store.state.message.message))]),_c('div',{staticClass:"fb-toolbar"},[_c('div',{staticClass:"fb-toolbar-items"},[_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("attach_file")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_CHOOSE))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("send")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_SEND))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_DEL_FILE))])]),_c('my-button',{nativeOn:{"click":function($event){_vm.openCreate = true;}}},[_c('i',{staticClass:"material-icons"},[_vm._v("create_new_folder")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_NEW_FOLDER))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_DEL_FOLDER))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("publish")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.TOOLBAR.BTN_SEND_EDITOR))])])],1)]),_c('folder',{attrs:{"open-create":_vm.openCreate},on:{"closeModal":function($event){_vm.openCreate = false;}}})],1)},staticRenderFns: [],
  name: 'Header',
  components: { MyButton: MyButton, Folder: Folder },
  computed: {
    messageClasses: function () {
      console.log(this.$store.state.message.class);
      return {
        'fb-message': true,
        'show': this.$store.state.message.show,
        'alert': this.$store.state.message.class === 'alert',
        'success': this.$store.state.message.class === 'success'
      };
    }
  },
  data: function data() {
    return {
      openCreate: false,
      text: this.$store.state.text
    };
  }
};

var Item = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('li',{staticClass:"active open",class:{ 'collapse': _vm.open },style:(_vm.folderStyle),attrs:{"data-folders":_vm.tree.folders.length,"data-files":_vm.tree.files.length},on:{"click":function($event){$event.stopPropagation();_vm.collapse($event);}}},[_c('a',[_c('i',{staticClass:"material-icons"},[_vm._v("folder")]),_vm._v(" "),_c('span',{attrs:{"id":"folder-root-desc"}},[_vm._v(_vm._s(_vm.tree.name))])]),(_vm.tree.folders.length)?_c('ol',_vm._l((_vm.tree.folders),function(folder){return _c('item',{attrs:{"collapsed":true,"isRoot":false,"tree":folder}})})):_vm._e()])},staticRenderFns: [],
  name: 'Item',
  props: {
    tree: Object,
    isRoot: { type: Boolean, default: true },
    collapsed: Boolean
  },
  computed: {},
  data: function data() {
    return {
      open: this.collapsed,
      folderStyle: {
        height: (this.tree.folders.length + 1) * 34 + 'px'
      }
    };
  },
  mounted: function mounted() {
    console.log('tree', this.tree.name, this.folderStyle);
  },
  methods: {
    collapse: function collapse() {
      console.log('collapse', this.tree.name, this.isRoot);
      if (this.isRoot) { return; }
      this.open = !this.open;
    }
  }
};

var Tree = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-tree-container"},[_c('ol',[_c('item',{attrs:{"tree":_vm.$store.state.tree.tree}})],1)])},staticRenderFns: [],
  name: 'Tree',
  components: { Item: Item },
  data: function data() {
    return {
      text: this.$store.state.text
    };
  }
};

var AppBody = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-body"},[_c('tree',[_c('div',{staticClass:"fb-thumb-container"},[_c('ul',{staticClass:"fb-thumb",attrs:{"id":"fb-thumb"}}),_c('div',{staticClass:"js-fileapi-wrapper"},[_c('input',{staticClass:"input-file",attrs:{"id":"upload-input","name":"files","type":"file","multiple":"multiple"}})]),_c('ul',{staticClass:"fb-upload-thumb",attrs:{"id":"upload-thumb","data-label":"\n      lang.preview\n    "}})])])],1)},staticRenderFns: [],
  name: 'Body',
  components: { MyButton: MyButton, Tree: Tree }
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
  REQUIRED: 'Field is required',
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
    VALIDATION: [
      'Only <strong>letters, numbers</strong>',
      ' and the following characters: <span class="highlight">- _</span>'
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
  },
  API: {
    MESSAGES: {
      FOLDER: {
        CREATED: 'Folder created!',
        RENAMED: 'Folder renamed!',
        EXISTS: 'This folder already exists!'
      }
    }
  }
};

const ROUTES = {
  FILES: {
    ALL: '/files',
    CREATE: '/files',
    REMOVE: '/files/:id'
  },
  FOLDER: {
    CREATE: '/folder',
    EDIT: '/folder/:id',
    REMOVE: '/folder/:id'
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

var request = function (url, options) {
  if ( options === void 0 ) options = {};

  const config = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  options = Object.assign(config, options);

  if (options.body) { options.body = JSON.stringify(options.body); }

  console.log('fetch', options);
  return fetch(url, options)
    .then(handleResponse, handleNetworkError);
};

function handleResponse(response) {
  return response.ok
    ? response.json()
    : response.json().then(function (err) { throw err });
}

function handleNetworkError(error) {
  throw { message: error.message };
}

var folder = {
  namespaced: true,
  state: { selected: '/' },
  actions: {
    create: function create(ref, name) {
      var commit = ref.commit;
      var state = ref.state;
      var dispatch = ref.dispatch;

      const path = state.selected + name;
      const config = { method: 'POST', body: { path: path }};
      console.log('store folder/create', path);

      return new Promise(function (resolve, reject) {
        request(ROUTES.FOLDER.CREATE, config).then(function (res) {
          console.log('store folder/create res', res);
          commit('tree/update', res.tree, { root: true });
          resolve(res.message);
        }).catch(function (res) { return reject(res.message); });
      });
    }
  },
  mutations: {}
};

var tree = {
  namespaced: true,
  state: {
    tree: { name: '', files: [], folders: [] }
  },
  actions: {
    get: function get(ref) {
      var commit = ref.commit;
      var state = ref.state;
      var rootState = ref.rootState;

      return new Promise(function (resolve, reject) {
        request(rootState.options.server + ROUTES.FILES.ALL)
          .then(function (tree) {
            tree.name = rootState.text.ROOT_FOLDER;
            console.log('getTree', tree);
            commit('update', tree);
            resolve();
          })
          .catch(reject);
      });
    }
  },
  mutations: {
    update: function update(state, tree) {
      state.tree = tree;
    }
  }
};

var file = {
  namespaced: true,
  state: {},
  actions: {},
  mutations: {}
};

var message = {
  namespaced: true,
  state: { show: false, class: '', message: '' },
  actions: {
    show: function show(ref, ref$1) {
      var commit = ref.commit;
      var state = ref.state;
      var rootState = ref.rootState;
      var message = ref$1.message;
      var type = ref$1.type;

      commit('show', { message: message, type: type });
      setTimeout(function () { commit('hide'); }, 5000);
    }
  },
  mutations: {
    show: function show(state, ref) {
      var message = ref.message;
      var type = ref.type;

      state.show = true;
      state.message = message;
      state.class = type;
    },
    hide: function hide(state, type) {
      state.show = false;
    }
  }
};

var store = new Vuex.Store({
  modules: { folder: folder, tree: tree, file: file, message: message },
  state: {
    text: {},
    options: OPTIONS
  },
  mutations: {
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
  store.dispatch('tree/get');
  app.$mount(el);
};

return FileBrowser;

}(Vue,mdc.ripple,mdc.dialog,mdc.textfield,Vuex));
