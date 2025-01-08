//
//  Location.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

import Coordinate from './Coordinate';
import { Dead } from './UtilityTypes';

/*
 * The data sent in a location-response realtime data message.
 */
export default class Location {

    constructor(props: Dead<Location>) {
        Object.assign(this, {...props, coordinate: new Coordinate(props.coordinate)});
    }

    readonly coordinate!: Coordinate;

    readonly altitude?: number;

    readonly horizontalAccuracy?: number;

    readonly verticalAccuracy?: number;

    readonly course?: number;

    readonly courseAccuracy?: number;

}
