const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const { transformFromAst } = require('@babel/core');

module.exports = {
    getAst: (filename) => {
        const content = fs.readFileSync(filename, 'utf-8');
        const ast = parser.parse(content, {
            sourceType: 'module'
        });
        return ast;
    },
    getDependecies: (ast, filename) => {
        const dependecies = {};
        traverse(ast, {
            ImportDeclaration({ node }) {
                const dirname = path.dirname(filename);
                const newfile = "./" + path.join(dirname, node.source.value);
                dependecies[node.source.value] = newfile;
            }
        })
        return dependecies;
    },
    getCode: ast => {
        const { code } = transformFromAst(ast, null, {
            presets: ['@babel/preset-env']
        });
        return code;
    }
}
