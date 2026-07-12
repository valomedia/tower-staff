//
//  Location.ts
//  tower-staff
//
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

    /**
     * The geographical coordinate information.
     */
    readonly coordinate!: Coordinate;

    /**
     * The altitude above mean sea level, measured in meters.
     */
    readonly altitude?: number;

    /**
     * The radius of uncertainty for the coordinate, measured in meters.
     */
    readonly horizontalAccuracy?: number;

    /**
     * The estimated uncertainty for the altitude, measured in meters.
     */
    readonly verticalAccuracy?: number;

    /**
     * The direction in which the device is traveling, measured in degrees and relative to due north.
     */
    readonly course?: number;

    /**
     * The accuracy of the course, measured in degrees.
     */
    readonly courseAccuracy?: number;

}
