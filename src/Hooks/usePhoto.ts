//
//  usePhoto.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2024-12-23.
//  Copyright © 2024 valo.media GmbH. All rights reserved.
//

import PhotoDataChunk from '../Models/PhotoDataChunk';
import PhotoResource from '../Models/PhotoResource';
import { useState } from 'react';

export default function usePhoto(): {
    photo?: PhotoResource,
    storePhotoDataChunk: (photoDataChunk: PhotoDataChunk) => void,
    clearPhoto: () => void
} {
    const [photo, setPhoto] = useState<PhotoResource|undefined>();

    let dataChunks: Record<string, string[]> = {};

    function storePhotoDataChunk(photoDataChunk: PhotoDataChunk) {
        const {uuid, index, count} = photoDataChunk.chunkingInfo;
        const imageSize = photoDataChunk.imageSize;
        if (!dataChunks[uuid]) {dataChunks[uuid] = [];}
        dataChunks[uuid][index] = photoDataChunk.imageData;
        if (dataChunks[uuid].flat().length === count) {
            setPhoto(new PhotoResource(new URL("data:image/jpeg;base64," + dataChunks[uuid].join("")), imageSize));
            dataChunks = {};
        }
    }

    function clearPhoto() {
        dataChunks = {};
        setPhoto(undefined);
    }

    return {photo, storePhotoDataChunk, clearPhoto};
};
