//
//  cssTransform.js
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2024-05-26.
//
//

'use strict';

// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
    process() {
        return 'module.exports = {};';
    },
    getCacheKey() {
        // The output is always the same.
        return 'cssTransform';
    },
};
