<?php
ini_set("display_errors", 1);
error_reporting(E_ALL ^ E_NOTICE);

// TODO adjust for Windows OS

class buildTreeFromDirectory {

  public $count_suffix = 2; //small, big
  
  private $filter,
          $root_dir,
          $file_suffix,
          $allowed_extensions,
          $ignore_hidden,
          $exclude_dir;

  public function __construct($root_dir) {
  
    $root_dir = realpath($root_dir);
    if(!$root_dir)
      die("This directory doesn't exist!");
  
    $this->root_dir = $root_dir;
    $this->setFilter();
    date_default_timezone_set(@date_default_timezone_get());
  }
  public function setFilter(
      $allowed_extensions = array('*'),
      $file_suffix = '',
      $exclude_dir = array(),
      $ignore_hidden = true
    ) {
  
    $this->allowed_extensions = $allowed_extensions;
    $this->file_suffix = $file_suffix;
    $this->ignore_hidden = $ignore_hidden;
    $this->exclude_dir = $exclude_dir;
  }
  public function buildTree($last_created = '') {
    $dir = new RecursiveDirectoryIterator(
      $this->root_dir, FilesystemIterator::SKIP_DOTS);
  
    $this->filter($dir);
    $it = new RecursiveIteratorIterator(
      $this->filter,
      RecursiveIteratorIterator::SELF_FIRST,
      RecursiveIteratorIterator::CATCH_GET_CHILD
    );
    
    $tree = array();
    foreach($it as $fileinfo) {
      
      $name = $fileinfo->getFilename();
      $sub_path_name = $it->getSubPathName();
      $parts = explode(DIRECTORY_SEPARATOR, $sub_path_name);
      array_pop($parts);
      
      $parentArr = &$tree;
      
      //go deep in the file|dir path
      foreach ($parts as $part) {
        $parentArr = &$parentArr['dirs'][$part];
      }
      
      if ($fileinfo->isDir()) {
        //statistics
        $statistics = $this->countChildren($it->key());
        $total_files = round($statistics['files'] / $this->count_suffix);
      
        // Add the final part to the structure
        if(!empty($last_created) && $it->key() == $last_created) {
          $parentArr['dirs'][$name] = array(
            'f' => $name,
            'c-folders' => $statistics['folders'],
            'c-files' => $total_files,
            'last' => true
          );
        } else {
          $parentArr['dirs'][$name] = array(
            'f' => $name,
            'c-folders' => $statistics['folders'],
            'c-files' => $total_files,
            'ffff' => $statistics['files'].'..'.$this->count_suffix
          );
        }
      } else {
        // Add some file info to the structure
        if($fileinfo->isLink()) {
          $realpath = $fileinfo->getRealPath();
          $filesize = filesize($realpath);
          $filemtime = filemtime($realpath);
        } else {
          $filesize = $fileinfo->getSize();
          $filemtime = $fileinfo->getMTime();
        }
        
        $file_path = $it->getSubPath() == '' ? '/' : '/'.$it->getSubPath().'/';
        
        $parentArr['files'][] = array(
          'filename'      => $name,
          'filesize'      => $this->fileSizeConvert($filesize),
          'date'        => date("d-m-Y H:i", $filemtime),
          'relative_path'   => $file_path 
        );
      }
    }
    unset($parentArr);
    $this->sortArray($tree);
    return $tree;
  }
  private function sortArray(&$tree) {
    foreach ($tree as &$value) {
      if (is_array($value))
        $this->sortArray($value);
    }
    return ksort($tree);
  }
  private function countChildren($folder) {
    $folders = array();
    $files = array();
    exec('ls -Rp '.$folder.' | grep "/$" | wc -l', $folders);
    exec('find '.$folder.' -type f | wc -l', $files);
    return array(
      'folders' => $folders[0],
      'files' => $files[0]
    );
  }
  public function saveJSON($path, $filename) {
    $tree = $this->buildTree();
    $path = realpath($path);
    if($path && is_writable($path)) {
      $full = $path .DIRECTORY_SEPARATOR. $filename;
      $write = file_put_contents($full, json_encode($tree));
      
      if($write)
        echo 'Saved: ' . $full . "\n";
      else
        echo 'Error trying to save: ' . $full . "\n";
    }
  }
  public function getJSON() {
    return json_encode(array(
      'tree' => $this->buildTree()
    ));
  }
  private function filter($dir) {
  
    $this->filter = new RecursiveCallbackFilterIterator($dir, 
      function($current, $key, $iterator) {
        $filename = $current->getFilename();
      
        //ignore all hidden files/directories
        if($this->ignore_hidden) {
          if(substr($filename, 0, 1) == '.')
            return false;
        }
      
        // Allow recursion
        if($iterator->hasChildren() && 
          !in_array($filename, $this->exclude_dir)) {
          return true;
        }
        
        if($current->isReadable() === false)
          return false;
        
          
        //filter by file extension
        $path = $current->getPathname();
        $file_ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        
        if($this->allowed_extensions[0] == '*') { //no extension filter
          $ext_allowed = true;
        } else {
          $ext_allowed = in_array($file_ext, $this->allowed_extensions);
        }
        
        if(!empty($this->file_suffix)) {
          //filter by suffix and extension
          if(strpos($filename, $this->file_suffix.'.'.$file_ext) !== false && $ext_allowed)
            return true;
          else
            return false;
        }
        
        //filter by extension
        return $ext_allowed;
      }
    );
  }
  public function fileSizeConvert($bytes) {
    $label = array('B', 'KB', 'MB', 'GB', 'TB', 'PB');
    for($i = 0; $bytes >= 1024 && $i < (count($label) -1); $bytes /= 1024, $i++);
    return round($bytes, 2) . " " . $label[$i];
  }
}
?>