//
//  User.ts
//  tower-staff
//
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { CommunicationUserIdentifier } from '@azure/communication-common';

/**
 * A username associated with a CommunicationsUserIdentifier.
 */
export default interface User extends CommunicationUserIdentifier {

    /**
     * The username of the user.
     */
    username: string;

}
