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
