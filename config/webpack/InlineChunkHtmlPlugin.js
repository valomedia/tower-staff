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

/**
 * HtmlWebpackPlugin hook that inlines matching script chunks directly into the HTML, saving a round trip.
 */
class InlineChunkHtmlPlugin {

    /**
     * Constructor for InlineChunkHtmlPlugin
     *
     * @param htmlWebpackPlugin The HtmlWebpackPlugin class (not an instance).
     * @param tests             Array of regular expressions; chunks whose names match are inlined.
     */
    constructor(htmlWebpackPlugin, tests) {
        this.htmlWebpackPlugin = htmlWebpackPlugin;
        this.tests = tests;
    }

    getInlinedTag(publicPath, assets, tag) {
        if (tag.tagName !== 'script' || !(tag.attributes && tag.attributes.src)) {
            return tag;
        }
        const scriptName = publicPath
            ? tag.attributes.src.replace(publicPath, '')
            : tag.attributes.src;
        if (!this.tests.some(test => scriptName.match(test))) {
            return tag;
        }
        const asset = assets[scriptName];
        if (asset == null) {
            return tag;
        }
        return {tagName: 'script', innerHTML: asset.source(), closeTag: true};
    }

    apply(compiler) {
        let publicPath = compiler.options.output.publicPath || '';
        if (publicPath && !publicPath.endsWith('/')) {
            publicPath += '/';
        }

        compiler.hooks.compilation.tap('InlineChunkHtmlPlugin', compilation => {
            const tagFunction = tag =>
                this.getInlinedTag(publicPath, compilation.assets, tag);

            const hooks = this.htmlWebpackPlugin.getHooks(compilation);
            hooks.alterAssetTagGroups.tap('InlineChunkHtmlPlugin', assets => {
                assets.headTags = assets.headTags.map(tagFunction);
                assets.bodyTags = assets.bodyTags.map(tagFunction);
            });
        });
    }
}

module.exports = InlineChunkHtmlPlugin;
