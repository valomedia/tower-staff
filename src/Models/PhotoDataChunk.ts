//
//  PhotoDataChunk.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-08-07.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

/**
 * The data sent in a photoDataEvent.
 */
export default interface PhotoDataChunk {

    /**
     * The base-64 encoded string of one chunk of image data.
     */
    imageData: string;

    /**
     * The information needed to reassemble the chunks into a complete image.
     *
     * @property index The index of this chunk in the set it belongs to.
     * @property count The total number of chunks in the set this chunk belongs to.
     * @property uuid A uuid that is the same for all the chunks belonging to the same photo.
     */
    chunkingInfo: {
        index: number,
        count: number,
        uuid: string
    };

}
