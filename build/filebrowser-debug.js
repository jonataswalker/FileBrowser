// A multi-purpose filebrowser.
// https://github.com/jonataswalker/FileBrowser
// Version: v1.3.0
// Built: 2016-04-09T13:13:47-0300

'use strict';

(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.FileBrowser = factory();
  }
}(this, function() {

  var FB = {};
  /**
   * Helper
   */
  var utils = {
    whiteSpaceRegex: /\s+/,
    toQueryString: function(obj) {
      return Object.keys(obj).reduce(function(a, k) {
        a.push(
          (typeof obj[k] === 'object') ? utils.toQueryString(obj[k]) :
          encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
        );
        return a;
      }, []).join('&');
    },
    encodeUrlXhr: function(url, data) {
      if (data && typeof(data) === 'object') {
        var str_data = utils.toQueryString(data);
        url += (/\?/.test(url) ? '&' : '?') + str_data;
      }
      return url;
    },
    json: function(url, data) {
      var xhr = new XMLHttpRequest(),
        when = {},
        onload = function() {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          } else {
            console.info('Status code was ' + xhr.status);
          }
        },
        onerror = function() {
          console.info('Can\'t XHR ' + JSON.stringify(url));
        },
        onprogress = function() {};

      url = utils.encodeUrlXhr(url, data);
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = onload;
      xhr.onerror = onerror;
      xhr.onprogress = onprogress;
      xhr.send(null);

      return {
        when: function(obj) {
          when.ready = obj.ready;
        }
      };
    },
    post: function(url, data) {
      var xhr = new XMLHttpRequest(),
        when = {},
        onload = function() {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          } else {
            console.info('Status code was ' + xhr.status);
          }
        },
        onerror = function() {
          console.info('Can\'t XHR ' + JSON.stringify(url));
        },
        onprogress = function() {};

      data = utils.toQueryString(data);
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.onload = onload;
      xhr.onerror = onerror;
      xhr.onprogress = onprogress;
      xhr.send(data);

      return {
        when: function(obj) {
          when.ready = obj.ready;
        }
      };
    },
    getPath: function() {
      var parts = window.location.pathname.split('/');
      parts.shift();
      parts.pop();
      return '/' + parts.join('/') + '/';
    },
    stopEventPropagation: function(e) {
      if (typeof e.stopPropagation === 'function') {
        e.stopPropagation();
        e.preventDefault();
      } else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
        window.event.cancelBubble = true;
      }
    },
    fireClick: function(node) {
      if (typeof MouseEvent === 'function') {
        var mevt = new MouseEvent('click', {
          view: window,
          bubbles: false,
          cancelable: true
        });
        node.dispatchEvent(mevt);
      } else if (document.createEvent) {
        // Fallback
        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', false, false);
        node.dispatchEvent(evt);
      } else if (document.createEventObject) {
        node.fireEvent('onclick');
      } else if (typeof node.onclick === 'function') {
        node.onclick();
      }
    },
    classRegex: function(classname) {
      return new RegExp('(^|\\s+)' + classname + '(\\s+|$)');
    },
    _addClass: function(el, c, timeout) {
      if (el.classList) {
        el.classList.add(c);
      } else {
        el.className = (el.className + ' ' + c).trim();
      }

      if (timeout && utils.isNumeric(timeout)) {
        window.setTimeout(function() {
          utils._removeClass(el, c);
        }, timeout);
      }
    },
    addClass: function(el, classname, timeout) {
      if (Array.isArray(el)) {
        el.forEach(function(each) {
          utils.addClass(each, classname);
        });
        return;
      }

      //classname can be ['class1', 'class2'] or 'class1 class2'
      var
        array = (Array.isArray(classname)) ?
        classname : classname.split(utils.whiteSpaceRegex),
        i = array.length;
      while (i--) {
        if (!utils.hasClass(el, array[i])) {
          utils._addClass(el, array[i], timeout);
        }
      }
    },
    _removeClass: function(el, c) {
      if (el.classList) {
        el.classList.remove(c);
      } else {
        el.className = (el.className.replace(utils.classReg(c), ' ')).trim();
      }
    },
    removeClass: function(el, classname) {
      if (Array.isArray(el)) {
        el.forEach(function(each) {
          utils.removeClass(each, classname);
        });
        return;
      }

      //classname can be ['class1', 'class2'] or 'class1 class2'
      var
        array = (Array.isArray(classname)) ?
        classname : classname.split(utils.whiteSpaceRegex),
        i = array.length;
      while (i--) {
        if (utils.hasClass(el, array[i])) {
          utils._removeClass(el, array[i]);
        }
      }
    },
    hasClass: function(el, c) {
      return (el.classList) ?
        el.classList.contains(c) : utils.classReg(c).test(el.className);
    },
    toggleClass: function(el, c) {
      if (Array.isArray(el)) {
        el.forEach(function(each) {
          utils.toggleClass(each, c);
        });
        return;
      }

      if (el.classList) {
        el.classList.toggle(c);
      } else {
        if (utils.hasClass(el, c)) {
          utils._removeClass(el, c);
        } else {
          utils._addClass(el, c);
        }
      }
    },
    $: function(id) {
      id = (id[0] === '#') ? id.substr(1, id.length) : id;
      return document.getElementById(id);
    },
    isElement: function(obj) {
      // DOM, Level2
      if ('HTMLElement' in window) {
        return (!!obj && obj instanceof HTMLElement);
      }
      // Older browsers
      return (!!obj && typeof obj === 'object' &&
        obj.nodeType === 1 && !!obj.nodeName);
    },
    find: function(selector, context, find_all) {
      var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
        periodRe = /\./g,
        slice = [].slice,
        matches = [];
      if (simpleRe.test(selector)) {
        switch (selector[0]) {
          case '#':
            matches = [utils.$(selector.substr(1))];
            break;
          case '.':
            matches = slice.call(context.getElementsByClassName(
              selector.substr(1).replace(periodRe, ' ')));
            break;
          default:
            matches = slice.call(context.getElementsByTagName(selector));
        }
      } else {
        // If not a simple selector, query the DOM as usual 
        // and return an array for easier usage
        matches = slice.call(context.querySelectorAll(selector));
      }

      return (find_all) ? matches : matches[0];
    },
    getAllChildren: function(node, tag) {
      return [].slice.call(node.getElementsByTagName(tag));
    },
    getSiblings: function(node, tagname) {
      return Array.prototype.filter.call(node.parentNode.children,
        function(child) {
          if (tagname) {
            if (tagname.toUpperCase() == child.tagName) {
              return child !== node;
            }
          } else {
            return child !== node;
          }
        });
    },
    emptyArray: function(array) {
      while (array.length) array.pop();
    },
    removeAllChildren: function(node) {
      while (node.firstChild) node.removeChild(node.firstChild);
    },
    removeAll: function(collection) {
      var node;
      while ((node = collection[0]))
        node.parentNode.removeChild(node);
    },
    getChildren: function(node, tag) {
      return [].filter.call(node.childNodes, function(el) {
        return (tag) ?
          el.nodeType == 1 && el.tagName.toLowerCase() == tag : el.nodeType == 1;
      });
    },
    /*
     * Replace 'String %1 foo' with replace[0]
     * @param {String} str
     * @param {Array} replace
     */
    templateLang: function(str, replace) {
      return str.replace(/(%\d)/g, function(match, key) {
        var i = key.match(/\d+$/)[0];
        return replace[i - 1];
      });
    },
    template: function(html, row) {
      var this_ = this;

      return html.replace(/\{ *([\w_-]+) *\}/g, function(html, key) {
        var value = (row[key] === undefined) ? '' : row[key];
        return this_.htmlEscape(value);
      });
    },
    htmlEscape: function(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
    getMaxZIndex: function() {
      var zIndex,
        max = 0,
        all = utils.find('*', document, true),
        len = all.length,
        i = -1;
      while (++i < len) {
        zIndex = parseInt(window.getComputedStyle(all[i]).zIndex, 10);
        max = (zIndex) ? Math.max(max, zIndex) : max;
      }
      return max;
    },
    deepExtend: function(destination, source) {
      var property, propertyValue;

      for (property in source)
        if (source.hasOwnProperty(property)) {
          propertyValue = source[property];
          if (propertyValue !== undefined && propertyValue !== null &&
            propertyValue.constructor !== undefined &&
            propertyValue.constructor === Object) {
            destination[property] = destination[property] || {};
            utils.deepExtend(destination[property], propertyValue);
          } else {
            destination[property] = propertyValue;
          }
        }
      return destination;
    },
    createElement: function(node, html) {
      var elem;
      if (Array.isArray(node)) {
        elem = document.createElement(node[0]);

        if (node[1].id) elem.id = node[1].id;
        if (node[1].classname) elem.className = node[1].classname;

        if (node[1].attr) {
          var attr = node[1].attr;
          if (Array.isArray(attr)) {
            var i = -1;
            while (++i < attr.length) {
              elem.setAttribute(attr[i].name, attr[i].value);
            }
          } else {
            elem.setAttribute(attr.name, attr.value);
          }
        }
      } else {
        elem = document.createElement(node);
      }
      elem.innerHTML = html;
      var frag = document.createDocumentFragment();

      while (elem.childNodes[0]) {
        frag.appendChild(elem.childNodes[0]);
      }
      elem.appendChild(frag);
      return elem;
    },
    setCenter: function(node, parent) {
      parent = parent || window;
      var parent_size = utils.getSize(parent),
        node_size = utils.getSize(node),
        scroll_x = (parent == window) ? window.pageXOffset : parent.scrollLeft,
        scroll_y = (parent == window) ? window.pageYOffset : parent.scrollTop,
        top = Math.max(0, (
          (parent_size.height - node_size.height) / 2) + scroll_y),
        left = Math.max(0, (
          (parent_size.width - node_size.width) / 2) + scroll_x);

      node.style.position = 'absolute';
      node.style.top = top + 'px';
      node.style.left = left + 'px';
    },
    getSize: function(element) {
      if (element == window || element == document) {
        return utils.getWindowSize();
      } else {
        return {
          width: element.offsetWidth,
          height: element.offsetHeight
        };
      }
    },
    offset: function(element) {
      var rect = element.getBoundingClientRect();
      return {
        left: rect.left + window.pageXOffset - document.documentElement.clientLeft,
        top: rect.top + window.pageYOffset - document.documentElement.clientTop,
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    },
    getWindowSize: function() {
      return {
        width: window.innerWidth ||
          document.documentElement.clientWidth || document.body.clientWidth,
        height: window.innerHeight ||
          document.documentElement.clientHeight || document.body.clientHeight
      };
    },
    fadeIn: function(elem, interval) {
      if (+elem.style.opacity < 1) {
        interval = interval || 16;
        elem.style.opacity = 0;
        elem.style.display = 'block';
        var last = +new Date();
        var tick = function() {
          elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
          last = +new Date();

          if (+elem.style.opacity < 1) {
            setTimeout(tick, interval);
          }
        };
        tick();
      }
      elem.style.display = 'block';
    },
    fadeOut: function(elem, interval) {
      interval = interval || 16;
      elem.style.opacity = 1;
      var last = +new Date();
      var tick = function() {
        elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
        last = +new Date();

        if (+elem.style.opacity > 0) {
          setTimeout(tick, interval);
        } else {
          elem.style.display = 'none';
        }
      };
      tick();
    },
    getTopMargin: function(elem) {
      elem.style.left = '-9999px';
      elem.style.display = 'block';

      var height = elem.clientHeight,
        padding;
      if (typeof getComputedStyle !== 'undefined') {
        padding = parseInt(getComputedStyle(elem).paddingTop, 10);
      } else {
        padding = parseInt(elem.currentStyle.padding);
      }

      elem.style.left = '';
      elem.style.display = 'none';
      return ('-' + parseInt((height + padding) / 2) + 'px');
    },
    toType: function(obj) {
      if (obj == window && obj.document && obj.location) {
        return 'window';
      } else if (obj == document) {
        return 'htmldocument';
      } else if (typeof obj === 'string') {
        return 'string';
      } else if (utils.isElement(obj)) {
        return 'element';
      }
    },
    typeOf: function(obj) {
      return ({}).toString.call(obj)
        .match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },
    removeArrayEntry: function(array, value) {
      var index = array.indexOf(value);
      /* jshint -W030 */
      index > -1 && array.splice(index, 1);
    },
    bytesToSize: function(bytes) {
      if (bytes === 0) return '0 Byte';
      var
        k = 1000,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }
  };
  /**
   * @constructor
   * @param {Object|undefined} opt_options Options.
   */
  FB.Base = function(opt_options) {
    var defaultOptions = utils.deepExtend({}, FB.defaultOptions);
    FB.options = utils.deepExtend(defaultOptions, opt_options);

    FB.$base = this;
    FB.$html = new FB.Html();
    FB.$html.createBrowser();
    FB.$html.createAlert();

    FB.$drag = new FB.DragAndResize();
    FB.$tree = new FB.Tree();
    FB.$alert = new FB.Alert();
    FB.$upload = new FB.Upload();
    FB.$internal = new FB.Internal();

    FB.$tree.build();
    FB.$internal.setListeners();
  };

  FB.Base.prototype = {
    show: function() {
      FB.container.style.zIndex = utils.getMaxZIndex() + 10;
      FB.container.style.display = 'block';
      utils.setCenter(FB.container);
    },
    setEditor: function(editor) {
      //editor is an instance of CKeditor for example
      FB.options.editor = editor;
    }
  };

  FB.constants = {
    css: {
      container: 'filebrowser-fb fb-container',
      alert_overlay: 'filebrowser-fb fb-alert-overlay',
      alert_container: 'filebrowser-fb fb-alert'
    },
    types: {
      image: 'image'
    },
    actions: {
      upload: 'upload',
      new_folder: 'new-folder',
      delete_folder: 'del-folder',
      delete_file: 'del-file',
      get_thumbs: 'get-thumbs',
    },
    suffix_small: 'small',
    suffix_big: 'big',
    thumb_path: 'data-path',
    thumb_sel: 'selected',
    li_key: 'data-key'
  };

  FB.defaultOptions = {
    mode: 'plugin',
    lang: 'en',
    root_http: '/',
    server_http: 'filebrowser.php',
    regex_folder: /^[a-zA-Z0-9-_.]{1,10}$/,
    upload_types: [FB.constants.types.image],
    image: {
      min_width: 120, // pixels
      min_height: 120,
      transform: {
        big: {
          maxWidth: 1200,
          maxHeight: 800
        },
        small: {
          maxWidth: 320,
          maxHeight: 240
        }
      }
    }
  };

  FB.elements = {};

  FB.lang = {};
  /*
   * Language specific
   */
  FB.lang['pt-br'] = {
    title: 'Image Browser',
    root_folder: 'Root Folder',
    preview: 'Sending Preview',
    send_to_editor: 'Send to Editor',
    toolbar: {
      bt_choose: 'Escolha',
      bt_send: 'Envie',
      bt_del_file: 'Remover Arquivo',
      bt_new_folder: 'Nova Pasta',
      bt_del_folder: 'Remover Pasta',
      bt_send_editor: 'Enviar para o Editor'
    },
    file: {
      total: 'Total de Arquivos:',
      del: 'Remover Arquivo',
      dels: 'Remover Arquivos'
    },
    folder: {
      new_: 'Nova Pasta',
      del: 'Remover Pasta',
      creation: 'Esta pasta será criada em:',
      minimum: [
        '<p>Preenchimento mínimo: 1 - máximo: 10',
        '<br>Apenas <span class="strong">letras</span>, ',
        '<span class="strong">números</span>',
        ' e os seguintes caracteres: <span class="highlight">. - _</span></p>'
      ].join(''),
      deletion: [
        '<p class="folder-path">Esta pasta <span>%1</span>',
        ' será removida juntamente com todo seu conteúdo: </p>',
        '<p>Total de Arquivos: <span class="destaque">%2</span>',
        ' &mdash; Total de Sub-Pastas: <span class="destaque">%3</span></p>'
      ].join('')
    },
    alert: {
      bt_ok: 'OK',
      bt_cancel: 'Cancelar',
      image: {
        not_min_size: 'Apenas imagens com no mínimo %1 x %2!'
      },
      upload: {
        sending: 'Um envio já está em andamento!',
        none: 'Nenhum arquivo foi selecionado!',
        sent: 'Todos os arquivos já foram enviados!'
      }
    }
  };
  /*
   * Language specific
   */
  FB.lang.en = {
    title: 'Image Browser',
    root_folder: 'Root Folder',
    preview: 'Sending Preview',
    send_to_editor: 'Send to Editor',
    toolbar: {
      bt_choose: 'Choose',
      bt_send: 'Send',
      bt_del_file: 'Delete File',
      bt_new_folder: 'New Folder',
      bt_del_folder: 'Delete Folder',
      bt_send_editor: 'Send to Editor'
    },
    file: {
      total: 'Total Files:',
      del: 'Delete File',
      dels: 'Delete Files'
    },
    folder: {
      new_: 'New Folder',
      del: 'Delete Folder',
      creation: 'This folder will be created inside:',
      minimum: [
        '<p>Min-length: 1 - Max-length: 10',
        '<br>Only <span class="strong">letters</span>, ',
        '<span class="strong">numbers</span> ',
        'and the following characters: <span class="highlight">. - _</span></p>'
      ].join(''),
      deletion: [
        '<p class="folder-path">This folder <span>%1</span>',
        ' will be removed with all its contents: </p>',
        '<p>Total Files: <span class="destaque">%2</span>',
        ' &mdash; Total Subfolders: <span class="destaque">%3</span></p>'
      ].join('')
    },
    alert: {
      bt_ok: 'OK',
      bt_cancel: 'Cancel',
      image: {
        not_min_size: 'Only images with minimum %1 x %2!'
      },
      upload: {
        sending: 'An upload is already in progress!',
        none: 'No file!',
        sent: 'All done!'
      }
    }
  };
  /**
   * @constructor
   */
  FB.Tree = function() {
    this.els = FB.elements;
    this.options = FB.options;
    this.lang = FB.lang[FB.options.lang];

    this.current_active = FB.elements.folder_tree_root;
    this.root_event_added = false;
    this.thumbs_root = [];
    this.thumbs_selected = [];
  };

  FB.Tree.prototype = {
    get: function() {
      utils.addClass(this.els.grd_preview, 'mapeando-spinner');

      var when = {},
        this_ = this;
      utils.json(this.options.server_http, {
        action: FB.constants.actions.get_thumbs,
        lang: FB.options.lang
      }).when({
        ready: function(response) {

          utils.removeClass(this_.els.grd_preview, 'mapeando-spinner');
          if ('files' in response.tree) {
            this_.thumbs_root = response.tree.files;
            this_.loadThumbs(this_.thumbs_root);
          }
          if ('dirs' in response.tree) {
            when.ready.call(undefined, {
              dirs: response.tree.dirs
            });
          }
          this_.updateCountFolder();
        }
      });

      return {
        when: function(obj) {
          when.ready = obj.ready;
        }
      };
    },
    build: function() {
      var this_ = this;
      this.get().when({
        ready: function(response) {
          this_.buildTree(response.dirs);
          this_.treeEvents(response.dirs);
        }
      });
    },
    buildTree: function(json) {
      var this_ = this;
      var createFolder = function(folder, statistics, parent, last_created) {
        var row = {
            folder: folder,
            'n-files': statistics.files,
            'n-files-all': statistics['files-all'],
            'n-folders': statistics.folders,
            last: last_created
          },
          html = this_.folderTemplate(row),
          ol = utils.createElement(['ol', {
            classname: 'collapse'
          }], html),
          appended = parent.appendChild(ol);
        return appended;
      };
      var recursive = function(obj, parent) {
        var keys = Object.keys(obj),
          len = keys.length,
          i = -1,
          prop, value,
          appended, last, statistics = {};
        while (++i < len) {
          prop = keys[i];
          value = obj[prop];
          last = (value.last === true) ? 1 : 0;
          statistics = {
            files: (value.files) ? value.files.length : 0,
            'files-all': value['c-files'],
            folders: value['c-folders']
          };

          appended = createFolder(prop, statistics, parent, last);

          if (value.dirs) {
            recursive(value.dirs, appended.firstChild);
          }
        }
      };
      var keys = Object.keys(json),
        len = keys.length,
        i = -1,
        prop, value, appended,
        last_created,
        statistics = {};
      while (++i < len) {
        prop = keys[i];
        value = json[prop];
        last_created = (value.last === true) ? 1 : 0;
        statistics = {
          files: (value.files) ? value.files.length : 0,
          'files-all': value['c-files'],
          folders: value['c-folders']
        };

        appended = createFolder(
          prop,
          statistics,
          this.els.folder_tree_root,
          last_created
        );

        if (value.dirs) {
          recursive(value.dirs, appended.firstChild);
        }
      }
    },
    showHeaderMessage: function(obj) {
      var this_ = this;
      this.els.grd_msg.textContent = obj.msg;
      utils.addClass(this.els.grd_msg, ['show', obj.type]);
      window.setTimeout(function() {
        utils.removeClass(this_.els.grd_msg, ['show', obj.type]);
      }, obj.duration);
    },
    renewTree: function(tree) {
      this.removeTree();
      this.emptyThumbSelected();
      //to renew thumbs
      this.removeThumbs();
      utils.emptyArray(this.thumbs_root);
      this.current_active = false;

      if (Array.isArray(tree) && tree.length === 0) {
        //empty return
        this.updateCountFolder();
        utils.fireClick(this.els.folder_tree_root);
        return;
      }

      if ('files' in tree) {
        this.thumbs_root = tree.files;
        this.loadThumbs(this.thumbs_root);
      }
      if ('dirs' in tree) {
        this.buildTree(tree.dirs);
        this.treeEvents(tree.dirs);
      }
      this.updateCountFolder();
      this.setFolderActive();
    },
    newFolder: function() {
      var this_ = this,
        regex = this.options.regex_folder,
        checkInput = function() {
          //this = input value
          if (regex.test(this)) {
            FB.$alert.hideInputError();
          } else {
            FB.$alert.showInputError(this_.lang.folder.minimum);
          }
        },
        submit = function() {
          //this = input value
          if (!regex.test(this)) {
            FB.$alert.showInputError(this_.lang.folder.minimum);
            return;
          }

          this_.submitFolder(this, FB.constants.actions.new_folder).when({
            ready: function(response) {
              if (response.error === false) {
                this_.renewTree(response.tree);
                FB.$alert.close();
              } else {
                FB.$alert.showInputError(response.msg);
              }
            }
          });
        },
        parents = this.getFolderPath(this.current_active),
        i = parents.length,
        path = '<span>' + this.lang.root_folder + '</span>';
      parents.reverse();
      while (i--) {
        path += '&nbsp;&rarr;&nbsp;<span>' + parents[i] + '</span>';
      }

      var text = '<p>' + this.lang.folder.creation + '</p>' + '<p class="folder-path">' + path + '</p>',
        html = {
          title: this.lang.folder.new_,
          text: text
        };
      FB.$alert.prompt({
        placeholder: this.lang.folder.new_,
        html: html,
        checkInput: checkInput,
        submit: submit
      });
    },
    submitFolder: function(value, action) {
      //exclude current from parents
      var parents = (action == FB.constants.actions.delete_folder) ?
        this.getFolderPath(this.current_active, true) :
        this.getFolderPath(this.current_active),
        when = {};

      utils.post(this.options.server_http, {
        action: action,
        folder: value,
        parents: parents.join(),
        lang: FB.options.lang
      }).when({
        ready: function(response) {
          when.ready.call(undefined, response);
        }
      });
      return {
        when: function(obj) {
          when.ready = obj.ready;
        }
      };
    },
    removeFolder: function() {
      var this_ = this,
        folder = this.current_active.getAttribute('data-key'),
        n_files = this.current_active.getAttribute('data-files-all'),
        n_folders = this.current_active.getAttribute('data-folders'),
        submit = function() {
          this_.submitFolder(folder, FB.constants.actions.delete_folder).when({
            ready: function(response) {
              if (response.error === false) {
                this_.renewTree(response.tree);
                FB.$alert.close();
              } else {
                FB.$alert.showInputError(response.msg);
              }
            }
          });
        },
        text = utils.templateLang(
          this.lang.folder.deletion, [folder, n_files, n_folders]),
        html = {
          title: this.lang.folder.del,
          text: text
        };

      FB.$alert.confirm({
        html: html,
        submit: submit
      });
    },
    removeFile: function() {
      var this_ = this,
        submit = function() {
          utils.post(this_.options.server_http, {
            action: FB.constants.actions.delete_file,
            files: this_.thumbs_selected.join(),
            lang: FB.options.lang
          }).when({
            ready: function(response) {
              this_.renewTree(response.tree);
              FB.$alert.close();
            }
          });
        },
        text = [
          '<p>',
          this.lang.file.total,
          '<span class="highlight">',
          this.thumbs_selected.length,
          '</span></p>'
        ].join(''),
        html = {
          title: this.lang.file.del,
          text: text
        };
      FB.$alert.confirm({
        html: html,
        submit: submit
      });
    },
    setFolderActive: function() {
      //find last created
      var this_ = this,
        lis = utils.find('li', this.els.folder_tree_root, true),
        lis_len = lis.length,
        found = false,
        li, attr,
        i = -1,
        setCreatedActive = function(li) {
          var parent = li.parentNode,
            siblings, cond = true;
          while (cond) {
            if (parent) {
              if (parent == this_.els.folder_tree_root) {
                cond = false;
              } else if (parent.tagName == 'OL') {
                siblings = utils.getSiblings(parent, 'ol');
                utils.removeClass(siblings, 'collapse');
                utils.removeClass(parent, 'collapse');
              }
            } else {
              cond = false;
            }
            parent = parent.parentNode;
          }
          utils.fireClick(li);
        };

      while (++i < lis_len) {
        li = lis[i];
        attr = li.getAttribute('data-last');

        if (attr == 1) {
          found = true;
          setCreatedActive(li);
          break;
        }
      }
      //if none found click root folder
      if (!found || lis_len === 0) {
        utils.fireClick(this.els.folder_tree_root);
      }
    },
    getFolderPath: function(li, exclude) {
      var parents = [];
      if (exclude) {
        li = li.parentNode;
      }
      while (li && li !== this.els.folder_tree_root) {
        if (li.tagName == 'LI') {
          parents.unshift(li.getAttribute('data-key'));
        }
        li = li.parentNode;
      }
      return parents;
    },
    getFolderParent: function(li) {
      li = li.parentNode;
      var cond = true,
        parent;
      while (li && cond) {
        if (li.tagName == 'LI') {
          parent = li;
          cond = false;
        }
        li = li.parentNode;
      }
      return parent;
    },
    treeEvents: function(root_tree) {
      var this_ = this,
        lis = utils.find('li', this.els.folder_tree, true),
        lis_len = lis.length;

      // FIXME return what?
      if (lis_len === 0) return;

      var setParentOpen = function(li) {
        var cond = true;
        li = li.parentNode;
        while (li && cond) {
          if (li.tagName == 'LI') {
            utils.addClass(li, 'open');
            if (li == this_.els.folder_tree_root) {
              cond = false;
            }
          }
          li = li.parentNode;
        }
      };
      var toggle = function(li) {
        var openned = utils.hasClass(li, 'open'),
          active = utils.hasClass(li, 'active'),
          children = utils.getChildren(li, 'ol'),
          children_ol_recursive = utils.getAllChildren(li, 'ol'),
          children_li_recursive = utils.getAllChildren(li, 'li');

        if (openned && active) {
          utils.addClass(children_ol_recursive, 'collapse');
          utils.removeClass(children_li_recursive, 'open');
          utils.removeClass(li, 'open');
        } else if (openned) {
          utils.addClass(children_ol_recursive, 'collapse');
          utils.removeClass(children_li_recursive, 'open');
          utils.removeClass(li, 'open');
        } else {
          utils.removeClass(children, 'collapse');
          utils.addClass(li, 'open');
        }
        this_.current_active = li;
        utils.addClass(li, 'active');
      };
      var findFiles = function(keys, tree_node, depth) {
        var len_keys = keys.length,
          k, files;

        depth = depth || 1;
        for (k in tree_node) {
          if (k == keys[depth - 1]) { //root coincide
            if (depth == len_keys) { //don't go deeper
              files = tree_node[k];
              if (files && 'files' in files) {
                this_.loadThumbs(files.files);
                break;
              }
            } else {
              ++depth;
              findFiles(keys, tree_node[k].dirs, depth);
            }
          }
        }
        return false;
      };
      var thumb = function(li, tree) {
        if (li == this_.els.folder_tree_root) {
          this_.loadThumbs(this_.thumbs_root);
          return;
        }

        var keys = [];
        while (li && li !== this_.els.folder_tree_root) {
          if (li.tagName == 'LI') {
            keys.unshift(li.getAttribute('data-key'));
          }
          li = li.parentNode;
        }
        findFiles(keys, tree);
      };
      var clickFolder = function(evt) {
        evt.stopPropagation();
        FB.$upload.showTree();
        //this is <li>
        if (this != this_.current_active) {
          this_.removeThumbs();
          thumb(this, root_tree);
        }

        this_.current_active = this_.current_active || this_.els.folder_tree_root;

        utils.removeClass(this_.current_active, 'active');
        setParentOpen(this);
        toggle(this);

        //hide btn_del_folder if root
        if (this == this_.els.folder_tree_root) {
          this_.els.btn_del_folder.style.display = 'none';
        } else {
          this_.els.btn_del_folder.style.display = '';
        }
      };
      var i = -1;
      while (++i < lis_len) {
        (function(i) {
          var li = lis[i];
          if (i === 0) {
            var children = utils.getChildren(li, 'ol');
            if (children.length > 0) {
              utils.removeClass(children, 'collapse');
            }
          }
          if (li == this_.els.folder_tree_root) {
            if (!this_.root_event_added) {
              li.addEventListener('click', clickFolder, false);
              this_.root_event_added = true;
            }
          } else {
            li.addEventListener('click', clickFolder, false);
          }
        })(i);
      }
    },
    emptyThumbSelected: function() {
      var lis = utils.find('li', this.els.grd_preview, true);
      utils.emptyArray(this.thumbs_selected);
      utils.removeClass(lis, FB.constants.thumb_sel);
      this.buttonThumbRemoveHandler();
    },
    buttonThumbRemoveHandler: function() {
      var len_sel = this.thumbs_selected.length,
        btn_desc = (len_sel > 1) ? this.lang.file.dels : this.lang.file.del;
      if (len_sel > 0) {
        utils.removeClass(this.els.btn_editor, 'hidden');
        utils.removeClass(this.els.btn_del_file, 'hidden');
        this.els.desc_btn_del_file.textContent = btn_desc + ' (' + len_sel + ')';
        this.els.desc_btn_editor.textContent =
          this.lang.send_to_editor + ' (' + len_sel + ')';
      } else {
        utils.addClass(this.els.btn_editor, 'hidden');
        utils.addClass(this.els.btn_del_file, 'hidden');
      }
    },
    updateCountFolder: function() {
      this.els.folder_root_desc.textContent =
        this.lang.root_folder + ' (' + this.thumbs_root.length + ')';
    },
    removeThumbs: function() {
      utils.removeAllChildren(this.els.grd_preview);
    },
    loadThumbs: function(files) {
      var this_ = this,
        row, html, li,
        i = -1,
        file, path, selected,
        url = this.options.root_http,
        count = files.length,
        thumbSelect = function() {
          utils.toggleClass(this, FB.constants.thumb_sel);
          var selected = utils.hasClass(this, FB.constants.thumb_sel),
            attr = this.getAttribute(FB.constants.thumb_path);
          if (selected) {
            this_.thumbs_selected.push(attr);
          } else {
            utils.removeArrayEntry(this_.thumbs_selected, attr);
          }
          this_.buttonThumbRemoveHandler();
        };

      while (++i < count) {
        file = files[i];
        path = file.relative_path + file.filename;
        // FIXME change this ternary
        selected = (this.thumbs_selected.indexOf(path) > -1) ? true : false;
        row = {
          filename: file.filename,
          date: file.date,
          filesize: file.filesize,
          url: url + path
        };
        html = this.thumbTemplate(row);
        li = utils.createElement(['li', {
          classname: (selected) ? FB.constants.thumb_sel : '',
          attr: [{
            name: FB.constants.thumb_path,
            value: path
          }]
        }], html);

        this.els.grd_preview.appendChild(li);
        li.addEventListener('click', thumbSelect, false);
      }
    },
    sendEditor: function() {
      var editor = this.options.editor,
        c = this.thumbs_selected.length,
        i = -1,
        filename;
      while (++i < c) {
        filename = this.thumbs_selected[i].replace(
          FB.constants.suffix_small,
          FB.constants.suffix_big
        );
        editor.insertHtml('<img src="' + this.options.root_http + filename + '">');
      }
      this.emptyThumbSelected();
      this.closeBrowser();
    },
    closeBrowser: function() {
      this.els.container.style.display = 'none';
    },
    removeTree: function() {
      var elements = this.els.folder_tree_root.getElementsByTagName('ol');
      utils.removeAll(elements);
    },
    thumbTemplate: function(row) {
      var str = [
        '<a class="brankic-checked" style="background-image:url({url})">',
        '<span class="fb-fileinfo">',
        '<span class="fb-fileinfo-center">',
        '<span>{filename}</span>',
        '<span>{date}<br>{filesize}</span>',
        '</span>',
        '</span>',
        '</a>'
      ].join('');
      return utils.template(str, row);
    },
    folderTemplate: function(row) {
      var str = [
        '<li data-key="{folder}" data-last="{last}" ',
        'data-files-all="{n-files-all}" data-folders="{n-folders}"><a>',
        '<i class="icomoon-folder"></i>',
        '<span>{folder} ({n-files})</span>',
        '</a></li>'
      ].join('');
      return utils.template(str, row);
    }
  };
  /**
   * @constructor
   */
  FB.Internal = function() {
    FB.$drag.when({
      startDragging: function() {
        utils.addClass(FB.container, 'dragging');
      },
      dragging: function() {
        FB.container.style.left = this.x + 'px';
        FB.container.style.top = this.y + 'px';
      },
      endDragging: function() {
        utils.removeClass(FB.container, 'dragging');
        if (this.y < 0) FB.container.style.top = 0;
      },
      resizing: function() {
        FB.container.style.width = this.w + 'px';
        FB.container.style.height = this.h + 'px';
      },
      endResizing: function() {
        var min_width = 400,
          min_height = 300;
        if (this.w < min_width)
          FB.container.style.width = min_width + 'px';
        if (this.h < min_height)
          FB.container.style.height = min_height + 'px';
      }
    });
  };

  FB.Internal.prototype = {
    setListeners: function() {
      var els = FB.elements,
        //to not loose scope
        newFolder = function() {
          this.blur();
          FB.$tree.newFolder();
        },
        removeFolder = function() {
          this.blur();
          FB.$tree.removeFolder();
        },
        removeFile = function() {
          this.blur();
          FB.$tree.removeFile();
        },
        sendEditor = function() {
          this.blur();
          FB.$tree.sendEditor();
        },
        closeBrowser = function() {
          this.blur();
          FB.$tree.closeBrowser();
        },
        upChoose = function() {
          this.blur();
          FB.$upload.choose();
        },
        upStart = function() {
          this.blur();
          FB.$upload.start();
        };
      els.btn_new_folder.addEventListener('click', newFolder, false);
      els.btn_del_folder.addEventListener('click', removeFolder, false);
      els.btn_upload_choose.addEventListener('click', upChoose, false);
      els.btn_upload_file.addEventListener('click', upStart, false);
      els.btn_del_file.addEventListener('click', removeFile, false);
      els.btn_editor.addEventListener('click', sendEditor, false);
      els.btn_close_grd.addEventListener('click', closeBrowser, false);
    }
  };
  /**
   * @constructor
   */
  FB.Html = function() {};

  FB.Html.prototype = {
    createBrowser: function() {
      var lang = FB.lang[FB.options.lang];

      var html = [
        '<div class="fb-wrap">',
        '<header>',
        '<div class="fb-header unselectable">',
        '<span>',
        lang.title,
        '</span>',
        '<span class="close"></span>',
        '</div>',
        '<h5 class="fb-message"></h5>',
        '<div class="fb-toolbar">',
        '<div class="fb-toolbar-items">',
        '<button id="btn-upload-choose" class="button-filebrowser">',
        '<i class="brankic-attachment"></i>',
        '<span>',
        lang.toolbar.bt_choose,
        '</span>',
        '</button>',
        '<button class="button-filebrowser hidden" id="btn-upload-send">',
        '<i class="brankic-upload"></i>',
        '<span>',
        lang.toolbar.bt_send,
        '</span>',
        '</button>',
        '<button class="button-filebrowser hidden" id="btn-del-file">',
        '<i class="brankic-trashcan"></i>',
        '<span>',
        lang.toolbar.bt_del_file,
        '</span>',
        '</button>',
        '<button class="button-filebrowser" id="btn-new-folder">',
        '<i class="icomoon-folder-plus"></i>',
        '<span>',
        lang.toolbar.bt_new_folder,
        '</span>',
        '</button>',
        '<button class="button-filebrowser" id="btn-del-folder" ',
        'style="display:none">',
        '<i class="icomoon-folder-minus"></i>',
        '<span>',
        lang.toolbar.bt_del_folder,
        '</span>',
        '</button>',
        '<button class="button-filebrowser hidden" id="btn-editor">',
        '<i class="brankic-edit"></i>',
        '<span>',
        lang.toolbar.bt_send_editor,
        '</span>',
        '</button>',
        '</div>',
        '</div>',
        '</header>',
        '<div class="fb-body clearfix">',
        '<div class="fb-tree-container">',
        '<ol id="fb-tree">',
        '<li id="fb-tree-folder-root" class="active open">',
        '<a>',
        '<i class="icomoon-folder"></i>',
        '<span id="folder-root-desc">',
        lang.root_folder,
        '</span>',
        '</a>',
        '</li>',
        '</ol>',
        '</div>',
        '<div class="fb-thumb-container">',
        '<ul id="fb-thumb" class="fb-thumb clearfix"></ul>',
        //<!-- "js-fileapi-wrapper" -- required class -->
        '<div class="js-fileapi-wrapper">',
        '<input id="upload-input" class="input-file" name="files" ',
        'type="file" multiple />',
        '</div>',
        '<ul id="upload-thumb" class="fb-upload-thumb" data-label="',
        lang.preview,
        '"></ul>',
        '</div>',
        '</div>',
        '<footer class="fb-footer clearfix">',
        '<span></span>',
        '</footer>',
        '</div>'
      ].join('');


      var container = utils.createElement([
          'div', {
            classname: FB.constants.css.container
          }
        ], html),
        elements = {
          container: container,
          drag_handle: container.querySelector('.fb-header'),
          resize_handle: container.querySelector('.fb-footer > span'),
          grd_preview: container.querySelector('#fb-thumb'),
          folder_tree: container.querySelector('#fb-tree'),
          folder_tree_root: container.querySelector('#fb-tree-folder-root'),
          folder_root_desc: container.querySelector('#folder-root-desc'),
          upload_input: container.querySelector('#upload-input'),
          btn_upload_choose: container.querySelector('#btn-upload-choose'),
          btn_new_folder: container.querySelector('#btn-new-folder'),
          btn_del_folder: container.querySelector('#btn-del-folder'),
          btn_del_file: container.querySelector('#btn-del-file'),
          btn_upload_file: container.querySelector('#btn-upload-send'),
          btn_editor: container.querySelector('#btn-editor'),
          images_list: container.querySelector('#upload-thumb'),
          grd_msg: container.querySelector('.fb-message'),
          grd_drag: container.querySelector('.fb-header'),
          grd_resize: container.querySelector('.fb-footer'),
          desc_btn_del_file: container.querySelector('#btn-del-file span'),
          desc_btn_editor: container.querySelector('#btn-editor span'),
          btn_close_grd: container.querySelector('.fb-header span.close')
        };
      //add elements to FB.elements
      for (var el in elements) {
        FB.elements[el] = elements[el];
      }
      container.style.position = 'fixed';
      container.style.zIndex = FB.$base.maxZIndex + 10;
      container.style.display = 'none';
      document.body.appendChild(container);
      FB.container = container;
    },
    createAlert: function() {
      var lang = FB.lang[FB.options.lang];

      var html = [
        '<div class="fb-icon fb-error" style="display:none;">',
        '<span class="fb-x-mark">',
        '<span class="fb-line fb-left"></span>',
        '<span class="fb-line fb-right"></span>',
        '</span>',
        '</div>',
        '<div class="fb-icon fb-warning" style="display:none;">',
        '<span class="fb-body"></span>',
        '<span class="fb-dot"></span>',
        '</div>',
        '<div class="fb-icon fb-info" style="display:none;"></div>',
        '<h2 class="fb-title"></h2>',
        '<div class="fb-text"></div>',
        '<fieldset><input type="text" style="display:none;"></fieldset>',
        '<div class="fb-error-container">',
        '<div class="icon">!</div>',
        '<div class="fb-error-text"></div>',
        '</div>',
        '<div class="fb-button-container">',
        '<button class="button-filebrowser cancel">',
        lang.alert.bt_cancel,
        '</button>',
        '<button class="button-filebrowser ok">',
        lang.alert.bt_ok,
        '</button>',
        '</div>'
      ].join('');

      var overlay = document.createElement('div'),
        container = utils.createElement([
          'div', {
            classname: FB.constants.css.alert_container
          }
        ], html),
        elements = {
          alert_overlay: overlay,
          alert_container: container,
          alert_title: container.querySelector('.fb-title'),
          alert_text: container.querySelector('.fb-text'),
          alert_input: container.querySelector('input[type="text"]'),
          alert_icon_error: container.querySelector('.fb-icon.fb-error'),
          alert_icon_warning: container.querySelector('.fb-icon.fb-warning'),
          alert_icon_info: container.querySelector('.fb-icon.fb-info'),
          alert_icon_success: container.querySelector('.fb-icon.fb-success'),
          alert_elem_error: container.querySelector('.fb-error-container'),
          alert_error_text: container.querySelector('.fb-error-text'),
          alert_ok: container.querySelector('button.ok'),
          alert_cancel: container.querySelector('button.cancel')
        };
      //add elements to FB.elements
      for (var el in elements) {
        FB.elements[el] = elements[el];
      }

      overlay.className = FB.constants.css.alert_overlay;
      overlay.style.zIndex = FB.$base.maxZIndex + 11;
      container.style.zIndex = FB.$base.maxZIndex + 12;
      container.style.display = 'none';
      document.body.appendChild(overlay);
      document.body.appendChild(container);

      return container;
    }
  };
  /**
   * @constructor
   */
  FB.DragAndResize = function() {
    var lastX, lastY, currentX, currentY, x, y,
      when = {};

    /*
     * Dragging
     */
    FB.elements.drag_handle.addEventListener('mousedown', function(evt) {
      if (evt.button !== 0) return;

      evt.preventDefault();
      lastX = evt.clientX;
      lastY = evt.clientY;

      function mousemove(e) {
        currentX = parseInt(FB.container.style.left, 10) || 0;
        currentY = parseInt(FB.container.style.top, 10) || 0;

        x = currentX + (e.clientX - lastX);
        y = currentY + (e.clientY - lastY);

        when.dragging.call({
          target: FB.container,
          x: x,
          y: y
        });

        lastX = e.clientX;
        lastY = e.clientY;
      }

      function mouseup() {
        window.removeEventListener('mousemove', mousemove, false);
        window.removeEventListener('mouseup', mouseup, false);

        when.endDragging.call({
          target: FB.container,
          x: x,
          y: y
        });
      }

      when.startDragging.call({
        target: FB.container
      });
      window.addEventListener('mousemove', mousemove, false);
      window.addEventListener('mouseup', mouseup, false);
    }, false);

    /*
     * Resizing
     */
    FB.elements.resize_handle.addEventListener('mousedown', function(evt) {
      evt.preventDefault();

      if (evt.which == 2 || evt.which == 3) return;

      function mousemove(e) {
        var offset = utils.offset(FB.container);
        x = e.clientX - offset.left;
        y = e.clientY - offset.top;

        when.resizing.call({
          target: FB.container,
          w: x,
          h: y
        });
      }

      function mouseup() {
        window.removeEventListener('mousemove', mousemove, false);
        window.removeEventListener('mouseup', mouseup, false);

        when.endResizing.call({
          target: FB.container,
          w: x,
          h: y
        });
      }

      window.addEventListener('mousemove', mousemove, false);
      window.addEventListener('mouseup', mouseup, false);
    }, false);

    return {
      when: function(obj) {
        when = {
          startDragging: obj.startDragging,
          endDragging: obj.endDragging,
          dragging: obj.dragging,
          startResizing: obj.startResizing,
          endResizing: obj.endResizing,
          resizing: obj.resizing
        };
      }
    };
  };
  /**
   * @constructor
   */
  FB.Upload = function() {
    this.els = FB.elements;
    this.files = [];
    this.index = 0;
    this.active = false;
    this.path_parents = '';
    this.setListeners();
    this.lang = FB.lang[FB.options.lang];
  };

  FB.Upload.prototype = {
    setListeners: function() {
      var this_ = this;

      var isImageAndHasMinSize = function(file, info) {
        return /^image/.test(file.type) ?
          info.width >= FB.options.image.min_width &&
          info.height >= FB.options.image.min_height : false;
      };

      FileAPI.event.on(this.els.upload_input, 'change', function(evt) {
        var files = FileAPI.getFiles(evt);

        FileAPI.filterFiles(files,
          function(file, info) {
            var check;
            // TODO prepare for other file types
            FB.options.upload_types.forEach(function(type) {
              if (type == FB.constants.types.image) {
                check = isImageAndHasMinSize(file, info);
              }
            });
            return check;
          },
          function(files, rejected) {
            if (rejected && rejected.length) {
              FB.$tree.showHeaderMessage({
                msg: utils.templateLang(this_.lang.alert.image.not_min_size, [FB.options.image.min_width, FB.options.image.min_height]),
                duration: 3500,
                type: 'alert'
              });
            }
            files.length && this_.add(files);
          }
        );
      });
    },
    choose: function() {
      utils.fireClick(this.els.upload_input);
    },
    showPreview: function() {
      this.els.grd_preview.style.display = 'none';
      this.els.images_list.style.display = '';
      utils.removeClass(this.els.btn_upload_file, 'hidden');
    },
    showTree: function() {
      this.els.grd_preview.style.display = '';
      this.els.images_list.style.display = 'none';
      utils.addClass(this.els.btn_upload_file, 'hidden');
    },
    add: function(files) {
      var this_ = this,
        row, html, li, left;

      this.showPreview();
      FB.$tree.emptyThumbSelected();

      FileAPI.each(files, function(file) {
        this_.files.push(file);
        FileAPI.Image(file).preview(70).get(function(err, img) {
          row = {
            name: file.name,
            size: utils.bytesToSize(file.size)
          };
          html = this_.thumbTemplate(row);
          li = utils.createElement('li', html);
          li.id = 'file-' + FileAPI.uid(file);
          this_.els.images_list.appendChild(li);
          left = utils.find('.fb-preview-left', li);
          left.appendChild(img);
        });
      });
      window.setTimeout(function() {
        utils.fireClick(this_.els.btn_upload_file);
      }, 300);
    },
    thumbTemplate: function(row) {
      var str = [
        '<div class="fb-preview-left"></div>',
        '<div class="fb-preview-right">',
        '<div class="fb-preview-filename">',
        '<span>{name}</span><br/>',
        '<span>tamanho: {size}</span>',
        '</div>',
        '<div class="fb-preview-progress">',
        '<div class="fb-progress-bar"></div>',
        '</div>',
        '</div>'
      ].join('');
      return utils.template(str, row);
    },
    getFileById: function(id) {
      var i = this.files.length;
      while (i--) {
        if (FileAPI.uid(this.files[i]) == id) {
          return this.files[i];
        }
      }
    },
    start: function() {
      var len = this.files.length;

      this.path_parents = FB.$tree.getFolderPath(FB.$tree.current_active);
      if (this.active) {
        FB.$tree.showHeaderMessage({
          msg: this.lang.alert.upload.sending,
          duration: 1500,
          type: 'alert'
        });
        return;
      } else {
        if (len === 0) {
          FB.$tree.showHeaderMessage({
            msg: this.lang.alert.upload.none,
            duration: 1500,
            type: 'alert'
          });
          return;
        } else if (len == this.index) {
          FB.$tree.showHeaderMessage({
            msg: this.lang.alert.upload.sent,
            duration: 1500,
            type: 'alert'
          });
          return;
        }
      }
      this.start_();
    },
    start_: function() {
      if (!this.active && (this.active = this.files.length > this.index)) {
        this.upload_(this.files[this.index]);
      }
    },
    abort: function(id) {
      var file = this.getFileById(id);
      if (file.xhr) {
        file.xhr.abort();
      }
    },
    getEl_: function(file, sel) {
      var el = utils.$('file-' + FileAPI.uid(file));
      return (sel) ? utils.find(sel, el) : el;
    },
    upload_: function(file) {
      var this_ = this,
        opt_transform = FB.options.image.transform,
        progress_el = this.getEl_(file, '.fb-progress-bar');

      if (!file) return;

      console.info(opt_transform);
      file.xhr = FileAPI.upload({
        url: FB.options.server_http,
        files: {
          file: file
        },
        data: {
          action: FB.constants.actions.upload,
          parents: this.path_parents.join()
        },
        imageOriginal: false,
        imageTransform: {
          big: {
            maxWidth: opt_transform.big.maxWidth,
            maxHeight: opt_transform.big.maxHeight
          },
          small: {
            maxWidth: opt_transform.small.maxWidth,
            maxHeight: opt_transform.small.maxHeight
          }
        },
        filecomplete: function(err) {
          if (err) {
            console.info(err);
          }
        },
        progress: function(evt) {
          progress_el.style.width = evt.loaded / evt.total * 100 + '%';
        },
        complete: function(err, xhr) {
          //var state = err ? 'error' : 'done';

          this_.index++;
          this_.active = false;
          this_.start_();

          if (this_.files.length == this_.index) {
            var result = FileAPI.parseJSON(xhr.responseText);
            if (result.error === false) {
              FB.$tree.showHeaderMessage({
                msg: this_.lang.alert.upload.sent,
                duration: 2500,
                type: 'success'
              });
              window.setTimeout(function() {
                this_.showTree();
                FB.$tree.renewTree(result.tree);
              }, 1500);
            }
          }
        }
      });
    }
  };
  /**
   * @constructor
   */
  FB.Alert = function() {
    this.els = FB.elements;
    this.setListeners();
    this.opened = false;
    // this will be filled later by methods (prompt, confirm, etc)
    this.options = {};
  };

  FB.Alert.prototype = {
    show: function() {
      var container = this.els.alert_container,
        browser_zindex = parseInt(this.els.container.style.zIndex);

      this.els.alert_title.textContent = this.options.html.title;
      this.els.alert_text.innerHTML = this.options.html.text;
      utils.addClass(document.body, 'filebrowser-fb-stop-scrolling');
      utils.fadeIn(this.els.alert_overlay);
      this.els.alert_overlay.style.zIndex = browser_zindex + 1;
      container.style.marginTop = utils.getTopMargin(container);
      container.style.opacity = '';
      container.style.zIndex = browser_zindex + 2;
      container.style.display = 'block';
      utils.addClass(container, 'fb-alert-show');
      utils.removeClass(container, 'fb-alert-hide');
      window.previousActiveElement = document.activeElement;
      this.opened = true;
      this.hideInputError();
    },
    close: function() {
      this.opened = false;
      utils.fadeOut(this.els.alert_overlay);
      utils.fadeOut(this.els.alert_container);
      utils.addClass(this.els.alert_container, 'fb-alert-hide');
      utils.removeClass(this.els.alert_container, 'fb-alert-show');
      utils.removeClass(document.body, 'filebrowser-fb-stop-scrolling');
      if (window.previousActiveElement) {
        //window.previousActiveElement.focus();
      }
    },
    checkInput: function(keyCode, value) {
      //enter key 13
      if (keyCode === 13) {
        this.options.submit.call(value);
      } else {
        this.options.checkInput.call(value);
      }
    },
    submit: function() {
      //this.options.submit is application submit function
      this.options.submit.call(this.els.alert_input.value);
    },
    prompt: function(options) {
      this.options = options;

      this.show();
      this.els.alert_icon_warning.style.display = 'none';
      this.els.alert_input.style.display = '';
      this.els.alert_input.setAttribute('placeholder', options.placeholder);
      this.els.alert_input.focus();
    },
    confirm: function(options) {
      this.options = options;

      this.show();
      this.els.alert_icon_warning.style.display = '';
      this.els.alert_input.style.display = 'none';
      this.els.alert_input.focus();
    },
    showInputError: function(html) {
      utils.addClass(this.els.alert_input, 'invalid');
      utils.addClass(this.els.alert_elem_error, 'show');
      this.els.alert_error_text.innerHTML = html;
    },
    hideInputError: function() {
      utils.removeClass(this.els.alert_input, 'invalid');
      utils.removeClass(this.els.alert_elem_error, 'show');
    },
    setListeners: function() {
      var this_ = this,
        //to not loose scope
        submit = function() {
          this.blur();
          this_.submit();
        },
        close = function() {
          this.blur();
          this_.close();
        },
        checkInput = function(evt) {
          this_.checkInput(evt.keyCode, this.value);
        },
        keydown = function(evt) {
          if (evt.keyCode === 27 && this_.opened) { //esc key
            this_.close();
          }
        };
      this.els.alert_ok.addEventListener('click', submit, false);
      this.els.alert_cancel.addEventListener('click', close, false);
      this.els.alert_input.addEventListener('keyup', checkInput, false);
      document.addEventListener('keydown', keydown, false);
    }
  };
  return FB.Base;
}));

// disable lint for externs (FileAPI)
/*eslint-disable */
/*
 * JavaScript Canvas to Blob 2.0.5
 * https://github.com/blueimp/JavaScript-Canvas-to-Blob
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on stackoverflow user Stoive's code snippet:
 * http://stackoverflow.com/q/4998908
 */

/*jslint nomen: true, regexp: true */
/*global window, atob, Blob, ArrayBuffer, Uint8Array */

(function(window) {
  'use strict';
  var CanvasPrototype = window.HTMLCanvasElement &&
    window.HTMLCanvasElement.prototype,
    hasBlobConstructor = window.Blob && (function() {
      try {
        return Boolean(new Blob());
      } catch (e) {
        return false;
      }
    }()),
    hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array &&
    (function() {
      try {
        return new Blob([new Uint8Array(100)]).size === 100;
      } catch (e) {
        return false;
      }
    }()),
    BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
    window.MozBlobBuilder || window.MSBlobBuilder,
    dataURLtoBlob = (hasBlobConstructor || BlobBuilder) && window.atob &&
    window.ArrayBuffer && window.Uint8Array && function(dataURI) {
      var byteString,
        arrayBuffer,
        intArray,
        i,
        mimeString,
        bb;
      if (dataURI.split(',')[0].indexOf('base64') >= 0) {
        // Convert base64 to raw binary data held in a string:
        byteString = atob(dataURI.split(',')[1]);
      } else {
        // Convert base64/URLEncoded data component to raw binary data:
        byteString = decodeURIComponent(dataURI.split(',')[1]);
      }
      // Write the bytes of the string to an ArrayBuffer:
      arrayBuffer = new ArrayBuffer(byteString.length);
      intArray = new Uint8Array(arrayBuffer);
      for (i = 0; i < byteString.length; i += 1) {
        intArray[i] = byteString.charCodeAt(i);
      }
      // Separate out the mime component:
      mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      // Write the ArrayBuffer (or ArrayBufferView) to a blob:
      if (hasBlobConstructor) {
        return new Blob(
          [hasArrayBufferViewSupport ? intArray : arrayBuffer], {
            type: mimeString
          }
        );
      }
      bb = new BlobBuilder();
      bb.append(arrayBuffer);
      return bb.getBlob(mimeString);
    };
  if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
    if (CanvasPrototype.mozGetAsFile) {
      CanvasPrototype.toBlob = function(callback, type, quality) {
        if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
          callback(dataURLtoBlob(this.toDataURL(type, quality)));
        } else {
          callback(this.mozGetAsFile('blob', type));
        }
      };
    } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
      CanvasPrototype.toBlob = function(callback, type, quality) {
        callback(dataURLtoBlob(this.toDataURL(type, quality)));
      };
    }
  }
  window.dataURLtoBlob = dataURLtoBlob;
})(window);
/*jslint evil: true */
/*global window, URL, webkitURL, ActiveXObject */

(function(window, undef) {
  'use strict';

  var
    gid = 1,
    noop = function() {},

    document = window.document,
    doctype = document.doctype || {},
    userAgent = window.navigator.userAgent,
    safari = /safari\//i.test(userAgent) && !/chrome\//i.test(userAgent),
    iemobile = /iemobile\//i.test(userAgent),

    // https://github.com/blueimp/JavaScript-Load-Image/blob/master/load-image.js#L48
    apiURL = (window.createObjectURL && window) || (window.URL && URL.revokeObjectURL && URL) || (window.webkitURL && webkitURL),

    Blob = window.Blob,
    File = window.File,
    FileReader = window.FileReader,
    FormData = window.FormData,


    XMLHttpRequest = window.XMLHttpRequest,
    jQuery = window.jQuery,

    html5 = !!(File && (FileReader && (window.Uint8Array || FormData || XMLHttpRequest.prototype.sendAsBinary))) && !(safari && /windows/i.test(userAgent) && !iemobile), // BugFix: https://github.com/mailru/FileAPI/issues/25

    cors = html5 && ('withCredentials' in (new XMLHttpRequest)),

    chunked = html5 && !!Blob && !!(Blob.prototype.webkitSlice || Blob.prototype.mozSlice || Blob.prototype.slice),

    normalize = ('' + ''.normalize).indexOf('[native code]') > 0,

    // https://github.com/blueimp/JavaScript-Canvas-to-Blob
    dataURLtoBlob = window.dataURLtoBlob,


    _rimg = /img/i,
    _rcanvas = /canvas/i,
    _rimgcanvas = /img|canvas/i,
    _rinput = /input/i,
    _rdata = /^data:[^,]+,/,

    _toString = {}.toString,
    _supportConsoleLog,
    _supportConsoleLogApply,


    Math = window.Math,

    _SIZE_CONST = function(pow) {
      pow = new window.Number(Math.pow(1024, pow));
      pow.from = function(sz) {
        return Math.round(sz * this);
      };
      return pow;
    },

    _elEvents = {}, // element event listeners
    _infoReader = [], // list of file info processors

    _readerEvents = 'abort progress error load loadend',
    _xhrPropsExport = 'status statusText readyState response responseXML responseText responseBody'.split(' '),

    currentTarget = 'currentTarget', // for minimize
    preventDefault = 'preventDefault', // and this too

    _isArray = function(ar) {
      return ar && ('length' in ar);
    },

    /**
     * Iterate over a object or array
     */
    _each = function(obj, fn, ctx) {
      if (obj) {
        if (_isArray(obj)) {
          for (var i = 0, n = obj.length; i < n; i++) {
            if (i in obj) {
              fn.call(ctx, obj[i], i, obj);
            }
          }
        } else {
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              fn.call(ctx, obj[key], key, obj);
            }
          }
        }
      }
    },

    /**
     * Merge the contents of two or more objects together into the first object
     */
    _extend = function(dst) {
      var args = arguments,
        i = 1,
        _ext = function(val, key) {
          dst[key] = val;
        };
      for (; i < args.length; i++) {
        _each(args[i], _ext);
      }
      return dst;
    },

    /**
     * Add event listener
     */
    _on = function(el, type, fn) {
      if (el) {
        var uid = api.uid(el);

        if (!_elEvents[uid]) {
          _elEvents[uid] = {};
        }

        var isFileReader = (FileReader && el) && (el instanceof FileReader);
        _each(type.split(/\s+/), function(type) {
          if (jQuery && !isFileReader) {
            jQuery.event.add(el, type, fn);
          } else {
            if (!_elEvents[uid][type]) {
              _elEvents[uid][type] = [];
            }

            _elEvents[uid][type].push(fn);

            if (el.addEventListener) {
              el.addEventListener(type, fn, false);
            } else if (el.attachEvent) {
              el.attachEvent('on' + type, fn);
            } else {
              el['on' + type] = fn;
            }
          }
        });
      }
    },


    /**
     * Remove event listener
     */
    _off = function(el, type, fn) {
      if (el) {
        var uid = api.uid(el),
          events = _elEvents[uid] || {};

        var isFileReader = (FileReader && el) && (el instanceof FileReader);
        _each(type.split(/\s+/), function(type) {
          if (jQuery && !isFileReader) {
            jQuery.event.remove(el, type, fn);
          } else {
            var fns = events[type] || [],
              i = fns.length;

            while (i--) {
              if (fns[i] === fn) {
                fns.splice(i, 1);
                break;
              }
            }

            if (el.addEventListener) {
              el.removeEventListener(type, fn, false);
            } else if (el.detachEvent) {
              el.detachEvent('on' + type, fn);
            } else {
              el['on' + type] = null;
            }
          }
        });
      }
    },


    _one = function(el, type, fn) {
      _on(el, type, function _(evt) {
        _off(el, type, _);
        fn(evt);
      });
    },


    _fixEvent = function(evt) {
      if (!evt.target) {
        evt.target = window.event && window.event.srcElement || document;
      }
      if (evt.target.nodeType === 3) {
        evt.target = evt.target.parentNode;
      }
      return evt;
    },


    _supportInputAttr = function(attr) {
      var input = document.createElement('input');
      input.setAttribute('type', "file");
      return attr in input;
    },


    /**
     * FileAPI (core object)
     */
    api = {
      version: '2.0.19',

      cors: false,
      html5: true,
      media: false,
      formData: true,
      multiPassResize: true,

      debug: false,
      pingUrl: false,
      multiFlash: false,
      flashAbortTimeout: 0,
      withCredentials: true,

      staticPath: './dist/',

      flashUrl: 0, // @default: './FileAPI.flash.swf'
      flashImageUrl: 0, // @default: './FileAPI.flash.image.swf'

      postNameConcat: function(name, idx) {
        return name + (idx != null ? '[' + idx + ']' : '');
      },

      ext2mime: {
        jpg: 'image/jpeg',
        tif: 'image/tiff',
        txt: 'text/plain'
      },

      // Fallback for flash
      accept: {
        'image/*': 'art bm bmp dwg dxf cbr cbz fif fpx gif ico iefs jfif jpe jpeg jpg jps jut mcf nap nif pbm pcx pgm pict pm png pnm qif qtif ras rast rf rp svf tga tif tiff xbm xbm xpm xwd',
        'audio/*': 'm4a flac aac rm mpa wav wma ogg mp3 mp2 m3u mod amf dmf dsm far gdm imf it m15 med okt s3m stm sfx ult uni xm sid ac3 dts cue aif aiff wpl ape mac mpc mpp shn wv nsf spc gym adplug adx dsp adp ymf ast afc hps xs',
        'video/*': 'm4v 3gp nsv ts ty strm rm rmvb m3u ifo mov qt divx xvid bivx vob nrg img iso pva wmv asf asx ogm m2v avi bin dat dvr-ms mpg mpeg mp4 mkv avc vp3 svq3 nuv viv dv fli flv wpl'
      },

      uploadRetry: 0,
      networkDownRetryTimeout: 5000, // milliseconds, don't flood when network is down

      chunkSize: 0,
      chunkUploadRetry: 0,
      chunkNetworkDownRetryTimeout: 2000, // milliseconds, don't flood when network is down

      KB: _SIZE_CONST(1),
      MB: _SIZE_CONST(2),
      GB: _SIZE_CONST(3),
      TB: _SIZE_CONST(4),

      EMPTY_PNG: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=',

      expando: 'fileapi' + (new Date).getTime(),

      uid: function(obj) {
        return obj ? (obj[api.expando] = obj[api.expando] || api.uid()) : (++gid, api.expando + gid);
      },

      log: function() {
        if (api.debug && _supportConsoleLog) {
          if (_supportConsoleLogApply) {
            console.log.apply(console, arguments);
          } else {
            console.log([].join.call(arguments, ' '));
          }
        }
      },

      /**
       * Create new image
       *
       * @param {String} [src]
       * @param {Function} [fn]   1. error -- boolean, 2. img -- Image element
       * @returns {HTMLElement}
       */
      newImage: function(src, fn) {
        var img = document.createElement('img');
        if (fn) {
          api.event.one(img, 'error load', function(evt) {
            fn(evt.type == 'error', img);
            img = null;
          });
        }
        img.src = src;
        return img;
      },

      /**
       * Get XHR
       * @returns {XMLHttpRequest}
       */
      getXHR: function() {
        var xhr;

        if (XMLHttpRequest) {
          xhr = new XMLHttpRequest;
        } else if (window.ActiveXObject) {
          try {
            xhr = new ActiveXObject('MSXML2.XMLHttp.3.0');
          } catch (e) {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
          }
        }

        return xhr;
      },

      isArray: _isArray,

      support: {
        dnd: cors && ('ondrop' in document.createElement('div')),
        cors: cors,
        html5: html5,
        chunked: chunked,
        dataURI: true,
        accept: _supportInputAttr('accept'),
        multiple: _supportInputAttr('multiple')
      },

      event: {
        on: _on,
        off: _off,
        one: _one,
        fix: _fixEvent
      },


      throttle: function(fn, delay) {
        var id, args;

        return function _throttle() {
          args = arguments;

          if (!id) {
            fn.apply(window, args);
            id = setTimeout(function() {
              id = 0;
              fn.apply(window, args);
            }, delay);
          }
        };
      },


      F: function() {},


      parseJSON: function(str) {
        var json;
        if (window.JSON && JSON.parse) {
          json = JSON.parse(str);
        } else {
          json = (new Function('return (' + str.replace(/([\r\n])/g, '\\$1') + ');'))();
        }
        return json;
      },


      trim: function(str) {
        str = String(str);
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
      },

      /**
       * Simple Defer
       * @return	{Object}
       */
      defer: function() {
        var
          list = [],
          result, error, defer = {
            resolve: function(err, res) {
              defer.resolve = noop;
              error = err || false;
              result = res;

              while (res = list.shift()) {
                res(error, result);
              }
            },

            then: function(fn) {
              if (error !== undef) {
                fn(error, result);
              } else {
                list.push(fn);
              }
            }
          };

        return defer;
      },

      queue: function(fn) {
        var
          _idx = 0,
          _length = 0,
          _fail = false,
          _end = false,
          queue = {
            inc: function() {
              _length++;
            },

            next: function() {
              _idx++;
              setTimeout(queue.check, 0);
            },

            check: function() {
              (_idx >= _length) && !_fail && queue.end();
            },

            isFail: function() {
              return _fail;
            },

            fail: function() {
              !_fail && fn(_fail = true);
            },

            end: function() {
              if (!_end) {
                _end = true;
                fn();
              }
            }
          };
        return queue;
      },


      /**
       * For each object
       *
       * @param	{Object|Array}	obj
       * @param	{Function}		fn
       * @param	{*}				[ctx]
       */
      each: _each,


      /**
       * Async for
       * @param {Array} array
       * @param {Function} callback
       */
      afor: function(array, callback) {
        var i = 0,
          n = array.length;

        if (_isArray(array) && n--) {
          (function _next() {
            callback(n != i && _next, array[i], i++);
          })();
        } else {
          callback(false);
        }
      },


      /**
       * Merge the contents of two or more objects together into the first object
       *
       * @param	{Object}	dst
       * @return	{Object}
       */
      extend: _extend,


      /**
       * Is file?
       * @param  {File}  file
       * @return {Boolean}
       */
      isFile: function(file) {
        return _toString.call(file) === '[object File]';
      },


      /**
       * Is blob?
       * @param   {Blob}  blob
       * @returns {Boolean}
       */
      isBlob: function(blob) {
        return this.isFile(blob) || (_toString.call(blob) === '[object Blob]');
      },


      /**
       * Is canvas element
       *
       * @param	{HTMLElement}	el
       * @return	{Boolean}
       */
      isCanvas: function(el) {
        return el && _rcanvas.test(el.nodeName);
      },


      getFilesFilter: function(filter) {
        filter = typeof filter == 'string' ? filter : (filter.getAttribute && filter.getAttribute('accept') || '');
        return filter ? new RegExp('(' + filter.replace(/\./g, '\\.').replace(/,/g, '|') + ')$', 'i') : /./;
      },



      /**
       * Read as DataURL
       *
       * @param {File|Element} file
       * @param {Function} fn
       */
      readAsDataURL: function(file, fn) {
        if (api.isCanvas(file)) {
          _emit(file, fn, 'load', api.toDataURL(file));
        } else {
          _readAs(file, fn, 'DataURL');
        }
      },


      /**
       * Read as Binary string
       *
       * @param {File} file
       * @param {Function} fn
       */
      readAsBinaryString: function(file, fn) {
        if (_hasSupportReadAs('BinaryString')) {
          _readAs(file, fn, 'BinaryString');
        } else {
          // Hello IE10!
          _readAs(file, function(evt) {
            if (evt.type == 'load') {
              try {
                // dataURL -> binaryString
                evt.result = api.toBinaryString(evt.result);
              } catch (e) {
                evt.type = 'error';
                evt.message = e.toString();
              }
            }
            fn(evt);
          }, 'DataURL');
        }
      },


      /**
       * Read as ArrayBuffer
       *
       * @param {File} file
       * @param {Function} fn
       */
      readAsArrayBuffer: function(file, fn) {
        _readAs(file, fn, 'ArrayBuffer');
      },


      /**
       * Read as text
       *
       * @param {File} file
       * @param {String} encoding
       * @param {Function} [fn]
       */
      readAsText: function(file, encoding, fn) {
        if (!fn) {
          fn = encoding;
          encoding = 'utf-8';
        }

        _readAs(file, fn, 'Text', encoding);
      },


      /**
       * Convert image or canvas to DataURL
       *
       * @param   {Element}  el      Image or Canvas element
       * @param   {String}   [type]  mime-type
       * @return  {String}
       */
      toDataURL: function(el, type) {
        if (typeof el == 'string') {
          return el;
        } else if (el.toDataURL) {
          return el.toDataURL(type || 'image/png');
        }
      },


      /**
       * Canvert string, image or canvas to binary string
       *
       * @param   {String|Element} val
       * @return  {String}
       */
      toBinaryString: function(val) {
        return window.atob(api.toDataURL(val).replace(_rdata, ''));
      },


      /**
       * Read file or DataURL as ImageElement
       *
       * @param	{File|String}	file
       * @param	{Function}		fn
       * @param	{Boolean}		[progress]
       */
      readAsImage: function(file, fn, progress) {
        if (api.isBlob(file)) {
          if (apiURL) {
            /** @namespace apiURL.createObjectURL */
            var data = apiURL.createObjectURL(file);
            if (data === undef) {
              _emit(file, fn, 'error');
            } else {
              api.readAsImage(data, fn, progress);
            }
          } else {
            api.readAsDataURL(file, function(evt) {
              if (evt.type == 'load') {
                api.readAsImage(evt.result, fn, progress);
              } else if (progress || evt.type == 'error') {
                _emit(file, fn, evt, null, {
                  loaded: evt.loaded,
                  total: evt.total
                });
              }
            });
          }
        } else if (api.isCanvas(file)) {
          _emit(file, fn, 'load', file);
        } else if (_rimg.test(file.nodeName)) {
          if (file.complete) {
            _emit(file, fn, 'load', file);
          } else {
            var events = 'error abort load';
            _one(file, events, function _fn(evt) {
              if (evt.type == 'load' && apiURL) {
                /** @namespace apiURL.revokeObjectURL */
                apiURL.revokeObjectURL(file.src);
              }

              _off(file, events, _fn);
              _emit(file, fn, evt, file);
            });
          }
        } else if (file.iframe) {
          _emit(file, fn, {
            type: 'error'
          });
        } else {
          // Created image
          var img = api.newImage(file.dataURL || file);
          api.readAsImage(img, fn, progress);
        }
      },


      /**
       * Make file by name
       *
       * @param	{String}	name
       * @return	{Array}
       */
      checkFileObj: function(name) {
        var file = {},
          accept = api.accept;

        if (typeof name == 'object') {
          file = name;
        } else {
          file.name = (name + '').split(/\\|\//g).pop();
        }

        if (file.type == null) {
          file.type = file.name.split('.').pop();
        }

        _each(accept, function(ext, type) {
          ext = new RegExp(ext.replace(/\s/g, '|'), 'i');
          if (ext.test(file.type) || api.ext2mime[file.type]) {
            file.type = api.ext2mime[file.type] || (type.split('/')[0] + '/' + file.type);
          }
        });

        return file;
      },


      /**
       * Get drop files
       *
       * @param	{Event}	evt
       * @param	{Function} callback
       */
      getDropFiles: function(evt, callback) {
        var
          files = [],
          all = [],
          items, dataTransfer = _getDataTransfer(evt),
          transFiles = dataTransfer.files,
          transItems = dataTransfer.items,
          entrySupport = _isArray(transItems) && transItems[0] && _getAsEntry(transItems[0]),
          queue = api.queue(function() {
            callback(files, all);
          });

        if (entrySupport) {
          if (normalize && transFiles) {
            var
              i = transFiles.length,
              file, entry;

            items = new Array(i);
            while (i--) {
              file = transFiles[i];

              try {
                entry = _getAsEntry(transItems[i]);
              } catch (err) {
                api.log('[err] getDropFiles: ', err);
                entry = null;
              }

              if (_isEntry(entry)) {
                // OSX filesystems use Unicode Normalization Form D (NFD),
                // and entry.file(…) can't read the files with the same names
                if (entry.isDirectory || (entry.isFile && file.name == file.name.normalize('NFC'))) {
                  items[i] = entry;
                } else {
                  items[i] = file;
                }
              } else {
                items[i] = file;
              }
            }
          } else {
            items = transItems;
          }
        } else {
          items = transFiles;
        }

        _each(items || [], function(item) {
          queue.inc();

          try {
            if (entrySupport && _isEntry(item)) {
              _readEntryAsFiles(item, function(err, entryFiles, allEntries) {
                if (err) {
                  api.log('[err] getDropFiles:', err);
                } else {
                  files.push.apply(files, entryFiles);
                }
                all.push.apply(all, allEntries);

                queue.next();
              });
            } else {
              _isRegularFile(item, function(yes, err) {
                if (yes) {
                  files.push(item);
                } else {
                  item.error = err;
                }
                all.push(item);

                queue.next();
              });
            }
          } catch (err) {
            queue.next();
            api.log('[err] getDropFiles: ', err);
          }
        });

        queue.check();
      },


      /**
       * Get file list
       *
       * @param	{HTMLInputElement|Event}	input
       * @param	{String|Function}	[filter]
       * @param	{Function}			[callback]
       * @return	{Array|Null}
       */
      getFiles: function(input, filter, callback) {
        var files = [];

        if (callback) {
          api.filterFiles(api.getFiles(input), filter, callback);
          return null;
        }

        if (input.jquery) {
          // jQuery object
          input.each(function() {
            files = files.concat(api.getFiles(this));
          });
          input = files;
          files = [];
        }

        if (typeof filter == 'string') {
          filter = api.getFilesFilter(filter);
        }

        if (input.originalEvent) {
          // jQuery event
          input = _fixEvent(input.originalEvent);
        } else if (input.srcElement) {
          // IE Event
          input = _fixEvent(input);
        }


        if (input.dataTransfer) {
          // Drag'n'Drop
          input = input.dataTransfer;
        } else if (input.target) {
          // Event
          input = input.target;
        }

        if (input.files) {
          // Input[type="file"]
          files = input.files;

          if (!html5) {
            // Partial support for file api
            files[0].blob = input;
            files[0].iframe = true;
          }
        } else if (!html5 && isInputFile(input)) {
          if (api.trim(input.value)) {
            files = [api.checkFileObj(input.value)];
            files[0].blob = input;
            files[0].iframe = true;
          }
        } else if (_isArray(input)) {
          files = input;
        }

        return api.filter(files, function(file) {
          return !filter || filter.test(file.name);
        });
      },


      /**
       * Get total file size
       * @param	{Array}	files
       * @return	{Number}
       */
      getTotalSize: function(files) {
        var size = 0,
          i = files && files.length;
        while (i--) {
          size += files[i].size;
        }
        return size;
      },


      /**
       * Get image information
       *
       * @param	{File}		file
       * @param	{Function}	fn
       */
      getInfo: function(file, fn) {
        var info = {},
          readers = _infoReader.concat();

        if (api.isBlob(file)) {
          (function _next() {
            var reader = readers.shift();
            if (reader) {
              if (reader.test(file.type)) {
                reader(file, function(err, res) {
                  if (err) {
                    fn(err);
                  } else {
                    _extend(info, res);
                    _next();
                  }
                });
              } else {
                _next();
              }
            } else {
              fn(false, info);
            }
          })();
        } else {
          fn('not_support_info', info);
        }
      },


      /**
       * Add information reader
       *
       * @param {RegExp} mime
       * @param {Function} fn
       */
      addInfoReader: function(mime, fn) {
        fn.test = function(type) {
          return mime.test(type);
        };
        _infoReader.push(fn);
      },


      /**
       * Filter of array
       *
       * @param	{Array}		input
       * @param	{Function}	fn
       * @return	{Array}
       */
      filter: function(input, fn) {
        var result = [],
          i = 0,
          n = input.length,
          val;

        for (; i < n; i++) {
          if (i in input) {
            val = input[i];
            if (fn.call(val, val, i, input)) {
              result.push(val);
            }
          }
        }

        return result;
      },


      /**
       * Filter files
       *
       * @param	{Array}		files
       * @param	{Function}	eachFn
       * @param	{Function}	resultFn
       */
      filterFiles: function(files, eachFn, resultFn) {
        if (files.length) {
          // HTML5 or Flash
          var queue = files.concat(),
            file, result = [],
            deleted = [];

          (function _next() {
            if (queue.length) {
              file = queue.shift();
              api.getInfo(file, function(err, info) {
                (eachFn(file, err ? false : info) ? result : deleted).push(file);
                _next();
              });
            } else {
              resultFn(result, deleted);
            }
          })();
        } else {
          resultFn([], files);
        }
      },


      upload: function(options) {
        options = _extend({
          jsonp: 'callback',
          prepare: api.F,
          beforeupload: api.F,
          upload: api.F,
          fileupload: api.F,
          fileprogress: api.F,
          filecomplete: api.F,
          progress: api.F,
          complete: api.F,
          pause: api.F,
          imageOriginal: true,
          chunkSize: api.chunkSize,
          chunkUploadRetry: api.chunkUploadRetry,
          uploadRetry: api.uploadRetry
        }, options);


        if (options.imageAutoOrientation && !options.imageTransform) {
          options.imageTransform = {
            rotate: 'auto'
          };
        }


        var
          proxyXHR = new api.XHR(options),
          dataArray = this._getFilesDataArray(options.files),
          _this = this,
          _total = 0,
          _loaded = 0,
          _nextFile, _complete = false;


        // calc total size
        _each(dataArray, function(data) {
          _total += data.size;
        });

        // Array of files
        proxyXHR.files = [];
        _each(dataArray, function(data) {
          proxyXHR.files.push(data.file);
        });

        // Set upload status props
        proxyXHR.total = _total;
        proxyXHR.loaded = 0;
        proxyXHR.filesLeft = dataArray.length;

        // emit "beforeupload"  event
        options.beforeupload(proxyXHR, options);

        // Upload by file
        _nextFile = function() {
          var
            data = dataArray.shift(),
            _file = data && data.file,
            _fileLoaded = false,
            _fileOptions = _simpleClone(options);

          proxyXHR.filesLeft = dataArray.length;

          if (_file && _file.name === api.expando) {
            _file = null;
            api.log('[warn] FileAPI.upload() — called without files');
          }

          if ((proxyXHR.statusText != 'abort' || proxyXHR.current) && data) {
            // Mark active job
            _complete = false;

            // Set current upload file
            proxyXHR.currentFile = _file;

            // Prepare file options
            if (_file && options.prepare(_file, _fileOptions) === false) {
              _nextFile.call(_this);
              return;
            }
            _fileOptions.file = _file;

            _this._getFormData(_fileOptions, data, function(form) {
              if (!_loaded) {
                // emit "upload" event
                options.upload(proxyXHR, options);
              }

              var xhr = new api.XHR(_extend({}, _fileOptions, {

                upload: _file ? function() {
                  // emit "fileupload" event
                  options.fileupload(_file, xhr, _fileOptions);
                } : noop,

                progress: _file ? function(evt) {
                  if (!_fileLoaded) {
                    // For ignore the double calls.
                    _fileLoaded = (evt.loaded === evt.total);

                    // emit "fileprogress" event
                    options.fileprogress({
                      type: 'progress',
                      total: data.total = evt.total,
                      loaded: data.loaded = evt.loaded
                    }, _file, xhr, _fileOptions);

                    // emit "progress" event
                    options.progress({
                      type: 'progress',
                      total: _total,
                      loaded: proxyXHR.loaded = (_loaded + data.size * (evt.loaded / evt.total)) || 0
                    }, _file, xhr, _fileOptions);
                  }
                } : noop,

                complete: function(err) {
                  _each(_xhrPropsExport, function(name) {
                    proxyXHR[name] = xhr[name];
                  });

                  if (_file) {
                    data.total = (data.total || data.size);
                    data.loaded = data.total;

                    if (!err) {
                      // emulate 100% "progress"
                      this.progress(data);

                      // fixed throttle event
                      _fileLoaded = true;

                      // bytes loaded
                      _loaded += data.size; // data.size != data.total, it's desirable fix this
                      proxyXHR.loaded = _loaded;
                    }

                    // emit "filecomplete" event
                    options.filecomplete(err, xhr, _file, _fileOptions);
                  }

                  // upload next file
                  setTimeout(function() {
                    _nextFile.call(_this);
                  }, 0);
                }
              })); // xhr


              // ...
              proxyXHR.abort = function(current) {
                if (!current) {
                  dataArray.length = 0;
                }
                this.current = current;
                xhr.abort();
              };

              // Start upload
              xhr.send(form);
            });
          } else {
            var successful = proxyXHR.status == 200 || proxyXHR.status == 201 || proxyXHR.status == 204;
            options.complete(successful ? false : (proxyXHR.statusText || 'error'), proxyXHR, options);
            // Mark done state
            _complete = true;
          }
        };


        // Next tick
        setTimeout(_nextFile, 0);


        // Append more files to the existing request
        // first - add them to the queue head/tail
        proxyXHR.append = function(files, first) {
          files = api._getFilesDataArray([].concat(files));

          _each(files, function(data) {
            _total += data.size;
            proxyXHR.files.push(data.file);
            if (first) {
              dataArray.unshift(data);
            } else {
              dataArray.push(data);
            }
          });

          proxyXHR.statusText = "";

          if (_complete) {
            _nextFile.call(_this);
          }
        };


        // Removes file from queue by file reference and returns it
        proxyXHR.remove = function(file) {
          var i = dataArray.length,
            _file;
          while (i--) {
            if (dataArray[i].file == file) {
              _file = dataArray.splice(i, 1);
              _total -= _file.size;
            }
          }
          return _file;
        };

        return proxyXHR;
      },


      _getFilesDataArray: function(data) {
        var files = [],
          oFiles = {};

        if (isInputFile(data)) {
          var tmp = api.getFiles(data);
          oFiles[data.name || 'file'] = data.getAttribute('multiple') !== null ? tmp : tmp[0];
        } else if (_isArray(data) && isInputFile(data[0])) {
          _each(data, function(input) {
            oFiles[input.name || 'file'] = api.getFiles(input);
          });
        } else {
          oFiles = data;
        }

        _each(oFiles, function add(file, name) {
          if (_isArray(file)) {
            _each(file, function(file) {
              add(file, name);
            });
          } else if (file && (file.name || file.image)) {
            files.push({
              name: name,
              file: file,
              size: file.size,
              total: file.size,
              loaded: 0
            });
          }
        });

        if (!files.length) {
          // Create fake `file` object
          files.push({
            file: {
              name: api.expando
            }
          });
        }

        return files;
      },


      _getFormData: function(options, data, fn) {
        var
          file = data.file,
          name = data.name,
          filename = file.name,
          filetype = file.type,
          trans = api.support.transform && options.imageTransform,
          Form = new api.Form,
          queue = api.queue(function() {
            fn(Form);
          }),
          isOrignTrans = trans && _isOriginTransform(trans),
          postNameConcat = api.postNameConcat;

        // Append data
        _each(options.data, function add(val, name) {
          if (typeof val == 'object') {
            _each(val, function(v, i) {
              add(v, postNameConcat(name, i));
            });
          } else {
            Form.append(name, val);
          }
        });

        (function _addFile(file /**Object*/ ) {
          if (file.image) { // This is a FileAPI.Image
            queue.inc();

            file.toData(function(err, image) {
              // @todo: требует рефакторинга и обработки ошибки
              if (file.file) {
                image.type = file.file.type;
                image.quality = file.matrix.quality;
                filename = file.file && file.file.name;
              }

              filename = filename || (new Date).getTime() + '.png';

              _addFile(image);
              queue.next();
            });
          } else if (api.Image && trans && (/^image/.test(file.type) || _rimgcanvas.test(file.nodeName))) {
            queue.inc();

            if (isOrignTrans) {
              // Convert to array for transform function
              trans = [trans];
            }

            api.Image.transform(file, trans, options.imageAutoOrientation, function(err, images) {
              if (isOrignTrans && !err) {
                if (!dataURLtoBlob && !api.flashEngine) {
                  // Canvas.toBlob or Flash not supported, use multipart
                  Form.multipart = true;
                }

                Form.append(name, images[0], filename, trans[0].type || filetype);
              } else {
                var addOrigin = 0;

                if (!err) {
                  _each(images, function(image, idx) {
                    if (!dataURLtoBlob && !api.flashEngine) {
                      Form.multipart = true;
                    }

                    if (!trans[idx].postName) {
                      addOrigin = 1;
                    }

                    Form.append(trans[idx].postName || postNameConcat(name, idx), image, filename, trans[idx].type || filetype);
                  });
                }

                if (err || options.imageOriginal) {
                  Form.append(postNameConcat(name, (addOrigin ? 'original' : null)), file, filename, filetype);
                }
              }

              queue.next();
            });
          } else if (filename !== api.expando) {
            Form.append(name, file, filename);
          }
        })(file);

        queue.check();
      },


      reset: function(inp, notRemove) {
        var parent, clone;

        if (jQuery) {
          clone = jQuery(inp).clone(true).insertBefore(inp).val('')[0];
          if (!notRemove) {
            jQuery(inp).remove();
          }
        } else {
          parent = inp.parentNode;
          clone = parent.insertBefore(inp.cloneNode(true), inp);
          clone.value = '';

          if (!notRemove) {
            parent.removeChild(inp);
          }

          _each(_elEvents[api.uid(inp)], function(fns, type) {
            _each(fns, function(fn) {
              _off(inp, type, fn);
              _on(clone, type, fn);
            });
          });
        }

        return clone;
      },


      /**
       * Load remote file
       *
       * @param   {String}    url
       * @param   {Function}  fn
       * @return  {XMLHttpRequest}
       */
      load: function(url, fn) {
        var xhr = api.getXHR();
        if (xhr) {
          xhr.open('GET', url, true);

          if (xhr.overrideMimeType) {
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
          }

          _on(xhr, 'progress', function( /**Event*/ evt) {
            /** @namespace evt.lengthComputable */
            if (evt.lengthComputable) {
              fn({
                type: evt.type,
                loaded: evt.loaded,
                total: evt.total
              }, xhr);
            }
          });

          xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
              xhr.onreadystatechange = null;
              if (xhr.status == 200) {
                url = url.split('/');
                /** @namespace xhr.responseBody */
                var file = {
                  name: url[url.length - 1],
                  size: xhr.getResponseHeader('Content-Length'),
                  type: xhr.getResponseHeader('Content-Type')
                };
                file.dataURL = 'data:' + file.type + ';base64,' + api.encode64(xhr.responseBody || xhr.responseText);
                fn({
                  type: 'load',
                  result: file
                }, xhr);
              } else {
                fn({
                  type: 'error'
                }, xhr);
              }
            }
          };
          xhr.send(null);
        } else {
          fn({
            type: 'error'
          });
        }

        return xhr;
      },

      encode64: function(str) {
        var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
          outStr = '',
          i = 0;

        if (typeof str !== 'string') {
          str = String(str);
        }

        while (i < str.length) {
          //all three "& 0xff" added below are there to fix a known bug
          //with bytes returned by xhr.responseText
          var
            byte1 = str.charCodeAt(i++) & 0xff,
            byte2 = str.charCodeAt(i++) & 0xff,
            byte3 = str.charCodeAt(i++) & 0xff,
            enc1 = byte1 >> 2,
            enc2 = ((byte1 & 3) << 4) | (byte2 >> 4),
            enc3, enc4;

          if (isNaN(byte2)) {
            enc3 = enc4 = 64;
          } else {
            enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
            enc4 = isNaN(byte3) ? 64 : byte3 & 63;
          }

          outStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
        }

        return outStr;
      }

    } // api
  ;


  function _emit(target, fn, name, res, ext) {
    var evt = {
      type: name.type || name,
      target: target,
      result: res
    };
    _extend(evt, ext);
    fn(evt);
  }


  function _hasSupportReadAs(method) {
    return FileReader && !!FileReader.prototype['readAs' + method];
  }


  function _readAs(file, fn, method, encoding) {
    if (api.isBlob(file) && _hasSupportReadAs(method)) {
      var Reader = new FileReader;

      // Add event listener
      _on(Reader, _readerEvents, function _fn(evt) {
        var type = evt.type;
        if (type == 'progress') {
          _emit(file, fn, evt, evt.target.result, {
            loaded: evt.loaded,
            total: evt.total
          });
        } else if (type == 'loadend') {
          _off(Reader, _readerEvents, _fn);
          Reader = null;
        } else {
          _emit(file, fn, evt, evt.target.result);
        }
      });


      try {
        // ReadAs ...
        if (encoding) {
          Reader['readAs' + method](file, encoding);
        } else {
          Reader['readAs' + method](file);
        }
      } catch (err) {
        _emit(file, fn, 'error', undef, {
          error: err.toString()
        });
      }
    } else {
      _emit(file, fn, 'error', undef, {
        error: 'filreader_not_support_' + method
      });
    }
  }


  function _isRegularFile(file, callback) {
    // http://stackoverflow.com/questions/8856628/detecting-folders-directories-in-javascript-filelist-objects
    if (!file.type && (safari || ((file.size % 4096) === 0 && (file.size <= 102400)))) {
      if (FileReader) {
        try {
          var reader = new FileReader();

          _one(reader, _readerEvents, function(evt) {
            var isFile = evt.type != 'error';
            if (isFile) {
              if (reader.readyState == null || reader.readyState === reader.LOADING) {
                reader.abort();
              }
              callback(isFile);
            } else {
              callback(false, reader.error);
            }
          });

          reader.readAsDataURL(file);
        } catch (err) {
          callback(false, err);
        }
      } else {
        callback(null, new Error('FileReader is not supported'));
      }
    } else {
      callback(true);
    }
  }


  function _isEntry(item) {
    return item && (item.isFile || item.isDirectory);
  }


  function _getAsEntry(item) {
    var entry;
    if (item.getAsEntry) {
      entry = item.getAsEntry();
    } else if (item.webkitGetAsEntry) {
      entry = item.webkitGetAsEntry();
    }
    return entry;
  }


  function _readEntryAsFiles(entry, callback) {
    if (!entry) {
      // error
      var err = new Error('invalid entry');
      entry = new Object(entry);
      entry.error = err;
      callback(err.message, [], [entry]);
    } else if (entry.isFile) {
      // Read as file
      entry.file(function(file) {
        // success
        file.fullPath = entry.fullPath;
        callback(false, [file], [file]);
      }, function(err) {
        // error
        entry.error = err;
        callback('FileError.code: ' + err.code, [], [entry]);
      });
    } else if (entry.isDirectory) {
      var
        reader = entry.createReader(),
        firstAttempt = true,
        files = [],
        all = [entry];

      var onerror = function(err) {
        // error
        entry.error = err;
        callback('DirectoryError.code: ' + err.code, files, all);
      };
      var ondone = function ondone(entries) {
        if (firstAttempt) {
          firstAttempt = false;
          if (!entries.length) {
            entry.error = new Error('directory is empty');
          }
        }

        // success
        if (entries.length) {
          api.afor(entries, function(next, entry) {
            _readEntryAsFiles(entry, function(err, entryFiles, allEntries) {
              if (!err) {
                files = files.concat(entryFiles);
              }
              all = all.concat(allEntries);

              if (next) {
                next();
              } else {
                reader.readEntries(ondone, onerror);
              }
            });
          });
        } else {
          callback(false, files, all);
        }
      };

      reader.readEntries(ondone, onerror);
    } else {
      _readEntryAsFiles(_getAsEntry(entry), callback);
    }
  }


  function _simpleClone(obj) {
    var copy = {};
    _each(obj, function(val, key) {
      if (val && (typeof val === 'object') && (val.nodeType === void 0)) {
        val = _extend({}, val);
      }
      copy[key] = val;
    });
    return copy;
  }


  function isInputFile(el) {
    return _rinput.test(el && el.tagName);
  }


  function _getDataTransfer(evt) {
    return (evt.originalEvent || evt || '').dataTransfer || {};
  }


  function _isOriginTransform(trans) {
    var key;
    for (key in trans) {
      if (trans.hasOwnProperty(key)) {
        if (!(trans[key] instanceof Object || key === 'overlay' || key === 'filter')) {
          return true;
        }
      }
    }
    return false;
  }


  // Add default image info reader
  api.addInfoReader(/^image/, function(file /**File*/ , callback /**Function*/ ) {
    if (!file.__dimensions) {
      var defer = file.__dimensions = api.defer();

      api.readAsImage(file, function(evt) {
        var img = evt.target;
        defer.resolve(evt.type == 'load' ? false : 'error', {
          width: img.width,
          height: img.height
        });
        img.src = api.EMPTY_PNG;
        img = null;
      });
    }

    file.__dimensions.then(callback);
  });


  /**
   * Drag'n'Drop special event
   *
   * @param	{HTMLElement}	el
   * @param	{Function}		onHover
   * @param	{Function}		onDrop
   */
  api.event.dnd = function(el, onHover, onDrop) {
    var _id, _type;

    if (!onDrop) {
      onDrop = onHover;
      onHover = api.F;
    }

    if (FileReader) {
      // Hover
      _on(el, 'dragenter dragleave dragover', onHover.ff = onHover.ff || function(evt) {
        var
          types = _getDataTransfer(evt).types,
          i = types && types.length,
          debounceTrigger = false;

        while (i--) {
          if (~types[i].indexOf('File')) {
            evt[preventDefault]();

            if (_type !== evt.type) {
              _type = evt.type; // Store current type of event

              if (_type != 'dragleave') {
                onHover.call(evt[currentTarget], true, evt);
              }

              debounceTrigger = true;
            }

            break; // exit from "while"
          }
        }

        if (debounceTrigger) {
          clearTimeout(_id);
          _id = setTimeout(function() {
            onHover.call(evt[currentTarget], _type != 'dragleave', evt);
          }, 50);
        }
      });


      // Drop
      _on(el, 'drop', onDrop.ff = onDrop.ff || function(evt) {
        evt[preventDefault]();

        _type = 0;
        onHover.call(evt[currentTarget], false, evt);

        api.getDropFiles(evt, function(files, all) {
          onDrop.call(evt[currentTarget], files, all, evt);
        });
      });
    } else {
      api.log("Drag'n'Drop -- not supported");
    }
  };


  /**
   * Remove drag'n'drop
   * @param	{HTMLElement}	el
   * @param	{Function}		onHover
   * @param	{Function}		onDrop
   */
  api.event.dnd.off = function(el, onHover, onDrop) {
    _off(el, 'dragenter dragleave dragover', onHover.ff);
    _off(el, 'drop', onDrop.ff);
  };


  // Support jQuery
  if (jQuery && !jQuery.fn.dnd) {
    jQuery.fn.dnd = function(onHover, onDrop) {
      return this.each(function() {
        api.event.dnd(this, onHover, onDrop);
      });
    };

    jQuery.fn.offdnd = function(onHover, onDrop) {
      return this.each(function() {
        api.event.dnd.off(this, onHover, onDrop);
      });
    };
  }

  // @export
  window.FileAPI = _extend(api, window.FileAPI);


  // Debug info
  api.log('FileAPI: ' + api.version);
  api.log('protocol: ' + window.location.protocol);
  api.log('doctype: [' + doctype.name + '] ' + doctype.publicId + ' ' + doctype.systemId);


  // @detect 'x-ua-compatible'
  _each(document.getElementsByTagName('meta'), function(meta) {
    if (/x-ua-compatible/i.test(meta.getAttribute('http-equiv'))) {
      api.log('meta.http-equiv: ' + meta.getAttribute('content'));
    }
  });


  // Configuration
  try {
    _supportConsoleLog = !!console.log;
    _supportConsoleLogApply = !!console.log.apply;
  } catch (err) {}

  if (!api.flashUrl) {
    api.flashUrl = api.staticPath + 'FileAPI.flash.swf';
  }
  if (!api.flashImageUrl) {
    api.flashImageUrl = api.staticPath + 'FileAPI.flash.image.swf';
  }
  if (!api.flashWebcamUrl) {
    api.flashWebcamUrl = api.staticPath + 'FileAPI.flash.camera.swf';
  }
})(window, void 0);
/*global window, FileAPI, document */

(function(api, document, undef) {
  'use strict';

  var
    min = Math.min,
    round = Math.round,
    getCanvas = function() {
      return document.createElement('canvas');
    },
    support = false,
    exifOrientation = {
      8: 270,
      3: 180,
      6: 90,
      7: 270,
      4: 180,
      5: 90
    };

  try {
    support = getCanvas().toDataURL('image/png').indexOf('data:image/png') > -1;
  } catch (e) {}


  function Image(file) {
    if (file instanceof Image) {
      var img = new Image(file.file);
      api.extend(img.matrix, file.matrix);
      return img;
    } else if (!(this instanceof Image)) {
      return new Image(file);
    }

    this.file = file;
    this.size = file.size || 100;

    this.matrix = {
      sx: 0,
      sy: 0,
      sw: 0,
      sh: 0,
      dx: 0,
      dy: 0,
      dw: 0,
      dh: 0,
      resize: 0, // min, max OR preview
      deg: 0,
      quality: 1, // jpeg quality
      filter: 0
    };
  }


  Image.prototype = {
    image: true,
    constructor: Image,

    set: function(attrs) {
      api.extend(this.matrix, attrs);
      return this;
    },

    crop: function(x, y, w, h) {
      if (w === undef) {
        w = x;
        h = y;
        x = y = 0;
      }
      return this.set({
        sx: x,
        sy: y,
        sw: w,
        sh: h || w
      });
    },

    resize: function(w, h, strategy) {
      if (/min|max|height|width/.test(h)) {
        strategy = h;
        h = w;
      }

      return this.set({
        dw: w,
        dh: h || w,
        resize: strategy
      });
    },

    preview: function(w, h) {
      return this.resize(w, h || w, 'preview');
    },

    rotate: function(deg) {
      return this.set({
        deg: deg
      });
    },

    filter: function(filter) {
      return this.set({
        filter: filter
      });
    },

    overlay: function(images) {
      return this.set({
        overlay: images
      });
    },

    clone: function() {
      return new Image(this);
    },

    _load: function(image, fn) {
      var self = this;

      if (/img|video/i.test(image.nodeName)) {
        fn.call(self, null, image);
      } else {
        api.readAsImage(image, function(evt) {
          fn.call(self, evt.type != 'load', evt.result);
        });
      }
    },

    _apply: function(image, fn) {
      var
        canvas = getCanvas(),
        m = this.getMatrix(image),
        ctx = canvas.getContext('2d'),
        width = image.videoWidth || image.width,
        height = image.videoHeight || image.height,
        deg = m.deg,
        dw = m.dw,
        dh = m.dh,
        w = width,
        h = height,
        filter = m.filter,
        copy // canvas copy
        , buffer = image,
        overlay = m.overlay,
        queue = api.queue(function() {
          image.src = api.EMPTY_PNG;
          fn(false, canvas);
        }),
        renderImageToCanvas = api.renderImageToCanvas;

      // Normalize angle
      deg = deg - Math.floor(deg / 360) * 360;

      // For `renderImageToCanvas`
      image._type = this.file.type;

      while (m.multipass && min(w / dw, h / dh) > 2) {
        w = (w / 2 + 0.5) | 0;
        h = (h / 2 + 0.5) | 0;

        copy = getCanvas();
        copy.width = w;
        copy.height = h;

        if (buffer !== image) {
          renderImageToCanvas(copy, buffer, 0, 0, buffer.width, buffer.height, 0, 0, w, h);
          buffer = copy;
        } else {
          buffer = copy;
          renderImageToCanvas(buffer, image, m.sx, m.sy, m.sw, m.sh, 0, 0, w, h);
          m.sx = m.sy = m.sw = m.sh = 0;
        }
      }


      canvas.width = (deg % 180) ? dh : dw;
      canvas.height = (deg % 180) ? dw : dh;

      canvas.type = m.type;
      canvas.quality = m.quality;

      ctx.rotate(deg * Math.PI / 180);
      renderImageToCanvas(ctx.canvas, buffer, m.sx, m.sy, m.sw || buffer.width, m.sh || buffer.height, (deg == 180 || deg == 270 ? -dw : 0), (deg == 90 || deg == 180 ? -dh : 0), dw, dh);
      dw = canvas.width;
      dh = canvas.height;

      // Apply overlay
      overlay && api.each([].concat(overlay), function(over) {
        queue.inc();
        // preload
        var img = new window.Image,
          fn = function() {
            var
              x = over.x | 0,
              y = over.y | 0,
              w = over.w || img.width,
              h = over.h || img.height,
              rel = over.rel;

            // center  |  right  |  left
            x = (rel == 1 || rel == 4 || rel == 7) ? (dw - w + x) / 2 : (rel == 2 || rel == 5 || rel == 8 ? dw - (w + x) : x);

            // center  |  bottom  |  top
            y = (rel == 3 || rel == 4 || rel == 5) ? (dh - h + y) / 2 : (rel >= 6 ? dh - (h + y) : y);

            api.event.off(img, 'error load abort', fn);

            try {
              ctx.globalAlpha = over.opacity || 1;
              ctx.drawImage(img, x, y, w, h);
            } catch (er) {}

            queue.next();
          };

        api.event.on(img, 'error load abort', fn);
        img.src = over.src;

        if (img.complete) {
          fn();
        }
      });

      if (filter) {
        queue.inc();
        Image.applyFilter(canvas, filter, queue.next);
      }

      queue.check();
    },

    getMatrix: function(image) {
      var
        m = api.extend({}, this.matrix),
        sw = m.sw = m.sw || image.videoWidth || image.naturalWidth || image.width,
        sh = m.sh = m.sh || image.videoHeight || image.naturalHeight || image.height,
        dw = m.dw = m.dw || sw,
        dh = m.dh = m.dh || sh,
        sf = sw / sh,
        df = dw / dh,
        strategy = m.resize;

      if (strategy == 'preview') {
        if (dw != sw || dh != sh) {
          // Make preview
          var w, h;

          if (df >= sf) {
            w = sw;
            h = w / df;
          } else {
            h = sh;
            w = h * df;
          }

          if (w != sw || h != sh) {
            m.sx = ~~((sw - w) / 2);
            m.sy = ~~((sh - h) / 2);
            sw = w;
            sh = h;
          }
        }
      } else if (strategy == 'height') {
        dw = dh * sf;
      } else if (strategy == 'width') {
        dh = dw / sf;
      } else if (strategy) {
        if (!(sw > dw || sh > dh)) {
          dw = sw;
          dh = sh;
        } else if (strategy == 'min') {
          dw = round(sf < df ? min(sw, dw) : dh * sf);
          dh = round(sf < df ? dw / sf : min(sh, dh));
        } else {
          dw = round(sf >= df ? min(sw, dw) : dh * sf);
          dh = round(sf >= df ? dw / sf : min(sh, dh));
        }
      }

      m.sw = sw;
      m.sh = sh;
      m.dw = dw;
      m.dh = dh;
      m.multipass = api.multiPassResize;
      return m;
    },

    _trans: function(fn) {
      this._load(this.file, function(err, image) {
        if (err) {
          fn(err);
        } else {
          try {
            this._apply(image, fn);
          } catch (err) {
            api.log('[err] FileAPI.Image.fn._apply:', err);
            fn(err);
          }
        }
      });
    },


    get: function(fn) {
      if (api.support.transform) {
        var _this = this,
          matrix = _this.matrix;

        if (matrix.deg == 'auto') {
          api.getInfo(_this.file, function(err, info) {
            // rotate by exif orientation
            matrix.deg = exifOrientation[info && info.exif && info.exif.Orientation] || 0;
            _this._trans(fn);
          });
        } else {
          _this._trans(fn);
        }
      } else {
        fn('not_support_transform');
      }

      return this;
    },


    toData: function(fn) {
      return this.get(fn);
    }

  };


  Image.exifOrientation = exifOrientation;


  Image.transform = function(file, transform, autoOrientation, fn) {
    function _transform(err, img) {
      // img -- info object
      var
        images = {},
        queue = api.queue(function(err) {
          fn(err, images);
        });

      if (!err) {
        api.each(transform, function(params, name) {
          if (!queue.isFail()) {
            var ImgTrans = new Image(img.nodeType ? img : file),
              isFn = typeof params == 'function';

            if (isFn) {
              params(img, ImgTrans);
            } else if (params.width) {
              ImgTrans[params.preview ? 'preview' : 'resize'](params.width, params.height, params.strategy);
            } else {
              if (params.maxWidth && (img.width > params.maxWidth || img.height > params.maxHeight)) {
                ImgTrans.resize(params.maxWidth, params.maxHeight, 'max');
              }
            }

            if (params.crop) {
              var crop = params.crop;
              ImgTrans.crop(crop.x | 0, crop.y | 0, crop.w || crop.width, crop.h || crop.height);
            }

            if (params.rotate === undef && autoOrientation) {
              params.rotate = 'auto';
            }

            ImgTrans.set({
              type: ImgTrans.matrix.type || params.type || file.type || 'image/png'
            });

            if (!isFn) {
              ImgTrans.set({
                deg: params.rotate,
                overlay: params.overlay,
                filter: params.filter,
                quality: params.quality || 1
              });
            }

            queue.inc();
            ImgTrans.toData(function(err, image) {
              if (err) {
                queue.fail();
              } else {
                images[name] = image;
                queue.next();
              }
            });
          }
        });
      } else {
        queue.fail();
      }
    }


    // @todo: Оло-ло, нужно рефакторить это место
    if (file.width) {
      _transform(false, file);
    } else {
      api.getInfo(file, _transform);
    }
  };


  // @const
  api.each(['TOP', 'CENTER', 'BOTTOM'], function(x, i) {
    api.each(['LEFT', 'CENTER', 'RIGHT'], function(y, j) {
      Image[x + '_' + y] = i * 3 + j;
      Image[y + '_' + x] = i * 3 + j;
    });
  });


  /**
   * Trabsform element to canvas
   *
   * @param    {Image|HTMLVideoElement}   el
   * @returns  {Canvas}
   */
  Image.toCanvas = function(el) {
    var canvas = document.createElement('canvas');
    canvas.width = el.videoWidth || el.width;
    canvas.height = el.videoHeight || el.height;
    canvas.getContext('2d').drawImage(el, 0, 0);
    return canvas;
  };


  /**
   * Create image from DataURL
   * @param  {String}  dataURL
   * @param  {Object}  size
   * @param  {Function}  callback
   */
  Image.fromDataURL = function(dataURL, size, callback) {
    var img = api.newImage(dataURL);
    api.extend(img, size);
    callback(img);
  };


  /**
   * Apply filter (caman.js)
   *
   * @param  {Canvas|Image}   canvas
   * @param  {String|Function}  filter
   * @param  {Function}  doneFn
   */
  Image.applyFilter = function(canvas, filter, doneFn) {
    if (typeof filter == 'function') {
      filter(canvas, doneFn);
    } else if (window.Caman) {
      // http://camanjs.com/guides/
      window.Caman(canvas.tagName == 'IMG' ? Image.toCanvas(canvas) : canvas, function() {
        if (typeof filter == 'string') {
          this[filter]();
        } else {
          api.each(filter, function(val, method) {
            this[method](val);
          }, this);
        }
        this.render(doneFn);
      });
    }
  };


  /**
   * For load-image-ios.js
   */
  api.renderImageToCanvas = function(canvas, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    try {
      return canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    } catch (ex) {
      api.log('renderImageToCanvas failed');
      throw ex;
    }
  };


  // @export
  api.support.canvas = api.support.transform = support;
  api.Image = Image;
})(FileAPI, document);
/*global window, FileAPI */

(function(api, window) {
  "use strict";

  var
    document = window.document,
    FormData = window.FormData,
    Form = function() {
      this.items = [];
    },
    encodeURIComponent = window.encodeURIComponent;


  Form.prototype = {

    append: function(name, blob, file, type) {
      this.items.push({
        name: name,
        blob: blob && blob.blob || (blob == void 0 ? '' : blob),
        file: blob && (file || blob.name),
        type: blob && (type || blob.type)
      });
    },

    each: function(fn) {
      var i = 0,
        n = this.items.length;
      for (; i < n; i++) {
        fn.call(this, this.items[i]);
      }
    },

    toData: function(fn, options) {
      // allow chunked transfer if we have only one file to send
      // flag is used below and in XHR._send
      options._chunked = api.support.chunked && options.chunkSize > 0 && api.filter(this.items, function(item) {
        return item.file;
      }).length == 1;

      if (!api.support.html5) {
        api.log('FileAPI.Form.toHtmlData');
        this.toHtmlData(fn);
      } else if (!api.formData || this.multipart || !FormData) {
        api.log('FileAPI.Form.toMultipartData');
        this.toMultipartData(fn);
      } else if (options._chunked) {
        api.log('FileAPI.Form.toPlainData');
        this.toPlainData(fn);
      } else {
        api.log('FileAPI.Form.toFormData');
        this.toFormData(fn);
      }
    },

    _to: function(data, complete, next, arg) {
      var queue = api.queue(function() {
        complete(data);
      });

      this.each(function(file) {
        try {
          next(file, data, queue, arg);
        } catch (err) {
          api.log('FileAPI.Form._to: ' + err.message);
          complete(err);
        }
      });

      queue.check();
    },


    toHtmlData: function(fn) {
      this._to(document.createDocumentFragment(), fn, function(file, data /**DocumentFragment*/ ) {
        var blob = file.blob,
          hidden;

        if (file.file) {
          api.reset(blob, true);
          // set new name
          blob.name = file.name;
          blob.disabled = false;
          data.appendChild(blob);
        } else {
          hidden = document.createElement('input');
          hidden.name = file.name;
          hidden.type = 'hidden';
          hidden.value = blob;
          data.appendChild(hidden);
        }
      });
    },

    toPlainData: function(fn) {
      this._to({}, fn, function(file, data, queue) {
        if (file.file) {
          data.type = file.file;
        }

        if (file.blob.toBlob) {
          // canvas
          queue.inc();
          _convertFile(file, function(file, blob) {
            data.name = file.name;
            data.file = blob;
            data.size = blob.length;
            data.type = file.type;
            queue.next();
          });
        } else if (file.file) {
          // file
          data.name = file.blob.name;
          data.file = file.blob;
          data.size = file.blob.size;
          data.type = file.type;
        } else {
          // additional data
          if (!data.params) {
            data.params = [];
          }
          data.params.push(encodeURIComponent(file.name) + "=" + encodeURIComponent(file.blob));
        }

        data.start = -1;
        data.end = data.file && data.file.FileAPIReadPosition || -1;
        data.retry = 0;
      });
    },

    toFormData: function(fn) {
      this._to(new FormData, fn, function(file, data, queue) {
        if (file.blob && file.blob.toBlob) {
          queue.inc();
          _convertFile(file, function(file, blob) {
            data.append(file.name, blob, file.file);
            queue.next();
          });
        } else if (file.file) {
          data.append(file.name, file.blob, file.file);
        } else {
          data.append(file.name, file.blob);
        }

        if (file.file) {
          data.append('_' + file.name, file.file);
        }
      });
    },


    toMultipartData: function(fn) {
      this._to([], fn, function(file, data, queue, boundary) {
        queue.inc();
        _convertFile(file, function(file, blob) {
          data.push(
            '--_' + boundary + ('\r\nContent-Disposition: form-data; name="' + file.name + '"' + (file.file ? '; filename="' + encodeURIComponent(file.file) + '"' : '') + (file.file ? '\r\nContent-Type: ' + (file.type || 'application/octet-stream') : '') + '\r\n' + '\r\n' + (file.file ? blob : encodeURIComponent(blob)) + '\r\n')
          );
          queue.next();
        }, true);
      }, api.expando);
    }
  };


  function _convertFile(file, fn, useBinaryString) {
    var blob = file.blob,
      filename = file.file;

    if (filename) {
      if (!blob.toDataURL) {
        // The Blob is not an image.
        api.readAsBinaryString(blob, function(evt) {
          if (evt.type == 'load') {
            fn(file, evt.result);
          }
        });
        return;
      }

      var
        mime = {
          'image/jpeg': '.jpe?g',
          'image/png': '.png'
        },
        type = mime[file.type] ? file.type : 'image/png',
        ext = mime[type] || '.png',
        quality = blob.quality || 1;

      if (!filename.match(new RegExp(ext + '$', 'i'))) {
        // Does not change the current extension, but add a new one.
        filename += ext.replace('?', '');
      }

      file.file = filename;
      file.type = type;

      if (!useBinaryString && blob.toBlob) {
        blob.toBlob(function(blob) {
          fn(file, blob);
        }, type, quality);
      } else {
        fn(file, api.toBinaryString(blob.toDataURL(type, quality)));
      }
    } else {
      fn(file, blob);
    }
  }


  // @export
  api.Form = Form;
})(FileAPI, window);
/*global window, FileAPI, Uint8Array */

(function(window, api) {
  "use strict";

  var
    noop = function() {},
    document = window.document

  , XHR = function(options) {
      this.uid = api.uid();
      this.xhr = {
        abort: noop,
        getResponseHeader: noop,
        getAllResponseHeaders: noop
      };
      this.options = options;
    },

    _xhrResponsePostfix = {
      '': 1,
      XML: 1,
      Text: 1,
      Body: 1
    };


  XHR.prototype = {
    status: 0,
    statusText: '',
    constructor: XHR,

    getResponseHeader: function(name) {
      return this.xhr.getResponseHeader(name);
    },

    getAllResponseHeaders: function() {
      return this.xhr.getAllResponseHeaders() || {};
    },

    end: function(status, statusText) {
      var _this = this,
        options = _this.options;

      _this.end =
        _this.abort = noop;
      _this.status = status;

      if (statusText) {
        _this.statusText = statusText;
      }

      api.log('xhr.end:', status, statusText);
      options.complete(status == 200 || status == 201 ? false : _this.statusText || 'unknown', _this);

      if (_this.xhr && _this.xhr.node) {
        setTimeout(function() {
          var node = _this.xhr.node;
          try {
            node.parentNode.removeChild(node);
          } catch (e) {}
          try {
            delete window[_this.uid];
          } catch (e) {}
          window[_this.uid] = _this.xhr.node = null;
        }, 9);
      }
    },

    abort: function() {
      this.end(0, 'abort');

      if (this.xhr) {
        this.xhr.aborted = true;
        this.xhr.abort();
      }
    },

    send: function(FormData) {
      var _this = this,
        options = this.options;

      FormData.toData(function(data) {
        if (data instanceof Error) {
          _this.end(0, data.message);
        } else {
          // Start uploading
          options.upload(options, _this);
          _this._send.call(_this, options, data);
        }
      }, options);
    },

    _send: function(options, data) {
      var _this = this,
        xhr, uid = _this.uid,
        onLoadFnName = _this.uid + "Load",
        url = options.url;

      api.log('XHR._send:', data);

      if (!options.cache) {
        // No cache
        url += (~url.indexOf('?') ? '&' : '?') + api.uid();
      }

      if (data.nodeName) {
        var jsonp = options.jsonp;

        // prepare callback in GET
        url = url.replace(/([a-z]+)=(\?)/i, '$1=' + uid);

        // legacy
        options.upload(options, _this);

        var
          onPostMessage = function(evt) {
            if (~url.indexOf(evt.origin)) {
              try {
                var result = api.parseJSON(evt.data);
                if (result.id == uid) {
                  complete(result.status, result.statusText, result.response);
                }
              } catch (err) {
                complete(0, err.message);
              }
            }
          },

          // jsonp-callack
          complete = window[uid] = function(status, statusText, response) {
            _this.readyState = 4;
            _this.responseText = response;
            _this.end(status, statusText);

            api.event.off(window, 'message', onPostMessage);
            window[uid] = xhr = transport = window[onLoadFnName] = null;
          };

        _this.xhr.abort = function() {
          try {
            if (transport.stop) {
              transport.stop();
            } else if (transport.contentWindow.stop) {
              transport.contentWindow.stop();
            } else {
              transport.contentWindow.document.execCommand('Stop');
            }
          } catch (er) {}
          complete(0, "abort");
        };

        api.event.on(window, 'message', onPostMessage);

        window[onLoadFnName] = function() {
          try {
            var
              win = transport.contentWindow,
              doc = win.document,
              result = win.result || api.parseJSON(doc.body.innerHTML);
            complete(result.status, result.statusText, result.response);
          } catch (e) {
            api.log('[transport.onload]', e);
          }
        };

        xhr = document.createElement('div');
        xhr.innerHTML = '<form target="' + uid + '" action="' + url + '" method="POST" enctype="multipart/form-data" style="position: absolute; top: -1000px; overflow: hidden; width: 1px; height: 1px;">' + '<iframe name="' + uid + '" src="javascript:false;" onload="window.' + onLoadFnName + ' && ' + onLoadFnName + '();"></iframe>' + (jsonp && (options.url.indexOf('=?') < 0) ? '<input value="' + uid + '" name="' + jsonp + '" type="hidden"/>' : '') + '</form>';

        // get form-data & transport
        var
          form = xhr.getElementsByTagName('form')[0],
          transport = xhr.getElementsByTagName('iframe')[0];

        form.appendChild(data);

        api.log(form.parentNode.innerHTML);

        // append to DOM
        document.body.appendChild(xhr);

        // keep a reference to node-transport
        _this.xhr.node = xhr;

        // send
        _this.readyState = 2; // loaded
        try {
          form.submit();
        } catch (err) {
          api.log('iframe.error: ' + err);
        }
        form = null;
      } else {
        // Clean url
        url = url.replace(/([a-z]+)=(\?)&?/i, '');

        // html5
        if (this.xhr && this.xhr.aborted) {
          api.log("Error: already aborted");
          return;
        }
        xhr = _this.xhr = api.getXHR();

        if (data.params) {
          url += (url.indexOf('?') < 0 ? "?" : "&") + data.params.join("&");
        }

        xhr.open('POST', url, true);

        if (api.withCredentials) {
          xhr.withCredentials = "true";
        }

        if (!options.headers || !options.headers['X-Requested-With']) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }

        api.each(options.headers, function(val, key) {
          xhr.setRequestHeader(key, val);
        });


        if (options._chunked) {
          // chunked upload
          if (xhr.upload) {
            xhr.upload.addEventListener('progress', api.throttle(function( /**Event*/ evt) {
              if (!data.retry) {
                // show progress only for correct chunk uploads
                options.progress({
                  type: evt.type,
                  total: data.size,
                  loaded: data.start + evt.loaded,
                  totalSize: data.size
                }, _this, options);
              }
            }, 100), false);
          }

          xhr.onreadystatechange = function() {
            var lkb = parseInt(xhr.getResponseHeader('X-Last-Known-Byte'), 10);

            _this.status = xhr.status;
            _this.statusText = xhr.statusText;
            _this.readyState = xhr.readyState;

            if (xhr.readyState == 4) {
              for (var k in _xhrResponsePostfix) {
                _this['response' + k] = xhr['response' + k];
              }
              xhr.onreadystatechange = null;

              if (!xhr.status || xhr.status - 201 > 0) {
                api.log("Error: " + xhr.status);
                // some kind of error
                // 0 - connection fail or timeout, if xhr.aborted is true, then it's not recoverable user action
                // up - server error
                if (((!xhr.status && !xhr.aborted) || 500 == xhr.status || 416 == xhr.status) && ++data.retry <= options.chunkUploadRetry) {
                  // let's try again the same chunk
                  // only applicable for recoverable error codes 500 && 416
                  var delay = xhr.status ? 0 : api.chunkNetworkDownRetryTimeout;

                  // inform about recoverable problems
                  options.pause(data.file, options);

                  // smart restart if server reports about the last known byte
                  api.log("X-Last-Known-Byte: " + lkb);
                  if (lkb) {
                    data.end = lkb;
                  } else {
                    data.end = data.start - 1;
                    if (416 == xhr.status) {
                      data.end = data.end - options.chunkSize;
                    }
                  }

                  setTimeout(function() {
                    _this._send(options, data);
                  }, delay);
                } else {
                  // no mo retries
                  _this.end(xhr.status);
                }
              } else {
                // success
                data.retry = 0;

                if (data.end == data.size - 1) {
                  // finished
                  _this.end(xhr.status);
                } else {
                  // next chunk

                  // shift position if server reports about the last known byte
                  api.log("X-Last-Known-Byte: " + lkb);
                  if (lkb) {
                    data.end = lkb;
                  }
                  data.file.FileAPIReadPosition = data.end;

                  setTimeout(function() {
                    _this._send(options, data);
                  }, 0);
                }
              }

              xhr = null;
            }
          };

          data.start = data.end + 1;
          data.end = Math.max(Math.min(data.start + options.chunkSize, data.size) - 1, data.start);

          // Retrieve a slice of file
          var
            file = data.file,
            slice = (file.slice || file.mozSlice || file.webkitSlice).call(file, data.start, data.end + 1);

          if (data.size && !slice.size) {
            setTimeout(function() {
              _this.end(-1);
            });
          } else {
            xhr.setRequestHeader("Content-Range", "bytes " + data.start + "-" + data.end + "/" + data.size);
            xhr.setRequestHeader("Content-Disposition", 'attachment; filename=' + encodeURIComponent(data.name));
            xhr.setRequestHeader("Content-Type", data.type || "application/octet-stream");

            xhr.send(slice);
          }

          file = slice = null;
        } else {
          // single piece upload
          if (xhr.upload) {
            // https://github.com/blueimp/jQuery-File-Upload/wiki/Fixing-Safari-hanging-on-very-high-speed-connections-%281Gbps%29
            xhr.upload.addEventListener('progress', api.throttle(function( /**Event*/ evt) {
              options.progress(evt, _this, options);
            }, 100), false);
          }

          xhr.onreadystatechange = function() {
            _this.status = xhr.status;
            _this.statusText = xhr.statusText;
            _this.readyState = xhr.readyState;

            if (xhr.readyState == 4) {
              for (var k in _xhrResponsePostfix) {
                _this['response' + k] = xhr['response' + k];
              }
              xhr.onreadystatechange = null;

              if (!xhr.status || xhr.status > 201) {
                api.log("Error: " + xhr.status);
                if (((!xhr.status && !xhr.aborted) || 500 == xhr.status) && (options.retry || 0) < options.uploadRetry) {
                  options.retry = (options.retry || 0) + 1;
                  var delay = api.networkDownRetryTimeout;

                  // inform about recoverable problems
                  options.pause(options.file, options);

                  setTimeout(function() {
                    _this._send(options, data);
                  }, delay);
                } else {
                  //success
                  _this.end(xhr.status);
                }
              } else {
                //success
                _this.end(xhr.status);
              }

              xhr = null;
            }
          };

          if (api.isArray(data)) {
            // multipart
            xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=_' + api.expando);
            var rawData = data.join('') + '--_' + api.expando + '--';

            /** @namespace  xhr.sendAsBinary  https://developer.mozilla.org/ru/XMLHttpRequest#Sending_binary_content */
            if (xhr.sendAsBinary) {
              xhr.sendAsBinary(rawData);
            } else {
              var bytes = Array.prototype.map.call(rawData, function(c) {
                return c.charCodeAt(0) & 0xff;
              });
              xhr.send(new Uint8Array(bytes).buffer);

            }
          } else {
            // FormData
            xhr.send(data);
          }
        }
      }
    }
  };


  // @export
  api.XHR = XHR;
})(window, FileAPI);﻿
/**
 * FileAPI fallback to Flash
 *
 * @flash-developer  "Vladimir Demidov" <v.demidov@corp.mail.ru>
 */

/*global window, ActiveXObject, FileAPI */
(function(window, jQuery, api) {
  "use strict";

  var
    document = window.document,
    location = window.location,
    navigator = window.navigator,
    _each = api.each;


  api.support.flash = (function() {
    var mime = navigator.mimeTypes,
      has = false;

    if (navigator.plugins && typeof navigator.plugins['Shockwave Flash'] == 'object') {
      has = navigator.plugins['Shockwave Flash'].description && !(mime && mime['application/x-shockwave-flash'] && !mime['application/x-shockwave-flash'].enabledPlugin);
    } else {
      try {
        has = !!(window.ActiveXObject && new ActiveXObject('ShockwaveFlash.ShockwaveFlash'));
      } catch (er) {
        api.log('Flash -- does not supported.');
      }
    }

    if (has && /^file:/i.test(location)) {
      api.log('[warn] Flash does not work on `file:` protocol.');
    }

    return has;
  })();


  api.support.flash && (0 || !api.html5 || !api.support.html5 || (api.cors && !api.support.cors) || (api.media && !api.support.media)) && (function() {
    var
      _attr = api.uid(),
      _retry = 0,
      _files = {},
      _rhttp = /^https?:/i

    , flash = {
      _fn: {},


      /**
       * Initialization & preload flash object
       */
      init: function() {
        var child = document.body && document.body.firstChild;

        if (child) {
          do {
            if (child.nodeType == 1) {
              api.log('FlashAPI.state: awaiting');

              var dummy = document.createElement('div');

              dummy.id = '_' + _attr;

              _css(dummy, {
                top: 1,
                right: 1,
                width: 5,
                height: 5,
                position: 'absolute',
                zIndex: 2147483647 + '' // set max zIndex
              });

              child.parentNode.insertBefore(dummy, child);
              flash.publish(dummy, _attr);

              return;
            }
          }
          while (child = child.nextSibling);
        }

        if (_retry < 10) {
          setTimeout(flash.init, ++_retry * 50);
        }
      },


      /**
       * Publish flash-object
       *
       * @param {HTMLElement} el
       * @param {String} id
       * @param {Object} [opts]
       */
      publish: function(el, id, opts) {
        opts = opts || {};
        el.innerHTML = _makeFlashHTML({
          id: id,
          src: _getUrl(api.flashUrl, 'r=' + api.version)
            //						, src: _getUrl('http://v.demidov.boom.corp.mail.ru/uploaderfileapi/FlashFileAPI.swf?1')
            ,
          wmode: opts.camera ? '' : 'transparent',
          flashvars: 'callback=' + (opts.onEvent || 'FileAPI.Flash.onEvent') + '&flashId=' + id + '&storeKey=' + navigator.userAgent.match(/\d/ig).join('') + '_' + api.version + (flash.isReady || (api.pingUrl ? '&ping=' + api.pingUrl : '')) + '&timeout=' + api.flashAbortTimeout + (opts.camera ? '&useCamera=' + _getUrl(api.flashWebcamUrl) : '') + '&debug=' + (api.debug ? "1" : "")
        }, opts);
      },


      ready: function() {
        api.log('FlashAPI.state: ready');

        flash.ready = api.F;
        flash.isReady = true;
        flash.patch();
        flash.patchCamera && flash.patchCamera();
        api.event.on(document, 'mouseover', flash.mouseover);
        api.event.on(document, 'click', function(evt) {
          if (flash.mouseover(evt)) {
            evt.preventDefault ? evt.preventDefault() : (evt.returnValue = true);
          }
        });
      },


      getEl: function() {
        return document.getElementById('_' + _attr);
      },


      getWrapper: function(node) {
        do {
          if (/js-fileapi-wrapper/.test(node.className)) {
            return node;
          }
        }
        while ((node = node.parentNode) && (node !== document.body));
      },


      mouseover: function(evt) {
        var target = api.event.fix(evt).target;

        if (/input/i.test(target.nodeName) && target.type == 'file' && !target.disabled) {
          var
            state = target.getAttribute(_attr),
            wrapper = flash.getWrapper(target);

          if (api.multiFlash) {
            // check state:
            //   p — published
            //   i — initialization
            //   r — ready
            if (state == 'i' || state == 'r') {
              // publish fail
              return false;
            } else if (state != 'p') {
              // set "init" state
              target.setAttribute(_attr, 'i');

              var dummy = document.createElement('div');

              if (!wrapper) {
                api.log('[err] FlashAPI.mouseover: js-fileapi-wrapper not found');
                return;
              }

              _css(dummy, {
                top: 0,
                left: 0,
                width: target.offsetWidth,
                height: target.offsetHeight,
                zIndex: 2147483647 + '' // set max zIndex
                  ,
                position: 'absolute'
              });

              wrapper.appendChild(dummy);
              flash.publish(dummy, api.uid());

              // set "publish" state
              target.setAttribute(_attr, 'p');
            }

            return true;
          } else if (wrapper) {
            // Use one flash element
            var box = _getDimensions(wrapper);

            _css(flash.getEl(), box);

            // Set current input
            flash.curInp = target;
          }
        } else if (!/object|embed/i.test(target.nodeName)) {
          _css(flash.getEl(), {
            top: 1,
            left: 1,
            width: 5,
            height: 5
          });
        }
      },

      onEvent: function(evt) {
        var type = evt.type;

        if (type == 'ready') {
          try {
            // set "ready" state
            flash.getInput(evt.flashId).setAttribute(_attr, 'r');
          } catch (e) {}

          flash.ready();
          setTimeout(function() {
            flash.mouseenter(evt);
          }, 50);
          return true;
        } else if (type === 'ping') {
          api.log('(flash -> js).ping:', [evt.status, evt.savedStatus], evt.error);
        } else if (type === 'log') {
          api.log('(flash -> js).log:', evt.target);
        } else if (type in flash) {
          setTimeout(function() {
            api.log('FlashAPI.event.' + evt.type + ':', evt);
            flash[type](evt);
          }, 1);
        }
      },


      mouseenter: function(evt) {
        var node = flash.getInput(evt.flashId);

        if (node) {
          // Set multiple mode
          flash.cmd(evt, 'multiple', node.getAttribute('multiple') != null);


          // Set files filter
          var accept = [],
            exts = {};

          _each((node.getAttribute('accept') || '').split(/,\s*/), function(mime) {
            api.accept[mime] && _each(api.accept[mime].split(' '), function(ext) {
              exts[ext] = 1;
            });
          });

          _each(exts, function(i, ext) {
            accept.push(ext);
          });

          flash.cmd(evt, 'accept', accept.length ? accept.join(',') + ',' + accept.join(',').toUpperCase() : '*');
        }
      },


      get: function(id) {
        return document[id] || window[id] || document.embeds[id];
      },


      getInput: function(id) {
        if (api.multiFlash) {
          try {
            var node = flash.getWrapper(flash.get(id));
            if (node) {
              return node.getElementsByTagName('input')[0];
            }
          } catch (e) {
            api.log('[err] Can not find "input" by flashId:', id, e);
          }
        } else {
          return flash.curInp;
        }
      },


      select: function(evt) {
        var
          inp = flash.getInput(evt.flashId),
          uid = api.uid(inp),
          files = evt.target.files,
          event;

        _each(files, function(file) {
          api.checkFileObj(file);
        });

        _files[uid] = files;

        if (document.createEvent) {
          event = document.createEvent('Event');
          event.files = files;
          event.initEvent('change', true, true);
          inp.dispatchEvent(event);
        } else if (jQuery) {
          jQuery(inp).trigger({
            type: 'change',
            files: files
          });
        } else {
          event = document.createEventObject();
          event.files = files;
          inp.fireEvent('onchange', event);
        }
      },


      cmd: function(id, name, data, last) {
        try {
          api.log('(js -> flash).' + name + ':', data);
          return flash.get(id.flashId || id).cmd(name, data);
        } catch (err) {
          api.log('(js -> flash).onError:', err.toString());
          if (!last) {
            // try again
            setTimeout(function() {
              flash.cmd(id, name, data, true);
            }, 50);
          }
        }
      },


      patch: function() {
        api.flashEngine = true;

        // FileAPI
        _inherit(api, {
          getFiles: function(input, filter, callback) {
            if (callback) {
              api.filterFiles(api.getFiles(input), filter, callback);
              return null;
            }

            var files = api.isArray(input) ? input : _files[api.uid(input.target || input.srcElement || input)];


            if (!files) {
              // Файлов нету, вызываем родительский метод
              return this.parent.apply(this, arguments);
            }


            if (filter) {
              filter = api.getFilesFilter(filter);
              files = api.filter(files, function(file) {
                return filter.test(file.name);
              });
            }

            return files;
          },


          getInfo: function(file, fn) {
            if (_isHtmlFile(file)) {
              this.parent.apply(this, arguments);
            } else if (file.isShot) {
              fn(null, file.info = {
                width: file.width,
                height: file.height
              });
            } else {
              if (!file.__info) {
                var defer = file.__info = api.defer();

                flash.cmd(file, 'getFileInfo', {
                  id: file.id,
                  callback: _wrap(function _(err, info) {
                    _unwrap(_);
                    defer.resolve(err, file.info = info);
                  })
                });
              }

              file.__info.then(fn);
            }
          }
        });


        // FileAPI.Image
        api.support.transform = true;
        api.Image && _inherit(api.Image.prototype, {
          get: function(fn, scaleMode) {
            this.set({
              scaleMode: scaleMode || 'noScale'
            }); // noScale, exactFit
            return this.parent(fn);
          },

          _load: function(file, fn) {
            api.log('FlashAPI.Image._load:', file);

            if (_isHtmlFile(file)) {
              this.parent.apply(this, arguments);
            } else {
              var _this = this;
              api.getInfo(file, function(err) {
                fn.call(_this, err, file);
              });
            }
          },

          _apply: function(file, fn) {
            api.log('FlashAPI.Image._apply:', file);

            if (_isHtmlFile(file)) {
              this.parent.apply(this, arguments);
            } else {
              var m = this.getMatrix(file.info),
                doneFn = fn;

              flash.cmd(file, 'imageTransform', {
                id: file.id,
                matrix: m,
                callback: _wrap(function _(err, base64) {
                  api.log('FlashAPI.Image._apply.callback:', err);
                  _unwrap(_);

                  if (err) {
                    doneFn(err);
                  } else if (!api.support.html5 && (!api.support.dataURI || base64.length > 3e4)) {
                    _makeFlashImage({
                      width: (m.deg % 180) ? m.dh : m.dw,
                      height: (m.deg % 180) ? m.dw : m.dh,
                      scale: m.scaleMode
                    }, base64, doneFn);
                  } else {
                    if (m.filter) {
                      doneFn = function(err, img) {
                        if (err) {
                          fn(err);
                        } else {
                          api.Image.applyFilter(img, m.filter, function() {
                            fn(err, this.canvas);
                          });
                        }
                      };
                    }

                    api.newImage('data:' + file.type + ';base64,' + base64, doneFn);
                  }
                })
              });
            }
          },

          toData: function(fn) {
            var
              file = this.file,
              info = file.info,
              matrix = this.getMatrix(info);
            api.log('FlashAPI.Image.toData');

            if (_isHtmlFile(file)) {
              this.parent.apply(this, arguments);
            } else {
              if (matrix.deg == 'auto') {
                matrix.deg = api.Image.exifOrientation[info && info.exif && info.exif.Orientation] || 0;
              }

              fn.call(this, !file.info, {
                id: file.id,
                flashId: file.flashId,
                name: file.name,
                type: file.type,
                matrix: matrix
              });
            }
          }
        });


        api.Image && _inherit(api.Image, {
          fromDataURL: function(dataURL, size, callback) {
            if (!api.support.dataURI || dataURL.length > 3e4) {
              _makeFlashImage(
                api.extend({
                  scale: 'exactFit'
                }, size), dataURL.replace(/^data:[^,]+,/, ''),
                function(err, el) {
                  callback(el);
                }
              );
            } else {
              this.parent(dataURL, size, callback);
            }
          }
        });

        // FileAPI.Form
        _inherit(api.Form.prototype, {
          toData: function(fn) {
            var items = this.items,
              i = items.length;

            for (; i--;) {
              if (items[i].file && _isHtmlFile(items[i].blob)) {
                return this.parent.apply(this, arguments);
              }
            }

            api.log('FlashAPI.Form.toData');
            fn(items);
          }
        });


        // FileAPI.XHR
        _inherit(api.XHR.prototype, {
          _send: function(options, formData) {
            if (
              formData.nodeName || formData.append && api.support.html5 || api.isArray(formData) && (typeof formData[0] === 'string')
            ) {
              // HTML5, Multipart or IFrame
              return this.parent.apply(this, arguments);
            }


            var
              data = {},
              files = {},
              _this = this,
              flashId, fileId;

            _each(formData, function(item) {
              if (item.file) {
                files[item.name] = item = _getFileDescr(item.blob);
                fileId = item.id;
                flashId = item.flashId;
              } else {
                data[item.name] = item.blob;
              }
            });

            if (!fileId) {
              flashId = _attr;
            }

            if (!flashId) {
              api.log('[err] FlashAPI._send: flashId -- undefined');
              return this.parent.apply(this, arguments);
            } else {
              api.log('FlashAPI.XHR._send: ' + flashId + ' -> ' + fileId);
            }

            _this.xhr = {
              headers: {},
              abort: function() {
                flash.cmd(flashId, 'abort', {
                  id: fileId
                });
              },
              getResponseHeader: function(name) {
                return this.headers[name];
              },
              getAllResponseHeaders: function() {
                return this.headers;
              }
            };

            var queue = api.queue(function() {
              flash.cmd(flashId, 'upload', {
                url: _getUrl(options.url.replace(/([a-z]+)=(\?)&?/i, '')),
                data: data,
                files: fileId ? files : null,
                headers: options.headers || {},
                callback: _wrap(function upload(evt) {
                  var type = evt.type,
                    result = evt.result;

                  api.log('FlashAPI.upload.' + type);

                  if (type == 'progress') {
                    evt.loaded = Math.min(evt.loaded, evt.total); // @todo fixme
                    evt.lengthComputable = true;
                    options.progress(evt);
                  } else if (type == 'complete') {
                    _unwrap(upload);

                    if (typeof result == 'string') {
                      _this.responseText = result.replace(/%22/g, "\"").replace(/%5c/g, "\\").replace(/%26/g, "&").replace(/%25/g, "%");
                    }

                    _this.end(evt.status || 200);
                  } else if (type == 'abort' || type == 'error') {
                    _this.end(evt.status || 0, evt.message);
                    _unwrap(upload);
                  }
                })
              });
            });


            // #2174: FileReference.load() call while FileReference.upload() or vice versa
            _each(files, function(file) {
              queue.inc();
              api.getInfo(file, queue.next);
            });

            queue.check();
          }
        });
      }
    };


    function _makeFlashHTML(opts) {
      return ('<object id="#id#" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + (opts.width || '100%') + '" height="' + (opts.height || '100%') + '">' + '<param name="movie" value="#src#" />' + '<param name="flashvars" value="#flashvars#" />' + '<param name="swliveconnect" value="true" />' + '<param name="allowscriptaccess" value="always" />' + '<param name="allownetworking" value="all" />' + '<param name="menu" value="false" />' + '<param name="wmode" value="#wmode#" />' + '<embed flashvars="#flashvars#" swliveconnect="true" allownetworking="all" allowscriptaccess="always" name="#id#" src="#src#" width="' + (opts.width || '100%') + '" height="' + (opts.height || '100%') + '" menu="false" wmode="transparent" type="application/x-shockwave-flash"></embed>' + '</object>').replace(/#(\w+)#/ig, function(a, name) {
        return opts[name];
      });
    }


    function _css(el, css) {
      if (el && el.style) {
        var key, val;
        for (key in css) {
          val = css[key];
          if (typeof val == 'number') {
            val += 'px';
          }
          try {
            el.style[key] = val;
          } catch (e) {}
        }
      }
    }


    function _inherit(obj, methods) {
      _each(methods, function(fn, name) {
        var prev = obj[name];
        obj[name] = function() {
          this.parent = prev;
          return fn.apply(this, arguments);
        };
      });
    }

    function _isHtmlFile(file) {
      return file && !file.flashId;
    }

    function _wrap(fn) {
      var id = fn.wid = api.uid();
      flash._fn[id] = fn;
      return 'FileAPI.Flash._fn.' + id;
    }


    function _unwrap(fn) {
      try {
        flash._fn[fn.wid] = null;
        delete flash._fn[fn.wid];
      } catch (e) {}
    }


    function _getUrl(url, params) {
      if (!_rhttp.test(url)) {
        if (/^\.\//.test(url) || '/' != url.charAt(0)) {
          var path = location.pathname;
          path = path.substr(0, path.lastIndexOf('/'));
          url = (path + '/' + url).replace('/./', '/');
        }

        if ('//' != url.substr(0, 2)) {
          url = '//' + location.host + url;
        }

        if (!_rhttp.test(url)) {
          url = location.protocol + url;
        }
      }

      if (params) {
        url += (/\?/.test(url) ? '&' : '?') + params;
      }

      return url;
    }


    function _makeFlashImage(opts, base64, fn) {
      var
        key, flashId = api.uid(),
        el = document.createElement('div'),
        attempts = 10;

      for (key in opts) {
        el.setAttribute(key, opts[key]);
        el[key] = opts[key];
      }

      _css(el, opts);

      opts.width = '100%';
      opts.height = '100%';

      el.innerHTML = _makeFlashHTML(api.extend({
        id: flashId,
        src: _getUrl(api.flashImageUrl, 'r=' + api.uid()),
        wmode: 'opaque',
        flashvars: 'scale=' + opts.scale + '&callback=' + _wrap(function _() {
          _unwrap(_);
          if (--attempts > 0) {
            _setImage();
          }
          return true;
        })
      }, opts));

      function _setImage() {
        try {
          // Get flash-object by id
          var img = flash.get(flashId);
          img.setImage(base64);
        } catch (e) {
          api.log('[err] FlashAPI.Preview.setImage -- can not set "base64":', e);
        }
      }

      fn(false, el);
      el = null;
    }


    function _getFileDescr(file) {
      return {
        id: file.id,
        name: file.name,
        matrix: file.matrix,
        flashId: file.flashId
      };
    }


    function _getDimensions(el) {
      var
        box = el.getBoundingClientRect(),
        body = document.body,
        docEl = (el && el.ownerDocument).documentElement;

      return {
        top: box.top + (window.pageYOffset || docEl.scrollTop) - (docEl.clientTop || body.clientTop || 0),
        left: box.left + (window.pageXOffset || docEl.scrollLeft) - (docEl.clientLeft || body.clientLeft || 0),
        width: box.right - box.left,
        height: box.bottom - box.top
      };
    }

    // @export
    api.Flash = flash;


    // Check dataURI support
    api.newImage('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', function(err, img) {
      api.support.dataURI = !(img.width != 1 || img.height != 1);
      flash.init();
    });
  })();
})(window, window.jQuery, FileAPI);