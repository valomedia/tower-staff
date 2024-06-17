//
//  LocationEventData.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

import Coordinate from './Coordinate';


/*
 * The data sent in a location-response realtime data message.
 */
export default interface LocationEventData {
    locationInfo?: {
        coordinate: Coordinate,
        altitude: number | null,
        horizontalAccuracy: number | null,
        verticalAccuracy: number | null,
        course: number | null,
        courseAccuracy: number | null,
        timestamp: number
    },
    message?: string
}


/*
 * Reviver for LocationEventData to be used when parsing LocationEventData from JSON.
 */
export function locationEventDataReviver(key: String, value: any): any {
    return key === "coordinate" ? new Coordinate(value) : value
}

