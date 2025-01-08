//
//  UserToken.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-11-25.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import User from './User';

/**
 * A User associated with an access token.
 */
export default interface UserToken {

    /**
     * The User the token is for.
     */
    user: User;

    /**
     * The token for the User.
     */
    token: string;

    /**
     * The expiry Date of the token.
     */
    expiresOn: Date;

}
