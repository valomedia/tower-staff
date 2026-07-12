//
//  cssTransform.js
//  tower-staff
//
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

/**
 * This is a custom Jest transformer turning style imports into empty objects.
 *
 * See also: http://facebook.github.io/jest/docs/en/webpack.html
 *
 * @type {{getCacheKey(): string, process(): string}}
 */
module.exports = {
    process() {
        return 'module.exports = {};';
    },
    getCacheKey() {
        // The output is always the same.
        return 'cssTransform';
    },
};
