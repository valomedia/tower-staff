//
//  InterpolateHtmlPlugin.js
//  tower-staff
//
//  Adapted from react-dev-utils by Facebook, Inc.
//  Copyright (c) 2013-2022, Facebook, Inc.
//  Copyright © 2026 valo.media GmbH. All rights reserved.
//
//  Licensed under the MIT License. See ACKNOWLEDGEMENTS.txt for details.
//

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
