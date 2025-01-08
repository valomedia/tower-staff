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
import { Dead } from './UtilityTypes';

export default class Coordinate {

    constructor(props: Dead<Coordinate>) {
        Object.assign(this, props);
    }

    /*
     * The latitude in degrees.
     */
    readonly latitude!: number;

    /*
     * The longitude in degrees.
     */
    readonly longitude!: number;

    toString() {
        return `${this.latitude},${this.longitude}`;
    }

}
