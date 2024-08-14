//
//  CapturePhotoResponseData.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-08-07.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import ImageSize from './ImageSize';

/**
 * The data sent in a capture-photo-response realtime data message.
 */
export default interface CapturePhotoResponseData {
    photoData?: {
        imageData: string,
        imageSize: ImageSize,
        chunkingInfo: {
            index: number,
            count: number,
            uuid: string
        }
    },
    message?:string
}

/**
 * Reviver for CapturePhotoResponseData.
 *
 * This function is meant to be supplied to JSON.parse() when parsing CapturePhotoResponseData from
 * a capture-photo-response.
 */
export function capturePhotoResponseDataReviver(key: string, value: any): any {
    return key === "imageSize" ? new ImageSize(value) : value
}
