module.paths.push('/usr/local/lib/node_modules');
var
  fs = require('fs'),
  path = require('path'),
  read = function(f) {
      return fs.readFileSync(f).toString();
  },
  log = function(t){console.log(t)},
  css_file, css_min = '', css_str = '', js_str = '',
  css_files = [
    'filebrowser.css',
    'brankic-icomoon.css'
  ],
  js_files = [
    'base.js',
    'tree.js',
    'html.js',
    'drag.js',
    'upload.js',
    'alert.js',
    'utils.js'
  ],
  
  root_project = __dirname,
  src_dir = root_project + 'src/tour/',
  out_dir_html = root_project + 'tour/',
  out_dir_build = root_project + 'tour/build/',
  
  out_css_file_combined = out_dir_build + 'tour-combined.css',
  out_js_file_combined = out_dir_build + 'tour-debug.js',
  i = -1,
  what = process.argv[2]
;
console.info(root_project);
//HTML
if(what === 'html'){
  while(++i < html_files.length){
    var html_file = fs.realpathSync(src_dir + html_files[i]);
    var html_str = read(html_file);
    html_str = html_str.replace(/(\r\n|\n|\r)/gm,"")
      .replace(/\>[\n\t ]+\</gm,"><")
      .replace(/\s+=\s+/g,"=")
      .replace(/\s+&&\s+/g,"&&")
      .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'')
      .replace(/\s+/g,' ')
    ;
    
    var filename = path.basename(html_file);
    
    try {
      fs.writeFileSync(out_dir_html + filename, html_str);
    } catch(e){
      log(e);
    }
  }
}

//CSS
if(what === 'css'){
  i = -1;
  while(++i < css_files.length){
    css_file = fs.realpathSync(src_dir + css_files[i]);
    css_str += read(css_file);
  }
  try {
    fs.writeFileSync(out_css_file_combined, css_str);
  } catch(e){
    log(e);
  }
}

//JS
if(what === 'js'){
  i = -1;
  while(++i < js_files.length){
    js_str += read(src_dir + js_files[i]);
  }
  var wrapper = read(fs.realpathSync(src_dir + 'wrapper.js'));
  var js_str_combined = wrapper.replace('/*{CODE_HERE}*/', js_str);

  fs.writeFileSync(out_js_file_combined, js_str_combined);
}