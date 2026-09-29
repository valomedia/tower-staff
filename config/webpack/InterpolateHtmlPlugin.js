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

const escapeStringRegexp = require('escape-string-regexp');

/**
 * Works in tandem with HtmlWebpackPlugin to replace %VARIABLE% placeholders in index.html.
 */
class InterpolateHtmlPlugin {

    /**
     * Constructor for InterpolateHtmlPlugin
     *
     * @param htmlWebpackPlugin The HtmlWebpackPlugin class (not an instance).
     * @param replacements      Map of placeholder names to their replacement values.
     */
    constructor(htmlWebpackPlugin, replacements) {
        this.htmlWebpackPlugin = htmlWebpackPlugin;
        this.replacements = replacements;
    }

    // noinspection JSUnusedGlobalSymbols
    apply(compiler) {
        compiler.hooks.compilation.tap('InterpolateHtmlPlugin', compilation => {
            this.htmlWebpackPlugin
                .getHooks(compilation)
                .afterTemplateExecution.tap('InterpolateHtmlPlugin', data => {
                Object.keys(this.replacements).forEach(key => {
                    const value = this.replacements[key];
                    data.html = data.html.replace(
                        new RegExp('%' + escapeStringRegexp(key) + '%', 'g'),
                        value
                    );
                });
            });
        });
    }
}

module.exports = InterpolateHtmlPlugin;
