//
//  env.js
//  tower-staff
//
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

// Make sure that including paths.js after env.js will read .env variables.
delete require.cache[require.resolve('./paths')];

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
    throw new Error(
        'The NODE_ENV environment variable is required but was not specified.'
    );
}

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
    `${paths.dotenv}.${NODE_ENV}.local`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    NODE_ENV !== 'test' && `${paths.dotenv}.local`,
    `${paths.dotenv}.${NODE_ENV}`,
    paths.dotenv,
].filter(Boolean);

// Load environment variables from .env* files.
//
// Suppress warnings using silent if this file is missing. Dotenv will never modify any environment variables that have
// already been set.  Variable expansion is supported in .env files.
//
// See also:
//  * https://github.com/motdotla/dotenv
//  * https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
        require('dotenv-expand')(
            require('dotenv').config({
                path: dotenvFile,
            })
        );
    }
});

// We support resolving modules according to `NODE_PATH`. This lets you use absolute paths in imports inside large
// monorepos: https://github.com/facebook/create-react-app/issues/253. It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders. Note that unlike in Node, only
// *relative* paths from `NODE_PATH` are honored. Otherwise, we risk importing Node.js core modules into an app instead
// of webpack shims: https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421. We also resolve
// them to make sure all tools using them work consistently.
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter(folder => folder && !path.isAbsolute(folder))
    .map(folder => path.resolve(appDirectory, folder))
    .join(path.delimiter);

// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in webpack configuration.
const REACT_APP = /^REACT_APP_/i;

/**
 * Get the environment for the client.
 *
 * This will pull all environment variables prefixed with `REACT_APP_` from the environment, along with NODE_ENV
 * (defaulting to 'development'), WDS_SOCKET_HOST, WDS_SOCKET_PATH, WDS_SOCKET_PORT, and FAST_REFRESH (defaulting to
 * 'true'). These will be returned as an object to be passed to the client, along with the provided value for
 * PUBLIC_URL (which can't be read straight from the environment, as it will need some preprocessing).
 *
 * @typedef {object} ClientEnvironment An environment to be passed to the client.
 * @property {Object.<string, any>}                         raw             The env represented using native types.
 * @property {{"process.env": Object.<string, string>}}     stringified     The env with each parameter stringified.
 *
 * @param publicUrl     {string}    The value to be used for PUBLIC_URL.
 *
 * @returns {ClientEnvironment}     The environment to be passed to the client.
 */
function getClientEnvironment(publicUrl) {
    const raw = Object.keys(process.env)
        .filter(key => REACT_APP.test(key))
        .reduce(
            (env, key) => {
                env[key] = process.env[key];
                return env;
            },
            {
                // Useful for determining whether we’re running in production mode.
                // Most importantly, it switches React into the correct mode.
                NODE_ENV: process.env.NODE_ENV || 'development',
                // Useful for resolving the correct path to static assets in `public`.
                // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
                // This should only be used as an escape hatch. Normally you would put
                // images into the `src` and `import` them in code to get their paths.
                PUBLIC_URL: publicUrl,
                // We support configuring the sockjs pathname during development.
                // These settings let a developer run multiple simultaneous projects.
                // They are used as the connection `hostname`, `pathname` and `port`
                // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
                // and `sockPort` options in webpack-dev-server.
                WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
                WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
                WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,

                // Whether react-refresh is enabled.
                //
                // It is defined here, so it is available in the webpackHotDevClient.
                FAST_REFRESH: process.env.FAST_REFRESH !== 'false',
            }
        );

    // Stringify all values so we can feed into webpack DefinePlugin
    const stringified = {
        'process.env': Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {}),
    };

    return {raw, stringified};
}

module.exports = getClientEnvironment;
