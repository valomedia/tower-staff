//
//  Size.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

/*
 * A width and height.
 */
import { Dead } from '../../types/util';

class Size {

    constructor(props: Dead<Size>) {
        Object.assign(this, props);
    }

    /*
     * The width in pixels.
     */
    readonly width!: number;

    /*
     * The height in pixels.
     */
    readonly height!: number;

    toString() {
        return `${this.width}x${this.height}`;
    }

}

export default Size
