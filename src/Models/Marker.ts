//
//  Marker.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

import Coordinate from './Coordinate';
import MarkerStyle from './MarkerStyle';


/*
 * A simple Marker as used by the Google Maps api.
 */
class Marker {

    constructor(
        {
            style,
            place
        }: {
            style?: MarkerStyle | undefined,
            place: Coordinate | string
        }
    ) {
        this.style = style
        this.place = place
    }

    /*
     * The latitude in degrees.
     */
    readonly style?: MarkerStyle

    /*
     * The longitude in degrees.
     */
    readonly place: Coordinate | string

    toString() {
        return (this.style ? `color:${this.style.color}|` : "") + this.place.toString();
    }

}


export default Marker
