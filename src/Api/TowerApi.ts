//
//  TowerApi.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import JoinResponse from '../Models/JoinResponse';
import MeetingResponse from '../Models/MeetingResponse';

/*
 * Make a request to the index endpoint.
 */
export async function index() {
    return await request('GET', '/');
}

/*
 * Make a request to the join endpoint.
 */
export async function join(): Promise<JoinResponse> {
    return await request('POST', '/join');
}

/*
 * Make a request to the end endpoint.
 */
export async function end(meetingId: string) {
    return await request('POST', '/end', new URLSearchParams({meetingId}));
}

/*
 * Make a request to the poll endpoint.
 */
export async function poll(): Promise<MeetingResponse> {
    return await request('GET', '/poll');
}

async function request(method = 'GET', path: String, params?: URLSearchParams) {
    const response = await fetch(
        // @ts-ignore
        process.env.REACT_APP_TOWER_API_ENDPOINT + path + (params ? '?' + params: ''),
        {
            method,
            credentials: 'include',
        }
    )
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}
