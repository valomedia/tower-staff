//
//  createEnvironmentHash.js
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-05-26.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

const {createHash} = require('crypto');

/**
 * Create an md5 hash of the current environment.
 *
 * @param env   {object}    An object representing the current environment.
 *
 * @returns {string} An md5-hash of the JSON representation of the environment object that was passed in.
 */
module.exports = env => {
    const hash = createHash('md5');
    hash.update(JSON.stringify(env));

    return hash.digest('hex');
};
