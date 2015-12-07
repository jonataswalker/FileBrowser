    return FileBrowser;
  })(),
  log = function(m){console.info(m);},
  utils = FileBrowser.Utils;
  
  if (typeof define === 'function' && define.amd) {
    define(function () { return FileBrowser; });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileBrowser;
  } else if (typeof this !== 'undefined') {
    this.FileBrowser = FileBrowser;
  }
}).call(this, window, document);