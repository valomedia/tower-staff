//
//  AssistanceRequest.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-11-25.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import User from './User';

/**
 * A User along with the Date the User requested assistance.
 */
export default interface AssistanceRequest {

    /**
     * The User requesting assistance.
     */
    user: User;

    /**
     * The date and time at which the user requested the assistance.
     */
    startDateTime: Date;

}

/*
 * Reviver for AssistanceRequest to be used when parsing AssistanceRequest from JSON.
 */
export function assistanceRequestReviver(key: String, value: any): any {
    return key === "expiresOn" ? new Date(value) : value
}
