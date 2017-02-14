var path = require('path');

module.exports = {
  entry: './index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: "index",
    libraryTarget: "commonjs2",
    filename: 'index.js'
  }
};
