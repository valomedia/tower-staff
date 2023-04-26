//
//  TowerApi.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-04-25.
//
//

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
    join: async () => {
        return await request('POST', '/join');
    },

    /*
     * Make a request to the end endpoint.
     */
    end: async () => {
        return await request('POST', '/end');
    },

    /*
     * Make a request to the poll endpoint.
     */
    poll: async () => {
        return await request('GET', '/poll');
    }

}

const request = async (method = 'GET', path: String) => {
    const response = await fetch(
        // @ts-ignore
        process.env.REACT_APP_TOWER_API_ENDPOINT + path,
        {
            method,
            credentials: 'include',
        }
    )
    return response.json();
}

export default TowerApi;
