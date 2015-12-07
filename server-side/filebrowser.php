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

if($_GET['action'] == 'thumbs'){
  die($tree->getJSON());
}


if($_SERVER['REQUEST_METHOD'] == 'OPTIONS'){
  exit;
}

if(strtoupper($_SERVER['REQUEST_METHOD']) == 'POST'){
  $action = $_POST['action'];

  if($action == 'nova-pasta' || $action == 'del-pasta' || $action == 'upload'){
    $parents = str_replace(',', '/', $_POST['parents']);
    
    $root2 = realpath($root.'/'.$parents);
    
    if(!is_writable($root2)){
      die(json_encode(array(
        'erro' => true,
        'msg' => 'Sem permissão de escrita!'
      )));
    }
    if(!$root2){
      die(json_encode(array(
        'erro' => true,
        'msg' => 'Erro com o path!'
      )));
    }
  }
  
  if($action == 'nova-pasta' || $action == 'del-pasta'){

    $full = $root2.'/'.$_POST['folder'];
    
    if($action == 'nova-pasta'){
      if(is_dir($full)){
        die(json_encode(array(
          'erro' => true,
          'msg' => 'Esta pasta já existe!'
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
          'msg' => 'Erro ao criar: ' . $parents.'/'.$_POST['folder']
        )));
      }
    } elseif($action == 'del-pasta'){
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
            'msg' => 'Erro ao remover pasta: ' . $parents.'/'.$_POST['folder']
          )));
        }
      } else {
        die(json_encode(array(
          'erro' => true,
          'msg' => 'Erro: ' . $parents.'/'.$_POST['folder']
        )));
      }
    }
  } elseif($action == 'upload'){
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
            'msg'   => 'Erro no upload'
          ));
        } else{
          echo json_encode(array(
            'erro' => false,
            'tree' => $tree->buildTree($root2)
          ));
        }
      }
    }
  } elseif($action == 'del-file'){
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
        'msg'   => 'Erro na remoção.'
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