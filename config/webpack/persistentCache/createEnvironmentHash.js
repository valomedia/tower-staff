//
//  createEnvironmentHash.js
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-05-26.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

const {createHash} = require('crypto');

module.exports = env => {
    const hash = createHash('md5');
    hash.update(JSON.stringify(env));

    return hash.digest('hex');
};
