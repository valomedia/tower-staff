//
//  InlineChunkHtmlPlugin.js
//  tower-staff
//
//  Adapted from react-dev-utils by Facebook, Inc.
//  Copyright (c) 2013-2022, Facebook, Inc.
//  Copyright © 2026 valo.media GmbH. All rights reserved.
//
//  Licensed under the MIT License. See ACKNOWLEDGEMENTS.txt for details.
//

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
