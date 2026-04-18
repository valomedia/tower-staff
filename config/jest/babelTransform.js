'use strict';

const babelJest = require('babel-jest').default;

module.exports = babelJest.createTransformer({
    presets: [
        ['@babel/preset-env', {targets: {node: 'current'}}],
        ['@babel/preset-react', {runtime: 'automatic'}],
        '@babel/preset-typescript',
    ],
    babelrc: false,
    configFile: false,
});
