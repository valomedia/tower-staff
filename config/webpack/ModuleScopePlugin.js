//
//  ModuleScopePlugin.js
//  tower-staff
//
//  Adapted from react-dev-utils by Facebook, Inc.
//  Copyright (c) 2013-2022, Facebook, Inc.
//  Copyright © 2026 valo.media GmbH. All rights reserved.
//
//  Licensed under the MIT License. See ACKNOWLEDGEMENTS.txt for details.
//

'use strict';

const chalk = require('chalk');
const path = require('path');
const os = require('os');

/**
 * Webpack resolver plugin that prevents importing files from outside of `src/` or `node_modules/`.
 */
class ModuleScopePlugin {

    /**
     * Constructor for ModuleScopePlugin
     *
     * @param appSrc       Path (or array of paths) to the application source directory.
     * @param allowedFiles Absolute paths of files permitted to be imported from outside `src/`.
     */
    constructor(appSrc, allowedFiles = []) {
        this.appSrcs = Array.isArray(appSrc) ? appSrc : [appSrc];
        this.allowedFiles = new Set(allowedFiles);
        this.allowedPaths = [...allowedFiles]
            .map(path.dirname)
            .filter(p => path.relative(p, process.cwd()) !== '');
    }

    apply(resolver) {
        const {appSrcs} = this;
        resolver.hooks.file.tapAsync(
            'ModuleScopePlugin',
            (request, contextResolver, callback) => {
                if (!request.context.issuer) {
                    return callback();
                }
                if (
                    request.descriptionFileRoot.indexOf('/node_modules/') !== -1 ||
                    request.descriptionFileRoot.indexOf('\\node_modules\\') !== -1 ||
                    !request.__innerRequest_request
                ) {
                    return callback();
                }
                if (
                    appSrcs.every(appSrc => {
                        const relative = path.relative(appSrc, request.context.issuer);
                        return relative.startsWith('../') || relative.startsWith('..\\');
                    })
                ) {
                    return callback();
                }
                const requestFullPath = path.resolve(
                    path.dirname(request.context.issuer),
                    request.__innerRequest_request
                );
                if (this.allowedFiles.has(requestFullPath)) {
                    return callback();
                }
                if (this.allowedPaths.some(allowedFile => requestFullPath.startsWith(allowedFile))) {
                    return callback();
                }
                if (
                    appSrcs.every(appSrc => {
                        const requestRelative = path.relative(appSrc, requestFullPath);
                        return (
                            requestRelative.startsWith('../') ||
                            requestRelative.startsWith('..\\')
                        );
                    })
                ) {
                    const scopeError = new Error(
                        `You attempted to import ${chalk.cyan(request.__innerRequest_request)} ` +
                        `which falls outside of the project ${chalk.cyan('src/')} directory. ` +
                        `Relative imports outside of ${chalk.cyan('src/')} are not supported.` +
                        os.EOL +
                        `You can either move it inside ${chalk.cyan('src/')}, ` +
                        `or add a symlink to it from project's ${chalk.cyan('node_modules/')}.`
                    );
                    Object.defineProperty(scopeError, '__module_scope_plugin', {
                        value: true,
                        writable: false,
                        enumerable: false,
                    });
                    callback(scopeError, request);
                } else {
                    callback();
                }
            }
        );
    }
}

module.exports = ModuleScopePlugin;
