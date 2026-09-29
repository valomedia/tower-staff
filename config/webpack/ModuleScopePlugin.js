/*
 * Copyright (c) 2026 valo.media GmbH
 * All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
