//
//  TowerApi.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import dateFieldReviver from '../Lib/dateFieldReviver';
import UserToken from '../Models/UserToken';
import AssistanceRequest from '../Models/AssistanceRequest';

/**
 * Make a request to the index endpoint.
 *
 * This is used to ensure that the backend is operational and the credentials are correct.
 */
export async function index() {
    return JSON.parse(await request('GET', '/'));
}

/**
 * Make a request to the assistanceToken endpoint.
 *
 * This fetches the token used to connect to Azure Communication Services.
 *
 * @return The token needed to connect to ACS.
 */
export async function assistanceToken(): Promise<{userToken: UserToken}> {
    return JSON.parse(await request('GET', '/assistanceToken'), dateFieldReviver);
}

/**
 * Make a request to the offerAssistance endpoint.
 *
 * This checks whether there are currently any users waiting for assistance.
 *
 * @return The oldest unanswered AssistanceRequest, if any.
 */
export async function offerAssistance(): Promise<{assistanceRequest?: AssistanceRequest}> {
    return JSON.parse(await request('GET', '/offerAssistance'), dateFieldReviver);
}

/**
 * Make a request to the beginAssistance endpoint.
 *
 * This will remove the oldest unanswered AssistanceRequest from the queue on the backend and return it.
 *
 * @return The assistance request that the assistant is supposed to answer.
 */
export async function beginAssistance(): Promise<{assistanceRequest: AssistanceRequest}> {
    return JSON.parse(await request('POST', '/beginAssistance'), dateFieldReviver);
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
    return response.text();
}
