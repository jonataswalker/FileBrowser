export const ROOT_ID = 'root';

export const LANG = {
  EN: 'en',
  BR: 'pt-br'
};

export const OPTIONS = {
  lang: 'en'
};

export const TEXT = {
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

export const ROUTES = {
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
