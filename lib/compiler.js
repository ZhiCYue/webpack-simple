const path = require('path');
const fs = require('fs');
const { getAst, getDependecies, getCode } = require('./parser');

module.exports = class Compiler {
    constructor(options) {
        const { entry, output } = options;
        this.entry = entry;
        this.output = output;
        this.modules = [];
    }
    run() {
        let info = this.build(this.entry);

        this.modules.push(info);
        for(let i=0; i<this.modules.length; i++) {
            const item = this.modules[i];
            const { dependecies } = item;
            if (dependecies) {
                for(let j in dependecies) {
                    this.modules.push(this.build(dependecies[j]));
                }
            }
        }

        const obj = {};
        this.modules.forEach((item) => {
            obj[item.filename] = {
                dependecies: item.dependecies,
                code: item.code
            }
        })
        
        this.file(obj);
    }
    build(filename) {
        let ast = getAst(filename);
        let dependecies = getDependecies(ast, filename);
        let code = getCode(ast);

        return {
            filename,
            dependecies,
            code
        }
    }
    file(code) {
        const filePath = path.join(this.output.path, this.output.filename);
        const newCode = JSON.stringify(code);

        const bundle = `(function(graph){
            function require(module) {
                var exports = {};

                function localRequire(relativePath) {
                    return require(graph[module].dependecies[relativePath]);
                }

                (function(require, exports, code){
                    eval(code)
                })(localRequire, exports, graph[module].code);

                return exports;
            }

            require('${this.entry}')
        })(${newCode})`;

        fs.writeFileSync(filePath, bundle, 'utf-8');
    }
}