(function(FileBrowser, win, doc){

  var getXhr = function() {
    var xhr = false;
    if (win.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else if (win.ActiveXObject) {
      try {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
      } catch(e) {
        try {
          xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } catch(e) {
          xhr = false;
        }
      }
    }
    return xhr;
  };
  var encodeUrlXhr = function(url, data) {
    if(data && typeof(data) === 'object') {
      var str_data = utils.toQueryString(data);
      url += (/\?/.test(url) ? '&' : '?') + str_data;
    }
    return url;
  };
  
  FileBrowser.Utils = {
    whiteSpaceRegex: /\s+/,
    toQueryString: function(obj){
      return Object.keys(obj).reduce(function(a, k) {
        a.push(
          (typeof obj[k] === 'object') ? utils.toQueryString(obj[k]) :
          encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
        );
        return a;
      }, []).join('&');
    },
    json: function(url, data) {
      var
        xhr = getXhr(),
        when = {},
        onload = function() {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          } else {
            log("Status code was " + xhr.status);
          }
        },
        onerror = function() {
          log("Can't XHR " + JSON.stringify(url));
        },
        onprogress = function(event) {}
      ;
      url = encodeUrlXhr(url, data);
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Accept","application/json");
      xhr.onload = onload;
      xhr.onerror = onerror;
      xhr.onprogress = onprogress;
      xhr.send(null);
      
      return {
        when: function(obj){
          when.ready = obj.ready;
        }
      };
    },
    post: function(url, data) {
      var 
        xhr = getXhr(),
        when = {},
        onload = function() {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          } else {
            log("Status code was " + xhr.status);
          }
        },
        onerror = function() {
          log("Can't XHR " + JSON.stringify(url));
        },
        onprogress = function(){}
      ;
      
      data = utils.toQueryString(data);
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.onload = onload;
      xhr.onerror = onerror;
      xhr.onprogress = onprogress;
      xhr.send(data);
      
      return {
        when: function(obj){
          when.ready = obj.ready;
        }
      };
    },
    getPath: function(){
      var parts = win.location.pathname.split('/');
      parts.shift();
      parts.pop();
      return '/' + parts.join('/') + '/';
    },
    stopEventPropagation: function(e) {
      if (typeof e.stopPropagation === 'function') {
        e.stopPropagation();
        e.preventDefault();
      } else if (win.event && win.event.hasOwnProperty('cancelBubble')) {
        win.event.cancelBubble = true;
      }
    },
    fireClick: function(node) {
      if (typeof MouseEvent === 'function') {
        var mevt = new MouseEvent('click', {
          view: win,
          bubbles: false,
          cancelable: true
        });
        node.dispatchEvent(mevt);
      } else if ( doc.createEvent ) {
        // Fallback
        var evt = doc.createEvent('MouseEvents');
        evt.initEvent('click', false, false);
        node.dispatchEvent(evt);
      } else if (doc.createEventObject) {
        node.fireEvent('onclick') ;
      } else if (typeof node.onclick === 'function' ) {
        node.onclick();
      }
    },
    classRegex: function(classname) {
      return new RegExp('(^|\\s+)' + classname + '(\\s+|$)');
    },
    _addClass: function(el, c, timeout){
      if (el.classList) {
        el.classList.add(c);
      } else {
        el.className = (el.className + ' ' + c).trim();
      }
      
      if(timeout && utils.isNumeric(timeout)){
        win.setTimeout(function(){
          utils._removeClass(el, c);
        }, timeout);
      }
    },
    addClass: function(el, classname, timeout){
      if(Array.isArray(el)){
        el.forEach(function(each){
          utils.addClass(each, classname);
        });
        return;
      }
      
      //classname can be ['class1', 'class2'] or 'class1 class2'
      var 
        array = (Array.isArray(classname)) ?
          classname : classname.split(utils.whiteSpaceRegex),
        i = array.length
      ;
      while(i--){
        if(!utils.hasClass(el, array[i])) {
          utils._addClass(el, array[i], timeout);
        }
      }
    },
    _removeClass: function(el, c){
      if (el.classList){
        el.classList.remove(c);
      } else {
        el.className = (el.className.replace(utils.classReg(c), ' ')).trim();
      }
    },
    removeClass: function(el, classname){
      if(Array.isArray(el)){
        el.forEach(function(each){
          utils.removeClass(each, classname);
        });
        return;
      }
      
      //classname can be ['class1', 'class2'] or 'class1 class2'
      var 
        array = (Array.isArray(classname)) ?
        classname : classname.split(utils.whiteSpaceRegex),
        i = array.length
      ;
      while(i--){
        if(utils.hasClass(el, array[i])) {
          utils._removeClass(el, array[i]);
        }
      }
    },
    hasClass: function(el, c){
      return (el.classList) ? 
        el.classList.contains(c) : utils.classReg(c).test(el.className);
    },
    toggleClass: function(el, c){
      if(Array.isArray(el)) {
        el.forEach(function(each) {
          utils.toggleClass(each, c);
        });
        return;
      }
      
      if(el.classList) {
        el.classList.toggle(c);
      } else {
        if(utils.hasClass(el, c)){
          utils._removeClass(el, c);
        } else {
          utils._addClass(el, c);
        }
      }
    },
    $: function(id){
      id = (id[0] === '#') ? id.substr(1, id.length) : id;
      return doc.getElementById(id);
    },
    isElement: function(obj){
      // DOM, Level2
      if ("HTMLElement" in win) {
        return (!!obj && obj instanceof HTMLElement);
      }
      // Older browsers
      return (!!obj && typeof obj === "object" && 
      obj.nodeType === 1 && !!obj.nodeName);
    },
    find: function(selector, context, find_all){
      var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/, 
        periodRe = /\./g, 
        slice = [].slice,
        matches = []
      ;
      if(simpleRe.test(selector)){
        switch(selector[0]){
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
      } else{
        // If not a simple selector, query the DOM as usual 
        // and return an array for easier usage
        matches = slice.call(context.querySelectorAll(selector));
      }
      
      return (find_all) ? matches : matches[0];
    },
    getAllChildren: function(node, tag){
      return [].slice.call(node.getElementsByTagName(tag));
    },
    getSiblings: function(node, tagname) {
      return Array.prototype.filter.call(node.parentNode.children, 
          function(child){
        if(tagname){
          if(tagname.toUpperCase() == child.tagName){
            return child !== node;
          }
        } else{
          return child !== node;
        }
      });
    },
    emptyArray: function(array){
      while(array.length) array.pop();
    },
    removeAllChildren: function(node) {
      while (node.firstChild) node.removeChild(node.firstChild);
    },
    removeAll: function(collection) {
      var node;
      while ((node = collection[0]))
        node.parentNode.removeChild(node);
    },
    getChildren: function(node, tag){
      return [].filter.call(node.childNodes, function(el) {
        return (tag) ? 
          el.nodeType == 1 && el.tagName.toLowerCase() == tag : el.nodeType == 1;
      });
    },
    template: function(html, row){
      var this_ = this;
      
      return html.replace(/\{ *([\w_-]+) *\}/g, function (html, key) {
        var value = (row[key]  === undefined) ? '' : row[key];
        return this_.htmlEscape(value);
      });
    },
    htmlEscape: function(str){
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, "&#039;");
    },
    getMaxZIndex: function () {
      var zIndex,
        max = 0,
        all = utils.find('*', doc, true),
        len = all.length,
        i = -1
      ;
      while(++i < len){
        zIndex = parseInt(win.getComputedStyle(all[i]).zIndex, 10);
        max = (zIndex) ? Math.max(max, zIndex) : max;
      }
      return max;
    },
    deepExtend: function (destination, source) {
      var property, propertyValue;
  
      for (property in source) if (source.hasOwnProperty(property)) {
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
    createElement: function(node, html){
      var elem;
      if(Array.isArray(node)){
        elem = doc.createElement(node[0]);
        
        if(node[1].id) elem.id = node[1].id;
        if(node[1].classname) elem.className = node[1].classname;
        
        if(node[1].attr){
          var attr = node[1].attr;
          if(Array.isArray(attr)){
            var i = -1;
            while(++i < attr.length){
              elem.setAttribute(attr[i].name, attr[i].value);
            }
          } else {
            elem.setAttribute(attr.name, attr.value);
          }
        }
      } else{
        elem = doc.createElement(node);
      }
      elem.innerHTML = html;
      var frag = doc.createDocumentFragment();
      
      while (elem.childNodes[0]) {
        frag.appendChild(elem.childNodes[0]);
      }
      elem.appendChild(frag);
      return elem;
    },
    setCenter: function(node, parent){
      parent = parent || win;
      var
        parent_size = utils.getSize(parent),
        node_size = utils.getSize(node),
        scroll_x = (parent == win) ? win.pageXOffset : parent.scrollLeft,
        scroll_y = (parent == win) ? win.pageYOffset : parent.scrollTop,
        top = Math.max(0, (
          (parent_size.height - node_size.height) / 2) + scroll_y),
        left = Math.max(0, (
          (parent_size.width - node_size.width) / 2) + scroll_x)
      ;
      node.style.position = 'absolute';
      node.style.top = top + 'px';
      node.style.left = left + 'px';
    },
    getSize: function(element){
      if(element == win || element == doc){
        return utils.getWindowSize();
      } else {
        return {
          width: element.offsetWidth,
          height: element.offsetHeight
        };
      }
    },
    getWindowSize: function(){
      return {
        width: win.innerWidth ||
            doc.documentElement.clientWidth || doc.body.clientWidth,
        height: win.innerHeight ||
            doc.documentElement.clientHeight || doc.body.clientHeight
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
      
      var height = elem.clientHeight, padding;
      if (typeof getComputedStyle !== "undefined") {
        padding = parseInt(getComputedStyle(elem).paddingTop, 10);
      } else {
        padding = parseInt(elem.currentStyle.padding);
      }
      
      elem.style.left = '';
      elem.style.display = 'none';
      return ('-' + parseInt((height + padding) / 2) + 'px');
    },
    toType: function(obj) {
      if(obj == win && obj.doc && obj.location){
        return 'window';
      } else if(obj == doc){
        return 'htmldocument';
      } else if(typeof obj === 'string'){
        return 'string';
      } else if(utils.isElement(obj)){
        return 'element';
      }
    },
    typeOf: function(obj){
      return ({}).toString.call(obj)
        .match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },
    removeArrayEntry: function(array, value){
      var index = array.indexOf(value);
      /* jshint -W030 */
      index > -1 && array.splice(index, 1);
    },
    bytesToSize: function(bytes) {
      if(bytes === 0) return '0 Byte';
      var
        k = 1000,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k))
      ;
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }
  };
})(FileBrowser, win, doc);