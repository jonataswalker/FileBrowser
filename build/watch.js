var spawn = require('cross-spawn');
const { watch } = require('chokidar');

run(['run', 'start', 'build.css']);

const css = watch([
  './src/css/*.scss'
]).on('change', () => run(['run', 'start', 'build.css']));

process.on('SIGINT', function () {
  css.close();
});

function run(script) {
  const proc = spawn.sync('npm', script, { stdio: 'inherit' });
  proc.error && console.log(proc.error);
}
