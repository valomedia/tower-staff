//
//  Coordinate.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

/*
 * A latitude and longitude
 */
class Coordinate {

    constructor(
        {
            latitude,
            longitude
        }: {
            latitude: number,
            longitude: number
        }
    ) {
        this.latitude = latitude
        this.longitude = longitude
    }

    /*
     * The latitude in degrees.
     */
    readonly latitude: number

    /*
     * The longitude in degrees.
     */
    readonly longitude: number

    toString() {
        return `${this.latitude},${this.longitude}`;
    }

}

export default Coordinate
