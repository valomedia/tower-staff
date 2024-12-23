//
//  TowerApi.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import OfferAssistanceResponse, { offerAssistanceResponseReviver } from '../Models/OfferAssistanceResponse';
import BeginAssistanceResponse, { beginAssistanceResponseReviver } from '../Models/BeginAssistanceResponse';

/*
 * Make a request to the index endpoint.
 */
export const index = async () =>
    JSON.parse(await request('GET', '/'));

export const offerAssistance = async (): Promise<OfferAssistanceResponse> =>
    JSON.parse(await request('GET', '/offerAssistance'), offerAssistanceResponseReviver);

export const beginAssistance = async (): Promise<BeginAssistanceResponse> =>
    JSON.parse(await request('POST', '/beginAssistance'), beginAssistanceResponseReviver);

const request = async (method = 'GET', path: String, params?: URLSearchParams) => {
    const response = await fetch(
        // @ts-ignore
        process.env.REACT_APP_TOWER_API_ENDPOINT + path + (params ? '?' + params: ''),
        {
            method,
            credentials: 'include',
        }
    );
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.text();
};
