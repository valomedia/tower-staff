/*
 * Copyright (c) 2023-2026 valo.media GmbH
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

//
//  TowerApi.ts
//  tower-staff
//
//
//

import dateFieldReviver from '../Lib/dateFieldReviver';
import UserToken from '../Models/UserToken';
import AssistanceRequest from '../Models/AssistanceRequest';
import UploadLink from '../Models/UploadLink';
import DownloadLink from '../Models/DownloadLink';
import compositeReviver from '../Lib/compositeReviver';
import urlFieldReviver from '../Lib/urlFieldReviver';

/**
 * Make a request to the index endpoint.
 *
 * This is used to ensure that the backend is operational and the credentials are correct.
 */
export async function index() {
    return request('GET', '/');
}

/**
 * Make a request to the assistanceToken endpoint.
 *
 * This fetches the token used to connect to Azure Communication Services.
 *
 * @return The token needed to connect to ACS.
 */
export async function assistanceToken(): Promise<{userToken: UserToken}> {
    return request('GET', '/assistanceToken');
}

/**
 * Make a request to the offerAssistance endpoint.
 *
 * This checks whether there are currently any users waiting for assistance.
 *
 * @return The oldest unanswered AssistanceRequest, if any.
 */
export async function offerAssistance(): Promise<{assistanceRequest?: AssistanceRequest}> {
    return request('GET', '/offerAssistance');
}

/**
 * Make a request to the beginAssistance endpoint.
 *
 * This will remove the oldest unanswered AssistanceRequest from the queue on the backend and return it.
 *
 * @return The assistance request that the assistant is supposed to answer.
 */
export async function beginAssistance(): Promise<{assistanceRequest: AssistanceRequest}> {
    return request('POST', '/beginAssistance');
}

/**
 * Make a request to the createImageUploadUrl endpoint.
 *
 * This endpoint will return a single-use URL the customer's app can use to upload an image in response to a
 * capturePhotoRequest.
 *
 * @return The UploadLink sent to the users app, so it can upload the photo.
 */
export async function createImageUploadUrl(): Promise<UploadLink> {
    return request('POST', '/createImageUploadUrl');
}

/**
 * Make a request to the createImageDownloadUrl endpoint.
 *
 * This endpoint will return a URL tower-staff can use to download the image an end-user app uploaded under a
 * particular key.
 *
 * @param key The key of the uploaded image.
 *
 * @return The DownloadLink that can be used to download the image.
 */
export async function createImageDownloadUrl(key: string): Promise<DownloadLink> {
    return request('POST', '/createImageDownloadUrl', {key});
}

async function request(method = 'GET', path: String, body?: {[key: string]: any}) {
    const response = await fetch(
        // @ts-ignore
        process.env.REACT_APP_TOWER_API_ENDPOINT + path,
        {
            method,
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
    );
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return JSON.parse(await response.text(), compositeReviver(dateFieldReviver, urlFieldReviver));
}
