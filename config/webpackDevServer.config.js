//
//  webpackDevServer.config.js
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-05-26.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

const fs = require('fs');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const paths = require('./paths');
const getHttpsConfig = require('./getHttpsConfig');

const host = process.env.HOST || '0.0.0.0';
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT;

/**
 * Build the configuration for the webpack-dev-server.
 *
 * @param {object[]}    proxy           Proxy configuration for webpack-dev-server.
 * @param {string}      allowedHost     The allowed host for CORS.
 *
 * @returns {object} The configuration for webpack-dev-server.
 */
module.exports = function (proxy, allowedHost) {
    // Check the HOST header iff the proxy is running and DANGEROUSLY_DISABLE_HOST_CHECK is not set.
    const disableFirewall =
        !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true';

    const httpsConfig = getHttpsConfig();

    // noinspection WebpackConfigHighlighting,JSUnusedGlobalSymbols
    return {
        // If checking the host header, allow the host set via allowedHost, falling back to "127.0.0.1", if no
        // allowedHost is specified. The values "localhost" and "127.0.0.1" are hard-coded as allowed in
        // webpack-dev-server, so specifying "127.0.0.1" has no effect, besides satisfying the requirement that
        // options.allowedHosts[0] must be a non-empty string.
        allowedHosts: disableFirewall ? 'all' : [allowedHost || '127.0.0.1'],
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
        },
        // Enable gzip compression of generated files.
        compress: true,
        static: {
            // By default, WebpackDevServer serves physical files from the current directory in addition to all the
            // virtual build products that it serves from memory. This is confusing because those files won’t
            // automatically be available in the production build folder unless we copy them. However, copying the whole
            // project directory is dangerous because we may expose sensitive files. Instead, we establish a convention
            // that only files in `public` directory get served. Our build script will copy `public` into the `build`
            // folder. In `index.html`, you can get URL of `public` folder with %PUBLIC_URL%: <link rel="icon"
            // href="%PUBLIC_URL%/favicon.ico"> In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
            // Note that we only recommend to use `public` folder as an escape hatch for files like `favicon.ico`,
            // `manifest.json`, and libraries that are for some reason broken when imported through webpack. If you just
            // want to use an image, put it in `src` and `import` it from JavaScript instead.
            directory: paths.appPublic,
            publicPath: [paths.publicUrlOrPath],

            // By default, files from `contentBase` will not trigger a page reload.
            watch: {
                // Reportedly, this avoids CPU overload on some systems (see also:
                // https://github.com/facebook/create-react-app/issues/293). src/node_modules is not ignored to support
                // absolute imports (see also: https://github.com/facebook/create-react-app/issues/1065).
                ignored: ignoredFiles(paths.appSrc),
            },
        },
        client: {
            webSocketURL: {
                // Enable custom sockjs pathname for websocket connection to hot reloading server.
                //
                // Enable custom sockjs hostname, pathname, and port for websocket connection to hot reloading server.
                hostname: sockHost,
                pathname: sockPath,
                port: sockPort,
            },
            overlay: {
                errors: true,
                warnings: false,
            },
        },
        devMiddleware: {
            // It is important to tell WebpackDevServer to use the same "publicPath" path as we specified in the webpack
            // config. When homepage is '.', default to serving from the root. Remove last slash so user can land on
            // `/test` instead of `/test/`.
            publicPath: paths.publicUrlOrPath.slice(0, -1),
        },
        server: httpsConfig
            ? {
                type: 'https',
                options: httpsConfig
            }
            : 'http',
        host,
        historyApiFallback: {
            // Paths with dots should still use the history fallback.
            // See https://github.com/facebook/create-react-app/issues/387.
            disableDotRule: true,
            index: paths.publicUrlOrPath,
        },
        // `proxy` is run between `before` and `after` `webpack-dev-server` hooks
        proxy,
        setupMiddlewares(middlewares, devServer) {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined')
            }

            // Keep `evalSourceMapMiddleware`
            // middlewares before `redirectServedPath` otherwise will not have any effect
            // This lets us fetch source contents from webpack for the error overlay
            middlewares.unshift(evalSourceMapMiddleware(devServer));

            if (fs.existsSync(paths.proxySetup)) {
                // This registers user provided middleware for proxy reasons
                middlewares = require(paths.proxySetup)(middlewares, devServer);
            }

            // Redirect to `PUBLIC_URL` or `homepage` from `package.json` if url not match
            middlewares.push(redirectServedPath(paths.publicUrlOrPath));

            // This service worker file is effectively a 'no-op' that will reset any
            // previous service worker registered for the same host:port combination.
            // We do this in development to avoid hitting the production cache if
            // it used the same host and port.
            //
            // See also: https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432.
            middlewares.push(noopServiceWorkerMiddleware(paths.publicUrlOrPath));

            return middlewares
        }
    };
};
