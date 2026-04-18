//
//  modules.js
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-05-26.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const chalk = require('chalk');
const resolve = require('resolve');

/**
 * Get additional module paths based on the baseUrl of a compilerOptions object.
 *
 * @param {{"baseUrl": string}}     options     The compilerOptions object containing the baseUrl.
 *
 * @returns {string[]}  The additional module paths to use.
 */
function getAdditionalModulePaths(options = {}) {
    const baseUrl = options.baseUrl;

    if (!baseUrl) {
        return [];
    }

    const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

    // We don't need to do anything if `baseUrl` is set to `node_modules`. This is
    // the default behavior.
    if (path.relative(paths.appNodeModules, baseUrlResolved) === '') {
        return [];
    }

    // Allow the user set the `baseUrl` to `appSrc`.
    if (path.relative(paths.appSrc, baseUrlResolved) === '') {
        return [paths.appSrc];
    }

    // If the path is equal to the root directory, we ignore it here. We don't want to allow importing from the root
    // directly as source files are not transpiled outside `src`. We do allow importing them with the absolute path
    // (e.g. `src/Components/Button.js`), but we set that up with an alias.
    if (path.relative(paths.appPath, baseUrlResolved) === '') {
        return [];
    }

    // Otherwise, throw an error.
    throw new Error(
        chalk.red.bold(
            "Your project's `baseUrl` can only be set to `src` or `node_modules`." +
            ' Create React App does not support other values at this time.'
        )
    );
}

/**
 * Get webpack aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {{"baseUrl": string?}}    options     The compilerOptions object containing the baseUrl.
 *
 * @returns {{"src": string?}} The path to the src directory, if it could be resolved.
 */
function getWebpackAliases(options = {}) {
    const baseUrl = options.baseUrl;

    if (!baseUrl) {
        return {};
    }

    const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

    if (path.relative(paths.appPath, baseUrlResolved) === '') {
        return {
            src: paths.appSrc,
        };
    } else {
        return {};
    }
}

/**
 * Get jest aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {{"baseUrl": string?}}    options     The compilerOptions object containing the baseUrl.
 *
 * @returns {{"^src/(.*)$": string?}} The path to the src directory, if it could be resolved.
 */
function getJestAliases(options = {}) {
    const baseUrl = options.baseUrl;

    if (!baseUrl) {
        return {};
    }

    const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

    if (path.relative(paths.appPath, baseUrlResolved) === '') {
        return {
            '^src/(.*)$': '<rootDir>/src/$1',
        };
    } else {
        return {};
    }
}

/**
 * Get the additional module paths, webpack aliases, and jest aliases for the project.
 *
 * This will parse either tsconfig.json or jsconfig.json (whichever exists) to find the additional module paths, jest
 * aliases, and webpack aliases for the project.
 *
 * @typedef {object} ModuleConfiguration The configuration parameters needed to configure module resolution.
 * @property {string[]}                 additionalModulePaths   A list of additional paths to search for modules.
 * @property {{"^src/(.*)$": string?}}  jestAliases             The path to the src directory as an alias for jest.
 * @property {boolean}                  hasTsConfig             Whether a tsconfig.json was used for the configuration.
 * @property {{src: string?}}           webpackAliases          The path to the src directory as an alias for webpack.
 *
 * @returns {ModuleConfiguration} The configuration to be used for resolving modules.
 */
function getModules() {
    // Check if TypeScript is set up.
    const hasTsConfig = fs.existsSync(paths.appTsConfig);
    const hasJsConfig = fs.existsSync(paths.appJsConfig);

    if (hasTsConfig && hasJsConfig) {
        throw new Error(
            'You have both a tsconfig.json and a jsconfig.json. If you are using TypeScript please remove your jsconfig.json file.'
        );
    }

    let config;

    if (hasTsConfig) {
        // If there's a tsconfig.json, we assume it's a TypeScript project and set up the config based on tsconfig.json.
        const ts = require(resolve.sync('typescript', {
            basedir: paths.appNodeModules,
        }));

        // noinspection JSUnresolvedReference
        config = ts.readConfigFile(paths.appTsConfig, ts.sys.readFile).config;

    } else if (hasJsConfig) {
        // Otherwise, we'll check if there is jsconfig.json for non TS projects.
        config = require(paths.appJsConfig);
    }

    config = config || {};
    const options = config.compilerOptions || {};

    const additionalModulePaths = getAdditionalModulePaths(options);

    return {
        additionalModulePaths: additionalModulePaths,
        webpackAliases: getWebpackAliases(options),
        jestAliases: getJestAliases(options),
        hasTsConfig,
    };
}

module.exports = getModules();
