const Compiler = require('./lib/compiler');
const options = require('./webpack.config');

new Compiler(options).run()