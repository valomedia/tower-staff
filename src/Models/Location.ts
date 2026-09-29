/*
 * Copyright (c) 2024-2026 valo.media GmbH
 * All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
