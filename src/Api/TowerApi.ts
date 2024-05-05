//
//  TowerApi.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

import JoinResponse from '../Models/JoinResponse';

const TowerApi = {

    /*
     * Make a request to the index endpoint.
     */
    index: async () => {
        return await request('GET', '/');
    },

    /*
     * Make a request to the join endpoint.
     */
    join: async (): Promise<JoinResponse> => {
        return await request('POST', '/join');
    },

    /*
     * Make a request to the end endpoint.
     */
    end: async (meetingId: string) => {
        return await request('POST', '/end', new URLSearchParams({meetingId}));
    },

    /*
     * Make a request to the poll endpoint.
     */
    poll: async () => {
        return await request('GET', '/poll');
    }

}

const request = async (method = 'GET', path: String, params?: URLSearchParams) => {
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

export default TowerApi;
