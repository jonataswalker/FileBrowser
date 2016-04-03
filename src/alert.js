/**
 * @constructor
 */
FB.Alert = function(){
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
  close: function(){
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
  checkInput: function(keyCode, value){
    //enter key 13
    if (keyCode === 13) {
      this.options.submit.call(value);
    } else {
      this.options.checkInput.call(value);
    }
  },
  submit: function(){
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
  showInputError: function(html){
    utils.addClass(this.els.alert_input, 'invalid');
    utils.addClass(this.els.alert_elem_error, 'show');
    this.els.alert_error_text.innerHTML = html;
  },
  hideInputError: function(){
    utils.removeClass(this.els.alert_input, 'invalid');
    utils.removeClass(this.els.alert_elem_error, 'show');
  },
  setListeners: function(){
    var this_ = this,
        //to not loose scope
        submit = function(){
          this.blur();
          this_.submit();
        },
        close = function(){
          this.blur();
          this_.close();
        },
        checkInput = function(evt){
          this_.checkInput(evt.keyCode, this.value);
        },
        keydown = function(evt){
          if (evt.keyCode === 27 && this_.opened){ //esc key
            this_.close();
          }
        };
    this.els.alert_ok.addEventListener('click', submit, false);
    this.els.alert_cancel.addEventListener('click', close, false);
    this.els.alert_input.addEventListener('keyup', checkInput, false);
    document.addEventListener('keydown', keydown, false);
  }
};