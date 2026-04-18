//
//  middleware.js
//  tower-staff
//
//  Adapted from react-dev-utils by Facebook, Inc.
//  Copyright (c) 2013-2022, Facebook, Inc.
//  Copyright © 2026 valo.media GmbH. All rights reserved.
//
//  Licensed under the MIT License. See ACKNOWLEDGEMENTS.txt for details.
//

'use strict';

const path = require('path');
const escape = require('escape-string-regexp');

function base64SourceMap(source) {
    const base64 = Buffer.from(JSON.stringify(source.map()), 'utf8').toString('base64');
    return `data:application/json;charset=utf-8;base64,${base64}`;
}

function getSourceById(server, id) {
    const module = Array.from(server._stats.compilation.modules).find(
        m => server._stats.compilation.chunkGraph.getModuleId(m) === id
    );
    return module.originalSource();
}

/**
 * Fetches source contents from webpack for the error overlay.
 *
 * @param server The webpack-dev-server instance.
 *
 * @return An Express middleware function.
 */
function createEvalSourceMapMiddleware(server) {
    return function handleWebpackInternalMiddleware(req, res, next) {
        if (req.url.startsWith('/__get-internal-source')) {
            const fileName = req.query.fileName;
            const id = fileName.match(/webpack-internal:\/\/\/(.+)/)[1];
            if (!id || !server._stats) {
                next();
            }
            const source = getSourceById(server, id);
            const sourceMapURL = `//# sourceMappingURL=${base64SourceMap(source)}`;
            const sourceURL = `//# sourceURL=webpack-internal:///${module.id}`;
            res.end(`${source.source()}\n${sourceMapURL}\n${sourceURL}`);
        } else {
            next();
        }
    };
}

/**
 * Returns a RegExp matching files outside `appSrc` that should not trigger rebuilds.
 *
 * @param appSrc The application source directory path.
 *
 * @return A RegExp that matches paths in node_modules outside the source directory.
 */
function ignoredFiles(appSrc) {
    return new RegExp(
        `^(?!${escape(path.normalize(appSrc + '/').replace(/[\\]+/g, '/'))}).+/node_modules/`,
        'g'
    );
}

/**
 * Redirects requests to the correct served path when using a non-root `publicPath`.
 *
 * @param servedPath The path prefix the app is served under.
 *
 * @return An Express middleware function.
 */
function createRedirectServedPathMiddleware(servedPath) {
    servedPath = servedPath.slice(0, -1);
    return function redirectServedPathMiddleware(req, res, next) {
        if (
            servedPath === '' ||
            req.url === servedPath ||
            req.url.startsWith(servedPath)
        ) {
            next();
        } else {
            const newPath = path.posix.join(servedPath, req.path !== '/' ? req.path : '');
            res.redirect(newPath);
        }
    };
}

module.exports = {
    createEvalSourceMapMiddleware,
    ignoredFiles,
    createRedirectServedPathMiddleware,
};
