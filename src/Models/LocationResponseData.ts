//
//  LocationResponseData.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

import Coordinate from './Coordinate';


/*
 * The data sent in a location-response realtime data message.
 */
export default interface LocationResponseData {
    locationInfo: {
        coordinate: {
            latitude: number,
            longitude: number
        },
        altitude: number | null,
        horizontalAccuracy: number | null,
        verticalAccuracy: number | null,
        course: number | null,
        courseAccuracy: number | null,
        timestamp: number
    }
    | null
}


/*
 * Reviver for LocationResponseData to be used when parsing LocationResponseData from JSON.
 */
export function locationResponseDataReviver(key: String, value: any): any {
    return key === "coordinate" ? new Coordinate(value) : value
}

