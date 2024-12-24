//
//  Marker.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

import Coordinate from './Coordinate';
import MarkerStyle from './MarkerStyle';
import { Dead } from '../../types/util';


/*
 * A simple Marker as used by the Google Maps api.
 */
class Marker {

    constructor(props: Dead<Marker>) {
        Object.assign(this, props);
    }

    /*
     * The latitude in degrees.
     */
    readonly style?: MarkerStyle;

    /*
     * The longitude in degrees.
     */
    readonly place!: Coordinate | string;

    toString() {
        return (this.style ? `color:${this.style.color}|` : "") + this.place.toString();
    }

}


export default Marker
