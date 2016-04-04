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
