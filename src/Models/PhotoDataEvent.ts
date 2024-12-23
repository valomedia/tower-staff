//
//  PhotoDataEvent.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-08-07.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import ImageSize from './ImageSize';
import { Dead } from '../../types/util';

/**
 * The data sent in a capture-photo-response realtime data message.
 */
export default class PhotoDataEvent {

    constructor(props: Dead<PhotoDataEvent>) {
        Object.assign(this, {...props, imageSize: new ImageSize(props.imageSize)});
    }

    readonly imageData!: string;

    readonly imageSize!: ImageSize;

    readonly chunkingInfo!: {
        index: number,
        count: number,
        uuid: string
    };
}
