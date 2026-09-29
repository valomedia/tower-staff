/*
 * Copyright (c) 2025-2026 valo.media GmbH
 * All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
