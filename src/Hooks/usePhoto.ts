/*
 * Copyright (c) 2024-2026 valo.media GmbH
 * All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import PhotoDataChunk from '../Models/PhotoDataChunk';
import { Dispatch, SetStateAction, useState } from 'react';

/**
 * Hook for reassembling a photo from PhotoDataChunk's
 */
export default function usePhoto(): {
    photo?: URL,
    setPhoto: Dispatch<SetStateAction<URL|undefined>>,
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

    return {photo, setPhoto, storePhotoDataChunk, clearPhoto};
};
