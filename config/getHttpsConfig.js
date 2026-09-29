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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chalk = require('chalk');
const paths = require('./paths');

// Ensure the certificate and key provided are valid and if not,
// throw an easy-to-debug error.
function validateKeyAndCerts({cert, key, keyFile, crtFile}) {
    let encrypted;
    try {
        // publicEncrypt will throw an error with an invalid cert
        encrypted = crypto.publicEncrypt(cert, Buffer.from('test'));
    } catch (err) {
        throw new Error(
            `The certificate "${chalk.yellow(crtFile)}" is invalid.\n${err.message}`
        );
    }

    try {
        // privateDecrypt will throw an error with an invalid key
        crypto.privateDecrypt(key, encrypted);
    } catch (err) {
        throw new Error(
            `The certificate key "${chalk.yellow(keyFile)}" is invalid.\n${
                err.message
            }`
        );
    }
}

// Read the file and throw an error if it doesn't exist.
function readEnvFile(file, type) {
    if (!fs.existsSync(file)) {
        throw new Error(
            `You specified ${chalk.cyan(
                type
            )} in your env, but the file "${chalk.yellow(file)}" can't be found.`
        );
    }
    return fs.readFileSync(file);
}

/**
 * Get the https config.
 *
 * Return cert files if provided in env, otherwise true or false.
 *
 * @typedef {object} HttpsConfig A configuration for a HTTPs server.
 * @property {Buffer}   cert    The certificate to use for HTTPs connections.
 * @property {Buffer}   key     The key to user for HTTPs connections.
 *
 * @returns {HttpsConfig|boolean} The configuration for HTTPs if any, or a boolean indicating whether to use HTTPs.
 */
function getHttpsConfig() {
    const {SSL_CRT_FILE, SSL_KEY_FILE, HTTPS} = process.env;
    const isHttps = HTTPS === 'true';

    if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
        const crtFile = path.resolve(paths.appPath, SSL_CRT_FILE);
        const keyFile = path.resolve(paths.appPath, SSL_KEY_FILE);
        const config = {
            cert: readEnvFile(crtFile, 'SSL_CRT_FILE'),
            key: readEnvFile(keyFile, 'SSL_KEY_FILE'),
        };

        validateKeyAndCerts({...config, keyFile, crtFile});
        return config;
    }
    return isHttps;
}

module.exports = getHttpsConfig;
