//
//  ImageSize.ts
//  tower-staff
//
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import { Dead } from './UtilityTypes';

/**
 * A width and height.
 */
export default class ImageSize {

    constructor(props: Dead<ImageSize>) {
        Object.assign(this, props);
    }

    /**
     * The width in pixels.
     */
    readonly width!: number;

    /**
     * The height in pixels.
     */
    readonly height!: number;

    toString() {
        return `${this.width}x${this.height}`;
    }

}
