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

const address = require('address');
const chalk = require('chalk');
const detect = require('detect-port-alt');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const url = require('url');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isInteractive = process.stdout.isTTY;

/**
 * Clears the terminal screen.
 */
function clearConsole() {
    process.stdout.write(
        process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
    );
}

/**
 * Checks that required files exist; logs an error and returns `false` if any are missing.
 *
 * @param files Array of absolute file paths to verify.
 *
 * @return `true` if all files exist, `false` otherwise.
 */
function checkRequiredFiles(files) {
    let currentFilePath;
    try {
        files.forEach(filePath => {
            currentFilePath = filePath;
            fs.accessSync(filePath, fs.F_OK);
        });
        return true;
    } catch (err) {
        const dirName = path.dirname(currentFilePath);
        const fileName = path.basename(currentFilePath);
        console.log(chalk.red('Could not find a required file.'));
        console.log(chalk.red('  Name: ') + chalk.cyan(fileName));
        console.log(chalk.red('  Searched in: ') + chalk.cyan(dirName));
        return false;
    }
}

/**
 * Detects an available port, prompting the user interactively to switch if the default is already in use.
 *
 * @param host        The hostname to bind to.
 * @param defaultPort The preferred port number.
 *
 * @return A Promise resolving to the chosen port number, or `null` if the user declined.
 */
function choosePort(host, defaultPort) {
    return detect(defaultPort, host).then(
        port =>
            new Promise(resolve => {
                if (port === defaultPort) {
                    return resolve(port);
                }
                const message = `Something is already running on port ${defaultPort}.`;
                if (isInteractive) {
                    clearConsole();
                    const question = {
                        type: 'confirm',
                        name: 'shouldChangePort',
                        message:
                            chalk.yellow(message) + '\n\nWould you like to run the app on another port instead?',
                        initial: true,
                    };
                    prompts(question).then(answer => {
                        if (answer.shouldChangePort) {
                            resolve(port);
                        } else {
                            resolve(null);
                        }
                    });
                } else {
                    console.log(chalk.red(message));
                    resolve(null);
                }
            }),
        err => {
            throw new Error(
                chalk.red(`Could not find an open port at ${chalk.bold(host)}.`) +
                '\n' +
                ('Network error message: ' + err.message || err) +
                '\n'
            );
        }
    );
}

/**
 * Builds the URL objects used to display dev server addresses in the terminal.
 *
 * @param protocol The URL protocol (`'http'` or `'https'`).
 * @param host     The hostname or IP address the server is bound to.
 * @param port     The port the server is listening on.
 * @param pathname The base pathname (defaults to `'/'`).
 *
 * @return An object with `localUrlForTerminal`, `localUrlForBrowser`, `lanUrlForTerminal`, and `lanUrlForConfig`.
 */
function prepareUrls(protocol, host, port, pathname = '/') {
    const formatUrl = hostname =>
        url.format({protocol, hostname, port, pathname});
    const prettyPrintUrl = hostname =>
        url.format({protocol, hostname, port: chalk.bold(port), pathname});

    const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
    let prettyHost, lanUrlForConfig, lanUrlForTerminal;
    if (isUnspecifiedHost) {
        prettyHost = 'localhost';
        try {
            lanUrlForConfig = address.ip();
            if (lanUrlForConfig) {
                if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
                    lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
                } else {
                    lanUrlForConfig = undefined;
                }
            }
        } catch (_e) {
            // ignored
        }
    } else {
        prettyHost = host;
    }
    const localUrlForTerminal = prettyPrintUrl(prettyHost);
    const localUrlForBrowser = formatUrl(prettyHost);
    return {lanUrlForConfig, lanUrlForTerminal, localUrlForTerminal, localUrlForBrowser};
}

/**
 * Resolves `localhost` to `127.0.0.1` on systems where IPv6 is unavailable.
 */
function resolveLoopback(proxy) {
    const o = url.parse(proxy);
    o.host = undefined;
    if (o.hostname !== 'localhost') {
        return proxy;
    }
    try {
        if (!address.ip()) {
            o.hostname = '127.0.0.1';
        }
    } catch (_ignored) {
        o.hostname = '127.0.0.1';
    }
    return url.format(o);
}

/**
 * Returns an http-proxy-middleware error handler that logs the failure and responds with a 500.
 */
function onProxyError(proxy) {
    return (err, req, res) => {
        const host = req.headers && req.headers.host;
        console.log(
            chalk.red('Proxy error:') +
            ' Could not proxy request ' +
            chalk.cyan(req.url) +
            ' from ' +
            chalk.cyan(host) +
            ' to ' +
            chalk.cyan(proxy) +
            '.'
        );
        console.log(
            'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
            chalk.cyan(err.code) +
            ').'
        );
        console.log();
        if (res.writeHead && !res.headersSent) {
            res.writeHead(500);
        }
        res.end(
            'Proxy error: Could not proxy request ' +
            req.url +
            ' from ' +
            host +
            ' to ' +
            proxy +
            ' (' +
            err.code +
            ').'
        );
    };
}

/**
 * Converts the configured proxy target into a webpack-dev-server proxy configuration array.
 *
 * @param proxy           The proxy target URL string.
 * @param appPublicFolder Absolute path to the public folder (used to exclude static file requests).
 * @param servedPathname  The base pathname the app is served under.
 *
 * @return A webpack-dev-server proxy configuration array, or `undefined` if no proxy is configured.
 */
function prepareProxy(proxy, appPublicFolder, servedPathname) {
    if (!proxy) {
        return undefined;
    }
    if (typeof proxy !== 'string') {
        console.log(chalk.red('When specified, TOWER_PROXY_TARGET must be a string.'));
        console.log(chalk.red('Instead, the type of TOWER_PROXY_TARGET was "' + typeof proxy + '".'));
        console.log(chalk.red('Either remove TOWER_PROXY_TARGET, or make it a string.'));
        process.exit(1);
    }

    const sockPath = process.env.WDS_SOCKET_PATH || '/ws';
    const isDefaultSockHost = !process.env.WDS_SOCKET_HOST;

    function mayProxy(pathname) {
        const maybePublicPath = path.resolve(
            appPublicFolder,
            pathname.replace(new RegExp('^' + servedPathname), '')
        );
        const isPublicFileRequest = fs.existsSync(maybePublicPath);
        const isWdsEndpointRequest = isDefaultSockHost && pathname.startsWith(sockPath);
        return !(isPublicFileRequest || isWdsEndpointRequest);
    }

    if (!/^http(s)?:\/\//.test(proxy)) {
        console.log(
            chalk.red(
                'When TOWER_PROXY_TARGET is specified it must start with either http:// or https://'
            )
        );
        process.exit(1);
    }

    let target;
    if (process.platform === 'win32') {
        target = resolveLoopback(proxy);
    } else {
        target = proxy;
    }
    return [
        {
            target,
            logLevel: 'silent',
            context: function (pathname, req) {
                return (
                    req.method !== 'GET' ||
                    (mayProxy(pathname) &&
                        req.headers.accept &&
                        req.headers.accept.indexOf('text/html') === -1)
                );
            },
            onProxyReq: proxyReq => {
                if (proxyReq.getHeader('origin')) {
                    proxyReq.setHeader('origin', target);
                }
            },
            onError: onProxyError(target),
            secure: false,
            changeOrigin: true,
            ws: true,
            xfwd: true,
        },
    ];
}

/**
 * Prints dev server URLs and a reminder about the production build command.
 */
function printInstructions(appName, urls, useYarn) {
    console.log();
    console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
    console.log();
    if (urls.lanUrlForTerminal) {
        console.log(`  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`);
        console.log(`  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`);
    } else {
        console.log(`  ${urls.localUrlForTerminal}`);
    }
    console.log();
    console.log('Note that the development build is not optimized.');
    console.log(
        `To create a production build, use ${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
    );
    console.log();
}

/**
 * Creates a webpack compiler with hooks that print friendly compile-status messages.
 *
 * @param options                 Configuration object.
 * @param options.appName         The application name shown in terminal output.
 * @param options.config          The webpack configuration object.
 * @param options.urls            URL info returned by {@link prepareUrls}.
 * @param options.useYarn         Whether to show yarn or npm commands in output.
 * @param options.useTypeScript   Whether TypeScript is enabled (wires up type-check status messages).
 * @param options.webpack         The webpack module.
 *
 * @return The configured webpack compiler instance.
 */
function createCompiler({appName, config, urls, useYarn, useTypeScript, webpack}) {
    let compiler;
    try {
        compiler = webpack(config);
    } catch (err) {
        console.log(chalk.red('Failed to compile.'));
        console.log();
        console.log(err.message || err);
        console.log();
        process.exit(1);
    }

    compiler.hooks.invalid.tap('invalid', () => {
        if (isInteractive) {
            clearConsole();
        }
        console.log('Compiling...');
    });

    let isFirstCompile = true;

    if (useTypeScript) {
        ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).waiting.tap(
            'awaitingTypeScriptCheck',
            () => {
                console.log(
                    chalk.yellow('Files successfully emitted, waiting for typecheck results...')
                );
            }
        );
    }

    compiler.hooks.done.tap('done', async stats => {
        if (isInteractive) {
            clearConsole();
        }
        const statsData = stats.toJson({all: false, warnings: true, errors: true});
        const messages = formatWebpackMessages(statsData);
        const isSuccessful = !messages.errors.length && !messages.warnings.length;
        if (isSuccessful) {
            console.log(chalk.green('Compiled successfully!'));
        }
        if (isSuccessful && (isInteractive || isFirstCompile)) {
            printInstructions(appName, urls, useYarn);
        }
        isFirstCompile = false;

        if (messages.errors.length) {
            if (messages.errors.length > 1) {
                messages.errors.length = 1;
            }
            console.log(chalk.red('Failed to compile.\n'));
            console.log(messages.errors.join('\n\n'));
            return;
        }

        if (messages.warnings.length) {
            console.log(chalk.yellow('Compiled with warnings.\n'));
            console.log(messages.warnings.join('\n\n'));
            console.log(
                '\nSearch for the ' +
                chalk.underline(chalk.yellow('keywords')) +
                ' to learn more about each warning.'
            );
            console.log(
                'To ignore, add ' + chalk.cyan('// eslint-disable-next-line') + ' to the line before.\n'
            );
        }
    });

    return compiler;
}

const friendlySyntaxErrorLabel = 'Syntax error:';

function isLikelyASyntaxError(message) {
    return message.indexOf(friendlySyntaxErrorLabel) !== -1;
}

function formatMessage(message) {
    let lines = [];
    if (typeof message === 'string') {
        lines = message.split('\n');
    } else if ('message' in message) {
        lines = message['message'].split('\n');
    } else if (Array.isArray(message)) {
        message.forEach(m => {
            if ('message' in m) lines = m['message'].split('\n');
        });
    }
    lines = lines.filter(line => !/Module [A-z ]+\(from/.test(line));
    lines = lines.map(line => {
        const parsingError = /Line (\d+):(?:(\d+):)?\s*Parsing error: (.+)$/.exec(line);
        if (!parsingError) return line;
        const [, errorLine, errorColumn, errorMessage] = parsingError;
        return `${friendlySyntaxErrorLabel} ${errorMessage} (${errorLine}:${errorColumn})`;
    });
    message = lines.join('\n');
    message = message.replace(
        /SyntaxError\s+\((\d+):(\d+)\)\s*(.+?)\n/g,
        `${friendlySyntaxErrorLabel} $3 ($1:$2)\n`
    );
    message = message.replace(
        /^.*export '(.+?)' was not found in '(.+?)'.*$/gm,
        `Attempted import error: '$1' is not exported from '$2'.`
    );
    message = message.replace(
        /^.*export 'default' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
        `Attempted import error: '$2' does not contain a default export (imported as '$1').`
    );
    message = message.replace(
        /^.*export '(.+?)' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
        `Attempted import error: '$1' is not exported from '$3' (imported as '$2').`
    );
    lines = message.split('\n');
    if (lines.length > 2 && lines[1].trim() === '') {
        lines.splice(1, 1);
    }
    lines[0] = lines[0].replace(/^(.*) \d+:\d+-\d+$/, '$1');
    if (lines[1] && lines[1].indexOf('Module not found: ') === 0) {
        lines = [
            lines[0],
            lines[1]
                .replace('Error: ', '')
                .replace('Module not found: Cannot find file:', 'Cannot find file:'),
        ];
    }
    if (lines[1] && lines[1].match(/Cannot find module.+sass/)) {
        lines[1] = 'To import Sass files, you first need to install sass.\n';
        lines[1] += 'Run `npm install sass` or `yarn add sass` inside your workspace.';
    }
    message = lines.join('\n');
    message = message.replace(/^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm, '');
    message = message.replace(/^\s*at\s<anonymous>(\n|$)/gm, '');
    lines = message.split('\n');
    lines = lines.filter(
        (line, index, arr) =>
            index === 0 || line.trim() !== '' || line.trim() !== arr[index - 1].trim()
    );
    return lines.join('\n').trim();
}

/**
 * Formats webpack stats errors and warnings into human-readable strings.
 *
 * @param json The webpack stats JSON object (with `errors` and `warnings` arrays).
 *
 * @return An object with `errors` and `warnings` arrays of formatted message strings.
 */
function formatWebpackMessages(json) {
    const formattedErrors = json.errors.map(formatMessage);
    const formattedWarnings = json.warnings.map(formatMessage);
    const result = {errors: formattedErrors, warnings: formattedWarnings};
    if (result.errors.some(isLikelyASyntaxError)) {
        result.errors = result.errors.filter(isLikelyASyntaxError);
    }
    return result;
}

/**
 * Prints a build error, extracting source location from Terser minification errors where possible.
 *
 * @param err The error object to print.
 */
function printBuildError(err) {
    const message = err != null && err.message;
    const stack = err != null && err.stack;
    if (stack && typeof message === 'string' && message.indexOf('from Terser') !== -1) {
        try {
            const matched = /(.+)\[(.+):(.+),(.+)\]\[.+\]/.exec(stack);
            if (!matched) {
                throw new Error('Using errors for control flow is bad.');
            }
            const problemPath = matched[2];
            const line = matched[3];
            const column = matched[4];
            console.log(
                'Failed to minify the code from this file: \n\n',
                chalk.yellow(`\t${problemPath}:${line}${column !== '0' ? ':' + column : ''}`),
                '\n'
            );
        } catch (ignored) {
            console.log('Failed to minify the bundle.', err);
        }
    } else {
        console.log((message || err) + '\n');
    }
    console.log();
}

module.exports = {
    checkRequiredFiles,
    choosePort,
    clearConsole,
    createCompiler,
    formatWebpackMessages,
    prepareProxy,
    prepareUrls,
    printBuildError,
};
