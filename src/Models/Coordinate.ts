/*
 * Copyright (c) 2023-2026 valo.media GmbH
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
//  Coordinate.ts
//  tower-staff
//
//
//

/*
 * A latitude and longitude
 */
import { Dead } from './UtilityTypes';

/**
 * A latitude and longitude.
 */
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
