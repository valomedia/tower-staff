//
//  PhotoDataChunk.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-08-07.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

/**
 * The data sent in a capture-photo-response realtime data message.
 */
export default interface PhotoDataChunk {

    imageData: string;

    chunkingInfo: {
        index: number,
        count: number,
        uuid: string
    };

}
