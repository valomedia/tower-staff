/*
 * Copyright (c) 2024-2026 valo.media GmbH
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

const {URL} = require('url');
const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

function getPublicUrlOrPath(isEnvDevelopment, homepage, envPublicUrl) {
    const stubDomain = 'https://tower-staff.app';
    if (envPublicUrl) {
        envPublicUrl = envPublicUrl.endsWith('/') ? envPublicUrl : envPublicUrl + '/';
        const validPublicUrl = new URL(envPublicUrl, stubDomain);
        return isEnvDevelopment
            ? envPublicUrl.startsWith('.') ? '/' : validPublicUrl.pathname
            : envPublicUrl;
    }
    if (homepage) {
        homepage = homepage.endsWith('/') ? homepage : homepage + '/';
        const validHomepagePathname = new URL(homepage, stubDomain).pathname;
        return isEnvDevelopment
            ? homepage.startsWith('.') ? '/' : validHomepagePathname
            : homepage.startsWith('.') ? homepage : validHomepagePathname;
    }
    return '/';
}

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
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
