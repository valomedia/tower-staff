//
//  UserToken.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-11-25.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import User from './User';

export default interface UserToken {

    user: User;

    token: string;

    expiresOn: Date;

}

/*
 * Reviver for UserToken to be used when parsing UserToken from JSON.
 */
export function userTokenReviver(key: String, value: any): any {
    return key === "expiresOn" ? new Date(value) : value
}
