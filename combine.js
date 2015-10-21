module.paths.push('/usr/local/lib/node_modules');
var
    fs = require('fs'),
    path = require('path'),
    read = function(f) {
        return fs.readFileSync(f).toString();
    },
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
    
    src_dir = __dirname + '/src/',
    out_dir_build = __dirname + '/build/',
    
    out_css_file_combined = out_dir_build + 'filebrowser.css',
    out_js_file_combined = out_dir_build + 'filebrowser.js',
    i = -1,
    what = process.argv[2]
;

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