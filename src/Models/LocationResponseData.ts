//
//  LocationResponseData.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

/*
 * The data sent in a location-response realtime data message.
 */
interface LocationResponseData {
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

export default LocationResponseData
