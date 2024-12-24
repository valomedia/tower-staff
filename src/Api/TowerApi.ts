//
//  TowerApi.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import OfferAssistanceResponse from '../Models/OfferAssistanceResponse';
import BeginAssistanceResponse from '../Models/BeginAssistanceResponse';
import dateFieldReviver from '../Lib/dateFieldReviver';

/*
 * Make a request to the index endpoint.
 */
export async function index() {
    return JSON.parse(await request('GET', '/'));
}

export async function offerAssistance(): Promise<OfferAssistanceResponse> {
    return JSON.parse(await request('GET', '/offerAssistance'), dateFieldReviver);
}

export async function beginAssistance(): Promise<BeginAssistanceResponse> {
    return JSON.parse(await request('POST', '/beginAssistance'), dateFieldReviver);
}

async function request(method = 'GET', path: String, params?: URLSearchParams) {
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
}
