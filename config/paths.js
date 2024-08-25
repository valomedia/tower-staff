//
//  paths.js
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-05-26.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

const path = require('path');
const fs = require('fs');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === 'development',
    require(resolveApp('package.json')).homepage,
    process.env.PUBLIC_URL
);

const buildPath = process.env.BUILD_PATH || 'build';

/**
 * The list of extensions for module files.
 *
 * @type {string[]}
 */
const moduleFileExtensions = [
    'web.mjs',
    'mjs',
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
    const extension = moduleFileExtensions.find(extension =>
        fs.existsSync(resolveFn(`${filePath}.${extension}`))
    );

    if (extension) {
        return resolveFn(`${filePath}.${extension}`);
    }

    return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {

    /**
     * The path to the main env file.
     */
    dotenv: resolveApp('.env'),

    /**
     * The path to the root of the project.
     */
    appPath: resolveApp('.'),

    /**
     * The path to the build directory.
     */
    appBuild: resolveApp(buildPath),

    /**
     * The path to the directory for public static files.
     */
    appPublic: resolveApp('public'),

    /**
     * The path to the index.html used to bootstrap the app.
     */
    appHtml: resolveApp('public/index.html'),

    /**
     * The path to the module that contains the entry point for the app.
     */
    appIndexJs: resolveModule(resolveApp, 'src/index'),

    /**
     * The path to the package.json that defines the dependencies for the app.
     */
    appPackageJson: resolveApp('package.json'),

    /**
     * The path to the directory containing the sources for the app.
     */
    appSrc: resolveApp('src'),

    /**
     * The path to the TypeScript configuration.
     */
    appTsConfig: resolveApp('tsconfig.json'),

    /**
     * The path to the JavaScript configuration (unused).
     */
    appJsConfig: resolveApp('jsconfig.json'),

    /**
     * The path to the yarn lock file (unused).
     */
    yarnLockFile: resolveApp('yarn.lock'),

    /**
     * The path to the module for setting up the tests.
     */
    testsSetup: resolveModule(resolveApp, 'src/setupTests'),

    /**
     * The path to the script for setting up the development proxy (unused).
     */
    proxySetup: resolveApp('src/setupProxy.js'),

    /**
     * The path to the node modules repository.
     */
    appNodeModules: resolveApp('node_modules'),

    /**
     * The path to the webpack cache.
     */
    appWebpackCache: resolveApp('node_modules/.cache'),

    /**
     * The path to the typescript build information.
     */
    appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),

    /**
     * The path to the module that contains the service workers (unused).
     */
    swSrc: resolveModule(resolveApp, 'src/service-worker'),

    /**
     * The public url the app is available under (if any).
     */
    publicUrlOrPath,
};


module.exports.moduleFileExtensions = moduleFileExtensions;
