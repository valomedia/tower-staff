//
//  UserData.ts
//  tower-staff
//
//  Copyright © 2025 valo.media GmbH. All rights reserved.
//

import { Gender } from './Gender';

/**
 * Information about the user making the call and the app being used.
 */
export interface UserData {

    /**
     * Information about the app the user is using to connect.
     */
    clientInfo: ClientInfo;

    /**
     * Information about the user making the call.
     */
    userProfile: UserProfile;

}

/**
 * Information about the app the user is using to connect.
 */
export interface ClientInfo {

    /**
     * Package identifier for the client the user is using.
     */
    identifier: "media.valo.Tower-iOS"|"media.valo.tower_android";

    /**
     * Version number of the client the user is using.
     */
    version: string;

}

/**
 * Personal information about the user making the call.
 */
export interface UserProfile {

    /**
     * The given name of the user, if known.
     */
    firstName?: string;

    /**
     * The family name of the user, if known.
     */
    lastName?: string;

    /**
     * The gender of the user, if known.
     */
    gender?: Gender;

    /**
     * The birthdate of the user (formatted as YYYY-MM-DD), if known.
     */
    birthdate?: string;

    /**
     * The preferred phone number for calling the user, if known.
     */
    phone?: string;

    /**
     * The preferred e-mail address for contacting the user, if known.
     */
    email?: string;

}
