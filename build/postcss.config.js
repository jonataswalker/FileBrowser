// const styles = require('../src/constants/styles');

module.exports = {
  plugins: [
    require('postcss-import')(),
    require('postcss-simple-vars')(),
    require('postcss-calc')(),
    require('postcss-nested')(),
    require('postcss-cssnext')()
  ]
};
