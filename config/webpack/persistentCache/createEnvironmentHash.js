//
//  createEnvironmentHash.js
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2024-05-26.
//
//

'use strict';
const { createHash } = require('crypto');

module.exports = env => {
  const hash = createHash('md5');
  hash.update(JSON.stringify(env));

  return hash.digest('hex');
};
