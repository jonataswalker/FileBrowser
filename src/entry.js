import { app } from './app';
import { TEXT, LANG } from './constants';
import TEXT_BR from './constants/lang/pt-br';

export default class FileBrowser {
  constructor(el, options = {}) {
    app.options = Object.assign(app.options, options);

    switch (app.options.lang) {
      case LANG.BR:
        app.text = TEXT_BR;
        break;
      default:
        app.text = TEXT;
    }

    app.$mount(el);
  }
}
