//
//  PhotoResource.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-08-07.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import ImageSize from './ImageSize';

/**
 * The data for a photo.
 *
 * This contains the URL for an image, along with its dimensions.
 */
export default class PhotoResource {

    constructor(imageURL: URL, imageSize: ImageSize) {
        this.imageURL = imageURL;
        this.imageSize = imageSize;
    }

    /**
     * The URL for the image.
     */
    readonly imageURL: URL;

    /**
     * The with and height of the image.
     */
    readonly imageSize: ImageSize;

}
