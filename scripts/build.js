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

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

// Ensure environment variables are read.
require('../config/env');

const chalk = require('chalk');
const fs = require('fs-extra');
const bfj = require('bfj');
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');
const {
    checkRequiredFiles,
    formatWebpackMessages,
    printBuildError,
} = require('./utils');

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

const argv = process.argv.slice(2);
const writeStatsJson = argv.indexOf('--stats') !== -1;

const config = configFactory('production');

fs.emptyDirSync(paths.appBuild);
copyPublicFolder();
build()
    .then(
        ({warnings}) => {
            if (warnings.length) {
                console.log(chalk.yellow('Compiled with warnings.\n'));
                console.log(warnings.join('\n\n'));
                console.log(
                    `\nSearch for the ${chalk.underline(chalk.yellow('keywords'))} to learn more about each warning.`
                );
                console.log(`To ignore, add ${chalk.cyan('// eslint-disable-next-line')} to the line before.\n`);
            } else {
                console.log(chalk.green('Compiled successfully.\n'));
            }
        },
        err => {
            console.log(chalk.red('Failed to compile.\n'));
            printBuildError(err);
            process.exit(1);
        }
    )
    .catch(err => {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    });

function build() {
    console.log('Creating an optimized production build...');

    const compiler = webpack(config);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages;
            if (err) {
                if (!err.message) {
                    return reject(err);
                }

                let errMessage = err.message;

                // Add additional information for postcss errors
                if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
                    errMessage += '\nCompileError: Begins at CSS selector ' + err['postcssNode'].selector;
                }

                messages = formatWebpackMessages({
                    errors: [errMessage],
                    warnings: [],
                });
            } else {
                // noinspection JSUnresolvedReference
                messages = formatWebpackMessages(
                    stats.toJson({all: false, warnings: true, errors: true})
                );
            }
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                return reject(new Error(messages.errors.join('\n\n')));
            }
            if (
                process.env.CI
                    && (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false')
                    && messages.warnings.length
            ) {
                // Ignore sourcemap warnings in CI builds. See #8227 for more info.
                const filteredWarnings = messages.warnings.filter(w => !/Failed to parse source map/.test(w));
                if (filteredWarnings.length) {
                    console.log(
                        chalk.yellow(
                            '\nTreating warnings as errors because process.env.CI = true.\n'
                                + 'Most CI servers set it automatically.\n'
                        )
                    );
                    return reject(new Error(filteredWarnings.join('\n\n')));
                }
            }

            const resolveArgs = {
                stats,
                warnings: messages.warnings,
            };

            if (writeStatsJson) {
                // noinspection JSUnresolvedReference
                return bfj
                    .write(paths.appBuild + '/bundle-stats.json', stats.toJson())
                    .then(() => resolve(resolveArgs))
                    .catch(error => reject(new Error(error)));
            }

            return resolve(resolveArgs);
        });
    });
}

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => file !== paths.appHtml,
    });
}
