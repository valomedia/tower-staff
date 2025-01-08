//
//  usePhoto.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-23.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import PhotoDataChunk from '../Models/PhotoDataChunk';
import { useState } from 'react';

/**
 * Hook for reassembling a photo from PhotoDataChunk's
 */
export default function usePhoto(): {
    photo?: URL,
    storePhotoDataChunk: (photoDataChunk: PhotoDataChunk) => void,
    clearPhoto: () => void
} {
    /**
     * The last complete photo that was stored, if any.
     */
    const [photo, setPhoto] = useState<URL|undefined>();

    /**
     * The chunks for the photo currently being assembled.
     */
    let dataChunks: Record<string, string[]> = {};

    /**
     * Add a chunk for the photo.
     *
     * This will store the given chunk, updating the photo if it was the last missing chunk.
     *
     * @param photoDataChunk The PhotoDataChunk to add.
     */
    function storePhotoDataChunk(photoDataChunk: PhotoDataChunk) {
        const {uuid, index, count} = photoDataChunk.chunkingInfo;
        if (!dataChunks[uuid]) {dataChunks[uuid] = [];}
        dataChunks[uuid][index] = photoDataChunk.imageData;
        if (dataChunks[uuid].flat().length === count) {
            setPhoto(new URL("data:image/jpeg;base64," + dataChunks[uuid].join("")));
            dataChunks = {};
        }
    }

    /**
     * Clear the state of the hook.
     *
     * This will remove the photo, as well as any store chunks that have not been assembled into a photo yet.
     */
    function clearPhoto() {
        dataChunks = {};
        setPhoto(undefined);
    }

    return {photo, storePhotoDataChunk, clearPhoto};
};
