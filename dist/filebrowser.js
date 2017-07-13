/*!
 * FileBrowser - v1.3.0
 * A multi-purpose filebrowser.
 * https://github.com/jonataswalker/FileBrowser
 * Built: Thu Jul 13 2017 16:18:21 GMT-0300 (-03)
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('@material/ripple')) :
	typeof define === 'function' && define.amd ? define(['vue', '@material/ripple'], factory) :
	(global.FileBrowser = factory(global.Vue,global.mdc.ripple));
}(this, (function (Vue,_material_ripple) { 'use strict';

Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue;

var MyButton = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('button',{staticClass:"mdc-button mdc-button--raised mdc-button--primary mdc-button--dense",class:_vm.classes,attrs:{"type":_vm.type,"disabled":_vm.disabled}},[_vm._t("default")],2)},staticRenderFns: [],
  name: 'Button',
  props: {
    text: String,
    classes: String,
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false }
  },
  mounted() {
    new _material_ripple.MDCRipple(this.$el);
  }
};

var MyHeader = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('header',{staticClass:"fb-header"},[_c('div',{staticClass:"fb-header-title"},[_c('span',[_vm._v(_vm._s(_vm.$root.text.TITLE))]),_vm._v(" "),_c('span',{staticClass:"close"})]),_c('div',{staticClass:"fb-message"}),_c('div',{staticClass:"fb-toolbar"},[_c('div',{staticClass:"fb-toolbar-items"},[_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("attach_file")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.$root.text.TOOLBAR.BTN_CHOOSE))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("send")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.$root.text.TOOLBAR.BTN_SEND))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.$root.text.TOOLBAR.BTN_DEL_FILE))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("create_new_folder")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.$root.text.TOOLBAR.BTN_NEW_FOLDER))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.$root.text.TOOLBAR.BTN_DEL_FOLDER))])]),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("publish")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.$root.text.TOOLBAR.BTN_SEND_EDITOR))])])],1)])])},staticRenderFns: [],
  name: 'Header',
  components: { MyButton }
};

var MyBody = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-body"},[_c('div',{staticClass:"fb-tree-container"},[_c('ol',{attrs:{"id":"fb-tree"}},[_c('li',{staticClass:"active open",attrs:{"id":"fb-tree-folder-root"}},[_c('a',[_c('i',{staticClass:"icomoon-folder"}),_vm._v(" "),_c('span',{attrs:{"id":"folder-root-desc"}},[_vm._v(_vm._s(_vm.$root.text.ROOT_FOLDER))])])])])]),_vm._m(0)])},staticRenderFns: [function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-thumb-container"},[_c('ul',{staticClass:"fb-thumb",attrs:{"id":"fb-thumb"}}),_c('div',{staticClass:"js-fileapi-wrapper"},[_c('input',{staticClass:"input-file",attrs:{"id":"upload-input","name":"files","type":"file","multiple":"multiple"}})]),_c('ul',{staticClass:"fb-upload-thumb",attrs:{"id":"upload-thumb","data-label":"\n      lang.preview\n    "}})])}],
  name: 'Body',
  components: { MyButton }
};

var Layout = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"filebrowser-container"}},[_c('div',{staticClass:"filebrowser-wrapper"},[_c('my-header'),_c('my-body')],1)])},staticRenderFns: [],
  name: 'Layout',
  components: { MyHeader, MyBody }
};

var App = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('layout')},staticRenderFns: [],
  name: 'App',
  components: { Layout }
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

const app = new Vue({
  data: { options: OPTIONS, text: {}},
  render: h => h(App)
});

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

class FileBrowser {
  constructor(el, options = {}) {
    app.options = Object.assign(app.options, options);

    switch (app.options.lang) {
      case LANG.BR:
        app.text = text;
        break;
      default:
        app.text = TEXT;
    }

    app.$mount(el);
  }
}

return FileBrowser;

})));
