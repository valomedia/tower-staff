//
//  Size.ts
//  tower-assist
//
//  Created by Jean-Pierre Höhmann on 2023-05-24.
//
//

/*
 * A width and height.
 */
class Size {

    constructor(
        {
            width,
            height
        }: {
            width: number,
            height: number
        }
    ) {
        this.width = width
        this.height = height
    }

    /*
     * The width in pixels.
     */
    readonly width: number

    /*
     * The height in pixels.
     */
    readonly height: number

    toString() {
        return `${this.width}x${this.height}`;
    }

}

export default Size
