<?php
ini_set("display_errors", 1);
error_reporting(E_ALL ^ E_NOTICE);
cors();
header('Content-Type: application/json');
require('./build-tree.php');

$allow_ext = array('gif','jpg','png','bmp');
$root = dirname('.') . '/writable';
$suffix = 'small';
$suffixes = array('small', 'medium', 'big');
$tree = new buildTreeFromDirectory($root);
$tree->setFilter($allow_ext, $suffix);

$actions = array(
  'upload' => 'upload',
  'new-folder' => 'new-folder',
  'del-folder' => 'del-folder',
  'del-file' => 'del-file',
  'get-thumbs' => 'get-thumbs'
);

$msg = array(
  'en' => array(
    'no-writable' => 'This folder is not writable!',
    'path-error' => 'Path error!',
    'folder-exists' => 'This folder already exists!',
    'folder-create-error' => 'Error creating folder!',
    'folder-del-error' => 'Error deleting folder!',
    'upload-error' => 'Cannot Upload!',
    'file-del-error' => 'Error deleting file!',
    'error' => 'Error: '
  ),
  'pt-br' => array(
    'no-writable' => 'Sem permissão de escrita!',
    'path-error' => 'Erro com path!',
    'folder-exists' => 'Esta pasta já existe!',
    'folder-create-error' => 'Erro na criação da pasta!',
    'folder-del-error' => 'Erro removendo a pasta!',
    'upload-error' => 'Não foi possível fazer o upload!',
    'file-del-error' => 'Erro removendo o arquivo!',
    'error' => 'Erro: '
  )
);


if($_GET['action'] == $actions['get-thumbs']){
  die($tree->getJSON());
}


if($_SERVER['REQUEST_METHOD'] == 'OPTIONS'){
  exit;
}

if(strtoupper($_SERVER['REQUEST_METHOD']) == 'POST'){
  $action = $_POST['action'];
  $lang = $_POST['lang'];

  if($action == $actions['new-folder'] || 
      $action == $actions['del-folder'] || 
      $action == $actions['upload']){
    $parents = str_replace(',', '/', $_POST['parents']);
    
    $root2 = realpath($root.'/'.$parents);
    
    if(!is_writable($root2)){
      die(json_encode(array(
        'erro' => true,
        'msg' => $msg[$lang]['no-writable']
      )));
    }
    if(!$root2){
      die(json_encode(array(
        'erro' => true,
        'msg' => $msg[$lang]['path-error']
      )));
    }
  }
  
  if($action == $actions['new-folder'] || $action == $actions['del-folder']){

    $full = $root2.'/'.$_POST['folder'];
    
    if($action == $actions['new-folder']){
      if(is_dir($full)){
        die(json_encode(array(
          'erro' => true,
          'msg' => $msg[$lang]['folder-exists']
        )));
      }
      
      $mkdir = mkdir($full);
      if($mkdir){
        chmod($full, 0777);
        die(json_encode(array(
          'erro' => false,
          'tree' => $tree->buildTree($full)
        )));
      } else {
        die(json_encode(array(
          'erro' => true,
          'msg' => $msg[$lang]['folder-create-error'] . $parents.'/'.$_POST['folder']
        )));
      }
    } elseif($action == $actions['del-folder']){
      $full = realpath($full);
      if($full && $full != $root){
        $rm = array();
        exec("rm -rf {$full}");
        exec('echo "$?"', $rm); //0 - no error
        
        if($rm[0] == 0){
          die(json_encode(array(
            'erro' => false,
            'tree' => $tree->buildTree($root2)
          )));
        } else {
          die(json_encode(array(
            'erro' => true,
            'msg' => $msg[$lang]['folder-del-error'] . $parents.'/'.$_POST['folder']
          )));
        }
      } else {
        die(json_encode(array(
          'erro' => true,
          'msg' => $msg[$lang]['error'] . $parents.'/'.$_POST['folder']
        )));
      }
    }
  } elseif($action == $actions['upload']){
    $files = $_FILES['file'];
    if($files && is_array($files['tmp_name'])){
      //extension
      $ext = getImageExtension($files['type']['medium']);
      if($ext){
        $err_up = false;
        
        $filesuffix = $files['name'];
        foreach($files['tmp_name'] as $k => $tmp){
          
          $filename = pathinfo($files['name'][$k], PATHINFO_FILENAME);
          $filename = safeFilename($filename) .'-'.$k.'.'. $ext;
          $full = $root2 .'/'. $filename;
          
          if(move_uploaded_file($tmp, $full)){
            chmod($full, 0777);
          } else {
            $err_up = true;
          }
        }
        if($err_up){
          echo json_encode(array(
            'erro' => true,
            'msg'   => $msg[$lang]['upload-error']
          ));
        } else{
          echo json_encode(array(
            'erro' => false,
            'tree' => $tree->buildTree($root2)
          ));
        }
      }
    }
  } elseif($action == $actions['del-file']){
    $arr = explode(',', $_POST['files']);
    $err = false;
    
    $keys = array_keys($arr);
    $key_last = end($keys);
    $last = $arr[$key_last];
    $last_arr = explode('/', $last);
    array_pop($last_arr);
    $last_parent = implode('/', $last_arr);

    foreach($arr as $path){
      $pattern = str_replace($suffix, '*', $path);
      array_map('unlink', glob($root . $pattern));
    
      if(is_file($root . $path)){
        $err = true;
      }
    }
  
    if($err){
      echo json_encode(array(
        'erro' => true,
        //'file' => $root . $path,
        'msg'   => $msg[$lang]['file-del-error']
      ));
    } else{
      echo json_encode(array(
        'erro' => false,
        //'parent' => $root . $last_parent,
        'tree' => $tree->buildTree($root . $last_parent)
      ));
    }
  }
}
function getImageExtension($mime){
  switch ($mime) {
    case 'image/gif':
      $ext = 'gif';
      break;
    case 'image/jpeg':
      $ext = 'jpg';
      break;
    case 'image/png':
      $ext = 'png';
      break;
    case 'image/bmp':
      $ext = 'bmp';
      break;
    default:
      $ext = false;
  }
  return $ext;
}
function safeFilename($string, $sep = '-', $extra = null){
  return strtolower(trim(preg_replace('~[^0-9a-z' . preg_quote($extra, '~') . ']+~i', $sep, unaccent($string)), $sep));
}
function unaccent($string){
  if (strpos($string = htmlentities($string, ENT_QUOTES, 'UTF-8'), '&') !== false){
    $string = html_entity_decode(preg_replace('~&([a-z]{1,2})(?:acute|cedil|circ|grave|lig|orn|ring|slash|tilde|uml);~i', '$1', $string), ENT_QUOTES, 'UTF-8');
  }
  return $string;
}
/**
 *  An example CORS-compliant method.  It will allow any GET, POST, or OPTIONS requests from any
 *  origin.
 *
 *  In a production environment, you probably want to be more restrictive, but this gives you
 *  the general idea of what is involved.  For the nitty-gritty low-down, read:
 *
 *  - https://developer.mozilla.org/en/HTTP_access_control
 *  - http://www.w3.org/TR/cors/
 *
 */
function cors() {

    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }
}

?>