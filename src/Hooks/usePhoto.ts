//
//  usePhoto.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-23.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import PhotoDataChunk from '../Models/PhotoDataChunk';
import { useState } from 'react';

export default function usePhoto(): {
    photo?: URL,
    storePhotoDataChunk: (photoDataChunk: PhotoDataChunk) => void,
    clearPhoto: () => void
} {
    const [photo, setPhoto] = useState<URL|undefined>();

    let dataChunks: Record<string, string[]> = {};

    function storePhotoDataChunk(photoDataChunk: PhotoDataChunk) {
        const {uuid, index, count} = photoDataChunk.chunkingInfo;
        if (!dataChunks[uuid]) {dataChunks[uuid] = [];}
        dataChunks[uuid][index] = photoDataChunk.imageData;
        if (dataChunks[uuid].flat().length === count) {
            setPhoto(new URL("data:image/jpeg;base64," + dataChunks[uuid].join("")));
            dataChunks = {};
        }
    }

    function clearPhoto() {
        dataChunks = {};
        setPhoto(undefined);
    }

    return {photo, storePhotoDataChunk, clearPhoto};
};
